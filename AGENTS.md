# AGENTS.md

## Referências visuais

As imagens de referência de telas ficam em `assets/images/examples`.
Antes de implementar ou alterar uma tela, inspecione as imagens aplicáveis e
use a hierarquia visual, o layout e os estados mostrados como referência de
UI. Elas não substituem `TASKS.md`, requisitos funcionais ou o contrato
OpenAPI; divergências intencionais devem ser registradas.

> Decisão de stack: Expo SDK 57, React Native 0.86, React 19 e TypeScript
> estrito. Expo Router navega; `fetch` encapsulado atende HTTP; AsyncStorage
> atende apenas cache não sensível; Expo SecureStore armazena somente
> access/refresh token; WebSocket nativo e Expo Notifications serão usados
> nas tasks correspondentes. Testes usam Jest/`jest-expo`, lint usa Expo
> ESLint e a formatação usa Prettier. Sem o OpenAPI no repositório, não criar
> endpoints, payloads nem respostas de API.

## Projeto

Nome: `workshop_mobile`

Aplicação mobile do sistema de workshops da ARWEG.

Este projeto será desenvolvido com forte uso de agentes de IA e vibe coding.  
Por isso, este arquivo define regras obrigatórias para qualquer agente que altere o código.

O objetivo é manter o aplicativo previsível, simples de evoluir, testável e coerente com a API e com os requisitos do produto.

---

# 1. Fonte de verdade

Antes de implementar qualquer funcionalidade, considerar esta ordem:

1. `TASKS.md`
2. Documentação funcional do projeto
3. Contrato OpenAPI da `workshop_api`
4. Regras descritas no `README.md`
5. Código e testes existentes
6. Este `AGENTS.md`

Não inventar endpoints.

Não inventar campos que não existam no contrato da API.

Não adaptar silenciosamente o comportamento mobile para contornar erros da API.

Quando existir divergência entre mobile e API, registrar o conflito.

---

# 2. Objetivo arquitetural

O aplicativo deve ser modular e organizado por feature.

Estrutura conceitual recomendada:

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

Dentro de cada feature, separar responsabilidades conforme a stack escolhida.

Evitar arquitetura global baseada apenas em:

```text
screens/
services/
models/
utils/
```

quando isso misturar domínios diferentes.

---

# 4. Regra de simplicidade

Sempre escolher a solução mais simples que cumpra corretamente o requisito.

Evitar:

- abstrações prematuras;
- wrappers sem necessidade;
- componentes genéricos demais;
- sistema de temas complexo antes de existir necessidade;
- estado global para tudo;
- duplicação de modelos;
- criação de camada "repository" apenas para cumprir moda arquitetural;
- lógica de negócio espalhada em componentes visuais.

O aplicativo deve ser fácil de alterar por humanos e agentes.

---

# 5. Regras para agentes de IA

Um agente não deve:

- inventar endpoint;
- inventar resposta da API;
- criar mock permanente no lugar de integração real;
- alterar fluxo de autenticação sem regra documentada;
- criar dependência nova sem necessidade;
- refatorar o projeto inteiro durante uma task pequena;
- remover tratamento de erro para "fazer funcionar";
- guardar token de forma insegura;
- persistir senha;
- colocar segredo dentro do aplicativo;
- assumir conectividade constante;
- ignorar estados de loading, erro e vazio;
- marcar task como concluída sem verificar o fluxo.

Se precisar fazer uma suposição:

1. procurar a documentação;
2. verificar o contrato da API;
3. verificar código existente;
4. usar a interpretação mais conservadora;
5. registrar a suposição.

---

# 6. API

Backend principal:

```text
workshop_api
```

Base esperada:

```text
/api/v1
```

O aplicativo não deve duplicar regras que pertencem ao backend.

Exemplos:

- autorização;
- disponibilidade de vagas;
- elegibilidade para inscrição;
- cálculo final de pagamento;
- permissão para avaliação;
- regras de transição de workshop.

