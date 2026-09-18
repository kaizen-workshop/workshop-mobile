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
[ ]
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
[ ]
```

Critérios:

- salva tokens com segurança;
- trata credencial inválida;
- trata usuário bloqueado;
- não loga senha/token.

---

## TASK-010 — Implementar roteamento por estado de autenticação

Status:

```text
[ ]
```

Estados:

```text
UNAUTHENTICATED
REQUIRES_PASSWORD_CHANGE
REQUIRES_ONBOARDING
AUTHENTICATED
```

---

## TASK-011 — Implementar troca obrigatória de senha

Status:

```text
[ ]
```

Fluxo:

```text
login
→ mustChangePassword
→ change password
→ session continues
```

---

## TASK-012 — Implementar refresh token

Status:

```text
[ ]
```

Critérios:

- renovação controlada;
- requests concorrentes não disparam vários refreshes desnecessários;
- falha final leva ao logout.

---

## TASK-013 — Implementar logout

Status:

```text
[ ]
```

Critérios:

- invalida sessão na API;
- limpa tokens locais;
- limpa dados sensíveis de sessão.

---

## TASK-014 — Implementar recuperação de senha

Status:

```text
[ ]
```

Telas:

- solicitar recuperação;
- redefinir senha.

---

# Milestone 2 — Onboarding and Preferences

## TASK-015 — Criar onboarding de preferências

Status:

```text
[ ]
```

Exibir temas retornados pela API.

Permitir múltipla seleção.

---

## TASK-016 — Salvar preferências

Status:

```text
[ ]
```

Critérios:

- loading;
- erro;
- retry;
- sucesso leva ao feed.

---

## TASK-017 — Editar preferências posteriormente

Status:

```text
[ ]
```

Disponível nas configurações/perfil.

---

# Milestone 3 — Navigation and Shell

## TASK-018 — Criar navegação principal

Status:

```text
[ ]
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
[ ]
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
[ ]
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
[ ]
```

Consumir endpoint da API.

---

## TASK-022 — Criar tela de feed

Status:

```text
[ ]
```

Exibir:

- workshops;
- posts;
- destaques.

---

## TASK-023 — Implementar paginação do feed

Status:

```text
[ ]
```

Preferir cursor quando fornecido pela API.

---

## TASK-024 — Implementar pull-to-refresh

Status:

```text
[ ]
```

---

## TASK-025 — Implementar cache do feed

Status:

```text
[ ]
```

Critérios:

- conteúdo anterior pode aparecer offline;
- sincronização posterior atualiza cache;
- cache não substitui refresh.

---

## TASK-026 — Implementar curtidas

Status:

```text
[ ]
```

Critérios:

- feedback imediato controlado;
- rollback em erro quando necessário;
- operação idempotente.

---

## TASK-027 — Implementar comentários

Status:

```text
[ ]
```

Criar:

- lista;
- criação;
- edição permitida;
- exclusão permitida.

---

# Milestone 5 — Workshops

## TASK-028 — Criar listagem de workshops

Status:

```text
[ ]
```

---

## TASK-029 — Implementar filtros de workshop

Status:

```text
[ ]
```

Cobrir filtros suportados pela API.

---

## TASK-030 — Criar tela de detalhes do workshop

Status:

```text
[ ]
```

Exibir dados disponíveis sem assumir preenchimento obrigatório de campos opcionais.

---

## TASK-031 — Implementar anexos

Status:

```text
[ ]
```

Visualizar/abrir anexos suportados.

---

## TASK-032 — Implementar cache de workshops

Status:

```text
[ ]
```

Permitir consulta básica offline de dados previamente carregados.

---

# Milestone 6 — Registrations

## TASK-033 — Implementar ação de inscrição

Status:

```text
[ ]
```

Critérios:

- bloqueio contra toque duplicado;
- loading;
- sucesso;
- erro;
- conflito;
- workshop cheio.

---

## TASK-034 — Implementar Idempotency-Key

Status:

```text
[ ]
```

Para retries da mesma inscrição.

A mesma operação deve reutilizar a mesma chave.

---

## TASK-035 — Implementar estado de inscrição

Status:

```text
[ ]
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

---

## TASK-036 — Implementar cancelamento de inscrição

Status:

```text
[ ]
```

Critérios:

- confirmação do usuário;
- tratamento de regra de prazo;
- atualização de estado.

---

## TASK-037 — Implementar lista de espera

Status:

```text
[ ]
```

Exibir:

- status;
- posição quando fornecida;
- promoção quando recebida pela API.

---

# Milestone 7 — Payments

## TASK-038 — Criar tela de estado de pagamento

Status:

```text
[ ]
```

Exibir estados retornados pela API.

---

## TASK-039 — Integrar fluxo de pagamento

Status:

```text
[ ]
```

Implementação depende da definição do gateway.

Não incluir dados sensíveis desnecessários no app.

---

## TASK-040 — Implementar estado de reembolso

Status:

```text
[ ]
```

Exibir:

- solicitado;
- processado;
- recusado;
- concluído;

