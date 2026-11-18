// Grupper på Facebook: söka, gå med och svara på medlemsfrågor. Körs bara på uppdrag
// från Kajsas agent, och bara efter att Kajsa har sagt ja i Telegram (söka är bara läsning).
//
// Försiktighet i koden:
//   - högst MAX_JOINS_PER_DAY grupper per dag och MAX_JOINS_PER_RUN per körning
//   - klickar bara på knappen "Gå med" i gruppens sidhuvud
//   - har gruppen frågor stängs rutan utan att skicka; frågorna går till Kajsa
//   - svar skickas bara om varje fråga i rutan har ett svar som Kajsa har godkänt
import {
  MAX_JOINS_PER_RUN,
  cardInfo,
  countJoin,
  groupUrl,
  isJoinLabel,
  jitterMs,
  joinsLeft,
  matchAnswers,
  membershipFromButtons,
  normaliseText,
  questionType,
  truncate,
} from "./lib.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FIELD = 'textarea, input[type="text"], [contenteditable="true"][role="textbox"], [role="radio"], input[type="radio"], [role="checkbox"], input[type="checkbox"]';

/** Söker grupper för varje sökord och samlar korten (namn, länk, info, medlemskap). */
export async function searchGroups(page, sokord, h) {
  const found = new Map();
  for (const q of sokord.slice(0, 4)) {
    await page.goto(`https://www.facebook.com/search/groups/?q=${encodeURIComponent(q)}`, { waitUntil: "domcontentloaded" });
    await h.settle(page, 4000, 7000);
    if (await h.checkHuman(page)) return { human: true };
    await page.mouse.wheel(0, 1400).catch(() => {});
    await sleep(jitterMs(1500, 3000));
    const cards = await page.evaluate(() => {
      const main = document.querySelector('[role="main"]') ?? document.body;
      const out = [];
      for (const a of main.querySelectorAll('a[href*="/groups/"]')) {
        const name = (a.innerText || "").trim().split("\n")[0];
        if (!name || name.length < 3) continue;
        let card = a;
        for (let i = 0; i < 8 && card.parentElement; i++) {
          card = card.parentElement;
          if (card.querySelector('[role="button"]')) break;
        }
        const buttons = [...card.querySelectorAll('[role="button"]')]
          .map((b) => (b.getAttribute("aria-label") || b.innerText || "").trim())
          .filter((t) => t && t.length < 40);
        out.push({ href: a.href, name: name.slice(0, 200), text: (card.innerText || "").slice(0, 500), buttons });
        if (out.length >= 30) break;
      }
      return out;
    });
    for (const c of cards) {
      const url = groupUrl(c.href);
      if (!url || found.has(url)) continue;
      found.set(url, { namn: c.name, url, info: cardInfo(c.text, c.name), status: membershipFromButtons(c.buttons) });
    }
    await sleep(jitterMs(3000, 7000));
  }
  return { human: false, grupper: [...found.values()].slice(0, 25) };
}

/** Knapparna i gruppens sidhuvud (övre delen av sidan, inte förslag längre ner). */
async function headerButtons(page) {
  return page.evaluate(() => {
    const main = document.querySelector('[role="main"]') ?? document.body;
    return [...main.querySelectorAll('[role="button"], button')]
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.top < 900;
      })
      .map((b) => (b.getAttribute("aria-label") || b.innerText || "").trim())
      .filter((t) => t && t.length < 40)
      .slice(0, 60);
  });
}

/** Läser medlemskap utan att klicka på något. Används även av --grupp för felsökning. */
export async function inspectGroup(page, url, h) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await h.settle(page, 4000, 7000);
  if (await h.checkHuman(page)) return { human: true };
  const buttons = await headerButtons(page);
  const namn = await page.evaluate(() => document.querySelector("h1")?.innerText?.trim() ?? document.title);
  return { human: false, namn, status: membershipFromButtons(buttons), buttons };
}

