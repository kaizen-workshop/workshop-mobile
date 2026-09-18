# Milestone 1 — Autenticação: especificação

## Escopo

Esta especificação cobre TASK-008 a TASK-014: tela de login, autenticação,
estado de sessão, troca obrigatória de senha, renovação, logout e recuperação
de senha. O contrato OpenAPI da `workshop_api` não está disponível neste
repositório; portanto, a implementação não criará endpoints, payloads ou
respostas de API.

## Estratégia de integração

`AuthGateway` é o único contrato consumido pela camada de apresentação. Ele
declara operações de login, troca/redefinição de senha, refresh e logout, com
tipos de domínio independentes de HTTP. Uma implementação real será adicionada
somente após a disponibilização do OpenAPI.

Até lá, `DemoAuthGateway` é permitido exclusivamente em testes e no ambiente
de desenvolvimento quando `APP_AUTH_MODE=demo` for definido de forma
explícita. A validação de ambiente rejeita esse modo em staging e produção. A
implementação padrão fora de demo retorna um erro seguro de integração
indisponível; ela nunca simula êxito.

No demo, login e senha não vazios criam uma sessão de demonstração. O código
`123456` é o único código aceito para primeiro acesso e recuperação; a nova
senha precisa ser não vazia. A troca obrigatória de senha é configurável por
teste e não depende de credenciais mágicas.

## Estado e persistência

Os estados de sessão são `UNAUTHENTICATED`, `REQUIRES_PASSWORD_CHANGE`,
`REQUIRES_ONBOARDING` e `AUTHENTICATED`. Um provider de sessão restaura os
tokens pelo armazenamento seguro na inicialização e expõe operações de login,
refresh e logout.

Access e refresh token usam exclusivamente `TokenStorage`/Expo SecureStore.
Senha, código de recuperação e dados de pagamento não são persistidos nem
registrados em logs. A renovação concorrente compartilha uma única promessa;
se ela falhar, a sessão é limpa e o estado retorna a `UNAUTHENTICATED`.

## Rotas e interface

As rotas públicas ficam em `app/(auth)/`: login, primeiro acesso, solicitação
de recuperação e redefinição de senha. Rotas internas futuras são renderizadas
somente quando o provider indicar `AUTHENTICATED`; mudança obrigatória de senha
direciona para primeiro acesso e onboarding aguarda a Milestone 2.

A tela de login segue `assets/images/examples/Login.png`: fundo azul, cartão
branco, título Entrar, campos Usuário / Email e Senha, alternância de
visibilidade da senha, link Primeiro acesso, botão Entrar e rodapé. Primeiro
acesso segue `assets/images/examples/Primeiro Acesso.png`: fundo azul, logo,
login, código e envio. As referências orientam layout e hierarquia, sem
substituir os requisitos funcionais.

Cada tela possui estados `idle`, `loading` e `error`; loading bloqueia envios
duplicados, erros mostram mensagem compreensível e retry fica disponível. Não
há parsing de mensagem técnica para decidir fluxo.

## Testes e aceite

Os testes cobrem gateway de demonstração, proibição do demo fora de
desenvolvimento/testes, restauração de sessão, transições de rota, refresh
concorrente, falha de refresh, logout, ausência de senha no armazenamento e
estados visuais de login. Os comandos de qualidade existentes continuam
obrigatórios: lint, TypeScript, Jest, Prettier e exportação web.