conforme contrato final da API.

---

# Milestone 8 — History and Calendar

## TASK-041 — Criar histórico de workshops

Status:

```text
[ ]
```

Filtros:

- futuros;
- andamento;
- concluídos;
- cancelados;
- lista de espera.

---

## TASK-042 — Criar calendário

Status:

```text
[ ]
```

---

## TASK-043 — Abrir detalhes pelo calendário

Status:

```text
[ ]
```

---

# Milestone 9 — Groups

## TASK-044 — Listar grupos acessíveis

Status:

```text
[ ]
```

Mesmo que inicialmente exista apenas um grupo por workshop.

---

## TASK-045 — Criar tela do grupo

Status:

```text
[ ]
```

Exibir vínculo com workshop e acesso ao chat.

---

## TASK-046 — Tratar perda de acesso ao grupo

Status:

```text
[ ]
```

Se inscrição for cancelada ou workshop encerrado conforme regra.

---

# Milestone 10 — Chat

## TASK-047 — Criar histórico de mensagens

Status:

```text
[ ]
```

Com paginação.

---

## TASK-048 — Implementar envio de mensagem

Status:

```text
[ ]
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
[ ]
```

Evitar duplicação.

---

## TASK-050 — Integrar WebSocket

Status:

```text
[ ]
```

Dependência:

API com suporte WebSocket.

---

## TASK-051 — Implementar reconexão do chat

Status:

```text
[ ]
```

Critérios:

- reconecta;
- sincroniza mensagens perdidas;
- não duplica mensagens.

---

## TASK-052 — Implementar exclusão/moderação visível

Status:

```text
[ ]
```

Refletir permissões retornadas pela API.

---

# Milestone 11 — Notifications

## TASK-053 — Criar central de notificações

Status:

```text
[ ]
```

---

## TASK-054 — Marcar notificação como lida

Status:

```text
[ ]
```

---

## TASK-055 — Implementar deep link interno

Status:

```text
[ ]
```

Exemplos:

```text
notification -> workshop
notification -> post
notification -> group/chat
```

---

## TASK-056 — Registrar dispositivo para push

Status:

```text
[ ]
```

---

## TASK-057 — Integrar push notification

Status:

```text
[ ]
```

---

# Milestone 12 — Profile and Settings

## TASK-058 — Criar tela de perfil

Status:

```text
[ ]
```

---

## TASK-059 — Editar campos permitidos

Status:

```text
[ ]
```

---

## TASK-060 — Criar configurações

Status:

```text
[ ]
```

Incluir conforme requisitos:

- preferências;
- notificações;
- tema;
- comunicação;
- privacidade;
- conta.

---

# Milestone 13 — Evaluations

## TASK-061 — Criar tela de avaliação

Status:

```text
[ ]
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
[ ]
```

Tratar elegibilidade retornada pela API.

---

# Milestone 14 — Offline and Sync

## TASK-063 — Definir política offline por feature

Status:

```text
[ ]
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
[ ]
```

A tecnologia depende da stack escolhida.

---

## TASK-065 — Implementar sincronização incremental

Status:

```text
[ ]
```

Utilizar suporte da API como:

```text
updatedAt
updatedAfter
```

quando disponível.

---

## TASK-066 — Criar fila controlada de operações retryable

Status:

```text
[ ]
```

Não incluir automaticamente pagamentos.

---

## TASK-067 — Resolver conflitos de sincronização

Status:

```text
[ ]
```

Definir regra por domínio.

Não usar "última escrita vence" universalmente sem avaliação.

---

# Milestone 15 — Quality

## TASK-068 — Configurar testes unitários

Status:

```text
[ ]
```

---

## TASK-069 — Configurar testes de componentes/telas

Status:

```text
[ ]
```

---

## TASK-070 — Configurar testes de integração

Status:

```text
[ ]
```

---

## TASK-071 — Criar testes do fluxo de autenticação

Status:

```text
[ ]
```

---

## TASK-072 — Criar testes do fluxo de inscrição

Status:

```text
[ ]
```

---

## TASK-073 — Criar testes de paginação do feed

Status:

```text
[ ]
```

---

## TASK-074 — Criar testes de offline/retry

Status:

```text
[ ]
```

---

## TASK-075 — Criar testes do chat

Status:

```text
[ ]
```

---

# Milestone 16 — Release

## TASK-076 — Configurar build de desenvolvimento

Status:

```text
[ ]
```

---

## TASK-077 — Configurar build de staging

Status:

```text
[ ]
```

---

## TASK-078 — Configurar build de produção

Status:

```text
[ ]
```

---

## TASK-079 — Revisar logs e segredos

Status:

```text
[ ]
```

---

## TASK-080 — Revisar acessibilidade

Status:

```text
[ ]
```

---

## TASK-081 — Revisar performance

Status:

```text
[ ]
```

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

- comparar telas implementadas com o protótipo;
- validar navegação;
- validar hierarquia visual;
- validar estados de loading, erro e vazio;
- registrar divergências intencionais;
- atualizar Figma ou implementação quando necessário.

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
