# Auditoria da API para o mobile — 2026-10-02

A análise foi feita diretamente nos controllers, DTOs, services e no
`API-DOCS.md` do `workshop-api`. A base configurada no mobile deve terminar em
`/api/v1`.

## Contratos integrados

- autenticação: login, refresh, logout, troca e recuperação de senha;
- perfil e preferências: leitura/edição de perfil, temas e onboarding;
- feed: posts, destaques, paginação, curtidas e ciclo completo de comentários;
- workshops: catálogo, filtros, detalhes, anexos e cache;
- inscrições e pagamentos: criação/cancelamento idempotentes e pagamento;
- histórico filtrável e calendário do participante;
- grupos e chat: REST por cursor, STOMP, reconexão, retry idempotente e moderação;
- notificações: central, leitura, deep link e registro de dispositivo;
- avaliações do participante.

## Divergências e bloqueios reais

1. A troca de senha incrementa `tokenVersion` e revoga refresh tokens, mas
   `POST /auth/change-password` responde `204`. Como nenhuma nova sessão é
   emitida, o mobile limpa os tokens e solicita novo login.
2. Reembolso possui somente o estado final `REFUNDED`; os estados solicitado,
   processado e recusado não existem no contrato.
3. O provedor Expo existe e pode ser ativado por configuração, mas a entrega
   remota permanece desativada por padrão. Também faltam `extra.eas.projectId`
   e identificadores oficiais no app.
4. `updatedAfter`, `updatedAt` e ETag já existem na API, porém a reconciliação
   incremental completa ainda está pendente no mobile.

Durante esta revisão, os contratos adicionados pela remediação da API foram
integrados: credenciais inválidas retornam `401`, comentários podem ser editados
e excluídos, histórico aceita cinco filtros, grupos informam permissões e
comentários, mensagens e avaliações aceitam UUID idempotente. O cliente também
renova automaticamente o access token após `401`, consolida chamadas concorrentes
e retorna ao login quando o refresh token é rejeitado.

O cancelamento de inscrição exige `Idempotency-Key`. A versão anterior do
mobile não enviava esse cabeçalho; o gateway e a tela agora mantêm a mesma UUID
durante todas as tentativas da operação.
