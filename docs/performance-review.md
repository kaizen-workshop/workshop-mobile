# Revisão de performance — TASK-081

Escopo revisado: inicialização e sessão, telas implementadas, listas, imagens,
cache local, HTTP e dependências existentes em setembro de 2026.

## Ajustes realizados

- o valor e as operações do contexto de autenticação permanecem estáveis
  enquanto o estado da sessão não muda, evitando renders dos consumidores por
  identidade de objeto;
- feed, preferências e workshops entregam a coleção original ao `FlatList`, sem
  criar uma cópia completa em cada render;
- testes de regressão verificam a estabilidade do contexto e a identidade das
  coleções usadas pelas listas.

## Itens verificados sem mudança

- listas potencialmente extensas já usam `FlatList`, com chave estável;
- imagens remotas usam `expo-image`, cujo cache padrão instalado é em disco;
- cache local possui expiração e isolamento por usuário;
- timers HTTP são sempre liberados no bloco `finally`;
- subscriptions, observadores, listeners e timers possuem limpeza no ciclo de
  vida correspondente;
- refresh concorrente de autenticação já é consolidado em uma única Promise;
- nenhuma dependência adicional foi necessária;
- o export web de referência gera atualmente um bundle JavaScript de 1,5 MB
  antes de compressão.

Não foram definidos números arbitrários para janela, lote ou recorte de
`FlatList`: esses parâmetros devem ser ajustados somente após medir listas reais
em Android e iOS, pois altura variável e acessibilidade podem mudar o custo e o
comportamento de rolagem.

## Checklist para dados reais

Quando feed e workshops estiverem integrados à API, medir em dispositivo:

- tempo até conteúdo visível em cold start e warm start;
- FPS e renders durante rolagem de listas longas;
- memória consumida por imagens e cache após navegação prolongada;
- tamanho e crescimento do cache por usuário;
- requests duplicados durante refresh, paginação e troca de rota;
- bundle nativo e tempo de inicialização em builds de staging/produção.
