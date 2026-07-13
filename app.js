const shell = document.querySelector(".app-shell");
const form = document.querySelector("[data-oracle-form]");
const readingGrid = document.querySelector("[data-reading-grid]");
const readingPanel = document.querySelector(".reading-panel");
const generatedStamp = document.querySelector("[data-generated-stamp]");
const questionEcho = document.querySelector("[data-question-echo]");
const copyButton = document.querySelector("[data-copy-reading]");
const primaryAction = document.querySelector(".primary-action");
const primaryActionLabel = primaryAction.querySelector("span");
const answerPreview = document.querySelector("[data-answer-preview]");
const answerToast = document.querySelector("[data-answer-toast]");
const generationBar = document.querySelector("[data-generation-bar]");
const topicSelect = document.querySelector("[data-topic-select]");
const canvas = document.querySelector("[data-star-canvas]");
const ctx = canvas.getContext("2d");

const state = {
  tradition: "chinese",
  mode: "dynamic",
  lastReadingText: "",
  generation: 0,
  hasGenerated: false,
};

const stems = [
  { name: "甲", element: "木", polarity: "阳" },
  { name: "乙", element: "木", polarity: "阴" },
  { name: "丙", element: "火", polarity: "阳" },
  { name: "丁", element: "火", polarity: "阴" },
  { name: "戊", element: "土", polarity: "阳" },
  { name: "己", element: "土", polarity: "阴" },
  { name: "庚", element: "金", polarity: "阳" },
  { name: "辛", element: "金", polarity: "阴" },
  { name: "壬", element: "水", polarity: "阳" },
  { name: "癸", element: "水", polarity: "阴" },
];

const branches = [
  { name: "子", element: "水", hidden: ["癸"] },
  { name: "丑", element: "土", hidden: ["己", "癸", "辛"] },
  { name: "寅", element: "木", hidden: ["甲", "丙", "戊"] },
  { name: "卯", element: "木", hidden: ["乙"] },
  { name: "辰", element: "土", hidden: ["戊", "乙", "癸"] },
  { name: "巳", element: "火", hidden: ["丙", "戊", "庚"] },
  { name: "午", element: "火", hidden: ["丁", "己"] },
  { name: "未", element: "土", hidden: ["己", "丁", "乙"] },
  { name: "申", element: "金", hidden: ["庚", "壬", "戊"] },
  { name: "酉", element: "金", hidden: ["辛"] },
  { name: "戌", element: "土", hidden: ["戊", "辛", "丁"] },
  { name: "亥", element: "水", hidden: ["壬", "甲"] },
];

const elementCycle = ["木", "火", "土", "金", "水"];
const elementTone = {
  木: "生长、规划、连接",
  火: "表达、曝光、决断",
  土: "稳定、承载、复盘",
  金: "规则、筛选、执行",
  水: "信息、流动、直觉",
};

const hexagrams = [
  { name: "乾为天", cue: "主动开局，但要有明确边界" },
  { name: "坤为地", cue: "先蓄势承接，再放大成果" },
  { name: "水雷屯", cue: "新机会正在成形，先解决阻塞" },
  { name: "山水蒙", cue: "先学习校准，再做判断" },
  { name: "风天小畜", cue: "小范围积累会带来突破" },
  { name: "地天泰", cue: "内外协同，适合推进合作" },
  { name: "火风鼎", cue: "适合重塑定位和展示方式" },
  { name: "风火家人", cue: "内部秩序决定外部机会" },
  { name: "雷火丰", cue: "机会明显，但别被热度带偏" },
  { name: "泽水困", cue: "先脱困，再谈扩张" },
  { name: "水火既济", cue: "阶段收束，适合复盘和交付" },
  { name: "火水未济", cue: "还差最后一段整合" },
];