O mobile pode antecipar validações para UX, mas a API continua sendo a autoridade.

---

# 7. Autenticação

Login aceita:

```text
username
ou
e-mail
```

Fluxo:

```text
login
→ recebe sessão
→ verifica mustChangePassword
→ se necessário, força troca de senha
→ acesso ao aplicativo
```

O mobile deve tratar:

- credencial inválida;
- usuário bloqueado;
- sessão expirada;
- refresh token;
- troca obrigatória de senha;
- logout;
- perda de conectividade.

Nunca armazenar senha.

Tokens devem ser armazenados utilizando mecanismo seguro disponível na plataforma.

---

# 8. Navegação por autenticação

Rotas devem respeitar o estado da sessão.

Estados conceituais:

```text
UNAUTHENTICATED
REQUIRES_PASSWORD_CHANGE
REQUIRES_ONBOARDING
AUTHENTICATED
```

Não permitir acessar telas internas apenas manipulando navegação local.

A API continua validando autorização.

---

# 9. Primeiro acesso e preferências

No primeiro acesso, o usuário deve selecionar seus interesses.

Fluxo:

```text
login
→ troca de senha quando necessária
→ preferências
→ feed
```

O usuário deve poder alterar suas preferências posteriormente.

A tela deve funcionar corretamente com:

- loading;
- lista vazia;
- erro;
- retry;
- dados previamente sincronizados quando aplicável.

---

# 10. Feed

O feed deve suportar:

- workshops recomendados;
- posts;
- destaques;
- inscrições abertas;
- conteúdos relacionados aos interesses.

O mobile não deve tentar recalcular o ranking principal se a API já fornecer a ordem.

Preservar a ordem recebida.

Implementar paginação incremental.

Não carregar o feed inteiro de uma vez.

---

# 11. Workshops

A listagem deve suportar filtros definidos pelo produto.

A tela de detalhes deve contemplar:

- título;
- imagem;
- descrição;
- tema;
- categoria;
- datas;
- horários;
- local;
- modalidade;
- valor;
- inscrições;
- vagas;
- responsáveis;
- anexos;
- informações adicionais.

Não assumir que todos os campos sempre estarão preenchidos.

A UI deve lidar com campos opcionais.

---

# 12. Inscrições

A confirmação da inscrição deve sempre depender da resposta da API.

Fluxo conceitual:

```text
usuário solicita inscrição
→ UI bloqueia repetição acidental
→ request é enviada
→ API valida
→ resultado é refletido localmente
```

Não atualizar o estado local como confirmado antes da resposta final quando isso puder criar inconsistência.

Para operações idempotentes, reutilizar corretamente a chave durante retry da mesma operação.

---

# 13. Pagamentos

Não armazenar dados sensíveis de pagamento sem necessidade.

Não implementar lógica financeira que pertença ao backend.

O aplicativo deve exibir estados fornecidos pela API, como:

```text
PENDING
PAID
DECLINED
CANCELLED
REFUNDED
EXEMPT
```

Falhas de rede durante pagamento não devem induzir o usuário a repetir uma cobrança de forma insegura.

---

# 14. Cancelamento e reembolso

O fluxo deve mostrar claramente:

- situação atual;
- possibilidade de cancelamento;
- consequência;
- situação de reembolso.

Não assumir que todo cancelamento gera reembolso.

Exibir o resultado retornado pela API.

---

# 15. Calendário

O calendário deve permitir visualizar workshops conforme filtros definidos pela API.

Não duplicar uma segunda base de workshops apenas para o calendário.

Usar a mesma fonte de dados sincronizada quando apropriado.

---

# 16. Grupos

Regra inicial:

```text
1 Workshop -> 1 Group
```

O usuário só pode acessar grupos autorizados pela API.

Não liberar tela de grupo apenas porque o workshop existe localmente.

---

# 17. Chat

