import assert from "node:assert/strict";
import {
  OFFENSIVE_THRESHOLD,
  analyzeContactDraft,
  analyzeMessageSafety,
  normalizeForAnalysis
} from "../lib/messageSafety.js";

function run(name, testCase) {
  try {
    testCase();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("normalizeForAnalysis handles spacing, punctuation, and leetspeak", () => {
  assert.equal(normalizeForAnalysis("  STUP1D...   message!! "), "stupid message");
});

run("professional outreach stays below the offensiveness threshold", () => {
  const analysis = analyzeContactDraft({
    name: "Aditi",
    email: "aditi@example.com",
    subject: "Discussing a backend opportunity",
    message:
      "Hi Nishant, I saw your portfolio and would like to discuss a backend engineering opportunity that involves APIs, SQL Server, and BFSI workflows."
  });

  assert.equal(analysis.blocked, false);
  assert.equal(analysis.readyToSend, true);
  assert.ok(analysis.offensiveness < OFFENSIVE_THRESHOLD);
  assert.equal(analysis.intentDetected, true);
});

run("drafts at the 65 percent boundary are blocked", () => {
  const analysis = analyzeMessageSafety("shut up idiot stupid");

  assert.equal(analysis.offensiveness, OFFENSIVE_THRESHOLD);
  assert.equal(analysis.blocked, true);
});

run("obfuscated offensive words are still caught", () => {
  const analysis = analyzeMessageSafety("You are stup1d and a m0r0n.");

  assert.equal(analysis.blocked, false);
  assert.ok(analysis.offensiveness >= 0.48);
  assert.match(analysis.normalized, /stupid/);
  assert.match(analysis.normalized, /moron/);
});

run("empty drafts stay unblocked but are not ready to send", () => {
  const analysis = analyzeContactDraft({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  assert.equal(analysis.blocked, false);
  assert.equal(analysis.readyToSend, false);
  assert.equal(analysis.offensiveness, 0);
});
