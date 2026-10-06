# TASKS.md

# workshop_mobile

Backlog técnico inicial da aplicação mobile.

Legenda:

```text
[ ] pendente
[~] em andamento
[x] concluída
[!] bloqueada
```

A task só pode ser marcada como concluída quando atender à Definition of Done do `AGENTS.md`.

---

# Milestone 0 — Foundation

## TASK-001 — Definir stack mobile

Status:

```text
[x]
```

Definir explicitamente:

- framework;
- linguagem;
- versões;
- navegação;
- gerenciamento de estado;
- cliente HTTP;
- persistência local;
- armazenamento seguro;
- WebSocket;
- push notification;
- testes;
- lint;
- formatter.

Critério de aceite:

- decisão registrada no README;
- dependências principais justificadas;
- projeto ainda não deve acumular bibliotecas redundantes.

---

## TASK-002 — Criar projeto base

Status:

```text
[x]
```

Critérios de aceite:

- aplicação inicia;
- build funciona;
- lint funciona;
- configuração básica está versionada.

Dependência:

```text
TASK-001
```

---

## TASK-003 — Criar estrutura por features

Status:

```text
[x]
```

Features iniciais:

```text
auth
onboarding
profile
preferences
feed
workshop
registration
payment
calendar
group
chat
notification
evaluation
settings
shared
core
```

---

## TASK-004 — Configurar ambientes

Status:

```text
[x]
```

Criar suporte para:

```text
dev
staging
prod
```

Configurar URL da API externamente.

Nenhum segredo deve estar no app.

---

## TASK-005 — Configurar cliente HTTP

Status:

```text
[x]
```

Implementar:

- base URL;
- headers comuns;
- timeout;
- serialização;
- tratamento de erros;
- interceptação controlada.

---

## TASK-006 — Configurar armazenamento seguro

Status:

```text
[x]
```

Usar mecanismo seguro da plataforma para:

- access token;
- refresh token.

Nunca armazenar senha.

---

## TASK-007 — Criar tratamento global de erros

Status:

```text
[x]
```

Mapear:

- erro de rede;
- timeout;
- 400;
- 401;
- 403;
- 404;
- 409;
- 500;
- códigos de negócio.

---

# Milestone 1 — Authentication

## TASK-008 — Criar tela de login

Status:

```text
[x]
```

Campos:

```text
login
password
```

O campo `login` aceita username ou e-mail.

Estados:

- idle;
- loading;
- error.

---

## TASK-009 — Integrar login com API

Status:

```text
[x]
```

Critérios:

- salva tokens com segurança;
- trata credencial inválida;
- trata usuário bloqueado;
- não loga senha/token.

Implementado com login, perfil para derivar onboarding, refresh, logout, troca
e recuperação de senha. Android e iOS persistem tokens somente no SecureStore;
o Web de desenvolvimento usa memória volátil porque o SecureStore não existe
no navegador. A API retorna o envelope `401 UNAUTHORIZED` para credenciais
inválidas e o mobile apresenta a mensagem correspondente sem registrar senha
ou tokens.

---

## TASK-010 — Implementar roteamento por estado de autenticação

Status:

```text
[x]
```

Estados:

```text
UNAUTHENTICATED
REQUIRES_PASSWORD_CHANGE
REQUIRES_ONBOARDING
AUTHENTICATED
```

Os grupos protegidos possuem layouts próprios para o Expo Router remover a rota
anterior e redirecionar pelo novo estado após login, troca de senha e onboarding.

---

## TASK-011 — Implementar troca obrigatória de senha

Status:

```text
[x]
```

Fluxo:

```text
login
→ mustChangePassword
→ change password
→ session continues
```

A API atual revoga todos os refresh tokens e invalida o access token ao trocar
a senha sem devolver novos tokens. Por isso, após o sucesso o mobile limpa a
sessão revogada e exige novo login antes de continuar para o onboarding.

---

## TASK-012 — Implementar refresh token

Status:

```text
[x]
```

Respostas `401` em chamadas autenticadas renovam o par de tokens e repetem a
requisição uma vez. Renovações concorrentes compartilham uma única chamada; um
refresh rejeitado limpa a sessão e atualiza imediatamente o roteamento.

Critérios:

- renovação controlada;
- requests concorrentes não disparam vários refreshes desnecessários;
- falha final leva ao logout.

---

## TASK-013 — Implementar logout

Status:

```text
[x]
```

Critérios:

- invalida sessão na API;
- limpa tokens locais;
- limpa dados sensíveis de sessão.

