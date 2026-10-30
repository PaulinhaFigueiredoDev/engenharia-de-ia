import { performance } from "node:perf_hooks";

type ChatResponse = {
  message: {
    content: string;
  };
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

const start = performance.now();

const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3:0.6b",
    messages: [
      {
        role: "user",
        content: "Explique o que é uma LLM em duas frases.",
      },
    ],
    stream: false,
    think: false,
    keep_alive: "5m",
    options: {
      num_ctx: 2048,
      num_predict: 128,
      temperature: 0,
    },
  }),
});

if (!response.ok) {
  throw new Error(`O Ollama retornou um erro HTTP ${response.status}.`);
}

const result = (await response.json()) as ChatResponse;

const clientDurationMs = performance.now() - start;

console.log(result.message.content);

function toMilliseconds(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Number((value / 1_000_000).toFixed(2));
}

const outputTokensPerSecond =
  result.eval_count !== undefined &&
  result.eval_duration !== undefined &&
  result.eval_duration > 0
    ? result.eval_count / (result.eval_duration / 1_000_000_000)
    : undefined;

console.table({
  "Tempo observado pelo cliente (ms)": Number(clientDurationMs.toFixed(2)),
  "Tempo reportado pelo servidor (ms)": toMilliseconds(result.total_duration),
  "Carregamento do modelo (ms)": toMilliseconds(result.load_duration),
  "Processamento da entrada (ms)": toMilliseconds(result.prompt_eval_duration),
  "Geração da resposta (ms)": toMilliseconds(result.eval_duration),
  "Tokens de entrada": result.prompt_eval_count,
  "Tokens de saída": result.eval_count,
  "Tokens de saída por segundo":
    outputTokensPerSecond === undefined
      ? undefined
      : Number(outputTokensPerSecond.toFixed(2)),
});