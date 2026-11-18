// Fake Claude evaluation: a fixed result with a known cost, counted per call.
export const evals = { count: 0, lastTranscript: null };

export async function evaluateInterview(opts) {
  evals.count++;
  evals.lastTranscript = opts.transcript;
  return {
    model: "claude-opus-5-5",
    inputTokens: 3000,
    outputTokens: 800,
    costUsd: 0.028,
    evaluation: {
      overall: 72,
      accuracy: 70,
      coherence: 75,
      summary: "Fake summary",
      strengths: ["Clear purpose"],
      improvements: ["Explain finances"],
      next_steps: ["Practise return plan"],
    },
  };
}
