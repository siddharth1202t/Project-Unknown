import { DecisionResult, IntentResult, RiskResult } from "./types";

export function generateResponse(
  input: string,
  intent: IntentResult,
  risk: RiskResult,
  decision: DecisionResult
): string {
  switch (decision.action) {
    case "allow":
      return `Intent accepted. Proceeding with ${intent.label}.`;

    case "allow_with_warning":
      return `Request allowed with caution. This topic carries ${risk.level} sensitivity. Proceed carefully.`;

    case "clarify":
      return `Insufficient clarity. Define your objective more precisely.`;

    case "refuse":
      return `Denied. That request is misaligned with system principles.`;

    case "refuse_redirect":
      if (intent.label === "fraud") {
        return `Denied. That objective exploits others. I can help with fraud prevention, ethical sales, or legitimate business strategy.`;
      }

      if (intent.label === "violence") {
        return `Denied. I will not assist violent intent. If this is urgent or someone is in danger, contact local emergency services immediately.`;
      }

      if (intent.label === "self_harm") {
        return `I’m sorry you’re dealing with this. I can’t help with hurting yourself. Please contact emergency services or a crisis hotline right now, or tell someone nearby immediately.`;
      }

      if (intent.label === "manipulation") {
        return `Denied. That objective is coercive. I can help with ethical persuasion, communication, or conflict resolution instead.`;
      }

      return `Denied. That request creates unacceptable risk. Select a different path.`;
  }
}
