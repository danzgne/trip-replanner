import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.MODEL ?? "claude-haiku-5-5";
const EFFORT = process.env.EFFORT ?? "medium";
const RUNS = Number(process.env.RUNS ?? 3);
const MAX_TURNS = 12;
const MAX_PROPOSALS = 3;
const PRICE = { input: 0.1, output: 0.5 };
const FIXED_MARGIN = 30;
const MAX_STOP = 150;
const MAX_IDLE = 120;

const PLACES = [
  { id: "homestay", name: "Homestay", indoor: true, hours: [["00:00", "23:59"]], lat: 11.945, lng: 108.44 },
  { id: "cho_da_lat", name: "Chợ Đà Lạt", category: "market", indoor: true, hours: [["06:00", "22:00"]], lat: 11.9429, lng: 108.4373 },
  { id: "dinh_bao_dai", name: "Dinh Bảo Đại (Dinh III)", category: "museum", indoor: true, hours: [["07:00", "17:00"]], lat: 11.9302, lng: 108.4296 },
  { id: "xq_su_quan", name: "XQ Sử Quán", category: "museum", indoor: true, hours: [["07:30", "17:30"]], lat: 11.953, lng: 108.447 },
  { id: "bao_tang_lam_dong", name: "Bảo tàng Lâm Đồng", category: "museum", indoor: true, hours: [["07:30", "11:30"], ["13:30", "16:30"]], lat: 11.938, lng: 108.46 },
  { id: "crazy_house", name: "Biệt thự Hằng Nga (Crazy House)", category: "sight", indoor: false, hours: [["08:30", "19:00"]], lat: 11.9353, lng: 108.4307 },
  { id: "ho_xuan_huong", name: "Hồ Xuân Hương", category: "sight", indoor: false, hours: [["00:00", "23:59"]], lat: 11.9416, lng: 108.4425 },
  { id: "truc_lam", name: "Thiền viện Trúc Lâm", category: "sight", indoor: false, hours: [["07:00", "17:00"]], lat: 11.9022, lng: 108.4357 },
  { id: "cafe_tung", name: "Cà phê Tùng", category: "cafe", indoor: true, hours: [["07:00", "22:00"]], lat: 11.9431, lng: 108.4385 },
  { id: "me_linh", name: "Mê Linh Coffee Garden", category: "cafe", indoor: false, hours: [["07:00", "18:00"]], lat: 11.989, lng: 108.368 },
  { id: "ga_da_lat", name: "Ga Đà Lạt", category: "sight", indoor: true, hours: [["06:00", "17:00"]], lat: 11.942, lng: 108.455 },
  { id: "dau_tay_nha_kinh", name: "Vườn dâu tây nhà kính", category: "farm", indoor: true, hours: [["07:00", "17:00"]], lat: 11.97, lng: 108.43 },
  { id: "duong_ham_dat_set", name: "Đường hầm điêu khắc đất sét", category: "sight", indoor: false, hours: [["07:00", "17:00"]], lat: 11.889, lng: 108.438 },
  { id: "dinner_booking", name: "Nhà hàng đã đặt bàn", category: "restaurant", indoor: true, hours: [["10:00", "22:00"]], lat: 11.94, lng: 108.438 },
  { id: "ben_xe", name: "Bến xe liên tỉnh Đà Lạt", category: "station", indoor: true, hours: [["00:00", "23:59"]], lat: 11.9285, lng: 108.4455 },
];
const byId = Object.fromEntries(PLACES.map((p) => [p.id, p]));

const NOW = "12:45";
const RAIN_FROM = "13:00";
const CURRENT_PLACE = "cho_da_lat";
const FIXED = [
  { place_id: "dinner_booking", start: "18:30", end: "20:00", label: "Bàn ăn tối đã đặt cọc 300.000đ, không hoàn" },
  { place_id: "ben_xe", start: "21:30", end: "22:00", label: "Xe giường nằm 22:00 về TP.HCM, 2 vé 580.000đ, phải có mặt trước 21:30" },
];
const CURRENT_DAY = [
  { place_id: "truc_lam", start: "13:30", end: "15:30" },
  { place_id: "ho_xuan_huong", start: "16:00", end: "17:00" },
  ...FIXED.map(({ place_id, start, end }) => ({ place_id, start, end })),
];
const USER_MESSAGE =
  "Trời bắt đầu mưa to rồi, bỏ mấy chỗ ngoài trời chiều nay đi. Tụi mình hơi mệt nên đi nhẹ thôi, nhớ là tối còn bàn ăn với chuyến xe 22h.";

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function travelMinutes(fromId, toId) {
  if (fromId === toId) return 0;
  const a = byId[fromId];
  const b = byId[toId];
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * 6371 * Math.asin(Math.sqrt(h));
  return Math.round(((km * 1.4) / 25) * 60 + 5);
}

const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

const isOpen = (place, start, end) =>
  place.hours.some(([o, c]) => toMin(start) >= toMin(o) && toMin(end) <= toMin(c));

