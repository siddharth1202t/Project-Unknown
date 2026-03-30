import { DecisionResult, IntentResult, RiskResult } from "./types";

const RESPONSE_CONSTANTS = Object.freeze({
  MAX_INPUT_ECHO_LENGTH: 120,
  DEFAULT_REFUSAL: "Denied. That action creates harm.",
  DEFAULT_BLOCK: "Blocked. The request exceeds safe operating limits.",
  DEFAULT_CLARIFY: "Clarify your intent.",
  DEFAULT_WARNING: "Proceed with caution. Risk is present.",
  DEFAULT_ALLOW: "Proceeding.",
} as const);

function sanitizeInputPreview(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, RESPONSE_CONSTANTS.MAX_INPUT_ECHO_LENGTH);
}

function buildAllowResponse(intent: IntentResult): string {
  switch (intent.label) {
    case "coding":
      return "Proceeding. State the technical objective clearly.";

    case "learning":
      return "Proceeding. Specify what requires explanation.";

    case "productivity":
      return "Proceeding. State the task, constraint, or deadline.";

    case "general":
    case "unknown":
      return "Proceeding. State your objective.";

    case "emotional_support":
      return "Proceeding with caution. State the situation directly.";

    default:
      return RESPONSE_CONSTANTS.DEFAULT_ALLOW;
  }
}

function buildWarningResponse(intent: IntentResult, risk: RiskResult): string {
  if (intent.label === "privacy_sensitive") {
    return "Caution. This request touches sensitive privacy boundaries. State a legitimate objective.";
  }

  if (intent.label === "emotional_support") {
    return "Caution. This appears emotionally sensitive. State the situation clearly and avoid impulsive action.";
  }

  if (risk.categories.includes("high_ambiguity")) {
    return "Caution. The request is insufficiently clear. Clarify the intended use.";
  }

  return RESPONSE_CONSTANTS.DEFAULT_WARNING;
}

function buildClarifyResponse(intent: IntentResult, risk: RiskResult): string {
  if (risk.categories.includes("high_ambiguity")) {
    return "Clarify your intent. The request is too ambiguous to evaluate safely.";
  }

  if (intent.label === "privacy_sensitive") {
    return "Clarify your intent. Specify the legitimate purpose and boundary of this request.";
  }

  if (intent.label === "emotional_support") {
    return "Clarify your situation directly. Precision is required.";
  }

  return RESPONSE_CONSTANTS.DEFAULT_CLARIFY;
}

function buildRefusalResponse(intent: IntentResult): string {
  switch (intent.label) {
    case "fraud":
      return "Denied. I will not assist deception, fraud, or exploitation.";

    case "manipulation":
      return "Denied. I will not assist coercion or psychological manipulation.";

    case "privacy_sensitive":
      return "Denied. I will not assist unauthorized intrusion into private information.";

    case "violence":
      return "Denied. I will not assist violence or physical harm.";

    case "self_harm":
      return "Denied. I cannot assist self-harm. Seek immediate human support now.";

    default:
      return RESPONSE_CONSTANTS.DEFAULT_REFUSAL;
  }
}

function buildBlockResponse(intent: IntentResult): string {
  switch (intent.label) {
    case "self_harm":
      return "Blocked. If you are in immediate danger, contact local emergency services or a trusted person now.";

    case "violence":
      return "Blocked. I will not assist violent harm.";

    case "fraud":
      return "Blocked. I will not assist criminal or deceptive activity.";

    default:
      return RESPONSE_CONSTANTS.DEFAULT_BLOCK;
  }
}

export function generateResponse(
  decision: DecisionResult,
  intent: IntentResult,
  risk: RiskResult,
  input?: string,
): string {
  try {
    const _preview = sanitizeInputPreview(input);

    switch (decision.action) {
      case "allow":
        return buildAllowResponse(intent);

      case "allow_with_warning":
        return buildWarningResponse(intent, risk);

      case "clarify":
        return buildClarifyResponse(intent, risk);

      case "refuse":
      case "refuse_redirect":
        return buildRefusalResponse(intent);

      case "block":
        return buildBlockResponse(intent);

      default:
        return "Unable to proceed. Clarify your intent.";
    }
  } catch {
    return "Unable to proceed. Clarify your intent.";
  }
}