---

## TASK-014 — Implementar recuperação de senha

Status:

```text
[x]
```

Telas:

- solicitar recuperação;
- redefinir senha.

---

# Milestone 2 — Onboarding and Preferences

## TASK-015 — Criar onboarding de preferências

Status:

```text
[x]
```

Exibir temas retornados pela API.

Permitir múltipla seleção.

Implementado com carga autenticada de `GET /api/v1/themes`, validação defensiva
do contrato, seleção múltipla e estados de loading, erro, retry e vazio.

---

## TASK-016 — Salvar preferências

Status:

```text
[x]
```

Critérios:

- loading;
- erro;
- retry;
- sucesso leva ao feed.

Implementado com `PUT /api/v1/users/me/themes`, estado de salvamento, erro com
retry manual e avanço para o feed somente após confirmação da API.

---

## TASK-017 — Editar preferências posteriormente

Status:

```text
[x]
```

Disponível nas configurações/perfil.

Disponível pelo perfil, carregando a seleção atual de `GET /api/v1/users/me` e
salvando a substituição confirmada em `PUT /api/v1/users/me/themes`.

---

# Milestone 3 — Navigation and Shell

## TASK-018 — Criar navegação principal

Status:

```text
[x]
```

Áreas esperadas:

```text
feed
workshops/calendar
notifications
profile/settings
```

A composição final pode mudar conforme UX.

---

## TASK-019 — Criar design tokens básicos

Status:

```text
[x]
```

Centralizar:

- cores;
- tipografia;
- espaçamento;
- radius;
- tamanhos.

Não criar design system gigantesco nesta fase.

---

## TASK-020 — Criar componentes básicos de estado

Status:

```text
[x]
```

Criar:

```text
LoadingState
ErrorState
EmptyState
OfflineState
```

---

# Milestone 4 — Feed

## TASK-021 — Criar modelo e integração do feed

Status:

```text
[x]
```

Consumir endpoint da API.

Implementado com `GET /api/v1/posts/feed`, autenticação, validação defensiva do
Spring Page, mapeamento para o modelo local e fallback para o cache por usuário.

---

## TASK-022 — Criar tela de feed

Status:

```text
[~]
```

Exibir:

- workshops;
- posts;
- destaques.

Progresso: posts e destaques já usam a origem real da API. Workshops permanecem
ausentes porque o endpoint atual entrega somente `PostResponse`; o mobile não
mistura outra listagem e não recalcula a ordenação autoritativa.

---

## TASK-023 — Implementar paginação do feed

Status:

```text
[x]
```

Preferir cursor quando fornecido pela API.

Implementada com a paginação por página fornecida pelo Spring Page atual,
bloqueio de requests concorrentes, deduplicação defensiva e preservação da
ordem retornada pela API. O carregamento incremental é desabilitado no fallback
offline, pois o cache representa um snapshot.

---

## TASK-024 — Implementar pull-to-refresh

Status:

```text
[x]
```

O gesto executa nova leitura remota, atualiza o snapshot e a paginação após
sucesso, mantém conteúdo anterior durante a operação e bloqueia refreshes
concorrentes. Em falha, preserva dados já visíveis ou usa o fallback de cache.

---

## TASK-025 — Implementar cache do feed

Status:

```text
[x]
```

Critérios:

- conteúdo anterior pode aparecer offline;
- sincronização posterior atualiza cache;
- cache não substitui refresh.

Implementado com snapshot expirável e isolado por usuário. Toda carga tenta a
origem remota primeiro, atualiza o cache após sucesso e recorre ao conteúdo
salvo somente quando a leitura remota falha. A tela identifica o conteúdo
offline sem impedir refresh ou paginação posteriores.

---

## TASK-026 — Implementar curtidas

Status:

```text
[x]
```

Critérios:

- feedback imediato controlado;
- rollback em erro quando necessário;
- operação idempotente.

Implementada com `PUT`/`DELETE /api/v1/posts/{id}/like`, bloqueio por post,
feedback otimista de estado/contagem e rollback integral quando a API falha.

---

## TASK-027 — Implementar comentários

Status:

```text
[x]
```

Criar:

- lista;
- criação;
- edição permitida;
- exclusão permitida.

Listagem paginada, criação idempotente, edição própria e exclusão própria estão
integradas aos endpoints atuais da API.

---

# Milestone 5 — Workshops

## TASK-028 — Criar listagem de workshops

Status:

```text
[x]
```

