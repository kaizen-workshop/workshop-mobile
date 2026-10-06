# workshop_mobile

Aplicação mobile do sistema de workshops da ARWEG.

O aplicativo será o principal cliente da `workshop_api` e permitirá descoberta de workshops, inscrições, acompanhamento de eventos, interação no feed, participação em grupos, chat, notificações e avaliações.

---

# Status

Projeto em planejamento inicial.

Documentos principais:

```text
AGENTS.md
README.md
TASKS.md
```

O `AGENTS.md` define as regras de desenvolvimento.

O `TASKS.md` contém o backlog e a ordem de implementação.

---

# Backend

API:

```text
workshop_api
```

Contrato esperado:

```text
/api/v1
```

O contrato OpenAPI da API deve ser tratado como fonte de verdade para endpoints, requests e responses.

---

# Stack

A stack mobile ainda não foi formalmente definida.

Opções possíveis incluem:

- Flutter;
- React Native;
- desenvolvimento nativo.

Nenhuma deve ser assumida até decisão explícita.

Após a escolha, este documento deve ser atualizado com:

- versão da linguagem;
- framework;
- navegação;
- gerenciamento de estado;
- cliente HTTP;
- persistência local;
- armazenamento seguro;
- WebSocket;
- push notification;
- testes;
- lint/formatter.

---

# Arquitetura

O projeto deve ser organizado por feature.

Estrutura conceitual:

```text
app
├── auth
├── onboarding
├── profile
├── preferences
├── feed
├── workshop
├── registration
├── payment
├── calendar
├── group
├── chat
├── notification
├── evaluation
├── settings
├── shared
└── core
```

A estrutura concreta será adaptada à stack escolhida.

---

# Fluxo principal

```text
login
↓
troca de senha quando necessária
↓
configuração de preferências
↓
feed
↓
detalhes do workshop
↓
inscrição
↓
pagamento quando aplicável
↓
calendário / acompanhamento
↓
grupo
↓
chat
↓
participação
↓
avaliação
```

---

# Autenticação

O login permite:

```text
username
ou
e-mail
```

Fluxo inicial:

```text
ADMIN cria conta na API
↓
usuário recebe senha temporária
↓
login
↓
mustChangePassword = true
↓
troca obrigatória
↓
acesso ao aplicativo
```

O mobile deve tratar:

- login inválido;
- sessão;
- refresh token;
- logout;
- sessão expirada;
- usuário bloqueado;
- troca obrigatória.

Nunca armazenar senha.

---

# Feed

O feed pode exibir:

- posts;
- workshops recomendados;
- workshops próximos;
- destaques;
- inscrições abertas;
- conteúdo relacionado às preferências.

O aplicativo deve respeitar a ordenação recebida pela API.

A paginação deve ser incremental.

---

# Workshops

Usuários podem:

- listar;
- buscar;
- filtrar;
- visualizar detalhes;
- consultar vagas;
- consultar período de inscrição;
- visualizar anexos;
- realizar inscrição.

---

# Inscrições

O aplicativo deve exibir claramente o estado da inscrição.

Estados possíveis dependerão da API, incluindo:

```text
PENDING
CONFIRMED
WAITING_LIST
CANCELLED
REFUNDED
```

A API é a autoridade para confirmação de vaga.

---

# Pagamentos

Estados possíveis:

```text
PENDING
PAID
DECLINED
CANCELLED
REFUNDED
EXEMPT
```

O mobile não deve repetir pagamentos automaticamente sem garantia de segurança/idempotência.

---

# Calendário

O usuário poderá visualizar:

- workshops futuros;
- workshops inscritos;
- workshops relacionados às preferências;
- workshops realizados.

---

# Grupos

Regra inicial:

```text
1 Workshop -> 1 Group
```

O acesso depende da situação válida da inscrição.

---

# Chat

O chat deverá possuir:

- histórico;
- paginação;
- envio de mensagem;
- estados de envio;
- retry;
- tempo real quando a API disponibilizar WebSocket.

---

# Notificações

O aplicativo terá:

- central de notificações;
- indicador de leitura;
- navegação para conteúdo relacionado;
- push notification.

Push não substitui a central persistida na API.

---

# Avaliações

Após participação elegível, o usuário poderá avaliar:

- workshop;
- conteúdo;
- instrutor;
- organização.

---

# Offline

O aplicativo deve continuar útil com conexão instável.

Funcionalidades cacheáveis:

```text
feed
workshops
histórico
preferências
notificações
mensagens recentes
```

Nem toda escrita deve funcionar offline.

Operações críticas precisam ser classificadas explicitamente.

---

# Estados de interface

Telas que dependem da rede devem tratar:

```text
loading
success
empty
error
refreshing
offline
```

---

# Segurança

Nunca armazenar no aplicativo:

```text
password
JWT secret
database credentials
SMTP credentials
private keys
backend secrets
```

Tokens devem utilizar armazenamento seguro da plataforma.

---

# Git

Branches:

```text
<type>/TASK-<id>-<short-description>
```

Exemplo:

```text
feat/TASK-012-login-screen
```

Commits:

```text
<type>(<scope>): <description> [TASK-XXX]
```

Exemplo:

```text
feat(auth): add login screen [TASK-012]
```

PR:

```text
[TASK-012] feat: add login screen
```

Preferir Squash Merge.

---

# Desenvolvimento

Antes de iniciar uma task:

1. ler `AGENTS.md`;
2. encontrar a task em `TASKS.md`;
3. verificar contrato da API;
4. implementar somente o escopo da task;
5. testar;
6. atualizar a task.

---

# Repositório

Organização:

```text
https://github.com/kaizen-workshop
```

Nome recomendado:

```text
workshop_mobile
```
