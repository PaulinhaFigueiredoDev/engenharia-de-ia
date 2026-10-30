# Agente de IA com Ollama e JavaScript

Este repositório acompanha a construção de um agente de IA em JavaScript e TypeScript. O projeto começa com modelos locais no Ollama e avança por ferramentas, RAG, MCP, memória, avaliação e orquestração até uma aplicação final.

## Etapas da construção

1. **Fundamentos** — preparando o ambiente, fazendo a [primeira chamada a uma LLM local](local-llm-lab/HELLO.md) com Ollama e JavaScript, medindo respostas, testando prompts e validando saídas estruturadas.
2. **Construção do agente** — adicionando ferramentas, loop, contexto e permissões; criando um agente de revisão de arquivos com evidências.
3. **Conhecimento e memória** — implementando embeddings, busca semântica, RAG com fontes, MCP e memória.
4. **Orquestração e qualidade** — coordenando agentes, registrando checkpoints, incluindo aprovação humana e avaliando resultados.
5. **Operação e segurança** — observando execuções, medindo uso e custo, expondo uma API e testando os limites da aplicação.
6. **Projeto final** — reunindo uma demonstração com CLI, API e dashboard, documentando decisões e evidências.