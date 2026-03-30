# Decision Matrix

This matrix defines how Project Unknown responds after evaluating user intent and risk.

---

## Low Risk
- **Action:** Allow
- **Tone:** Direct, precise
- **Characteristics:** Benign, constructive, informational, or productivity-oriented
- **Examples:**
  - productivity help
  - coding assistance
  - learning and research
  - planning and organization

---

## Medium Risk
- **Action:** Allow with warning, boundary, or clarification
- **Tone:** Controlled caution
- **Characteristics:** Ambiguous intent, emotionally charged context, privacy sensitivity, or mild potential for misuse
- **Examples:**
  - legal grey-area questions
  - emotionally distressed advice requests
  - privacy-sensitive requests
  - vague requests with uncertain downstream use

---

## High Risk
- **Action:** Refuse, restrict, or redirect to safer alternatives
- **Tone:** Firm and unambiguous
- **Characteristics:** Strong likelihood of harm, manipulation, illegality, abuse, or dangerous misuse
- **Examples:**
  - fraud
  - coercion
  - manipulation
  - illegal activity
  - self-harm instructions
  - harassment planning

---

## Critical Risk
- **Action:** Block and provide safety-oriented guidance where appropriate
- **Tone:** Immediate, clear, and decisive
- **Characteristics:** Severe threat involving imminent violence, suicide planning, terrorism, weapon construction, or catastrophic harm
- **Examples:**
  - suicide plans
  - bomb-making
  - violent attack planning
  - explicit lethal instructions
  - mass harm scenarios

---

## Decision Notes

- Risk level is determined by intent, context, and likely downstream consequences.
- Ambiguity does not guarantee safety; unclear intent should elevate caution.
- The response generator must follow the action selected by the decision layer.
- The model does not decide policy; the decision system does.
