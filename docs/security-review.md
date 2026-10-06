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

## Integração real

O cliente de autenticação real foi revisado em 2 de outubro de 2026. Headers de
autorização, senhas, tokens e respostas não são enviados para logs nem exibidos
na interface. O push registra o token do provedor somente no endpoint
autenticado e não o persiste em AsyncStorage.
