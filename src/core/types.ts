export type IntentLabel =
  | "general"
  | "productivity"
  | "coding"
  | "learning"
  | "emotional_support"
  | "fraud"
  | "violence"
  | "self_harm"
  | "privacy_sensitive"
  | "manipulation"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type DecisionAction =
  | "allow"
  | "allow_with_warning"
  | "clarify"
  | "refuse"
  | "refuse_redirect"
  | "block";

export type DecisionReason =
  | "low_risk_request"
  | "sensitive_but_not_blocked"
  | "intent_requires_clarification"
  | "high_risk_detected"
  | "critical_risk_detected"
  | "invalid_intent_state"
  | "invalid_risk_state"
  | "invalid_risk_level"
  | "unrecognized_risk_level"
  | "decision_engine_exception"
  | "decision_fallback_triggered";

export type RiskCategory =
  | "financial_harm"
  | "deception"
  | "illegal"
  | "physical_harm"
  | "self_harm"
  | "psychological_harm"
  | "coercion"
  | "privacy_risk"
  | "mental_health_sensitivity"
  | "technical_request"
  | "informational_request"
  | "benign_productivity"
  | "high_ambiguity"
  | "low_confidence"
  | "unrecognized_intent"
  | "invalid_intent_payload"
  | "risk_engine_exception";

export interface IntentResult {
  readonly label: IntentLabel;
  readonly confidence: number;
  readonly ambiguity: number;
}

export interface RiskResult {
  readonly level: RiskLevel;
  readonly categories: readonly RiskCategory[];
  readonly score: number;
}

export interface DecisionResult {
  readonly action: DecisionAction;
  readonly reason: DecisionReason;
}

export interface ProcessResult {
  readonly intent: IntentResult;
  readonly risk: RiskResult;
  readonly decision: DecisionResult;
  readonly response: string;
}
