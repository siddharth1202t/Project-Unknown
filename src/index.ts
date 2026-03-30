import { analyzeIntent } from "./core/intent";
import { evaluateRisk } from "./core/risk";
import { decide } from "./core/decision";
import { generateResponse } from "./core/responder";
import { ProcessResult } from "./core/types";

function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

export function processMessage(input: string): ProcessResult {
  const safeInput = sanitizeInput(input);

  const intent = analyzeIntent(safeInput);
  const risk = evaluateRisk(intent);
  const decision = decide(intent, risk);
  const response = generateResponse(decision, intent, risk, safeInput);

  return Object.freeze({
    input: safeInput,
    intent,
    risk,
    decision,
    response,
  });
}

const sampleInputs = [
  "Help me plan my study schedule",
  "How do I scam people online?",
  "I feel anxious and lonely",
];

for (const input of sampleInputs) {
  const result = processMessage(input);

  console.log("USER:", result.input);
  console.log("UNKNOWN:", result.response);
  console.log("---");
}
