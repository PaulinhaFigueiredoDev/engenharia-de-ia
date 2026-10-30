import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import { performance } from "node:perf_hooks";

type ChatChunk = {
  message?: {
    content?: string;
  };
  done?: boolean;
  error?: string;
};

const start = performance.now();

const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  signal: AbortSignal.timeout(120_000),
  body: JSON.stringify({
    model: "qwen3:0.6b",
    messages: [
      {
        role: "user",
        content: "Explique o que é uma LLM em duas frases.",
      },
    ],
    stream: true,
    think: false,
    keep_alive: "5m",
    options: {
      num_ctx: 2048,
      num_predict: 128,
      temperature: 0,
    },
  }),
});

if (!response.ok || !response.body) {
  throw new Error(`Não foi possível iniciar o streaming: HTTP ${response.status}.`);
}

const lines = createInterface({
  input: Readable.fromWeb(response.body),
  crlfDelay: Infinity,
});

let firstContentMs: number | undefined;
let completed = false;

for await (const line of lines) {
  if (!line.trim()) {
    continue;
  }

  const chunk: ChatChunk = JSON.parse(line);

  if (chunk.error) {
    throw new Error(chunk.error);
  }

  const content = chunk.message?.content ?? "";

  if (content.length > 0) {
    if (firstContentMs === undefined) {
      firstContentMs = performance.now() - start;
    }

    process.stdout.write(content);
  }

  if (chunk.done) {
    completed = true;
  }
}

if (!completed) {
  throw new Error("O fluxo terminou sem confirmar a conclusão da resposta.");
}

const totalMs = performance.now() - start;

console.log("\n");

console.table({
  "Primeiro conteúdo recebido (ms)": firstContentMs,
  "Tempo total do fluxo (ms)": totalMs,
});