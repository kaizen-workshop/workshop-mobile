# Revisão de logs e segredos

Revisão executada em 28 de setembro de 2026 sobre os arquivos versionados e o
código existente. Esta verificação deve ser repetida antes de cada release.

## Resultado

- Não há chamadas `console.log`, `console.debug`, `console.info`,
  `console.warn` ou `console.error` em `app/` e `src/`.
- Não foram encontrados padrões de chave privada, token de provedor ou chave de
  API nos arquivos versionados.
- `.env.example` contém somente valores demonstrativos e nenhuma credencial.
- Access token e refresh token são persistidos exclusivamente pelo
  `TokenStorage`, usando Expo SecureStore.
- Senhas e códigos existem apenas no estado transitório das telas e nos
  argumentos do gateway; não são persistidos nem registrados.
- `demo-access-token` e `demo-refresh-token` são literais fictícios do gateway
  de demonstração, restrito a desenvolvimento/teste, e não concedem acesso a
  qualquer serviço.

## Pendências externas

O cliente real de autenticação continua bloqueado até a disponibilização do
OpenAPI. Quando ele for implementado, a revisão deve confirmar novamente que
headers de autorização, payloads e respostas não aparecem em logs ou mensagens
de erro da interface.