const signs = [
  { name: "白羊座", element: "火", mode: "开创", start: [3, 21], end: [4, 19] },
  { name: "金牛座", element: "土", mode: "固定", start: [4, 20], end: [5, 20] },
  { name: "双子座", element: "风", mode: "变动", start: [5, 21], end: [6, 21] },
  { name: "巨蟹座", element: "水", mode: "开创", start: [6, 22], end: [7, 22] },
  { name: "狮子座", element: "火", mode: "固定", start: [7, 23], end: [8, 22] },
  { name: "处女座", element: "土", mode: "变动", start: [8, 23], end: [9, 22] },
  { name: "天秤座", element: "风", mode: "开创", start: [9, 23], end: [10, 23] },
  { name: "天蝎座", element: "水", mode: "固定", start: [10, 24], end: [11, 22] },
  { name: "射手座", element: "火", mode: "变动", start: [11, 23], end: [12, 21] },
  { name: "摩羯座", element: "土", mode: "开创", start: [12, 22], end: [1, 19], wraps: true },
  { name: "水瓶座", element: "风", mode: "固定", start: [1, 20], end: [2, 18] },
  { name: "双鱼座", element: "水", mode: "变动", start: [2, 19], end: [3, 20] },
];

const topicMap = {
  career: "事业机会",
  wealth: "财富节奏",
  relationship: "关系情感",
  study: "学习成长",
  health: "身心状态",
};

const questionBank = {
  career: ["接下来三个月我最需要把握什么机会？", "我该不该换工作？", "我现在适合主动谈合作吗？"],
  wealth: ["我近期最该注意哪类财务风险？", "接下来适合增加收入还是控制支出？", "我该不该投入一个新项目？"],
  relationship: ["这段关系接下来该主动推进吗？", "我该不该把真实想法说出来？", "这段关系的问题核心是什么？"],
  study: ["我接下来最该补哪种能力？", "我现在适合开始一个长期学习计划吗？", "我怎么提高执行力？"],
  health: ["我近期最该调整哪种生活节律？", "我的压力出口应该放在哪里？", "接下来怎样让状态稳定下来？"],
};

const selectors = {
  panelTitle: "[data-panel-title]",
  panelSubtitle: "[data-panel-subtitle]",
  stageTitle: "[data-stage-title]",
  modeLabel: "[data-mode-label]",
  statusLabel: "[data-status-label]",
  dayMaster: "[data-day-master]",
  pillarsInline: "[data-pillars-inline]",
  cnBasis: "[data-cn-basis]",
  cnElement: "[data-cn-element]",
  cnElementCopy: "[data-cn-element-copy]",
  cnHexagram: "[data-cn-hexagram]",
  cnHexagramCopy: "[data-cn-hexagram-copy]",
  cnReportName: "[data-cn-report-name]",
  pillarYear: "[data-pillar-year]",
  pillarMonth: "[data-pillar-month]",
  pillarDay: "[data-pillar-day]",
  pillarHour: "[data-pillar-hour]",
  cnStaticCopy: "[data-cn-static-copy]",
  sunSign: "[data-sun-sign]",
  moonSign: "[data-moon-sign]",
  risingSign: "[data-rising-sign]",
  staticSun: "[data-static-sun]",
  staticMoon: "[data-static-moon]",
  staticRising: "[data-static-rising]",
  astroElement: "[data-astro-element]",
  westReportName: "[data-west-report-name]",
  westStaticCopy: "[data-west-static-copy]",
  energyScore: "[data-energy-score]",
  energyMeter: "[data-energy-meter]",
  windowLabel: "[data-window-label]",
  windowCopy: "[data-window-copy]",
  avoidLabel: "[data-avoid-label]",
  avoidCopy: "[data-avoid-copy]",
  readingTitle: "[data-reading-title]",
};

function $(selector) {
  return document.querySelector(selector);
}

function setText(selector, text) {
  const node = $(selector);
  if (node) node.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hashString(value) {
  return Array.from(value).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);
}

function mod(value, length) {
  return ((value % length) + length) % length;
}

function pick(list, seed, offset = 0) {
  return list[mod(seed + offset, list.length)];
}

function getFormData() {
  const data = new FormData(form);
  const raw = Object.fromEntries(data.entries());
  return {
    name: raw.name?.trim() || "来访者",
    date: raw.date || "1992-08-18",
    time: raw.time || "08:30",
    place: raw.place?.trim() || "未填写",
    topic: raw.topic || "career",
    question: raw.question?.trim() || "我接下来应该关注什么？",
  };
}

