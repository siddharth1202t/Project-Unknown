import { DecisionResult, IntentResult, RiskResult } from "./types";

export function decide(intent: IntentResult, risk: RiskResult): DecisionResult {
  if (risk.level === "critical") {
    return {
      action: "refuse_redirect",
      reason: "critical_risk_detected",
    };
  }

  if (risk.level === "high") {
    return {
      action: "refuse_redirect",
      reason: "high_risk_detected",
    };
  }

  if (risk.level === "medium" && intent.ambiguity > 0.2) {
    return {
      action: "clarify",
      reason: "intent_requires_clarification",
    };
  }

  if (risk.level === "medium") {
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