/** Frågorna i medlemsrutan, med varje fält märkt så att det kan fyllas i senare. */
async function readQuestions(page) {
  return page.evaluate((FIELD) => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dlg = dialogs[dialogs.length - 1];
    if (!dlg) return null;
    const fields = [...dlg.querySelectorAll(FIELD)].filter((el) => el.getClientRects().length > 0);
    if (!fields.length) return { fragor: [], text: (dlg.innerText || "").replace(/\s+/g, " ").trim().slice(0, 2500) };
    const kind = (el) =>
      el.matches('textarea, input[type="text"], [role="textbox"]') ? "text" : el.matches('[role="radio"], input[type="radio"]') ? "radio" : "checkbox";
    const label = (el) =>
      (el.getAttribute("aria-label") || el.closest("label")?.innerText || el.parentElement?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 200);
    fields.forEach((f, i) => f.setAttribute("data-sos-falt", String(i)));
    const used = new Set();
    const fragor = [];
    for (const f of fields) {
      if (used.has(f)) continue;
      const k = kind(f);
      let a = f;
      let fraga = "";
      for (let d = 0; d < 10 && a.parentElement && a !== dlg; d++) {
        a = a.parentElement;
        const inner = fields.filter((x) => a.contains(x) && !used.has(x));
        if (inner.some((x) => kind(x) !== k)) break;
        let t = a.innerText || "";
        if (k !== "text") for (const x of inner) t = t.replace(label(x), "");
        t = t.replace(/\s+/g, " ").trim();
        if (t.length >= 3) {
          fraga = t;
          break;
        }
      }
      const group = k === "text" ? [f] : fields.filter((x) => a.contains(x) && kind(x) === k && !used.has(x));
      group.forEach((x) => used.add(x));
      fragor.push({
        kind: k,
        fraga: fraga.slice(0, 600),
        alternativ: k === "text" ? undefined : group.map(label),
        falt: group.map((x) => x.getAttribute("data-sos-falt")),
      });
    }
    return { fragor, text: (dlg.innerText || "").replace(/\s+/g, " ").trim().slice(0, 2500) };
  }, FIELD);
}

async function clickJoin(page) {
  const btn = page
    .locator('[role="main"] [role="button"], [role="main"] button')
    .filter({ hasText: /^(Gå med i gruppen|Gå med|Join group|Join)$/i })
    .first();
  if (!(await btn.count())) return false;
  const box = await btn.boundingBox();
  if (!box || box.y > 900) return false;
  const label = normaliseText((await btn.getAttribute("aria-label")) || (await btn.innerText()));
  if (!isJoinLabel(label)) return false;
  await btn.hover().catch(() => {});
  await sleep(jitterMs(400, 1200));
  await btn.click();
  return true;
}

const isChecked = (el) =>
  el.evaluate((x) => x.getAttribute("aria-checked") === "true" || x.checked === true).catch(() => false);

/** Klickar ett val. Dolda inmatningsfält klickas via närmaste synliga förälder (etiketten). */
async function clickChoice(el) {
  try {
    await el.click({ timeout: 3000 });
  } catch {
    const ok = await el.evaluate((x) => {
      for (let a = x, i = 0; a && i < 4; a = a.parentElement, i++) {
        const r = a.getBoundingClientRect();
        if (r.width > 4 && r.height > 4) {
          a.click();
          return true;
        }
      }
      return false;
    });
    if (!ok) await el.click({ force: true, timeout: 3000 });
  }
  return isChecked(el);
}

async function fillAndSubmit(page, plan) {
  for (const q of plan) {
    await sleep(jitterMs(800, 2000));
    if (q.typ === "text") {
      const el = page.locator(`[data-sos-falt="${q.falt[0]}"]`);
      await el.click();
      await el.pressSequentially(q.text, { delay: jitterMs(25, 70) });
      continue;
    }
    for (const val of q.val) {
      const i = q.alternativ.indexOf(val);
      const el = page.locator(`[data-sos-falt="${q.falt[i]}"]`);
      if (!(await isChecked(el)) && !(await clickChoice(el))) return `kunde inte välja "${val}"`;
      await sleep(jitterMs(300, 800));
    }
  }
  await sleep(jitterMs(1000, 2500));
  const submit = page
    .locator('[role="dialog"] [role="button"], [role="dialog"] button')
    .filter({ hasText: /^(Skicka|Skicka in|Submit|Gå med i gruppen|Join group)$/i })
    .last();
  if (!(await submit.count())) return "hittade ingen Skicka-knapp";
  await submit.click();
  return null;
}

/**
 * Går med i en grupp. Utan svar: har gruppen frågor stängs rutan utan att skicka och
 * frågorna lämnas tillbaka. Med svar (uppdrag "svara"): fyller i och skickar, men bara
 * om varje fråga har ett godkänt svar.
 */