function parseInputDate(input) {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  return {
    year: year || 1992,
    month: month || 8,
    day: day || 18,
    hour: hour || 0,
    minute: minute || 0,
  };
}

function ganzhiFromIndex(index) {
  return `${stems[mod(index, 10)].name}${branches[mod(index, 12)].name}`;
}

function getStemInfo(name) {
  return stems.find((stem) => stem.name === name) || stems[0];
}

function getYearIndex(year) {
  return mod(year - 4, 60);
}

function getMonthIndex(dateParts) {
  const solarMonth = dateParts.day < 6 ? dateParts.month - 1 : dateParts.month;
  const lunarMonthIndex = mod(solarMonth - 2, 12);
  const branchIndex = mod(2 + lunarMonthIndex, 12);
  const yearStemIndex = mod(getYearIndex(dateParts.year), 10);
  const stemIndex = mod(yearStemIndex * 2 + lunarMonthIndex, 10);
  return { stemIndex, branchIndex, index: stemIndex };
}

function getDayIndex(dateParts) {
  const reference = Date.UTC(1900, 0, 31);
  const target = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);
  const diffDays = Math.floor((target - reference) / 86400000);
  return mod(diffDays + 40, 60);
}

function getHourIndex(dayIndex, hour) {
  const branchIndex = mod(Math.floor((hour + 1) / 2), 12);
  const dayStemIndex = mod(dayIndex, 10);
  const stemIndex = mod(dayStemIndex * 2 + branchIndex, 10);
  return { stemIndex, branchIndex };
}

function buildPillar(stemIndex, branchIndex) {
  const stem = stems[mod(stemIndex, 10)];
  const branch = branches[mod(branchIndex, 12)];
  return {
    label: `${stem.name}${branch.name}`,
    stem,
    branch,
  };
}

function buildChineseProfile(input, seed) {
  const date = parseInputDate(input);
  const yearIndex = getYearIndex(date.year);
  const monthIndex = getMonthIndex(date);
  const dayIndex = getDayIndex(date);
  const hourIndex = getHourIndex(dayIndex, date.hour);
  const pillars = {
    year: buildPillar(yearIndex, yearIndex),
    month: buildPillar(monthIndex.stemIndex, monthIndex.branchIndex),
    day: buildPillar(dayIndex, dayIndex),
    hour: buildPillar(hourIndex.stemIndex, hourIndex.branchIndex),
  };
  const scores = Object.fromEntries(elementCycle.map((element) => [element, 0]));

  Object.values(pillars).forEach((pillar) => {
    scores[pillar.stem.element] += 2;
    scores[pillar.branch.element] += 2;
    pillar.branch.hidden.forEach((hiddenStem) => {
      scores[getStemInfo(hiddenStem).element] += 0.7;
    });
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const support = sorted[1][0];
  const weak = sorted[sorted.length - 1][0];
  const dayMaster = `${pillars.day.stem.name}${pillars.day.stem.element}`;
  const hexagram = pick(hexagrams, seed, date.day + state.generation);
  const scoreTotal = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const balance = Math.round(100 - (sorted[0][1] - sorted[4][1]) * 8);
  const energy = Math.max(48, Math.min(96, balance + Math.round(sorted[0][1] * 3)));

  return {
    date,
    pillars,
    scores,
    dominant,
    support,
    weak,
    dayMaster,
    hexagram,
    energy,
    scoreTotal,
    needle: mod(seed + date.day * 11 + date.hour * 7, 360),
  };
}

function rangeContains(month, day, sign) {
  const value = month * 100 + day;
  const start = sign.start[0] * 100 + sign.start[1];
  const end = sign.end[0] * 100 + sign.end[1];
  if (sign.wraps) return value >= start || value <= end;
  return value >= start && value <= end;
}

function getSunSign(month, day) {
  return signs.find((sign) => rangeContains(month, day, sign)) || signs[0];
}

function getMoonSign(date) {
  const reference = Date.UTC(2000, 0, 6);
  const target = Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute);
  const days = (target - reference) / 86400000;
  return signs[mod(Math.floor(days / 2.295), signs.length)];
}

function getRisingSign(sunIndex, date, place, seed) {
  const placeOffset = mod(hashString(place), 6) - 2;
  const hourOffset = Math.floor((date.hour + date.minute / 60) / 2);
  return signs[mod(sunIndex + hourOffset + placeOffset + Math.floor(seed % 3), signs.length)];
}

function buildWesternProfile(input, seed) {
  const date = parseInputDate(input);
  const sun = getSunSign(date.month, date.day);
  const sunIndex = signs.indexOf(sun);
  const moon = getMoonSign(date);
  const rising = getRisingSign(sunIndex, date, input.place, seed);
  const elements = [sun.element, moon.element, rising.element];
  const elementCounts = elements.reduce((acc, element) => {
    acc[element] = (acc[element] || 0) + 1;
    return acc;
  }, {});
  const dominantElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0][0];
  const modes = [sun.mode, moon.mode, rising.mode];
  const dominantMode = modes.sort((a, b) => modes.filter((v) => v === b).length - modes.filter((v) => v === a).length)[0];
  const energy = Math.max(50, Math.min(96, 58 + elementCounts[dominantElement] * 10 + mod(seed, 17)));

  return {
    date,
    sun,
    moon,
    rising,
    sunIndex,
    moonIndex: signs.indexOf(moon),
    risingIndex: signs.indexOf(rising),
    dominantElement,
    dominantMode,
    energy,
  };
}

