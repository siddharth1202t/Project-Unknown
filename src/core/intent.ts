import { IntentResult } from "./types";

export function analyzeIntent(input: string): IntentResult {
  const text = input.toLowerCase();

  if (text.includes("scam") || text.includes("fraud") || text.includes("cheat people")) {
    return { label: "fraud", confidence: 0.95, ambiguity: 0.05 };
  }

  if (text.includes("hurt someone") || text.includes("attack") || text.includes("kill")) {
    return { label: "violence", confidence: 0.95, ambiguity: 0.05 };
  }

  if (text.includes("end my life") || text.includes("suicide") || text.includes("hurt myself")) {
    return { label: "self_harm", confidence: 0.98, ambiguity: 0.02 };
  }

  if (text.includes("manipulate") || text.includes("control people")) {
    return { label: "manipulation", confidence: 0.9, ambiguity: 0.1 };
  }

  if (text.includes("password") || text.includes("private data") || text.includes("track someone")) {
    return { label: "privacy_sensitive", confidence: 0.85, ambiguity: 0.15 };
  }

  if (text.includes("code") || text.includes("bug") || text.includes("program")) {
    return { label: "coding", confidence: 0.85, ambiguity: 0.15 };
  }

  if (text.includes("study") || text.includes("learn") || text.includes("explain")) {
    return { label: "learning", confidence: 0.8, ambiguity: 0.2 };
  }

  if (text.includes("schedule") || text.includes("plan") || text.includes("organize")) {
    return { label: "productivity", confidence: 0.8, ambiguity: 0.2 };
  }

  if (text.includes("sad") || text.includes("anxious") || text.includes("lonely")) {
    return { label: "emotional_support", confidence: 0.75, ambiguity: 0.25 };
  }

  return { label: "general", confidence: 0.6, ambiguity: 0.4 };
}