export async function joinGroup(page, grupp, h, { svar = null, godkannRegler = false } = {}) {
  const base = { namn: grupp.namn, url: grupp.url };
  const before = await inspectGroup(page, grupp.url, h);
  if (before.human) return { human: true };
  if (before.status === "medlem" || before.status === "vantar") return { ...base, status: before.status };
  if (before.status !== "ej_medlem") return { ...base, status: "fel", fel: "hittade ingen Gå med-knapp" };

  if (!(await clickJoin(page))) return { ...base, status: "fel", fel: "kunde inte trycka på Gå med" };
  base.klickat = true;
  await sleep(jitterMs(3500, 6000));
  if (await h.checkHuman(page)) return { human: true };

  const dialog = await readQuestions(page);
  if (dialog && dialog.fragor.length) {
    const fragor = dialog.fragor.map((q) => ({ ...q, typ: questionType(q.kind, q.fraga, q.alternativ) }));
    const utFragor = fragor.map((q) => ({ fraga: q.fraga, typ: q.typ, alternativ: q.alternativ }));
    if (!svar) {
      await page.goto("about:blank").catch(() => {});
      return { ...base, status: "fragor", fragor: utFragor, dialogtext: truncate(dialog.text, 2500) };
    }
    const match = matchAnswers(fragor, svar, godkannRegler);
    if (!match.ok) {
      await page.goto("about:blank").catch(() => {});
      return { ...base, status: "fragor_andrade", fragor: utFragor, dialogtext: truncate(dialog.text, 2500) };
    }
    const fel = await fillAndSubmit(page, match.plan);
    if (fel) {
      await page.goto("about:blank").catch(() => {});
      return { ...base, status: "fel", fel };
    }
    await sleep(jitterMs(3500, 6000));
  } else if (dialog && !dialog.fragor.length && svar) {
    // En ruta utan fält, t.ex. bara regler att läsa: låt Kajsa göra resten själv.
    await page.goto("about:blank").catch(() => {});
    return { ...base, status: "fel", fel: "rutan hade inga frågor att fylla i" };
  }

  const after = await inspectGroup(page, grupp.url, h);
  if (after.human) return { human: true };
  if (after.status === "medlem" || after.status === "vantar") return { ...base, status: after.status };
  return { ...base, status: "fel", fel: "oklart om förfrågan skickades" };
}

/**
 * Kör ett uppdrag (eller en del av det). Returnerar det som ska lämnas till agenten,
 * eller { human: true } om Facebook vill ha en människa.
 */
export async function runTask(page, task, state, h) {
  if (task.typ === "sok_grupper") {
    const r = await searchGroups(page, task.sokord ?? [], h);
    if (r.human) return r;
    return { resultat: { uppdrag: task.id, typ: task.typ, klar: true, grupper: r.grupper } };
  }

  const progress = (state.taskProgress ??= {});
  const p = (progress[task.id] ??= { done: [] });

  if (task.typ === "ga_med" || task.typ === "svara") {
    const kvar = (task.typ === "svara" ? [task.grupp] : task.grupper).filter((g) => !p.done.includes(g.url));
    const utfall = [];
    let gjort = 0;
    for (const g of kvar) {
      if (gjort >= MAX_JOINS_PER_RUN) break;
      if (joinsLeft(state) <= 0) {
        if (p.dagsgrans !== new Date().toDateString()) {
          utfall.push(...kvar.filter((x) => !p.done.includes(x.url)).map((x) => ({ namn: x.namn, url: x.url, status: "dagsgrans" })));
          p.dagsgrans = new Date().toDateString();
        }
        break;
      }
      if (gjort > 0) await sleep(jitterMs(45_000, 120_000));
      const u = await joinGroup(page, g, h, task.typ === "svara" ? { svar: task.svar, godkannRegler: task.godkannRegler } : {});
      if (u.human) return u;
      // Bara ett faktiskt skickat inträde räknas mot dagens gräns.
      if (u.klickat && (u.status === "vantar" || u.status === "medlem")) countJoin(state);
      delete u.klickat;
      p.done.push(g.url);
      utfall.push(u);
      gjort++;
    }
    const all = task.typ === "svara" ? [task.grupp] : task.grupper;
    const klar = all.every((g) => p.done.includes(g.url));
    if (klar) delete progress[task.id];
    if (!utfall.length) return { resultat: null };
    return { resultat: { uppdrag: task.id, typ: task.typ, klar, utfall } };
  }
  return { resultat: null };
}