function inferTopic(input) {
  const q = input.question;
  if (/钱|财|收入|投资|项目|成本|回款/.test(q)) return "wealth";
  if (/关系|感情|喜欢|伴侣|沟通|复合/.test(q)) return "relationship";
  if (/学|能力|成长|考试|课程|执行力/.test(q)) return "study";
  if (/健康|睡眠|压力|身体|状态|焦虑/.test(q)) return "health";
  if (/工作|事业|合作|机会|职业|客户|产品/.test(q)) return "career";
  return input.topic;
}

function buildDirectAnswer(input, profile) {
  const topic = inferTopic(input);
  if (state.tradition === "chinese") {
    const base = {
      career: `可以主动把握，但不要同时铺太多线。${profile.hexagram.name}提示你先把一个主项目打透，重点使用${profile.dominant}的力量。`,
      wealth: `先稳现金流，再看增量机会。当前${profile.weak}偏弱，容易在对应领域出现疏漏，预算和边界要先定清楚。`,
      relationship: `先把话说清楚，再判断要不要推进。${profile.hexagram.cue}，关系里的秩序感比一时情绪更重要。`,
      study: `可以开始，但要用小周期验证。你的盘面${profile.support}为辅助力量，适合找模板、老师或固定训练节奏。`,
      health: `先恢复节律，再谈提升。${profile.dominant}过旺时容易带来惯性消耗，建议先从睡眠、饮食和压力记录入手。`,
    };
    return `回答：${base[topic]}`;
  }

  const base = {
    career: `值得主动发起。太阳${profile.sun.name}强调可见度，接下来更需要把作品、方案或能力展示出来，而不是只在心里准备。`,
    wealth: `适合做结构调整，不适合冲动冒险。${profile.dominantElement}元素偏强，先管住节奏和风险，再谈收益。`,
    relationship: `先表达真实需求，再观察对方回应。上升${profile.rising.name}提示你会在呈现方式上顾及别人，但这次要把自己放回对话中心。`,
    study: `可以开始，而且要阶段化。${profile.dominantMode}能量适合把目标拆成短周期成果，用反馈推动学习。`,
    health: `先减负，再谈提升。星盘倾向显示状态受节奏影响明显，适合把作息、运动和压力源分开处理。`,
  };
  return `回答：${base[topic]}`;
}