Implementada com a API autenticada, paginação incremental do catálogo publicado,
nomes de temas/categorias, cache por usuário, pull-to-refresh e navegação para
os detalhes.

---

## TASK-029 — Implementar filtros de workshop

Status:

```text
[x]
```

Cobrir filtros suportados pela API.

Implementados filtros combináveis de status, tema e categoria, com opções
ativas da API, feedback de carregamento e consulta remota parametrizada.

---

## TASK-030 — Criar tela de detalhes do workshop

Status:

```text
[x]
```

Exibir dados disponíveis sem assumir preenchimento obrigatório de campos opcionais.

Tela integrada à consulta autenticada por id, incluindo taxonomias, agenda,
inscrições, capacidade, anexos disponíveis, cache por usuário e retry.

---

## TASK-031 — Implementar anexos

Status:

```text
[x]
```

Visualizar/abrir anexos suportados.

Os anexos são listados com metadados reais, baixados do endpoint autenticado
para o cache temporário e abertos pelo compartilhamento nativo, com feedback de
progresso e erro.

---

## TASK-032 — Implementar cache de workshops

Status:

```text
[x]
```

Permitir consulta básica offline de dados previamente carregados.

Implementado com cache expirável de lista e detalhes, isolado por usuário,
fallback para a última leitura válida quando a rede falha e identificação
acessível do conteúdo salvo nas telas. Falhas do cache não ocultam dados novos
nem substituem o erro original quando não existe conteúdo local.

---

# Milestone 6 — Registrations

## TASK-033 — Implementar ação de inscrição

Status:

```text
[x]
```

Critérios:

- bloqueio contra toque duplicado;
- loading;
- sucesso;
- erro;
- conflito;
- workshop cheio.

A ação usa o endpoint autenticado do workshop, bloqueia envios concorrentes,
mostra progresso, diferencia conflito de erro genérico e apresenta confirmação,
pendência ou entrada na lista de espera conforme a resposta da API.

---

## TASK-034 — Implementar Idempotency-Key

Status:

```text
[x]
```

Para retries da mesma inscrição.

A mesma operação deve reutilizar a mesma chave.

Cada abertura do fluxo gera uma UUID, enviada no cabeçalho `Idempotency-Key` e
mantida estável em todas as tentativas até a inscrição concluir.

---

## TASK-035 — Implementar estado de inscrição

Status:

```text
[x]
```

Exibir:

```text
PENDING
CONFIRMED
WAITING_LIST
CANCELLED
REFUNDED
```

conforme contrato da API.

Implementada como tela de apresentação tipada para `PENDING`, `CONFIRMED`,
`WAITING_LIST`, `CANCELLED` e `REFUNDED`. Os estados possuem descrição textual,
sem antecipar posição da lista de espera ou ações ainda dependentes da API.

---

## TASK-036 — Implementar cancelamento de inscrição

Status:

```text
[x]
```

Critérios:

- confirmação do usuário;
- tratamento de regra de prazo;
- atualização de estado.

A tela reconcilia a inscrição mais recente do usuário, exige confirmação antes
do cancelamento, bloqueia envios concorrentes e atualiza o estado retornado pela
API, distinguindo reembolso processado de cancelamento sem reembolso por prazo.
O `Idempotency-Key` permanece estável durante as tentativas da mesma operação.

---

## TASK-037 — Implementar lista de espera

Status:

```text
[x]
```

Exibir:

- status;
- posição quando fornecida;
- promoção quando recebida pela API.

O estado de espera mostra a posição quando a API a fornece. A inscrição é
reconciliada sempre que a tela volta ao foco, refletindo automaticamente a
promoção para confirmação e removendo a posição antiga.

---

# Milestone 7 — Payments

## TASK-038 — Criar tela de estado de pagamento

Status:

```text
[x]
```

Exibir estados retornados pela API.

Implementada como tela de apresentação tipada para `PENDING`, `PAID`,
`DECLINED`, `CANCELLED`, `REFUNDED` e `EXEMPT`, sem dados financeiros ou lógica
de gateway. Todos os estados possuem descrição textual e cobertura de teste.

---

## TASK-039 — Integrar fluxo de pagamento

Status:

```text
[x]
```

Implementação depende da definição do gateway.

Não incluir dados sensíveis desnecessários no app.

Integrado ao gateway simulado da API com `Idempotency-Key` estável por tentativa.
O app envia apenas os identificadores necessários, bloqueia duplicidade, apresenta
progresso/erro e exibe o estado retornado sem expor referência externa sensível.