O chat deve suportar:

- histórico;
- paginação;
- envio;
- estados de envio;
- erro;
- retry controlado;
- mensagens em tempo real quando WebSocket estiver disponível.

Estados úteis:

```text
sending
sent
failed
```

Não duplicar mensagens ao reconectar.

O histórico persistido pela API é a fonte de verdade.

---

# 18. Notificações

O aplicativo deve suportar:

- central de notificações;
- marcar como lida;
- navegação para conteúdo relacionado;
- push notification quando habilitado.

Nunca assumir que push substitui sincronização.

Uma notificação pode ser perdida pelo dispositivo.  
O estado persistido continua sendo a API.

---

# 19. Offline-first

A aplicação mobile deve ser pensada para rede instável.

Isso não significa permitir todas as operações offline.

Classificar operações em:

```text
READ-CACHEABLE
WRITE-RETRYABLE
WRITE-ONLINE-ONLY
```

Exemplo:

```text
feed -> READ-CACHEABLE
detalhes -> READ-CACHEABLE
comentário -> WRITE-RETRYABLE
inscrição -> WRITE-RETRYABLE com idempotência
pagamento -> WRITE-ONLINE-ONLY ou fluxo controlado
```

Nunca criar fila offline genérica para todas as chamadas sem avaliar risco.

---

# 20. Cache local

Cache deve possuir estratégia clara.

Dados cacheáveis podem incluir:

- feed;
- workshops;
- preferências;
- histórico;
- notificações;
- mensagens recentes.

Todo dado persistido deve possuir forma de atualização.

Evitar cache eterno.

Quando aplicável, utilizar:

```text
updatedAt
ETag
updatedAfter
```

fornecidos pela API.

---

# 21. Estado de tela

Toda tela que consulta rede deve considerar:

```text
initial
loading
success
empty
error
refreshing
```

Não usar apenas:

```text
loading = true/false
```

quando isso causar estados impossíveis ou UI inconsistente.

---

# 22. Erros

Mensagens técnicas da API não devem ser despejadas diretamente na interface.

Mapear erros conhecidos para mensagens compreensíveis.

Preservar códigos de erro quando necessários para comportamento.

Exemplos:

```text
REGISTRATION_ALREADY_EXISTS
WORKSHOP_FULL
REGISTRATION_CLOSED
AUTH_INVALID_CREDENTIALS
TOKEN_EXPIRED
```

Não fazer parsing de texto humano para decidir lógica.

---

# 23. Modelos

Separar claramente:

- payload da API;
- modelo de domínio local quando necessário;
- estado de UI.

Não reutilizar uma classe gigantesca para todas essas funções se isso tornar o código frágil.

Não duplicar modelos sem necessidade.

---

# 24. Componentes visuais

Criar componentes reutilizáveis quando houver repetição real.

Exemplos:

```text
WorkshopCard
PostCard
EmptyState
ErrorState
LoadingState
Avatar
Tag
```

Não criar um "UniversalCardComponent" com 37 parâmetros.

---

# 25. Design system

Quando a identidade visual for definida, centralizar:

- cores;
- tipografia;
- espaçamento;
- bordas;
- ícones;
- componentes básicos.

Não espalhar valores visuais arbitrários por dezenas de arquivos.

## Referência visual oficial da WEG

O aplicativo deve seguir o WEG Design System publicado em:

```text
https://design-system.weg.net/?path=/docs/about-introduction--documentation
```

Regras obrigatórias:

- usar os tokens semânticos do WEG Design System como fonte para cores;
- usar Roboto como tipografia principal;
- respeitar a escala oficial de espaçamento, radius, tipografia e estados;
- adaptar os padrões visuais para componentes nativos do React Native;
- não instalar ou reutilizar diretamente componentes React destinados à web;
- manter acessibilidade e tamanho mínimo de toque durante a adaptação mobile;
- centralizar a adaptação em `src/shared/theme` e nos componentes básicos;
- não copiar valores da paleta base quando existir token semântico equivalente;
- consultar novamente a documentação oficial antes de criar um novo padrão
  visual que ainda não esteja representado no aplicativo.