function buildReading(input, profile) {
  const topic = inferTopic(input);
  const topicName = topicMap[topic];
  if (state.tradition === "chinese") {
    return [
      {
        title: "问题直答",
        body: `你问「${input.question}」。${buildDirectAnswer(input, profile)}`,
      },
      {
        title: "判断依据",
        body: `四柱为 ${profile.pillars.year.label} / ${profile.pillars.month.label} / ${profile.pillars.day.label} / ${profile.pillars.hour.label}，日主为${profile.dayMaster}，主导五行为${profile.dominant}。`,
      },
      {
        title: "机会窗口",
        body: `围绕「${topicName}」，卦象「${profile.hexagram.name}」给出的窗口是：${profile.hexagram.cue}。建议用 7 到 21 天做一轮验证。`,
      },
      {
        title: "行动建议",
        body: `先做一件能被验证的小事：列出资源、定一个交付物、找一个反馈对象。避开${profile.weak}对应的短板，不要让细节拖慢主线。`,
      },
    ];
  }

  return [
    {
      title: "问题直答",
      body: `你问「${input.question}」。${buildDirectAnswer(input, profile)}`,
    },
    {
      title: "判断依据",
      body: `太阳${profile.sun.name}、月亮估算${profile.moon.name}、上升估算${profile.rising.name}，主导元素为${profile.dominantElement}，行动模式偏${profile.dominantMode}。`,
    },
    {
      title: "机会窗口",
      body: `围绕「${topicName}」，接下来更适合公开输出、主动沟通和建立节奏。机会来自可见成果，不是等待别人猜到你的价值。`,
    },
    {
      title: "行动建议",
      body: `先做一个小范围实验，再观察反馈。把问题拆成一个可交付动作，避免用一时情绪替代长期判断。`,
    },
  ];
}

function renderElementBars(scores, total) {
  const html = elementCycle
    .map((element) => {
      const percent = Math.round((scores[element] / total) * 100);
      return `<div><span>${element}</span><i style="--level:${percent}%"></i><b>${percent}</b></div>`;
    })
    .join("");
  document.querySelector("[data-element-bars]").innerHTML = html;
}

function renderChinese(input, profile) {
  const pillarText = `${profile.pillars.year.label} / ${profile.pillars.month.label} / ${profile.pillars.day.label} / ${profile.pillars.hour.label}`;
  setText(selectors.dayMaster, profile.dayMaster);
  setText(selectors.pillarsInline, pillarText);
  setText(selectors.cnBasis, `日主${profile.dayMaster}，${profile.dominant}最显，${profile.weak}需补。`);
  setText(selectors.cnElement, `${profile.dominant}旺，${profile.support}为辅`);
  setText(selectors.cnElementCopy, `${elementTone[profile.dominant]}是当前最容易调动的力量。`);
  setText(selectors.cnHexagram, profile.hexagram.name);
  setText(selectors.cnHexagramCopy, profile.hexagram.cue);
  setText(selectors.cnReportName, `${input.name}命盘摘要`);
  setText(selectors.pillarYear, profile.pillars.year.label);
  setText(selectors.pillarMonth, profile.pillars.month.label);
  setText(selectors.pillarDay, profile.pillars.day.label);
  setText(selectors.pillarHour, profile.pillars.hour.label);
  setText(selectors.cnStaticCopy, `当前结构以${profile.dominant}为主、${profile.support}为辅，${profile.weak}较弱。建议先利用强项打开局面，再补足短板。`);
  document.querySelector("[data-bagua-plate]").style.setProperty("--needle", `${profile.needle}deg`);
  renderElementBars(profile.scores, profile.scoreTotal);
}

function renderWestern(input, profile) {
  setText(selectors.sunSign, profile.sun.name);
  setText(selectors.moonSign, profile.moon.name);
  setText(selectors.risingSign, profile.rising.name);
  setText(selectors.staticSun, profile.sun.name);
  setText(selectors.staticMoon, profile.moon.name);
  setText(selectors.staticRising, profile.rising.name);
  setText(selectors.astroElement, `${profile.dominantElement}象`);
  setText(selectors.westReportName, `${input.name}星盘摘要`);
  setText(selectors.westStaticCopy, `太阳按公历生日计算为${profile.sun.name}；月亮和上升为原型估算。主导元素${profile.dominantElement}象，行动模式偏${profile.dominantMode}。`);
  document.querySelector(".planet-sun").style.setProperty("--deg", `${profile.sunIndex * 30}deg`);
  document.querySelector(".planet-moon").style.setProperty("--deg", `${profile.moonIndex * 30 + 9}deg`);
  document.querySelector(".planet-rise").style.setProperty("--deg", `${profile.risingIndex * 30 + 18}deg`);
}