---

## TASK-040 — Implementar estado de reembolso

Status:

```text
[!]
```

Exibir:

- solicitado;
- processado;
- recusado;
- concluído;

conforme contrato final da API.

Bloqueio: o contrato atual expõe apenas o estado final `REFUNDED` (ou mantém
`PAID` quando não há reembolso). Não há estados solicitado/processado/recusado.

---

# Milestone 8 — History and Calendar

## TASK-041 — Criar histórico de workshops

Status:

```text
[x]
```

Filtros:

- futuros;
- andamento;
- concluídos;
- cancelados;
- lista de espera.

O histórico paginado oferece os filtros `FUTURE`, `IN_PROGRESS`, `COMPLETED`,
`CANCELLED` e `WAITING_LIST` definidos pelo contrato da API.

---

## TASK-042 — Criar calendário

Status:

```text
[x]
```

---

## TASK-043 — Abrir detalhes pelo calendário

Status:

```text
[x]
```

---

# Milestone 9 — Groups

## TASK-044 — Listar grupos acessíveis

Status:

```text
[x]
```

Mesmo que inicialmente exista apenas um grupo por workshop.

---

## TASK-045 — Criar tela do grupo

Status:

```text
[x]
```

Exibir vínculo com workshop e acesso ao chat.

---

## TASK-046 — Tratar perda de acesso ao grupo

Status:

```text
[x]
```

Se inscrição for cancelada ou workshop encerrado conforme regra.

---

# Milestone 10 — Chat

## TASK-047 — Criar histórico de mensagens

Status:

```text
[x]
```

Com paginação.

---

## TASK-048 — Implementar envio de mensagem

Status:

```text
[x]
```

Estados:

```text
sending
sent
failed
```

---

## TASK-049 — Implementar retry de mensagem

Status:

```text
[x]
```

Evitar duplicação.

O mobile mantém a mesma UUID em `Idempotency-Key` enquanto o usuário repete uma
mensagem que falhou, permitindo recuperar uma resposta perdida sem duplicação.

---

## TASK-050 — Integrar WebSocket

Status:

```text
[x]
```

Dependência:

API com suporte WebSocket.

Integrado ao STOMP nativo em `/ws`, com Bearer no `CONNECT`, assinatura do
tópico autorizado e REST mantido como fonte persistente de verdade.

---

## TASK-051 — Implementar reconexão do chat

Status:

```text
[x]
```

Critérios:

- reconecta;
- sincroniza mensagens perdidas;
- não duplica mensagens.

Reconexão exponencial limitada a 30 segundos, ressincronização REST após
reconectar e deduplicação por ID.

---

## TASK-052 — Implementar exclusão/moderação visível

Status:

```text
[x]
```

Refletir permissões retornadas pela API.

Exclusão própria, tombstone e moderação usam `canModerate` retornado pelo grupo;
o compositor respeita separadamente `canSendMessages`.

---

# Milestone 11 — Notifications

## TASK-053 — Criar central de notificações

Status:

```text
[x]
```

---

## TASK-054 — Marcar notificação como lida

Status:

```text
[x]
```

---

## TASK-055 — Implementar deep link interno

Status:

```text
[x]
```

Exemplos:

```text
notification -> workshop
notification -> post
notification -> group/chat
```

Metadados `workshopId`, `postId` e `groupId` são resolvidos apenas para rotas
internas conhecidas, tanto na central quanto ao tocar uma notificação push.

---

## TASK-056 — Registrar dispositivo para push

Status:

```text
[x]
```

Permissão, canal Android, token Expo, armazenamento seguro do `deviceId`, remoção
no logout e registro autenticado na API foram implementados. Os identificadores
nativos são fixos e `EAS_PROJECT_ID` é exigido nos builds staging/produção.

---

## TASK-057 — Integrar push notification

Status:

```text
[!]
```

O listener e a navegação interna estão implementados. Bloqueio: a API usa
`NoOpPushProvider` e não envia notificações remotas até um provedor externo ser
configurado; o projeto EAS também ainda não possui ID oficial.

---

# Milestone 12 — Profile and Settings

## TASK-058 — Criar tela de perfil

Status:

```text
[x]
```

---

## TASK-059 — Editar campos permitidos

Status:

```text
[x]
```

Somente `name`, `phone` e `profileImage` são enviados no `PATCH /users/me`.
Usuário e e-mail permanecem somente leitura.

---

## TASK-060 — Criar configurações

