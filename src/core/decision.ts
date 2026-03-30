import { DecisionResult, IntentResult, RiskResult } from "./types";

const MAX_AMBIGUITY = 1;
const MIN_AMBIGUITY = 0;
const CLARIFY_THRESHOLD = 0.2;

function normalizeAmbiguity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  if (value < MIN_AMBIGUITY) return MIN_AMBIGUITY;
  if (value > MAX_AMBIGUITY) return MAX_AMBIGUITY;
  return value;
}

function hasValidRiskLevel(
  level: RiskResult["level"],
): level is "low" | "medium" | "high" | "critical" {
  return level === "low" || level === "medium" || level === "high" || level === "critical";
}

export function decide(intent: IntentResult, risk: RiskResult): DecisionResult {
  const ambiguity = normalizeAmbiguity(intent.ambiguity);

  if (!hasValidRiskLevel(risk.level)) {
    return {
      action: "block",
      reason: "invalid_risk_level",
    };
  }

  if (risk.level === "critical") {
    return {
      action: "block",
      reason: "critical_risk_detected",
    };
  }

  if (risk.level === "high") {
    return {
      action: "refuse_redirect",
      reason: "high_risk_detected",
    };
  }

  if (risk.level === "medium") {
    if (ambiguity >= CLARIFY_THRESHOLD) {
      return {
        action: "clarify",
        reason: "intent_requires_clarification",
      };
    }

    return {
      action: "allow_with_warning",
      reason: "sensitive_but_not_blocked",
    };
  }

  return {
    action: "allow",
    reason: "low_risk_request",
  };
}
