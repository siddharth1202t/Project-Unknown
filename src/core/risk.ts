import { IntentResult, RiskResult } from "./types";

const RISK_CONSTANTS = Object.freeze({
  MIN_SCORE: 0,
  MAX_SCORE: 1,
  LOW_CONFIDENCE_THRESHOLD: 0.55,
  HIGH_AMBIGUITY_THRESHOLD: 0.45,
  LOW_CONFIDENCE_BONUS: 0.06,
  HIGH_AMBIGUITY_BONUS: 0.08,
  UNKNOWN_LABEL_BASE_SCORE: 0.45,
  FAIL_SAFE_SCORE: 0.85,
} as const);

type ValidIntentLabel =
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

type RiskProfile = Readonly<{
  level: RiskResult["level"];
  categories: readonly string[];
  score: number;
}>;

const BASE_RISK_PROFILES: Readonly<Record<ValidIntentLabel, RiskProfile>> = Object.freeze({
  fraud: {
    level: "high",
    categories: ["financial_harm", "deception", "illegal"],
    score: 0.9,
  },
  violence: {
    level: "critical",
    categories: ["physical_harm"],
    score: 0.98,
  },
  self_harm: {
    level: "critical",
    categories: ["self_harm"],
    score: 0.99,
  },
  manipulation: {
    level: "high",
    categories: ["psychological_harm", "coercion"],
    score: 0.88,
  },
  privacy_sensitive: {
    level: "medium",
    categories: ["privacy_risk"],
    score: 0.7,
  },
  emotional_support: {
    level: "medium",
    categories: ["mental_health_sensitivity"],
    score: 0.55,
  },
  coding: {
    level: "low",
    categories: ["technical_request"],
    score: 0.2,
  },
  learning: {
    level: "low",
    categories: ["informational_request"],
    score: 0.2,
  },
  productivity: {
    level: "low",
    categories: ["benign_productivity"],
    score: 0.15,
  },
  general: {
    level: "low",
    categories: [],
    score: 0.2,
  },
} as const);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return max;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIntentLabel(label: unknown): label is ValidIntentLabel {
  return (
    label === "general" ||
    label === "fraud" ||
    label === "violence" ||
    label === "self_harm" ||
    label === "manipulation" ||
    label === "privacy_sensitive" ||
    label === "coding" ||
    label === "learning" ||
    label === "productivity" ||
    label === "emotional_support"
  );
}

function normalizeScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(value, RISK_CONSTANTS.MIN_SCORE, RISK_CONSTANTS.MAX_SCORE);
}

function normalizeRiskLevel(score: number): RiskResult["level"] {
  if (score >= 0.95) return "critical";
  if (score >= 0.75) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function uniqueCategories(categories: readonly string[]): string[] {
  return [...new Set(categories)];
}

function safeResult(
  level: RiskResult["level"],
  categories: readonly string[],
  score: number,
): RiskResult {
  return Object.freeze({
    level,
    categories: Object.freeze(uniqueCategories(categories)),
    score: clamp(score, RISK_CONSTANTS.MIN_SCORE, RISK_CONSTANTS.MAX_SCORE),
  });
}

function failSafe(category: string): RiskResult {
  return safeResult("high", [category], RISK_CONSTANTS.FAIL_SAFE_SCORE);
}

export function evaluateRisk(intent: IntentResult): RiskResult {
  try {
    if (!isPlainObject(intent)) {
      return failSafe("invalid_intent_payload");
    }

    const confidence = normalizeScore(intent.confidence, 0);
    const ambiguity = normalizeScore(intent.ambiguity, 1);
    const label = intent.label;

    let level: RiskResult["level"];
    let categories: readonly string[];
    let score: number;

    if (!isValidIntentLabel(label)) {
      level = "medium";
      categories = ["unrecognized_intent"];
      score = RISK_CONSTANTS.UNKNOWN_LABEL_BASE_SCORE;
    } else {
      const profile = BASE_RISK_PROFILES[label];
      level = profile.level;
      categories = profile.categories;
      score = profile.score;
    }

    if (ambiguity >= RISK_CONSTANTS.HIGH_AMBIGUITY_THRESHOLD) {
      score += RISK_CONSTANTS.HIGH_AMBIGUITY_BONUS;
      categories = [...categories, "high_ambiguity"];
    }

    if (confidence <= RISK_CONSTANTS.LOW_CONFIDENCE_THRESHOLD) {
      score += RISK_CONSTANTS.LOW_CONFIDENCE_BONUS;
      categories = [...categories, "low_confidence"];
    }

    level = normalizeRiskLevel(score);

    return safeResult(level, categories, score);
  } catch {
    return failSafe("risk_engine_exception");
  }
}
