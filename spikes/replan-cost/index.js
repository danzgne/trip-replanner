import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";

const MODEL = process.env.MODEL ?? "claude-haiku-5-5";
const EFFORT = process.env.EFFORT ?? "medium";
const RUNS = Number(process.env.RUNS ?? 1);
const ONLY = process.env.SCENARIO;
const CHECK_ONLY = process.argv.includes("--check");
const MAX_TURNS = 12;
const MAX_PROPOSALS = 3;
const PRICES = { "claude-haiku-5-5": { input: 0.1, output: 0.5 }, "claude-sonnet-5-5": { input: 2, output: 10 } };
const PRICE = PRICES[MODEL] ?? PRICES["claude-haiku-5-5"];
const FIXED_MARGIN = 30;
const MAX_STOP = 150;
const MAX_IDLE = 120;

const EVAL_DIR = path.resolve(import.meta.dirname, "../../eval");
const BASE_PLACES = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, "places.json"), "utf8"));
const SCENARIOS = fs
  .readdirSync(path.join(EVAL_DIR, "scenarios"))
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(EVAL_DIR, "scenarios", f), "utf8")))
  .filter((s) => !ONLY || s.id.startsWith(ONLY));

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
const isOpen = (place, start, end) =>
  place.hours.some(([o, c]) => toMin(start) >= toMin(o) && toMin(end) <= toMin(c));

function makeWorld(scenario) {
  const places = [...BASE_PLACES, ...(scenario.extra_places ?? [])];
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));
  for (const ref of [scenario.current_place, ...scenario.fixed.map((f) => f.place_id), ...scenario.planned.map((p) => p.place_id)]) {
    if (!byId[ref]) throw new Error(`${scenario.id}: unknown place_id ${ref}`);
  }

  const travelMinutes = (fromId, toId) => {
    if (fromId === toId) return 0;
    const a = byId[fromId];
    const b = byId[toId];
    const rad = (d) => (d * Math.PI) / 180;
    const h =
      Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.sqrt(h));
    return Math.round(((km * 1.4) / 25) * 60 + 5);
  };

  const raining = (end) => scenario.rain_from && toMin(end) > toMin(scenario.rain_from);

  const validate = (activities) => {
    const violations = [];
    let prevPlace = scenario.current_place;
    let prevEnd = toMin(scenario.now);
    for (const a of activities) {
      const place = byId[a.place_id];
      if (!place) {
        violations.push(`unknown place_id ${a.place_id}`);
        continue;
      }
      if (place.booking_only && !scenario.fixed.some((f) => f.place_id === a.place_id))
        violations.push(`${a.place_id}: this is a booking the traveller does not have`);
      if (toMin(a.end) <= toMin(a.start)) violations.push(`${a.place_id}: end before start`);
      if (!isOpen(place, a.start, a.end)) violations.push(`${a.place_id}: closed during ${a.start}-${a.end}`);
      if (!place.indoor && raining(a.end)) violations.push(`${a.place_id}: outdoor while raining`);
      const isFixed = scenario.fixed.some((f) => f.place_id === a.place_id);
      const arrival = prevEnd + travelMinutes(prevPlace, a.place_id);
      const latest = toMin(a.start) - (isFixed ? FIXED_MARGIN : 0);
      if (arrival > latest)
        violations.push(`${a.place_id}: arrives at ${fmt(arrival)}, must arrive by ${fmt(latest)}${isFixed ? ` (${FIXED_MARGIN} min before a fixed booking)` : ""}`);
      if (!isFixed && toMin(a.end) - toMin(a.start) > MAX_STOP)
        violations.push(`${a.place_id}: stop of ${toMin(a.end) - toMin(a.start)} min is longer than ${MAX_STOP} min`);
      if (latest - arrival > MAX_IDLE) violations.push(`${a.place_id}: ${latest - arrival} min idle before this stop, more than ${MAX_IDLE} min`);
      prevPlace = a.place_id;
      prevEnd = toMin(a.end);
    }
    for (const f of scenario.fixed) {
      if (!activities.some((a) => a.place_id === f.place_id && a.start === f.start && a.end === f.end))
        violations.push(`fixed booking missing or moved: ${f.label}`);
    }
    return violations;
  };

  const runTool = (name, input) => {
    if (name === "search_places") {
      const [s, e] = input.open_between ?? [];
      return places
        .filter((p) => p.searchable !== false && !p.booking_only)
        .filter((p) => !input.indoor_only || p.indoor)
        .filter((p) => !s || !e || isOpen(p, s, e))
        .map(({ id, name, category, indoor, hours }) => ({ id, name, category, indoor, hours }));
    }
    if (name === "get_travel_time") {
      if (!byId[input.from_place_id] || !byId[input.to_place_id]) return { error: "unknown place_id" };
      return { minutes: travelMinutes(input.from_place_id, input.to_place_id) };
    }
    throw new Error(`unknown tool ${name}`);
  };

  const weather = scenario.rain_from ? `Heavy rain from ${scenario.rain_from} for the rest of the day.` : "No rain expected.";
  const system = `You re-plan the rest of a traveller's day in Đà Lạt after something changes.
Current time: ${scenario.now}. Current location: ${scenario.current_place}. ${weather}
Fixed bookings that must stay exactly as they are:
${scenario.fixed.map((f) => `- ${f.place_id} ${f.start}-${f.end}: ${f.label}`).join("\n")}
Current plan for the rest of today: ${JSON.stringify([...scenario.planned, ...scenario.fixed.map(({ place_id, start, end }) => ({ place_id, start, end }))])}
Use search_places and get_travel_time to build a plan, then submit it with propose_plan. Include the fixed bookings as activities. Times are HH:MM, same day.
Arrive at least ${FIXED_MARGIN} minutes before each fixed booking. Keep each other stop to at most ${MAX_STOP} minutes and leave no more than ${MAX_IDLE} idle minutes before any stop.`;

  return { validate, runTool, system };
}

