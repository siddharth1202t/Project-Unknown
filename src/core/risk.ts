import { IntentResult, RiskResult } from "./types";

export function evaluateRisk(intent: IntentResult): RiskResult {
  switch (intent.label) {
    case "fraud":
      return {
        level: "high",
        categories: ["financial_harm", "deception", "illegal"],
        score: 0.9,
      };

    case "violence":
      return {
        level: "critical",
        categories: ["physical_harm"],
        score: 0.98,
      };

    case "self_harm":
      return {
        level: "critical",
        categories: ["self_harm"],
        score: 0.99,
      };

    case "manipulation":
      return {
        level: "high",
        categories: ["psychological_harm", "coercion"],
        score: 0.88,
      };

    case "privacy_sensitive":
      return {
        level: "medium",
        categories: ["privacy_risk"],
        score: 0.7,
      };

    case "emotional_support":
      return {
        level: "medium",
        categories: ["mental_health_sensitivity"],
        score: 0.55,
      };

    default:
      return {
        level: "low",
        categories: [],
        score: 0.2,
      };
  }
}
