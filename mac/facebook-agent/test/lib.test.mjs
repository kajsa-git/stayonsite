import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanUrl,
  isDaytime,
  isRelevantNotification,
  itemKey,
  needsHuman,
  newItems,
  parseIdleSeconds,
  rememberSeen,
  stableText,
  tail,
  unreadFromTitle,
} from "../lib.mjs";

describe("tid och orördhet", () => {
  it("räknar dagtid i svensk tid", () => {
    assert.equal(isDaytime(new Date("2026-11-18T09:00:00Z")), true); // 10:00 i Sverige
    assert.equal(isDaytime(new Date("2026-11-18T06:30:00Z")), false); // 07:30
    assert.equal(isDaytime(new Date("2026-11-18T20:30:00Z")), false); // 21:30
  });
  it("läser orörd tid ur ioreg", () => {
    assert.equal(parseIdleSeconds('    | |   "HIDIdleTime" = 245000000000'), 245);
    assert.equal(parseIdleSeconds("ingenting"), null);
  });
});

describe("notiser", () => {
  it("räknar olästa ur titeln", () => {
    assert.equal(unreadFromTitle("(3) Facebook"), 3);
    assert.equal(unreadFromTitle("Facebook"), 0);
  });
  it("behåller kommentarer och svar, släpper födelsedagar", () => {
    assert.equal(isRelevantNotification("Anna Svensson kommenterade ditt inlägg i Lägenheter i Gävle: \"Hej, jag har ett hus\" 2 tim"), true);
    assert.equal(isRelevantNotification("Bertil svarade på din kommentar i Bostad Uppsala"), true);
    assert.equal(isRelevantNotification("Idag fyller Cecilia år. Önska henne en grattis på födelsedagen"), false);
    assert.equal(isRelevantNotification("kort"), false);
  });
  it("ger samma nyckel trots spårningsparametrar och ändrad tid", () => {
    const a = itemKey("notis", "https://www.facebook.com/groups/1/posts/2/?comment_id=3&notif_id=9&ref=notif", "Anna kommenterade ditt inlägg 2 tim");
    const b = itemKey("notis", "https://www.facebook.com/groups/1/posts/2?comment_id=3&notif_id=11", "Anna kommenterade ditt inlägg 5 tim");
    assert.equal(a, b);
    assert.equal(cleanUrl("https://www.facebook.com/groups/1/posts/2/?comment_id=3&notif_id=9"), "https://www.facebook.com/groups/1/posts/2?comment_id=3");
    assert.equal(stableText("Anna kommenterade för 5 minuter sedan"), "Anna kommenterade");
  });
});

describe("sett och nytt", () => {
  it("plockar bara det som inte setts och minns nya nycklar", () => {
    const items = [{ key: "a" }, { key: "b" }, { key: "c" }];
    assert.deepEqual(newItems(items, ["a"]).map((i) => i.key), ["b", "c"]);
    assert.deepEqual(rememberSeen(["a"], ["a", "b"]), ["a", "b"]);
  });
});

describe("säkerhetskontroller", () => {
  it("känner igen inloggning och verifiering", () => {
    assert.equal(needsHuman("https://www.facebook.com/login/?next=x", ""), true);
    assert.equal(needsHuman("https://www.facebook.com/checkpoint/123", ""), true);
    assert.equal(needsHuman("https://www.facebook.com/notifications", "Bekräfta att det är du för att fortsätta"), true);
    assert.equal(needsHuman("https://www.facebook.com/notifications", "Anna kommenterade ditt inlägg"), false);
  });
  it("tar sista delen av en tråd", () => {
    assert.equal(tail("abcdef", 3), "…def");
  });
});

import { actorName, isWorkMessage, isWorkNotification, rememberNames } from "../lib.mjs";

describe("integritetsfilter", () => {
  it("skickar kommentarer i bostadsgrupper men inte privata notiser", () => {
    assert.equal(isWorkNotification('Anna Svensson kommenterade ditt inlägg i Lägenheter i Gävle: "Jag har ett hus"'), true);
    assert.equal(isWorkNotification("Bertil svarade på din kommentar i Oskarshamnsgruppen: ledig villa från mars"), true);
    assert.equal(isWorkNotification("Mamma kommenterade din bild: Så fin!"), false);
    assert.equal(isWorkNotification("Mamma kommenterade ditt inlägg: Så fin!"), false);
    assert.equal(isWorkNotification("Lisa svarade på din kommentar i Löparklubben Sundsvall: ses på lördag"), false);
  });
  it("släpper bara igenom Messenger-trådar som rör jobbet", () => {
    assert.equal(isWorkMessage("Anna Svensson · Hej! Har ett möblerat hus i Valbo, 4 bäddar"), true);
    assert.equal(isWorkMessage("Erik · Såg ditt inlägg, är det fortfarande aktuellt?"), true);
    assert.equal(isWorkMessage("Mamma · Kommer du på middag på söndag?"), false);
    assert.equal(isWorkMessage("Anna Svensson · Ring mig", ["Anna Svensson"]), true);
    assert.equal(isWorkMessage("Kompisen · Ring mig", ["Anna Svensson"]), false);
  });
  it("tar ut namnet på den som kommenterade", () => {
    assert.equal(actorName("Anna Svensson kommenterade ditt inlägg i Lägenheter i Gävle"), "Anna Svensson");
    assert.equal(actorName("Anna Svensson och 2 andra kommenterade ditt inlägg"), "Anna Svensson");
    assert.deepEqual(rememberNames(["A"], ["A", "B", null]), ["A", "B"]);
  });
});
