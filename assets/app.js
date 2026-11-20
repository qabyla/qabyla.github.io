/* Qabyla — поведение сайта: меню, сцена «переписка + журнал записи», калькулятор, формы. */
const CONTACT = { wa: "77472373165", tg: "dekoo_n" };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- шапка и меню ---------- */
const topBar = $(".top");
addEventListener("scroll", () => topBar?.classList.toggle("scrolled", scrollY > 8), { passive: true });
$(".burger")?.addEventListener("click", e => {
  const open = topBar.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
  e.currentTarget.textContent = open ? "Закрыть" : "Меню";
});
$$(".dd > button").forEach(b => b.addEventListener("click", e => {
  e.stopPropagation();
  const dd = b.parentElement, open = !dd.classList.contains("open");
  $$(".dd").forEach(x => x.classList.remove("open"));
  dd.classList.toggle("open", open);
  b.setAttribute("aria-expanded", open);
}));
document.addEventListener("click", () => $$(".dd").forEach(x => x.classList.remove("open")));
document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".dd").forEach(x => x.classList.remove("open")); });

/* ---------- сцена: переписка ночью → запись в журнале ----------
   write: [строка, столбец, текст] — бот вписывает запись;  move: [[r,c],[r,c],текст] — перенос (зачеркнуть и вписать заново) */
