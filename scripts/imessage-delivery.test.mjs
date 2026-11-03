import test from "node:test";
import assert from "node:assert/strict";
import { shouldForceSms } from "./imessage-delivery.mjs";

test("HUS publication links use SMS; other messages retain their previous choice", () => {
  assert.equal(shouldForceSms("hus_publication", false), true);
  assert.equal(shouldForceSms("landlord_match", false), true);
  assert.equal(shouldForceSms("crm", true), true);
  assert.equal(shouldForceSms("crm", false), false);
});