Status:

```text
[x]
```

Incluir conforme requisitos:

- preferências;
- notificações;
- tema;
- comunicação;
- privacidade;
- conta.

Inclui atalhos para preferências e notificações, informação de tema do sistema,
privacidade do armazenamento, ativação de push e logout.

---

# Milestone 13 — Evaluations

## TASK-061 — Criar tela de avaliação

Status:

```text
[x]
```

Campos:

- nota;
- comentário;
- conteúdo;
- instrutor;
- organização.

---

## TASK-062 — Enviar avaliação

Status:

```text
[x]
```

Tratar elegibilidade retornada pela API.

A tela envia as quatro notas de 1 a 5 e comentário opcional. Conflito,
proibição e recurso oculto são apresentados como indisponibilidade de avaliação.
Reenvios preservam a mesma `Idempotency-Key` enquanto o conteúdo não muda.

---

# Milestone 14 — Offline and Sync

## TASK-063 — Definir política offline por feature

Status:

```text
[x]
```

Classificar operações em:

```text
READ-CACHEABLE
WRITE-RETRYABLE
WRITE-ONLINE-ONLY
```

---

## TASK-064 — Criar camada de persistência local

Status:

```text
[x]
```

A tecnologia depende da stack escolhida.

---

## TASK-065 — Implementar sincronização incremental

Status:

```text
[~]
```

Utilizar suporte da API como:

```text
updatedAt
updatedAfter
```

quando disponível.

Progresso: a API agora oferece `updatedAt`/`updatedAfter` para workshops, feed e
notificações e ETag no detalhe de workshop. O mobile ainda usa refresh completo
dos snapshots; a aplicação incremental e a remoção de itens que deixaram as
coleções visíveis permanecem pendentes.

---

## TASK-066 — Criar fila controlada de operações retryable

Status:

```text
[!]
```

Não incluir automaticamente pagamentos.

Inscrição, cancelamento, comentários, mensagens e avaliações já têm identidade
idempotente, mas ainda não possuem fila persistida e política de expiração.

---

## TASK-067 — Resolver conflitos de sincronização

Status:

```text
[!]
```

Definir regra por domínio.

Não usar "última escrita vence" universalmente sem avaliação.

Bloqueio: depende das regras de conflito por domínio e das respostas definidas
na API; não há versionamento de escritas ou precondições condicionais.

---

# Milestone 15 — Quality

## TASK-068 — Configurar testes unitários

Status:

```text
[x]
```

---

## TASK-069 — Configurar testes de componentes/telas

Status:

```text
[x]
```

---

## TASK-070 — Configurar testes de integração

Status:

```text
[x]
```

---

## TASK-071 — Criar testes do fluxo de autenticação

Status:

```text
[x]
```

---

## TASK-072 — Criar testes do fluxo de inscrição

Status:

```text
[x]
```

Cobertos criação autenticada, reutilização da `Idempotency-Key`, respostas
inválidas e conflitos, consulta da inscrição atual, cancelamento, posição e
promoção na lista de espera, além do início do pagamento e dos estados exibidos
durante todo o fluxo.

---

## TASK-073 — Criar testes de paginação do feed

Status:

```text
[x]
```

Cobertos contrato e ordem das páginas, última página, deduplicação de
sobreposição, acionamento incremental, bloqueio durante request concorrente e
retry visual após falha.

---

## TASK-074 — Criar testes de offline/retry

Status:

```text
[x]
```

Cobertos cache expirado/inválido, fallback de feed e workshops, fluxo integrado
online para offline, recuperação por retry explícito, erros HTTP de rede e
timeout, ação visual de retry e refresh concorrente de sessão. Escritas sem
identidade idempotente não receberam retry automático.

---

## TASK-075 — Criar testes do chat

Status:

```text
[x]
```

Cobertos contrato do histórico por cursor, envio e exclusão persistente. A
reconexão é validada pelos checks de tipo/lint e pela deduplicação do fluxo.

---

# Milestone 16 — Release

## TASK-076 — Configurar build de desenvolvimento

Status:

```text
[~]
```

Progresso: perfil EAS interno com development client e ambiente de
desenvolvimento configurado. A validação nativa aguarda os identificadores
oficiais do aplicativo, vínculo do projeto EAS e credenciais das plataformas.

---

## TASK-077 — Configurar build de staging

Status:

```text
[~]
```