const tools = [
  {
    name: "search_places",
    description: "Search the Đà Lạt place catalog. Returns places with indoor flag and opening hours.",
    input_schema: {
      type: "object",
      properties: {
        indoor_only: { type: "boolean" },
        open_between: { type: "array", items: { type: "string" }, description: "[start, end] as HH:MM" },
      },
      required: [],
    },
  },
  {
    name: "get_travel_time",
    description: "Driving time in minutes by car between two places, including parking.",
    input_schema: {
      type: "object",
      properties: { from_place_id: { type: "string" }, to_place_id: { type: "string" } },
      required: ["from_place_id", "to_place_id"],
    },
  },
  {
    name: "propose_plan",
    description:
      "Submit the revised rest of today. The plan is checked by code; if it breaks a hard constraint you get the violations back and must fix them.",
    input_schema: {
      type: "object",
      properties: {
        activities: {
          type: "array",
          items: {
            type: "object",
            properties: { place_id: { type: "string" }, start: { type: "string" }, end: { type: "string" } },
            required: ["place_id", "start", "end"],
          },
        },
        explanation: { type: "string", description: "Short explanation for the traveller, in Vietnamese, including what was dropped and what it costs." },
      },
      required: ["activities", "explanation"],
    },
  },
];

function checkScenario(scenario) {
  const problems = [];
  const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
  for (const key of ["id", "now", "current_place", "fixed", "planned", "message"]) {
    if (scenario[key] === undefined) problems.push(`missing field ${key}`);
  }
  const times = [scenario.now, scenario.rain_from, ...(scenario.fixed ?? []).flatMap((f) => [f.start, f.end]), ...(scenario.planned ?? []).flatMap((p) => [p.start, p.end])];
  for (const time of times.filter((x) => x !== null && x !== undefined)) {
    if (!hhmm.test(time)) problems.push(`time ${time} is not HH:MM`);
  }
  try {
    makeWorld(scenario);
  } catch (err) {
    problems.push(err.message);
  }
  return problems;
}

