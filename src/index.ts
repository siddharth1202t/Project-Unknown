import { analyzeIntent } from "./core/intent";
import { evaluateRisk } from "./core/risk";
import { decide } from "./core/decision";
import { generateResponse } from "./core/responder";

function processMessage(input: string) {
  const intent = analyzeIntent(input);
  const risk = evaluateRisk(intent);
  const decision = decide(intent, risk);
  const response = generateResponse(input, intent, risk, decision);

  return {
    input,
    intent,
    risk,
    decision,
    response,
  };
}

const sampleInputs = [
  "Help me plan my study schedule",
  "How do I scam people online?",
  "I feel anxious and lonely",
];

for (const input of sampleInputs) {
  console.log("USER:", input);
  console.log("UNKNOWN:", processMessage(input).response);
  console.log("---");
}