const SCENES = {
  barber: {
    name: "Barber Demo", ava: "BD", staff: ["Арман", "Дамир", "Ерлан"], times: ["10:00", "12:00", "14:00", "16:00", "17:00", "18:00", "19:00"],
    taken: [[0, 0, "Тимур"], [1, 2, "Алмас"], [2, 1, "Руслан"], [3, 0, "Данияр"], [4, 2, "Ержан"], [6, 0, "Санжар"]],
    chat: {
      ru: [
        ["in", "Здравствуйте! Можно завтра вечером постричься?"],
        ["out", "Здравствуйте! Завтра свободно 18:00 у Армана и 19:00 у Дамира. Как вам удобнее?"],
        ["in", "18:00, к Арману. Ерасыл Нурланов"],
        ["out", "Записал: пятница, 18:00, мастер Арман.", { write: [5, 0, "Ерасыл Н."] }],
        ["in", "Извините, можно перенести на 19:00?"],
        ["out", "Конечно. В 19:00 свободен Дамир, перенёс к нему.", { move: [[5, 0], [6, 1], "Ерасыл Н."] }],
      ],
      kk: [
        ["in", "Сәлем! Ертең кешке шаш алдыруға бола ма?"],
        ["out", "Сәлеметсіз бе! Ертең 18:00-де Арманда, 19:00-де Дамирде бос. Қайсысы ыңғайлы?"],
        ["in", "18:00, Арман. Ерасыл Нұрланов"],
        ["out", "Жазылдыңыз: жұма, 18:00, шебер Арман.", { write: [5, 0, "Ерасыл Н."] }],
        ["in", "Кешіріңіз, 19:00-ге ауыстыруға бола ма?"],
        ["out", "Әрине. 19:00-де Дамирде бос, ауыстырдым.", { move: [[5, 0], [6, 1], "Ерасыл Н."] }],
      ],
    },
  },
  nails: {
    name: "Nail Demo", ava: "ND", staff: ["Асель", "Мадина", "Жанна"], times: ["10:00", "11:30", "13:00", "14:30", "16:00", "18:00", "19:00"],
    taken: [[0, 1, "Камила"], [1, 0, "Дана"], [3, 1, "Аружан"], [4, 0, "Мира"], [5, 2, "Жания"]],
    chat: {
      ru: [
        ["in", "Здравствуйте! Можно завтра маникюр с покрытием?"],
        ["out", "Здравствуйте! Завтра есть 13:00 у Асель или 18:00 у Мадины. Как вам удобнее?"],
        ["in", "13:00. Айгерим Сапарова"],
        ["out", "Записала: пятница, 13:00, мастер Асель. Напомню за два часа.", { write: [2, 0, "Айгерим С."] }],
      ],
      kk: [
        ["in", "Сәлеметсіз бе! Ертең гель-лакпен маникюр жасатуға бола ма?"],
        ["out", "Сәлеметсіз бе! Ертең Асельде 13:00, Мадинада 18:00 бос. Қайсысы ыңғайлы?"],
        ["in", "13:00. Айгерим Сапарова"],
        ["out", "Жазып қойдым: жұма, 13:00, шебер Асель. Екі сағат бұрын еске саламын.", { write: [2, 0, "Айгерим С."] }],
      ],
    },
  },
  cosmo: {
    name: "Cosmo Demo", ava: "CD", staff: ["Гульнара", "Динара", "Алия"], times: ["10:00", "11:00", "12:00", "14:00", "15:00", "17:00", "18:00"],
    taken: [[0, 1, "Лаура"], [2, 0, "Асем"], [3, 2, "Индира"], [4, 1, "Карина"], [6, 0, "Сабина"]],
    chat: {
      ru: [
        ["in", "Хочу ботокс на лоб. Сколько стоит?"],
        ["out", "Одна зона от 25 000 ₸. Вы уже были у нас на консультации?"],
        ["in", "Нет, первый раз"],
        ["out", "Тогда сначала консультация у Гульнары, перед уколами она обязательна. Завтра есть 11:00."],
        ["in", "Давайте. Мадина Касымова"],
        ["out", "Записала на консультацию: пятница, 11:00.", { write: [1, 0, "Мадина К."] }],
      ],
      kk: [
        ["in", "Маңдайға ботокс салдырғым келеді. Бағасы қанша?"],
        ["out", "Бір аймақ 25 000 ₸-ден басталады. Бізде бұрын кеңес алдыңыз ба?"],
        ["in", "Жоқ, бірінші рет"],
        ["out", "Онда алдымен Гүлнарадан кеңес аласыз, инъекция алдында бұл міндетті. Ертең 11:00 бос."],
        ["in", "Жарайды. Мадина Қасымова"],
        ["out", "Кеңеске жазып қойдым: жұма, 11:00.", { write: [1, 0, "Мадина Қ."] }],
      ],
    },
  },
  dental: {
    name: "Dental Demo", ava: "DD", staff: ["Алиев", "Омарова", "Ким"], times: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
    taken: [[1, 0, "Жумабаев"], [1, 1, "Ли О."], [2, 2, "Сериков"], [3, 0, "Ахметова"], [5, 1, "Ким Д."]],
    chat: {
      ru: [
        ["in", "Здравствуйте, сильно болит зуб. Можно завтра пораньше?"],
        ["out", "Сочувствую. Самое раннее завтра в 09:00 у терапевта Алиева. Записать вас?"],
        ["in", "Да. Сейткали Айгуль Маратовна"],
        ["out", "Записала: пятница, 09:00, терапевт Алиев. Отметила, что срочно.", { write: [0, 0, "Сейткали А."] }],
      ],
      kk: [
        ["in", "Сәлеметсіз бе, тісім қатты ауырып тұр. Ертең ертерек бола ма?"],
        ["out", "Түсінемін. Ертең ең ерте 09:00-де терапевт Алиевте бос. Жазайын ба?"],
        ["in", "Иә. Сейтқали Айгүл Маратқызы"],
        ["out", "Жазып қойдым: жұма, 09:00, терапевт Алиев. Шұғыл деп белгіледім.", { write: [0, 0, "Сейтқали А."] }],
      ],
    },
  },
  med: {
    name: "MedCenter Demo", ava: "MC", staff: ["Терапевт", "Гастроэнт.", "УЗИ"], times: ["08:00", "09:00", "10:00", "11:00", "12:00", "14:30", "16:00"],
    taken: [[0, 2, "Омаров"], [1, 0, "Исаева"], [2, 1, "Петров И."], [3, 0, "Нуриев"], [5, 1, "Касымова"]],
    chat: {
      ru: [
        ["in", "Неделю болит желудок после еды. К какому врачу мне?"],
        ["out", "С этим лучше к гастроэнтерологу. Завтра у Мусиной есть 12:00 и 14:30."],
        ["in", "12:00. Бекенов Нурлан"],
        ["out", "Записала: пятница, 12:00, гастроэнтеролог Мусина.", { write: [4, 1, "Бекенов Н."] }],
      ],
      kk: [
        ["in", "Бір аптадан бері тамақтан кейін асқазаным ауырады. Қай дәрігерге барайын?"],
        ["out", "Бұл жағдайда гастроэнтерологқа барған дұрыс. Ертең Мусинада 12:00 мен 14:30 бос."],
        ["in", "12:00. Бекенов Нұрлан"],
        ["out", "Жазып қойдым: жұма, 12:00, гастроэнтеролог Мусина.", { write: [4, 1, "Бекенов Н."] }],
      ],
    },
  },
};
const LABELS = { ru: { day: "Пятница", sub: "на завтра", who: "ИИ-администратор" },
                 kk: { day: "Жұма", sub: "ертеңге", who: "ИИ-әкімші" } };

