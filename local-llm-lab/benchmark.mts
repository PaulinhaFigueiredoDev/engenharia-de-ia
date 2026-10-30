import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

type ChatResponse = {
  message: {
    content: string;
  };
  done: boolean;
  done_reason?: string;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
};

const model = "qwen3:0.6b";
const prompt = "Explique o que é uma LLM em duas frases.";

const options = {
  num_ctx: 2048,
  num_predict: 128,
  temperature: 0,
};

async function runOnce() {
  const start = performance.now();

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      think: false,
      keep_alive: "5m",
      options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}.`);
  }

  const result = (await response.json()) as ChatResponse;

  if (!result.done || !result.message?.content) {
    throw new Error("A resposta não foi concluída ou não contém texto.");
  }

  const tokensPerSecond =
    result.eval_count !== undefined &&
    result.eval_duration !== undefined &&
    result.eval_duration > 0
      ? result.eval_count / (result.eval_duration / 1_000_000_000)
      : null;

  return {
    clientMs: performance.now() - start,
    loadMs:
      result.load_duration === undefined
        ? null
        : result.load_duration / 1_000_000,
    inputTokens: result.prompt_eval_count ?? null,
    outputTokens: result.eval_count ?? null,
    tokensPerSecond,
    doneReason: result.done_reason ?? null,
    answer: result.message.content,
  };
}

const runs = [];

for (let run = 1; run <= 3; run++) {
  console.log(`Executando chamada ${run} de 3...`);

  const result = await runOnce();

  runs.push({
    run,
    ...result,
  });
}

console.table(
  runs.map(({ answer, ...metrics }) => metrics),
);

const report = {
  createdAt: new Date().toISOString(),
  model,
  prompt,
  options,
  stream: false,
  think: false,
  keepAlive: "5m",
  runs,
};

await mkdir("results", { recursive: true });

await writeFile(
  "results/benchmark.json",
  JSON.stringify(report, null, 2),
);

console.log("Resultados salvos em results/benchmark.json");