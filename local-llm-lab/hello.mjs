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
    options: {
      num_ctx: 2048,
      num_predict: 128,
    },
  }),
});

if (!response.ok) {
  throw new Error(`O Ollama retornou um erro HTTP ${response.status}.`);
}

const result = await response.json();

console.log(result.message.content);