function makeDesk(desk) {
  const grid = $(".j-grid", desk), msgs = $(".msgs", desk), clock = $(".chat-bar time", desk);
  let run = 0, key = desk.dataset.scene || "barber", lang = "ru";
  const cell = (r, c) => $(`[data-rc="${r}-${c}"]`, grid);

  function draw(sc) {
    let html = `<span class="h"></span>` + sc.staff.map(s => `<span class="h">${s}</span>`).join("");
    sc.times.forEach((t, r) => {
      html += `<span class="t">${t}</span>`;
      sc.staff.forEach((_, c) => { html += `<span class="c" data-rc="${r}-${c}"></span>`; });
    });
    grid.innerHTML = html;
    sc.taken.forEach(([r, c, name]) => { const el = cell(r, c); el.classList.add("old"); el.innerHTML = `<span class="w">${name}</span>`; });
    $(".p-name", desk).textContent = sc.name; $(".p-ava", desk).textContent = sc.ava;
    const L = LABELS[lang]; $(".j-head b", desk).textContent = L.day; $(".j-head small", desk).textContent = L.sub;
    $(".chat-bar small", desk).textContent = L.who;
  }
  async function write(r, c, text, my) {
    const el = cell(r, c);
    el.className = "c new"; el.innerHTML = `<span class="w"></span><span class="caret"></span>`;
    const w = $(".w", el);
    for (const ch of text) { if (my !== run) return; w.textContent += ch; await wait(reduce ? 0 : 70); }
    $(".caret", el)?.remove();
  }
  function bubble(kind, text) {
    const el = document.createElement("div"); el.className = "msg " + kind; el.textContent = text; msgs.appendChild(el);
    // убираем только те сообщения, что ушли за верхний край (scrollHeight врёт из-за анимации появления)
    const top = msgs.getBoundingClientRect().top;
    while (msgs.children.length > 1 && msgs.firstElementChild.getBoundingClientRect().top < top - 1) msgs.removeChild(msgs.firstElementChild);
  }
  async function play(k = key) {
    key = k; const my = ++run, sc = SCENES[k];
    draw(sc); msgs.innerHTML = ""; clock.textContent = "23:47";
    let m = 47;
    for (const [kind, text, act] of sc.chat[lang]) {
      if (my !== run) return;
      if (!reduce) {
        if (kind === "out") {
          const t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<span></span><span></span><span></span>";
          msgs.appendChild(t); await wait(900 + Math.min(text.length * 10, 900)); t.remove();
        } else await wait(1300);
        if (my !== run) return;
      }
      bubble(kind, text);
      if (kind === "in") clock.textContent = "23:" + String(Math.min(++m, 59));
      if (act?.write) { await wait(reduce ? 0 : 300); await write(...act.write, my); }
      if (act?.move) {
        const [[r1, c1], [r2, c2], name] = act.move;
        const old = cell(r1, c1); old.className = "c struck"; old.innerHTML = `<span class="w">${name}</span>`;
        await wait(reduce ? 0 : 650); await write(r2, c2, name, my);
      }
    }
  }
  return { play, setLang(l) { lang = l; play(key); }, get key() { return key; } };
}

$$(".desk").forEach(desk => {
  const d = makeDesk(desk);
  const tabs = $$(`[data-for="${desk.id}"] button`);
  tabs.forEach(b => b.addEventListener("click", () => { tabs.forEach(x => x.setAttribute("aria-selected", x === b)); d.play(b.dataset.scene); }));
  $(`[data-replay="${desk.id}"]`)?.addEventListener("click", () => d.play(d.key));
  const langs = $$(`[data-lang-for="${desk.id}"] button`);
  langs.forEach(b => b.addEventListener("click", () => { langs.forEach(x => x.setAttribute("aria-pressed", x === b)); d.setLang(b.dataset.lang); }));
  let started = false;
  const go = () => { if (!started) { started = true; d.play(); } };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: .2 }).observe(desk);
  setTimeout(go, 1600);
});

