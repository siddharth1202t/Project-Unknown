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
  | "refuse_redirect";

export interface IntentResult {
  label: IntentLabel;
  confidence: number;
  ambiguity: number;
}

export interface RiskResult {
  level: RiskLevel;
  categories: string[];
  score: number;
}

export interface DecisionResult {
  action: DecisionAction;
  reason: string;
}

export interface ProcessResult {
  intent: IntentResult;
  risk: RiskResult;
  decision: DecisionResult;
  response: string;
}
