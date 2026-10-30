# Fluxo de `stream.mts`

O arquivo envia uma requisição com `stream: true` e lê a resposta linha por linha. Os diagramas abaixo mostram o fluxo principal e o processamento de cada linha.

## Fluxo principal

```mermaid
flowchart TB
    A(["Início"]) --> B["1. Inicia o cronômetro"]
    B --> C["2. Envia a requisição com stream: true"]
    C --> D{"HTTP OK e corpo presente?"}
    D -- Não --> X(["Erro"])
    D -- Sim --> E["3. Processa cada linha do corpo"]
    E --> F{"Foi recebido done: true?"}
    F -- Não --> X
    F -- Sim --> G["4. Calcula o tempo total"]
    G --> H["5. Mostra o tempo até o primeiro texto e o tempo total"]
    H --> I(["Fim"])
```

O passo 3 se repete até o corpo da resposta terminar. Receber `done: true` marca a conclusão, mas não interrompe a leitura.

## Processamento de cada linha (passo 3)

```mermaid
flowchart TB
    A(["Linha recebida"]) --> B{"Está vazia?"}
    B -- Sim --> Z(["Aguarda a próxima linha"])
    B -- Não --> C["Converte a linha em JSON"]
    C --> D{"Contém error?"}
    D -- Sim --> X(["Erro"])
    D -- Não --> E{"Contém texto?"}
    E -- Sim --> F["Registra o tempo, se for o primeiro texto"]
    F --> G["Escreve o texto no terminal"]
    G --> H{"Contém done: true?"}
    E -- Não --> H
    H -- Sim --> I["Marca a resposta como concluída"]
    H -- Não --> Z
    I --> Z
```

O tempo até o primeiro texto é contado desde antes do `fetch`. Se nenhuma linha trouxer `done: true`, o arquivo lança um erro ao fim da leitura.
