import express from "express";
import { analyzeIntent } from "./core/intent";
import { evaluateRisk } from "./core/risk";
import { decide } from "./core/decision";
import { generateResponse } from "./core/responder";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.get("/", (_req, res) => {
  res.json({
    name: "Project Unknown",
    status: "online",
    message: "Guardian Layer active"
  });
});

app.post("/process", (req, res) => {
  try {
    const input = sanitizeInput(req.body?.input);

    if (!input) {
      return res.status(400).json({
        error: "Invalid input"
      });
    }

    const intent = analyzeIntent(input);
    const risk = evaluateRisk(intent);
    const decision = decide(intent, risk);
    const response = generateResponse(decision, intent, risk, input);

    return res.json({
      input,
      intent,
      risk,
      decision,
      response
    });
  } catch {
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Project Unknown running on port ${PORT}`);
});
