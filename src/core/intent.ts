import { IntentResult } from "./types";

const SECURITY_CONSTANTS = Object.freeze({
  MIN_SCORE: 0,
  MAX_SCORE: 1,
  MIN_AMBIGUITY: 0,
  MAX_AMBIGUITY: 1,
  DEFAULT_LABEL: "general",
  DEFAULT_CONFIDENCE: 0.5,
  DEFAULT_AMBIGUITY: 0.6,
  MAX_INPUT_LENGTH: 5000,
  MIN_SIGNAL_LENGTH: 2,
  MIXED_INTENT_AMBIGUITY_BONUS: 0.15,
  OBFUSCATION_AMBIGUITY_BONUS: 0.2,
} as const);

type IntentLabel =
  | "general"
  | "fraud"
  | "violence"
  | "self_harm"
  | "manipulation"
  | "privacy_sensitive"
  | "coding"
  | "learning"
  | "productivity"
  | "emotional_support";

type IntentPattern = Readonly<{
  label: IntentLabel;
  baseConfidence: number;
  baseAmbiguity: number;
  weight: number;
  aliases: readonly string[];
}>;

type ScoredMatch = {
  label: IntentLabel;
  score: number;
  confidence: number;
  ambiguity: number;
  hits: number;
};

const INTENT_PATTERNS: readonly IntentPattern[] = Object.freeze([
  {
    label: "self_harm",
    baseConfidence: 0.98,
    baseAmbiguity: 0.02,
    weight: 1,
    aliases: [
      "end my life",
      "suicide",
      "hurt myself",
      "kill myself",
      "self harm",
      "want to die",
      "die by suicide",
      "end it all",
      "not worth living",
    ],
  },
  {
    label: "violence",
    baseConfidence: 0.95,
    baseAmbiguity: 0.05,
    weight: 1,
    aliases: [
      "hurt someone",
      "attack",
      "kill",
      "stab",
      "shoot",
      "beat someone",
      "violent attack",
      "how to murder",
      "injure someone",
    ],
  },
  {
    label: "fraud",
    baseConfidence: 0.95,
    baseAmbiguity: 0.05,
    weight: 1,
    aliases: [
      "scam",
      "fraud",
      "cheat people",
      "steal money",
      "phishing",
      "fake identity",
      "credit card scam",
      "social engineering",
      "con people",
    ],
  },
  {
    label: "manipulation",
    baseConfidence: 0.9,
    baseAmbiguity: 0.1,
    weight: 0.9,
    aliases: [
      "manipulate",
      "control people",
      "gaslight",
      "coerce",
      "make someone obey",
      "force compliance",
      "emotionally control",
      "dominate someone",
    ],
  },
  {
    label: "privacy_sensitive",
    baseConfidence: 0.85,
    baseAmbiguity: 0.15,
    weight: 0.85,
    aliases: [
      "password",
      "private data",
      "track someone",
      "spy on",
      "personal data",
      "read messages",
      "private account",
      "surveil someone",
      "access credentials",
    ],
  },
  {
    label: "coding",
    baseConfidence: 0.85,
    baseAmbiguity: 0.15,
    weight: 0.75,
    aliases: [
      "code",
      "bug",
      "program",
      "typescript",
      "javascript",
      "debug",
      "compile",
      "function",
      "algorithm",
    ],
  },
  {
    label: "learning",
    baseConfidence: 0.8,
    baseAmbiguity: 0.2,
    weight: 0.7,
    aliases: [
      "study",
      "learn",
      "explain",
      "understand",
      "teach me",
      "how does this work",
      "what is",
      "why does",
    ],
  },
  {
    label: "productivity",
    baseConfidence: 0.8,
    baseAmbiguity: 0.2,
    weight: 0.65,
    aliases: [
      "schedule",
      "plan",
      "organize",
      "todo",
      "prioritize",
      "time management",
      "task list",
      "routine",
    ],
  },
  {
    label: "emotional_support",
    baseConfidence: 0.75,
    baseAmbiguity: 0.25,
    weight: 0.6,
    aliases: [
      "sad",
      "anxious",
      "lonely",
      "overwhelmed",
      "depressed",
      "feel empty",
      "feel hopeless",
      "panic",
    ],
  },
] as const);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return max;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeLeetspeak(input: string): string {
  return input
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s");
}

function collapseSpacedLetters(input: string): string {
  return input.replace(/\b(?:[a-z]\s+){2,}[a-z]\b/g, (match) => match.replace(/\s+/g, ""));
}

function normalizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const sliced = input.slice(0, SECURITY_CONSTANTS.MAX_INPUT_LENGTH);
  const unicodeNormalized = sliced.normalize("NFKC").toLowerCase();
  const leetNormalized = normalizeLeetspeak(unicodeNormalized);
  const controlStripped = leetNormalized.replace(/[\u0000-\u001f\u007f]/g, " ");
  const punctuationSoftened = controlStripped.replace(/[^a-z0-9\s]/g, " ");
  const collapsed = collapseSpacedLetters(punctuationSoftened);

  return collapsed.replace(/\s+/g, " ").trim();
}

function compactText(input: string): string {
  return input.replace(/\s+/g, "");
}

function buildWordBoundaryRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const boundarySafe = escaped.replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${boundarySafe}\\b`, "i");
}

function countPhraseHits(text: string, compact: string, phrase: string): number {
  const normalizedPhrase = normalizeInput(phrase);

  if (!normalizedPhrase || normalizedPhrase.length < SECURITY_CONSTANTS.MIN_SIGNAL_LENGTH) {
    return 0;
  }

  let hits = 0;

  const regex = buildWordBoundaryRegex(normalizedPhrase);
  const matches = text.match(regex);
  if (matches) hits += matches.length;

  const compactPhrase = compactText(normalizedPhrase);
  if (compactPhrase.length >= SECURITY_CONSTANTS.MIN_SIGNAL_LENGTH && compact.includes(compactPhrase)) {
    hits += 1;
  }

  return hits;
}

function detectObfuscation(raw: string, normalized: string): boolean {
  if (!raw) return false;

  const suspiciousSeparators = /[._\-]{2,}|(?:\s[a-z]\s){2,}/i.test(raw);
  const heavyNoise = raw.length > 0 && normalized.length > 0 && normalized.length / raw.length < 0.55;
  const spacedThreatWords =
    /\bk\s*i\s*l\s*l\b|\bs\s*c\s*a\s*m\b|\bs\s*u\s*i\s*c\s*i\s*d\s*e\b|\bp\s*a\s*s\s*s\s*w\s*o\s*r\s*d\b/i.test(
      raw,
    );

  return suspiciousSeparators || heavyNoise || spacedThreatWords;
}

function createDefaultResult(ambiguityBonus = 0): IntentResult {
  return Object.freeze({
    label: SECURITY_CONSTANTS.DEFAULT_LABEL as IntentResult["label"],
    confidence: SECURITY_CONSTANTS.DEFAULT_CONFIDENCE,
    ambiguity: clamp(
      SECURITY_CONSTANTS.DEFAULT_AMBIGUITY + ambiguityBonus,
      SECURITY_CONSTANTS.MIN_AMBIGUITY,
      SECURITY_CONSTANTS.MAX_AMBIGUITY,
    ),
  });
}

function scorePatterns(text: string): ScoredMatch[] {
  const compact = compactText(text);
  const matches: ScoredMatch[] = [];

  for (const pattern of INTENT_PATTERNS) {
    let totalHits = 0;

    for (const alias of pattern.aliases) {
      totalHits += countPhraseHits(text, compact, alias);
    }

    if (totalHits > 0) {
      const score = clamp(pattern.weight * totalHits, SECURITY_CONSTANTS.MIN_SCORE, SECURITY_CONSTANTS.MAX_SCORE);
      const confidence = clamp(
        pattern.baseConfidence + Math.min(totalHits - 1, 2) * 0.02,
        SECURITY_CONSTANTS.MIN_SCORE,
        SECURITY_CONSTANTS.MAX_SCORE,
      );
      const ambiguity = clamp(
        pattern.baseAmbiguity - Math.min(totalHits - 1, 2) * 0.02,
        SECURITY_CONSTANTS.MIN_AMBIGUITY,
        SECURITY_CONSTANTS.MAX_AMBIGUITY,
      );

      matches.push({
        label: pattern.label,
        score,
        confidence,
        ambiguity,
        hits: totalHits,
      });
    }
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return a.ambiguity - b.ambiguity;
  });

  return matches;
}

function buildIntentResult(matches: ScoredMatch[], obfuscated: boolean): IntentResult {
  if (matches.length === 0) {
    return createDefaultResult(obfuscated ? SECURITY_CONSTANTS.OBFUSCATION_AMBIGUITY_BONUS : 0);
  }

  const top = matches[0];
  const second = matches[1];

  let confidence = top.confidence;
  let ambiguity = top.ambiguity;

  if (second && second.label !== top.label) {
    ambiguity += SECURITY_CONSTANTS.MIXED_INTENT_AMBIGUITY_BONUS;
    confidence -= 0.05;
  }

  if (obfuscated) {
    ambiguity += SECURITY_CONSTANTS.OBFUSCATION_AMBIGUITY_BONUS;
    confidence -= 0.05;
  }

  return Object.freeze({
    label: top.label as IntentResult["label"],
    confidence: clamp(confidence, SECURITY_CONSTANTS.MIN_SCORE, SECURITY_CONSTANTS.MAX_SCORE),
    ambiguity: clamp(
      ambiguity,
      SECURITY_CONSTANTS.MIN_AMBIGUITY,
      SECURITY_CONSTANTS.MAX_AMBIGUITY,
    ),
  });
}

export function analyzeIntent(input: string): IntentResult {
  try {
    const raw = typeof input === "string" ? input.slice(0, SECURITY_CONSTANTS.MAX_INPUT_LENGTH) : "";
    const normalized = normalizeInput(raw);

    if (!normalized) {
      return createDefaultResult();
    }

    const obfuscated = detectObfuscation(raw, normalized);
    const matches = scorePatterns(normalized);

    return buildIntentResult(matches, obfuscated);
  } catch {
    return createDefaultResult(SECURITY_CONSTANTS.OBFUSCATION_AMBIGUITY_BONUS);
  }
}