function buildProfile(input) {
  const seed = hashString(`${input.name}|${input.date}|${input.time}|${input.place}|${input.topic}|${input.question}|${state.generation}`);
  const chinese = buildChineseProfile(input, seed);
  const western = buildWesternProfile(input, seed);
  return { seed, chinese, western };
}

function getActiveProfile(profiles) {
  return state.tradition === "chinese" ? profiles.chinese : profiles.western;
}

function renderInsights(profile) {
  const energy = profile.energy;
  const windowLabel = energy > 82 ? "3-10 天" : energy > 68 ? "7-21 天" : "14-30 天";
  const avoid = state.tradition === "chinese" ? `${profile.weak}弱失衡` : "只想不发";
  const avoidCopy = state.tradition === "chinese" ? `补足${profile.weak}对应的短板，避免强项过度消耗。` : "把想法变成可见输出，别停在脑内推演。";
  setText(selectors.energyScore, energy);
  document.querySelector(selectors.energyMeter).style.setProperty("--score", `${energy}%`);
  setText(selectors.windowLabel, windowLabel);
  setText(selectors.windowCopy, energy > 82 ? "适合快速测试一个机会。" : "适合小范围验证。");
  setText(selectors.avoidLabel, avoid);
  setText(selectors.avoidCopy, avoidCopy);
}

function markReadingUpdated() {
  readingPanel.classList.remove("is-updating");
  answerPreview.classList.remove("is-updating");
  void readingPanel.offsetWidth;
  readingPanel.classList.add("is-updating");
  answerPreview.classList.add("is-updating");
}

function renderReading(cards, input, { animate = false, stamp = false } = {}) {
  readingGrid.innerHTML = cards
    .map((card, index) => `<article class="${index === 0 ? "is-featured" : ""}"><span>${escapeHtml(card.title)}</span><p>${escapeHtml(card.body)}</p></article>`)
    .join("");
  const directAnswer = cards[0];
  if (state.hasGenerated || stamp) {
    answerPreview.hidden = false;
    answerPreview.innerHTML = `<span>${escapeHtml(directAnswer.title)}</span><p>${escapeHtml(directAnswer.body)}</p>`;
  } else {
    answerPreview.hidden = true;
  }
  if (stamp) {
    answerToast.hidden = false;
    answerToast.querySelector("span").textContent = directAnswer.title;
    answerToast.querySelector("p").textContent = directAnswer.body;
  }
  state.lastReadingText = cards.map((card) => `${card.title}：${card.body}`).join("\n");
  questionEcho.textContent = `问题：${input.question}`;
  if (stamp) generatedStamp.textContent = `已生成 ${new Date().toLocaleTimeString("zh-CN", { hour12: false })}`;
  if (animate) markReadingUpdated();
}

function updateTitles() {
  const isChinese = state.tradition === "chinese";
  const isDynamic = state.mode === "dynamic";
  const traditionName = isChinese ? "中式命理" : "西式占星";
  setText(selectors.panelTitle, traditionName);
  setText(selectors.panelSubtitle, isChinese ? "干支五行推演中" : "星盘元素推演中");
  setText(selectors.modeLabel, isDynamic ? "动态版" : "静态版");
  setText(selectors.stageTitle, `${traditionName}${isDynamic ? "动态盘" : "静态报告"}`);
  setText(selectors.statusLabel, shell.dataset.generating === "true" ? "推演中" : "待推演");
  setText(selectors.readingTitle, `${traditionName} AI 解读`);
}

function syncControls() {
  shell.dataset.tradition = state.tradition;
  shell.dataset.mode = state.mode;
  document.querySelectorAll("[data-tradition-button]").forEach((button) => {
    const active = button.dataset.traditionButton === state.tradition;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-mode-button]").forEach((button) => {
    const active = button.dataset.modeButton === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  updateTitles();
}

function syncTopicChips() {
  document.querySelectorAll("[data-topic-chip]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.topicChip === topicSelect.value);
  });
}

