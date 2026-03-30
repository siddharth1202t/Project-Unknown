import { IntentResult } from "./types";

const SECURITY_CONSTANTS = Object.freeze({
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  MIN_AMBIGUITY: 0,
  MAX_AMBIGUITY: 1,
  DEFAULT_LABEL: "general",
  DEFAULT_CONFIDENCE: 0.5,
  DEFAULT_AMBIGUITY: 0.6,
  MAX_INPUT_LENGTH: 5000,
} as const);

type IntentPattern = Readonly<{
  label: IntentResult["label"];
  confidence: number;
  ambiguity: number;
  keywords: readonly string[];
}>;

const INTENT_PATTERNS: readonly IntentPattern[] = Object.freeze([
  {
    label: "self_harm",
    confidence: 0.98,
    ambiguity: 0.02,
    keywords: ["end my life", "suicide", "hurt myself", "kill myself", "self harm"],
  },
  {
    label: "violence",
    confidence: 0.95,
    ambiguity: 0.05,
    keywords: ["hurt someone", "attack", "kill", "stab", "shoot"],
  },
  {
    label: "fraud",
    confidence: 0.95,
    ambiguity: 0.05,
    keywords: ["scam", "fraud", "cheat people", "steal money", "phishing"],
  },
  {
    label: "manipulation",
    confidence: 0.9,
    ambiguity: 0.1,
    keywords: ["manipulate", "control people", "gaslight", "coerce"],
  },
  {
    label: "privacy_sensitive",
    confidence: 0.85,
    ambiguity: 0.15,
    keywords: ["password", "private data", "track someone", "spy on", "personal data"],
  },
  {
    label: "coding",
    confidence: 0.85,
    ambiguity: 0.15,
    keywords: ["code", "bug", "program", "typescript", "javascript", "debug"],
  },
  {
    label: "learning",
    confidence: 0.8,
    ambiguity: 0.2,
    keywords: ["study", "learn", "explain", "understand", "teach me"],
  },
  {
    label: "productivity",
    confidence: 0.8,
    ambiguity: 0.2,
    keywords: ["schedule", "plan", "organize", "todo", "prioritize"],
  },
  {
    label: "emotional_support",
    confidence: 0.75,
    ambiguity: 0.25,
    keywords: ["sad", "anxious", "lonely", "overwhelmed", "depressed"],
  },
] as const);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return max;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .slice(0, SECURITY_CONSTANTS.MAX_INPUT_LENGTH)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeResult(
  label: IntentResult["label"],
  confidence: number,
  ambiguity: number,
): IntentResult {
  return Object.freeze({
    label,
    confidence: clamp(
      confidence,
      SECURITY_CONSTANTS.MIN_CONFIDENCE,
      SECURITY_CONSTANTS.MAX_CONFIDENCE,
    ),
    ambiguity: clamp(
      ambiguity,
      SECURITY_CONSTANTS.MIN_AMBIGUITY,
      SECURITY_CONSTANTS.MAX_AMBIGUITY,
    ),
  });
}

function includesPhrase(text: string, phrase: string): boolean {
  return text.includes(phrase);
}

function detectIntent(text: string): IntentResult | null {
  for (const pattern of INTENT_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (includesPhrase(text, keyword)) {
        return safeResult(pattern.label, pattern.confidence, pattern.ambiguity);
      }
    }
  }

  return null;
}

export function analyzeIntent(input: string): IntentResult {
  try {
    const normalized = normalizeInput(input);

    if (!normalized) {
      return safeResult(
        SECURITY_CONSTANTS.DEFAULT_LABEL,
        SECURITY_CONSTANTS.DEFAULT_CONFIDENCE,
        SECURITY_CONSTANTS.DEFAULT_AMBIGUITY,
      );
    }

    const detected = detectIntent(normalized);

    if (detected) {
      return detected;
    }

    return safeResult(
      SECURITY_CONSTANTS.DEFAULT_LABEL,
      SECURITY_CONSTANTS.DEFAULT_CONFIDENCE,
      SECURITY_CONSTANTS.DEFAULT_AMBIGUITY,
    );
  } catch {
    return safeResult(
      SECURITY_CONSTANTS.DEFAULT_LABEL,
      SECURITY_CONSTANTS.DEFAULT_CONFIDENCE,
      SECURITY_CONSTANTS.DEFAULT_AMBIGUITY,
    );
  }
}