function validate(activities) {
  const violations = [];
  let prevPlace = CURRENT_PLACE;
  let prevEnd = toMin(NOW);
  for (const a of activities) {
    const place = byId[a.place_id];
    if (!place) {
      violations.push(`unknown place_id ${a.place_id}`);
      continue;
    }
    if (toMin(a.end) <= toMin(a.start)) violations.push(`${a.place_id}: end before start`);
    if (!isOpen(place, a.start, a.end)) violations.push(`${a.place_id}: closed during ${a.start}-${a.end}`);
    if (!place.indoor && toMin(a.end) > toMin(RAIN_FROM)) violations.push(`${a.place_id}: outdoor while raining`);
    const isFixed = FIXED.some((f) => f.place_id === a.place_id);
    const arrival = prevEnd + travelMinutes(prevPlace, a.place_id);
    const latest = toMin(a.start) - (isFixed ? FIXED_MARGIN : 0);
    if (arrival > latest)
      violations.push(`${a.place_id}: arrives at ${fmt(arrival)}, must arrive by ${fmt(latest)}${isFixed ? ` (${FIXED_MARGIN} min before a fixed booking)` : ""}`);
    if (!isFixed && toMin(a.end) - toMin(a.start) > MAX_STOP)
      violations.push(`${a.place_id}: stop of ${toMin(a.end) - toMin(a.start)} min is longer than ${MAX_STOP} min`);
    if (latest - arrival > MAX_IDLE)
      violations.push(`${a.place_id}: ${latest - arrival} min idle before this stop, more than ${MAX_IDLE} min`);
    prevPlace = a.place_id;
    prevEnd = toMin(a.end);
  }
  for (const f of FIXED) {
    if (!activities.some((a) => a.place_id === f.place_id && a.start === f.start && a.end === f.end))
      violations.push(`fixed booking missing or moved: ${f.label}`);
  }
  return violations;
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

const SYSTEM = `You re-plan the rest of a traveller's day in Đà Lạt after something changes.
Current time: ${NOW}. Current location: ${CURRENT_PLACE}. Heavy rain from ${RAIN_FROM} for the rest of the day.
Fixed bookings that must stay exactly as they are:
${FIXED.map((f) => `- ${f.place_id} ${f.start}-${f.end}: ${f.label}`).join("\n")}
Current plan for the rest of today: ${JSON.stringify(CURRENT_DAY)}
Use search_places and get_travel_time to build a plan, then submit it with propose_plan. Include the fixed bookings as activities. Times are HH:MM, same day.\nArrive at least ${FIXED_MARGIN} minutes before each fixed booking. Keep each other stop to at most ${MAX_STOP} minutes and leave no more than ${MAX_IDLE} idle minutes before any stop.`;

function runTool(name, input) {
  if (name === "search_places") {
    const [s, e] = input.open_between ?? [];
    return PLACES.filter((p) => p.id !== "homestay")
      .filter((p) => !input.indoor_only || p.indoor)
      .filter((p) => !s || !e || isOpen(p, s, e))
      .map(({ id, name, category, indoor, hours }) => ({ id, name, category, indoor, hours }));
  }
  if (name === "get_travel_time") {
    if (!byId[input.from_place_id] || !byId[input.to_place_id]) return { error: "unknown place_id" };
    return { minutes: travelMinutes(input.from_place_id, input.to_place_id) };
  }
  throw new Error(`unknown tool ${name}`);
}

const client = new Anthropic(
  process.env.ANTHROPIC_WORKSPACE_ID ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } } : {},
);

async function replanOnce() {
  const messages = [{ role: "user", content: USER_MESSAGE }];
  const usage = { input: 0, output: 0, turns: 0, toolCalls: 0, proposals: 0 };
  const startedAt = Date.now();
  let accepted = null;

  while (usage.turns < MAX_TURNS && usage.proposals < MAX_PROPOSALS && !accepted) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: EFFORT },
      system: SYSTEM,
      tools,
      messages,
    });
    usage.turns++;
    usage.input += response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
    usage.output += response.usage.output_tokens;

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
for (let i = 0; i < RUNS; i++) {
  const r = await replanOnce();
  runs.push(r);
  console.log(
    `run ${i + 1}: ok=${r.ok} turns=${r.turns} tool_calls=${r.toolCalls} proposals=${r.proposals} input=${r.input} output=${r.output} cost=$${cost(r).toFixed(4)} time=${r.seconds.toFixed(1)}s${r.reason ? " " + r.reason : ""}`,
  );
  if (r.plan) console.log(`  plan: ${r.plan.activities.map((a) => `${a.start} ${a.place_id}`).join(", ")}\n  explanation: ${r.plan.explanation}`);
}
const avg = (k) => runs.reduce((s, r) => s + r[k], 0) / runs.length;
console.log(
  `\nmodel=${MODEL} effort=${EFFORT} runs=${RUNS} valid=${runs.filter((r) => r.ok).length}/${RUNS} first-proposal-valid=${runs.filter((r) => r.ok && r.proposals === 1).length}/${RUNS}`,
);
console.log(`avg input=${avg("input").toFixed(0)} output=${avg("output").toFixed(0)} cost=$${(runs.reduce((s, r) => s + cost(r), 0) / RUNS).toFixed(4)} time=${avg("seconds").toFixed(1)}s`);
