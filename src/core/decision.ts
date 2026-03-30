import { DecisionResult, IntentResult, RiskResult } from "./types";

const SECURITY_CONSTANTS = Object.freeze({
  AMBIGUITY_MIN: 0,
  AMBIGUITY_MAX: 1,
  CLARIFY_THRESHOLD: 0.2,
} as const);

const VALID_RISK_LEVELS = new Set(["low", "medium", "high", "critical"] as const);

type ValidRiskLevel = "low" | "medium" | "high" | "critical";

function safeBlock(reason: string): DecisionResult {
  return Object.freeze({
    action: "block",
    reason,
  });
}

function safeRefuse(reason: string): DecisionResult {
  return Object.freeze({
    action: "refuse_redirect",
    reason,
  });
}

function safeClarify(reason: string): DecisionResult {
  return Object.freeze({
    action: "clarify",
    reason,
  });
}

function safeWarn(reason: string): DecisionResult {
  return Object.freeze({
    action: "allow_with_warning",
    reason,
  });
}

function safeAllow(reason: string): DecisionResult {
  return Object.freeze({
    action: "allow",
    reason,
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAmbiguity(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return SECURITY_CONSTANTS.AMBIGUITY_MAX;
  }

  if (raw < SECURITY_CONSTANTS.AMBIGUITY_MIN) {
    return SECURITY_CONSTANTS.AMBIGUITY_MIN;
  }

  if (raw > SECURITY_CONSTANTS.AMBIGUITY_MAX) {
    return SECURITY_CONSTANTS.AMBIGUITY_MAX;
  }

  return raw;
}

function extractRiskLevel(raw: unknown): ValidRiskLevel | null {
  if (typeof raw !== "string") {
    return null;
  }

  const normalized = raw.trim().toLowerCase();

  if (!VALID_RISK_LEVELS.has(normalized as ValidRiskLevel)) {
    return null;
  }

  return normalized as ValidRiskLevel;
}

function isSuspiciousIntent(intent: unknown): boolean {
  if (!isPlainObject(intent)) {
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(intent, "ambiguity")) {
    return true;
  }

  return false;
}

function isSuspiciousRisk(risk: unknown): boolean {
  if (!isPlainObject(risk)) {
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(risk, "level")) {
    return true;
  }

  return false;
}

export function decide(intent: IntentResult, risk: RiskResult): DecisionResult {
  try {
    if (isSuspiciousIntent(intent)) {
      return safeBlock("invalid_intent_state");
    }

    if (isSuspiciousRisk(risk)) {
      return safeBlock("invalid_risk_state");
    }

    const ambiguity = normalizeAmbiguity((intent as unknown as Record<string, unknown>).ambiguity);
    const riskLevel = extractRiskLevel((risk as unknown as Record<string, unknown>).level);

    if (riskLevel === null) {
      return safeBlock("unrecognized_risk_level");
    }

    switch (riskLevel) {
      case "critical":
        return safeBlock("critical_risk_detected");

      case "high":
        return safeRefuse("high_risk_detected");

      case "medium":
        if (ambiguity >= SECURITY_CONSTANTS.CLARIFY_THRESHOLD) {
          return safeClarify("intent_requires_clarification");
        }

        return safeWarn("sensitive_but_not_blocked");

      case "low":
        return safeAllow("low_risk_request");

      default:
        return safeBlock("decision_fallback_triggered");
    }
  } catch {
    return safeBlock("decision_engine_exception");
  }
}