function refreshAll(options = {}) {
  const input = getFormData();
  const profiles = buildProfile(input);
  const activeProfile = getActiveProfile(profiles);
  const cards = buildReading(input, activeProfile);
  renderChinese(input, profiles.chinese);
  renderWestern(input, profiles.western);
  renderInsights(activeProfile);
  renderReading(cards, input, options);
  return { input, profiles, activeProfile, cards };
}

function setGenerating(value) {
  shell.dataset.generating = String(value);
  primaryAction.disabled = value;
  primaryAction.classList.toggle("is-loading", value);
  primaryActionLabel.textContent = value ? "正在推演" : "生成 AI 解读";
  setText(selectors.statusLabel, value ? "推演中" : "已完成");
}

function generateWithFeedback() {
  state.generation += 1;
  state.hasGenerated = true;
  setGenerating(true);
  generationBar.style.setProperty("--progress", "0%");
  let progress = 0;
  const timer = window.setInterval(() => {
    progress = Math.min(92, progress + 11 + Math.round(Math.random() * 12));
    generationBar.style.setProperty("--progress", `${progress}%`);
  }, 90);

  window.setTimeout(() => {
    window.clearInterval(timer);
    generationBar.style.setProperty("--progress", "100%");
    refreshAll({ animate: true, stamp: true });
    setGenerating(false);
    window.setTimeout(() => generationBar.style.setProperty("--progress", "0%"), 700);
    answerPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 760);
}

document.querySelectorAll("[data-enter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.tradition = button.dataset.enter;
    state.mode = "dynamic";
    shell.classList.add("is-oracle");
    syncControls();
    refreshAll();
  });
});

document.querySelector("[data-back]").addEventListener("click", () => {
  shell.classList.remove("is-oracle");
});

document.querySelectorAll("[data-tradition-button]").forEach((button) => {
  button.addEventListener("click", () => {
    state.tradition = button.dataset.traditionButton;
    syncControls();
    refreshAll({ animate: true });
  });
});

document.querySelectorAll("[data-mode-button]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.modeButton;
    syncControls();
  });
});

document.querySelectorAll("[data-topic-chip]").forEach((button) => {
  button.addEventListener("click", () => {
    topicSelect.value = button.dataset.topicChip;
    syncTopicChips();
    refreshAll({ animate: true });
  });
});

topicSelect.addEventListener("change", () => {
  syncTopicChips();
  refreshAll({ animate: true });
});

document.querySelector("[data-random-question]").addEventListener("click", () => {
  const topic = topicSelect.value;
  const options = questionBank[topic];
  const question = pick(options, state.generation + hashString(form.elements.name.value), 1);
  form.elements.question.value = question;
  generateWithFeedback();
});

document.querySelector("[data-close-toast]").addEventListener("click", () => {
  answerToast.hidden = true;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateWithFeedback();
});

copyButton.addEventListener("click", async () => {
  if (!state.lastReadingText) return;
  try {
    await navigator.clipboard.writeText(state.lastReadingText);
    copyButton.querySelector("span").textContent = "已复制";
    window.setTimeout(() => {
      copyButton.querySelector("span").textContent = "复制";
    }, 1200);
  } catch {
    copyButton.querySelector("span").textContent = "复制失败";
  }
});

window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
});

function makeStars(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.7 + 0.35,
    speed: Math.random() * 0.0018 + 0.00035,
    alpha: Math.random() * 0.52 + 0.22,
  }));
}

const stars = makeStars(160);

function drawStars() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const targetWidth = Math.floor(width * ratio);
  const targetHeight = Math.floor(height * ratio);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(7, 10, 15, 0.42)";
  ctx.fillRect(0, 0, width, height);
  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > 1) star.y = 0;
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(248, 239, 226, ${star.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener("load", () => {
  initIcons();
  syncControls();
  syncTopicChips();
  refreshAll();
  drawStars();
});