/* ---------- калькулятор ---------- */
const money = n => Math.round(n).toLocaleString("ru-RU").replace(/[  ,]/g, " ") + " ₸";
if ($("#c-msgs")) {
  const calc = () => {
    const msgs = +$("#c-msgs").value, lost = +$("#c-lost").value / 100, check = +$("#c-check").value, noshow = +$("#c-noshow").value / 100;
    $("#o-msgs").textContent = msgs; $("#o-lost").textContent = Math.round(lost * 100) + "%";
    $("#o-check").textContent = money(check); $("#o-noshow").textContent = Math.round(noshow * 100) + "%";
    const days = 26, conv = .6;                       // ~60% обращений становятся записью
    const loss = (msgs * days * lost * conv + msgs * days * conv * (1 - lost) * noshow) * check;
    $("#r-loss").textContent = money(loss);
    const need = Math.ceil(34900 / check);
    $("#r-pay").textContent = `${need} ${need % 10 === 1 && need % 100 !== 11 ? "клиента" : "клиентов"} в месяц`;
  };
  ["c-msgs", "c-lost", "c-check", "c-noshow"].forEach(id => $("#" + id).addEventListener("input", calc));
  calc();
}

/* ---------- формы → WhatsApp ---------- */
const params = new URLSearchParams(location.search);
$$("select[name=plan]").forEach(s => { if (params.get("plan")) s.value = params.get("plan"); });
$$("select[name=biz]").forEach(s => { if (params.get("biz")) s.value = params.get("biz"); });
const openWA = lines => window.open(`https://wa.me/${CONTACT.wa}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
function check(f, names) {
  const missing = names.filter(n => !(f[n].value || "").trim());
  names.forEach(n => f[n].toggleAttribute("aria-invalid", missing.includes(n)));
  if (missing.length) f[missing[0]].focus();
  return !missing.length;
}
$$("form.lead-form").forEach(f => f.addEventListener("submit", e => {
  e.preventDefault();
  if (!check(f, ["name"])) return;
  const v = n => (f[n]?.value || "").trim();
  const lines = ["Здравствуйте! Хочу попробовать Qabyla 14 дней бесплатно.", `Имя: ${v("name")}`, `Бизнес: ${v("biz")}`,
                 `Город: ${v("city") || "—"}`, `Тариф: ${v("plan")}`];
  if (v("note")) lines.push(`Комментарий: ${v("note")}`);
  openWA(lines);
}));
$$(".kinds button").forEach(b => b.addEventListener("click", () => {
  const f = b.closest("form"); f.kind.value = b.textContent; f.kind.removeAttribute("aria-invalid");
  $$(".kinds button", f).forEach(x => x.classList.toggle("on", x === b)); f.services.focus();
}));
$$("form.custom-form").forEach(f => f.addEventListener("submit", e => {
  e.preventDefault();
  if (!check(f, ["kind", "services", "name"])) return;
  const v = n => (f[n]?.value || "").trim();
  const lines = ["Здравствуйте! Хочу ИИ-администратора для своего бизнеса.", `Вид бизнеса: ${v("kind")}`];
  if (v("title")) lines.push(`Название: ${v("title")}`);
  if (v("city")) lines.push(`Город: ${v("city")}`);
  lines.push("Услуги и цены:", v("services"));
  if (v("staff")) lines.push(`Мастера и график: ${v("staff")}`);
  lines.push(`Имя: ${v("name")}`);
  openWA(lines);
}));

/* ---------- демо: фраза копируется по нажатию ---------- */
$$(".phrases button").forEach(b => b.addEventListener("click", async () => {
  const text = b.dataset.text || b.textContent;
  try { await navigator.clipboard.writeText(text); } catch {}
  b.classList.add("copied"); b.textContent = "Скопировано";
  setTimeout(() => { b.textContent = text; b.classList.remove("copied"); }, 1200);
}));