As imagens em `assets/images/examples` continuam sendo referência de composição
e hierarquia das telas. Em caso de diferença visual, o WEG Design System define
os fundamentos e os requisitos funcionais continuam tendo prioridade sobre a
aparência.

---

# 26. Acessibilidade

Considerar:

- labels;
- contraste;
- tamanho de toque;
- leitor de tela;
- fonte escalável;
- estados não dependentes apenas de cor.

Acessibilidade não deve ser tratada apenas no fim do projeto.

---

# 27. Performance

Evitar:

- listas sem virtualização;
- imagens em resolução desnecessária;
- renderizações completas por pequenas mudanças;
- requests duplicados;
- chamadas de rede dentro de loops;
- cache sem limite;
- observadores/subscriptions não liberados.

Medir antes de introduzir otimizações complexas.

---

# 28. Imagens

Utilizar cache de imagem quando apropriado.

Exibir placeholders e estados de erro.

Não carregar Base64 gigantes na memória quando a API fornecer URL ou referência de arquivo.

---

# 29. Segurança mobile

Nunca armazenar:

- senha;
- segredo de backend;
- JWT secret;
- credencial SMTP;
- chave privada;
- token administrativo compartilhado.

Segredos embutidos no aplicativo devem ser considerados públicos.

Usar armazenamento seguro do sistema para tokens quando disponível.

---

# 30. Logs

Nunca logar:

- senha;
- access token;
- refresh token;
- dados financeiros sensíveis;
- payload contendo segredo.

Logs de desenvolvimento devem ser removidos ou controlados antes da release.

---

# 31. Testes

Cobrir principalmente:

- regras de estado;
- fluxos de autenticação;
- parsing/mapeamento da API;
- offline/retry;
- paginação;
- inscrição;
- chat;
- permissões visuais;
- navegação crítica.

Quando a stack for escolhida, definir:

- framework unitário;
- testes de componente/widget;
- integração;
- end-to-end.

---

# 32. Bugs

Sempre que possível:

```text
reproduzir
→ criar teste
→ corrigir
→ validar
```

Não corrigir um bug alterando comportamento relacionado sem verificar regressão.

---

# 33. Git

Branches:

```text
<type>/TASK-<id>-<short-description>
```

Exemplos:

```text
feat/TASK-012-login-screen
feat/TASK-031-workshop-details
fix/TASK-046-feed-pagination
```

Tipos:

```text
feat
fix
refactor
test
docs
chore
perf
hotfix
```

Commits:

```text
<type>(<scope>): <description> [TASK-XXX]
```

Exemplos:

```text
feat(auth): add login screen [TASK-012]
feat(feed): add workshop feed [TASK-042]
fix(chat): prevent duplicate messages [TASK-067]
```

Pull Requests:

```text
[TASK-XXX] <type>: <description>
```

Preferir Squash Merge.

Push direto na `main` não é permitido.

---

# 34. Definition of Done

Uma task só está concluída quando:

- implementação finalizada;
- build passa;
- lint passa;
- testes aplicáveis passam;
- loading tratado;
- erro tratado;
- estado vazio tratado quando aplicável;
- comportamento offline/retry avaliado;
- contrato da API respeitado;
- acessibilidade básica revisada;
- nenhuma credencial adicionada;
- nenhuma lógica crítica depende apenas da UI;
- task atualizada em `TASKS.md`.

---

# 35. Princípio final

Quando existirem duas soluções válidas, escolher a que:

1. é mais simples;
2. depende menos de estado global;
3. possui comportamento previsível com rede ruim;
4. é mais fácil de testar;
5. respeita melhor o contrato da API;
6. será mais fácil de alterar por outro desenvolvedor ou agente.
