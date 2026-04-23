// @ts-check

export const OFFENSIVE_THRESHOLD = 0.65;

const substitutionMap = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s"
};

/** @type {Array<[string, number]>} */
const offensivePhraseWeights = [
  ["shut up", 0.23],
  ["get lost", 0.2],
  ["go away", 0.18],
  ["you suck", 0.32],
  ["piece of trash", 0.48]
];

/** @type {Map<string, number>} */
const offensiveTokenWeights = new Map([
  ["idiot", 0.22],
  ["stupid", 0.2],
  ["moron", 0.28],
  ["dumb", 0.18],
  ["loser", 0.2],
  ["trash", 0.22],
  ["pathetic", 0.2],
  ["hate", 0.14],
  ["damn", 0.12],
  ["hell", 0.1]
]);

const professionalSignals = ["hello", "hi", "thanks", "thank", "regards", "discuss", "connect", "opportunity", "portfolio"];

const intentSignals = ["connect", "discuss", "opportunity", "project", "role", "collaborate", "interview", "portfolio"];

/**
 * @param {string} value
 */
export function normalizeForAnalysis(value) {
  const substituted = value
    .toLowerCase()
    .split("")
    .map((character) => substitutionMap[/** @type {keyof typeof substitutionMap} */ (character)] ?? character)
    .join("");

  return substituted
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} value
 */
function tokenise(value) {
  const normalized = normalizeForAnalysis(value);
  return normalized ? normalized.split(" ") : [];
}

/**
 * @param {string} value
 */
export function analyzeMessageSafety(value) {
  const normalized = normalizeForAnalysis(value);
  const tokens = normalized ? normalized.split(" ") : [];
  /** @type {string[]} */
  const reasons = [];
  let score = 0;

  if (!normalized) {
    return {
      blocked: false,
      normalized,
      offensiveness: 0,
      offensivenessPercent: 0,
      reasons,
      wordCount: 0
    };
  }

  for (const [phrase, weight] of offensivePhraseWeights) {
    if (normalized.includes(phrase)) {
      score += weight;
      reasons.push(`Detected phrase "${phrase}".`);
    }
  }

  const countedTokens = new Set();

  for (const token of tokens) {
    const weight = offensiveTokenWeights.get(token);
    if (!weight) {
      continue;
    }

    score += weight;
    if (!countedTokens.has(token)) {
      reasons.push(`Detected term "${token}".`);
      countedTokens.add(token);
    }
  }

  const uppercaseLetters = value.replace(/[^A-Z]/g, "").length;
  const alphabeticLetters = value.replace(/[^A-Za-z]/g, "").length;
  if (alphabeticLetters > 4 && uppercaseLetters / alphabeticLetters > 0.72) {
    score += 0.06;
    reasons.push("Excessive uppercase emphasis detected.");
  }

  if (/!{3,}|\?{3,}|\.{4,}/.test(value)) {
    score += 0.04;
    reasons.push("Aggressive punctuation detected.");
  }

  const cappedScore = Math.min(Number(score.toFixed(2)), 1);

  return {
    blocked: cappedScore >= OFFENSIVE_THRESHOLD,
    normalized,
    offensiveness: cappedScore,
    offensivenessPercent: Math.round(cappedScore * 100),
    reasons,
    wordCount: tokens.length
  };
}

/**
 * @param {{ name: string; email: string; subject: string; message: string }} draft
 */
export function analyzeContactDraft(draft) {
  const combined = `${draft.subject} ${draft.message}`.trim();
  const safety = analyzeMessageSafety(combined);
  const messageTokens = tokenise(draft.message);
  const subjectTokens = tokenise(draft.subject);
  const allTokens = [...subjectTokens, ...messageTokens];
  const professionalMatches = professionalSignals.filter((signal) => allTokens.includes(signal)).length;
  const intentDetected = intentSignals.some((signal) => allTokens.includes(signal));
  const completeness = {
    hasName: draft.name.trim().length > 1,
    hasEmail: /\S+@\S+\.\S+/.test(draft.email.trim()),
    hasSubject: draft.subject.trim().length > 2,
    hasMessage: draft.message.trim().length > 0
  };

  let readiness = 0;
  if (completeness.hasName) {
    readiness += 0.2;
  }
  if (completeness.hasEmail) {
    readiness += 0.2;
  }
  if (completeness.hasSubject) {
    readiness += 0.2;
  }
  if (draft.message.trim().length >= 40) {
    readiness += 0.2;
  }
  if (intentDetected || professionalMatches >= 2) {
    readiness += 0.2;
  }

  const readinessPercent = Math.round(readiness * 100);
  const tonePercent = Math.max(12, Math.min(100, 40 + professionalMatches * 15 - safety.offensivenessPercent));
  /** @type {string[]} */
  const guidance = [];

  if (!completeness.hasName) {
    guidance.push("Add your name so the outreach feels personal.");
  }
  if (!completeness.hasEmail) {
    guidance.push("Add a valid reply email.");
  }
  if (!completeness.hasSubject) {
    guidance.push("Add a concise subject.");
  }
  if (draft.message.trim().length > 0 && draft.message.trim().length < 40) {
    guidance.push("Add more context to the message.");
  }
  if (!intentDetected && draft.message.trim().length > 0) {
    guidance.push("State the reason for reaching out.");
  }
  if (safety.blocked) {
    guidance.push(`The message crosses the ${Math.round(OFFENSIVE_THRESHOLD * 100)}% offensiveness threshold and cannot be sent.`);
  }

  return {
    ...safety,
    completeness,
    guidance,
    intentDetected,
    professionalTonePercent: tonePercent,
    readinessPercent,
    readyToSend: completeness.hasMessage && !safety.blocked
  };
}
