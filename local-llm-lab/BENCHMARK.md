# Fluxo de `benchmark.mts`

O arquivo faz três requisições com `stream: false`, uma após a outra. Guarda o resultado de cada chamada e grava um relatório JSON.

## Fluxo principal

```mermaid
flowchart TB
    A(["Início"]) --> B["1. Define modelo, pergunta e opções"]
    B --> C["2. Executa a chamada 1"]
    C --> D["3. Executa a chamada 2"]
    D --> E["4. Executa a chamada 3"]
    E --> F["5. Mostra a tabela sem o texto das respostas"]
    F --> G["6. Monta o relatório com as três chamadas"]
    G --> H["7. Cria o diretório results"]
    H --> I["8. Grava results/benchmark.json"]
    I --> J["9. Informa o caminho do arquivo no terminal"]
    J --> K(["Fim"])
```

Os passos 2, 3 e 4 correspondem às três iterações do `for`. Cada chamada precisa terminar antes de começar a próxima. Se uma delas lançar um erro, os passos seguintes não são executados.

## O que acontece em cada chamada (passos 2, 3 e 4)

```mermaid
flowchart TB
    A(["Início da chamada"]) --> B["1. Inicia o cronômetro"]
    B --> C["2. Envia a requisição com stream: false"]
    C --> D{"HTTP OK?"}
    D -- Não --> X(["Erro"])
    D -- Sim --> E["3. Lê o JSON completo"]
    E --> F{"done: true e há texto na resposta?"}
    F -- Não --> X
    F -- Sim --> G["4. Calcula as métricas da chamada"]
    G --> H["5. Guarda métricas e texto em runs"]
    H --> I(["Chamada concluída"])
```

As métricas guardadas são `clientMs`, `loadMs`, `inputTokens`, `outputTokens`, `tokensPerSecond` e `doneReason`. O campo `answer` guarda o texto da resposta. A tabela omite `answer`, mas o relatório JSON inclui esse campo. O caminho `results/benchmark.json` é relativo ao diretório de execução.