if (CHECK_ONLY) {
  let failed = 0;
  for (const scenario of SCENARIOS) {
    const problems = checkScenario(scenario);
    if (problems.length) failed++;
    console.log(`${scenario.id ?? "(no id)"}: ${problems.length ? "PROBLEM\n  " + problems.join("\n  ") : "ok"}`);
  }
  process.exit(failed ? 1 : 0);
}

const client = new Anthropic(
  process.env.ANTHROPIC_WORKSPACE_ID ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } } : {},
);

async function replanOnce(scenario) {
  const { validate, runTool, system } = makeWorld(scenario);
  const messages = [{ role: "user", content: scenario.message }];
  const usage = { input: 0, output: 0, turns: 0, toolCalls: 0, proposals: 0, nudges: 0 };
  const startedAt = Date.now();
  let accepted = null;

  while (usage.turns < MAX_TURNS && usage.proposals < MAX_PROPOSALS && !accepted) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: EFFORT },
      system,
      tools,
      messages,
    });
    usage.turns++;
    usage.input += response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
    usage.output += response.usage.output_tokens;

    if (response.stop_reason === "end_turn" && usage.proposals > 0 && usage.proposals < MAX_PROPOSALS) {
      usage.nudges++;
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: "Your last plan was rejected. Fix the listed violations and submit a revised plan with propose_plan." });
      continue;
    }
    if (response.stop_reason !== "tool_use") {
      return { ...usage, seconds: (Date.now() - startedAt) / 1000, ok: false, reason: `stopped: ${response.stop_reason}` };
    }

    messages.push({ role: "assistant", content: response.content });
    const results = [];
    for (const block of response.content.filter((b) => b.type === "tool_use")) {
      usage.toolCalls++;
      if (block.name === "propose_plan") {
        usage.proposals++;
        const violations = validate(block.input.activities ?? []);
        if (violations.length === 0) accepted = block.input;
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: violations.length > 0,
          content: violations.length ? `Rejected:\n${violations.join("\n")}` : "Accepted.",
        });
      } else {
        results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(runTool(block.name, block.input)) });
      }
    }
    messages.push({ role: "user", content: results });
  }

  return { ...usage, seconds: (Date.now() - startedAt) / 1000, ok: Boolean(accepted), plan: accepted };
}

const cost = (u) => (u.input * PRICE.input + u.output * PRICE.output) / 1e6;

const runs = [];
for (const scenario of SCENARIOS) {
  for (let i = 0; i < RUNS; i++) {
    const r = await replanOnce(scenario);
    runs.push(r);
    console.log(
      `${scenario.id} run ${i + 1}: ok=${r.ok} turns=${r.turns} tool_calls=${r.toolCalls} proposals=${r.proposals} nudges=${r.nudges} input=${r.input} output=${r.output} cost=$${cost(r).toFixed(4)} time=${r.seconds.toFixed(1)}s${r.reason ? " " + r.reason : ""}`,
    );
    if (r.plan) console.log(`  plan: ${r.plan.activities.map((a) => `${a.start}-${a.end} ${a.place_id}`).join(", ")}\n  explanation: ${r.plan.explanation}`);
  }
}
const avg = (k) => runs.reduce((s, r) => s + r[k], 0) / runs.length;
console.log(
  `\nmodel=${MODEL} effort=${EFFORT} scenarios=${SCENARIOS.length} runs=${runs.length} valid=${runs.filter((r) => r.ok).length}/${runs.length} first-proposal-valid=${runs.filter((r) => r.ok && r.proposals === 1).length}/${runs.length}`,
);
console.log(`avg input=${avg("input").toFixed(0)} output=${avg("output").toFixed(0)} cost=$${(runs.reduce((s, r) => s + cost(r), 0) / runs.length).toFixed(4)} time=${avg("seconds").toFixed(1)}s`);