Progresso: perfil EAS de distribuição interna configurado, usando o ambiente
`preview` do EAS, `APP_VARIANT=staging` e APK para validação Android. A URL de
staging deve ser cadastrada externamente e o build nativo ainda precisa ser
executado.

---

## TASK-078 — Configurar build de produção

Status:

```text
[~]
```

Progresso: perfil EAS para distribuição em loja configurado, sem URL ou segredo
embutido. A conclusão depende dos identificadores oficiais, credenciais de loja,
URL de produção no ambiente EAS e validação do binário assinado.

---

## TASK-079 — Revisar logs e segredos

Status:

```text
[x]
```

---

## TASK-080 — Revisar acessibilidade

Status:

```text
[x]
```

Revisados semântica para leitor de tela, estados de ações assíncronas, alvos de
toque, contraste, conteúdo não interativo e adaptação dos formulários a teclado
e fonte ampliada. A cobertura automatizada foi atualizada e o checklist manual
para binários Android/iOS está registrado em `docs/accessibility-review.md`.

---

## TASK-081 — Revisar performance

Status:

```text
[x]
```

Revisados renders do contexto de autenticação, identidade dos dados das listas,
virtualização, imagens, cache, timers, listeners, requests concorrentes e bundle.
As correções mensuráveis receberam testes de regressão; medições com dados reais
estão registradas em `docs/performance-review.md`.

---

## TASK-082 — Preparar primeira release

Status:

```text
[ ]
```

Critérios:

- build verde;
- API de produção configurável;
- autenticação funcionando;
- fluxos principais testados;
- offline básico funcionando;
- nenhuma credencial embutida;
- logs revisados;
- versão definida.

---

# TASK-083 — Validar implementação contra o protótipo Figma

Status:

```text
[x]
```

- comparar telas implementadas com o protótipo;
- validar navegação;
- validar hierarquia visual;
- validar estados de loading, erro e vazio;
- registrar divergências intencionais;
- atualizar Figma ou implementação quando necessário.

As telas foram revisadas contra os arquivos fornecidos em
`Trabalho-Mobile`. Login e recuperação usam o fundo e a marca WEG do material;
a navegação principal usa menu hambúrguer lateral; lista e detalhes de workshop
seguem a composição dos cartões de referência e usam a imagem ilustrativa do
protótipo como fallback. Os detalhes incluem retorno, avaliação revisada e a
discussão vinculada ao post publicado do workshop no final da rolagem.

As navegações internas de workshop, grupo, chat, comentários e avaliação agora
mantêm o identificador em estado de sessão e expõem URLs estáveis sem UUID. O
fluxo real foi validado no navegador desde o login até lista, detalhes,
comentários e avaliação, além dos testes, tipos, lint, formatação e export web.

---

# TASK-084 — Adotar WEG Design System

Status:

```text
[x]
```

- registrar a documentação oficial no `AGENTS.md`;
- usar cores semânticas oficiais;
- usar Roboto;
- alinhar espaçamentos e radius;
- adaptar componentes para React Native sem dependência web;
- validar testes, lint, tipos, formatação e build.

Revisão de UI/UX concluída nas telas de autenticação, navegação principal,
feed, workshops, calendário, grupos, chat, notificações, preferências, perfil,
avaliação, comentários e configurações. Foram padronizados cabeçalhos, cartões,
ícones, hierarquia tipográfica, feedback de interação, estados de tela e largura
responsiva conforme os tokens WEG e as referências visuais do projeto.

Implementado com tokens semânticos consultados na documentação oficial,
tipografia Roboto empacotada no aplicativo e adaptação dos componentes nativos
existentes. Validado com testes, TypeScript, lint, Prettier e export web.

---

# MVP

Para a primeira versão funcional, priorizar:

```text
TASK-001 até TASK-020
TASK-021 até TASK-037
TASK-041 até TASK-051
TASK-053 até TASK-059
TASK-063 até TASK-065
TASK-068 até TASK-075
```

Fluxo esperado:

```text
login
↓
troca de senha
↓
preferências
↓
feed
↓
workshop
↓
inscrição
↓
histórico/calendário
↓
grupo
↓
chat
↓
notificações
```

---

# Ordem imediata

Executar primeiro:

```text
TASK-001
TASK-002
TASK-003
TASK-004
TASK-005
TASK-006
TASK-007
```

Não iniciar feed, chat ou inscrição antes de definir stack, arquitetura, cliente HTTP, armazenamento seguro e tratamento de erros.

Construir UI antes dessas bases é uma forma particularmente eficiente de fabricar retrabalho.
