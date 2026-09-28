# Milestone 1 — Plano de Implementação da Autenticação

> **Para agentes de implementação:** SUB-HABILIDADE OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos usam checkboxes (`- [ ]`) para acompanhamento.

**Objetivo:** Entregar a interface e a base de autenticação da Milestone 1, testável sem contrato OpenAPI e pronta para a integração real.

**Arquitetura:** `AuthGateway` separa a interface de autenticação da origem dos dados. O gateway de demonstração fica limitado a testes/desenvolvimento com ativação explícita; sessão e tokens são gerenciados por um provider e SecureStore. As rotas decidem acesso pelo estado de sessão, não por navegação local.

**Stack:** Expo SDK 57, React Native, Expo Router, React Context, Expo SecureStore, Jest/`jest-expo` e Testing Library.

**Especificação:** `docs/superpowers/specs/2026-09-18-milestone-1-authentication-design.md`

## Restrições globais

- Não criar endpoint, payload ou resposta inexistente no OpenAPI.
- `APP_AUTH_MODE=demo` é válido somente em desenvolvimento/testes; produção e staging devem rejeitá-lo.
- Senha e código de recuperação nunca são persistidos, logados ou incluídos em mensagens de erro.
- Demo aceita login/senha não vazios e o código fixo `123456`; esse comportamento deve ser injetável nos testes.
- Access/refresh token usam somente `TokenStorage`/Expo SecureStore.
- A UI deve cobrir `idle`, `loading` e `error`; loading impede envio duplicado.
- As imagens em `assets/images/examples` orientam a UI e divergências devem ser registradas.

---

## Estrutura de arquivos

| Arquivo                                     | Responsabilidade                                    |
| ------------------------------------------- | --------------------------------------------------- |
| `src/auth/domain/session.ts`                | Estados e tipos de sessão.                          |
| `src/auth/domain/auth-gateway.ts`           | Contrato independente de HTTP.                      |
| `src/auth/data/demo-auth-gateway.ts`        | Fake permitido somente em demo/testes.              |
| `src/auth/data/unavailable-auth-gateway.ts` | Falha segura sem OpenAPI.                           |
| `src/auth/session/auth-provider.tsx`        | Restauração, login, refresh compartilhado e logout. |
| `src/auth/presentation/*`                   | Telas e componentes dos fluxos de autenticação.     |
| `app/(auth)/*`                              | Rotas públicas.                                     |
| `app/_layout.tsx`                           | Guarda de rotas conforme sessão.                    |
| `tests/auth/**/*`                           | Cobertura de gateway, sessão, navegação e telas.    |

### Tarefa 1: Contratos de domínio e gateways (TASK-009)

**Arquivos:**

- Criar: `src/auth/domain/session.ts`, `src/auth/domain/auth-gateway.ts`
- Criar: `src/auth/data/demo-auth-gateway.ts`, `src/auth/data/unavailable-auth-gateway.ts`, `src/auth/data/index.ts`
- Criar: `tests/auth/data/demo-auth-gateway.test.ts`
- Modificar: `src/core/config/environment.ts`, `tests/core/config/environment.test.ts`

**Produz:** `AuthGateway`, `AuthSession`, `AuthState`, `DemoAuthGateway` e `UnavailableAuthGateway`.

- [ ] **Passo 1: Escrever os testes que falham**

```ts
it('authenticates non-empty credentials in demo mode', async () => {
  await expect(
    new DemoAuthGateway().login({ login: 'ana', password: 'senha' }),
  ).resolves.toMatchObject({ mustChangePassword: false });
});

it('rejects an invalid demo recovery code', async () => {
  await expect(
    new DemoAuthGateway().resetPassword({ code: '000000', password: 'nova' }),
  ).rejects.toMatchObject({ code: 'AUTH_INVALID_RECOVERY_CODE' });
});
```

- [ ] **Passo 2: Executar e confirmar falha**

Execute: `npm test -- --runInBand tests/auth/data/demo-auth-gateway.test.ts`

Esperado: falha por ausência dos módulos de autenticação.

- [ ] **Passo 3: Implementar os contratos mínimos**

```ts
export type AuthState =
  | 'UNAUTHENTICATED'
  | 'REQUIRES_PASSWORD_CHANGE'
  | 'REQUIRES_ONBOARDING'
  | 'AUTHENTICATED';
export type AuthSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  requiresOnboarding: boolean;
}>;
export type AuthGateway = Readonly<{
  login(input: { login: string; password: string }): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  requestPasswordRecovery(login: string): Promise<void>;
  resetPassword(input: { code: string; password: string }): Promise<void>;
  logout(refreshToken: string): Promise<void>;
}>;
```

`DemoAuthGateway` não deve persistir senhas. `UnavailableAuthGateway` deve
rejeitar cada operação com `AppError` de mensagem segura e código
`AUTH_INTEGRATION_UNAVAILABLE`. A validação de ambiente deve expor
`authMode: 'demo' | 'api'` e rejeitar demo fora de development/test.

- [ ] **Passo 4: Executar os testes e verificações**

Execute: `npm test -- --runInBand tests/auth/data/demo-auth-gateway.test.ts`, `npm run lint` e `npm run typecheck`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Commit**

```powershell
git add src/auth/domain src/auth/data src/core/config tests/auth/data tests/core/config
git commit -m "feat(auth): add gateway contracts and demo mode [TASK-009]"
```

### Tarefa 2: Provider, tokens, refresh e logout (TASK-010, TASK-012 e TASK-013)

**Arquivos:**

- Criar: `src/auth/session/auth-provider.tsx`, `src/auth/session/index.ts`
- Criar: `tests/auth/session/auth-provider.test.tsx`

**Consome:** `AuthGateway`, `AuthSession` e `TokenStorage`.

**Produz:** `AuthProvider`, `useAuth()` com `state`, `login`, `refresh` e `logout`.

- [ ] **Passo 1: Escrever os testes que falham**

```tsx
it('shares one refresh request across concurrent calls', async () => {
  const gateway = {
    refresh: jest.fn().mockResolvedValue(session),
    login: jest.fn(),
    changePassword: jest.fn(),
    requestPasswordRecovery: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };
  const { result } = renderAuthProvider({ gateway, tokenStorage });
  await Promise.all([result.current.refresh(), result.current.refresh()]);
  expect(gateway.refresh).toHaveBeenCalledTimes(1);
});

it('clears tokens and returns to login when refresh fails', async () => {
  const { result } = renderAuthProvider({
    gateway: failingGateway,
    tokenStorage,
  });
  await expect(result.current.refresh()).rejects.toBeDefined();
  expect(result.current.state).toBe('UNAUTHENTICATED');
  expect(tokenStorage.clear).toHaveBeenCalled();
});
```

- [ ] **Passo 2: Executar e confirmar falha**

Execute: `npm test -- --runInBand tests/auth/session/auth-provider.test.tsx`

Esperado: falha porque provider e hook não existem.

- [ ] **Passo 3: Implementar provider mínimo**

Restaure tokens ao montar; derive o estado somente de `AuthSession`;
persista tokens após login/refresh; mantenha `refreshPromise` privada para
deduplicar renovações; limpe token e estado em logout/falha final. Não inclua
senha no contexto nem em `TokenStorage`.

- [ ] **Passo 4: Executar verificações**

Execute: `npm test -- --runInBand tests/auth/session/auth-provider.test.tsx`, `npm run lint` e `npm run typecheck`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Commit**

```powershell
git add src/auth/session tests/auth/session
git commit -m "feat(auth): manage session refresh and logout [TASK-012]"
```

### Tarefa 3: Rotas protegidas e telas de login/primeiro acesso (TASK-008, TASK-010 e TASK-011)

**Arquivos:**

- Criar: `app/(auth)/login.tsx`, `app/(auth)/first-access.tsx`
- Criar: `src/auth/presentation/login-screen.tsx`, `src/auth/presentation/first-access-screen.tsx`, `src/auth/presentation/auth-styles.ts`
- Modificar: `app/_layout.tsx`, `app/index.tsx`
- Criar: `tests/auth/presentation/login-screen.test.tsx`, `tests/auth/presentation/first-access-screen.test.tsx`

**Consome:** `useAuth()` e referências `assets/images/examples/Login.png` e `Primeiro Acesso.png`.

**Produz:** Login com campos login/senha, alternância de senha, loading/erro e rota para primeiro acesso; guarda por estado de sessão.

- [ ] **Passo 1: Escrever testes que falham**

```tsx
it('disables a duplicate login submit while loading', async () => {
  render(<LoginScreen auth={pendingAuth} />);
  await userEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
});

it('uses an accessible password visibility control', () => {
  render(<LoginScreen auth={idleAuth} />);
  expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeTruthy();
});
```

- [ ] **Passo 2: Executar e confirmar falha**

Execute: `npm test -- --runInBand tests/auth/presentation/login-screen.test.tsx tests/auth/presentation/first-access-screen.test.tsx`

Esperado: falha porque telas não existem.

- [ ] **Passo 3: Implementar telas conforme referências**

Use fundo azul, cartão branco na tela de login, rótulos legíveis, áreas de
toque acessíveis e botão Entrar. O primeiro acesso usa fundo azul, login,
código e botão Enviar conforme a referência. Estado `error` não mostra texto
técnico. Não incluir logo inventado: reutilize somente ativo disponível ou
uma marca textual acessível até que um logo final seja fornecido.

- [ ] **Passo 4: Executar verificações**

Execute: `npm test -- --runInBand tests/auth/presentation`, `npm run lint` e `npm run typecheck`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Commit**

```powershell
git add app src/auth/presentation tests/auth/presentation
git commit -m "feat(auth): add login and first access screens [TASK-008]"
```

### Tarefa 4: Recuperação de senha (TASK-014)

**Arquivos:**

- Criar: `app/(auth)/forgot-password.tsx`, `app/(auth)/reset-password.tsx`
- Criar: `src/auth/presentation/forgot-password-screen.tsx`, `src/auth/presentation/reset-password-screen.tsx`
- Criar: `tests/auth/presentation/password-recovery.test.tsx`

**Consome:** `useAuth()` e `AuthGateway`.

**Produz:** Solicitação e redefinição com código demo `123456`, senha não vazia, loading/erro/retry e retorno ao login após sucesso.

- [ ] **Passo 1: Escrever testes que falham**

```tsx
it('shows a safe error for a code other than 123456', async () => {
  render(<ResetPasswordScreen auth={demoAuth} />);
  await fillResetForm({ code: '000000', password: 'nova' });
  await userEvent.press(
    screen.getByRole('button', { name: 'Redefinir senha' }),
  );
  expect(
    await screen.findByText('Não foi possível redefinir a senha.'),
  ).toBeTruthy();
});
```

- [ ] **Passo 2: Executar e confirmar falha**

Execute: `npm test -- --runInBand tests/auth/presentation/password-recovery.test.tsx`

Esperado: falha porque as telas ainda não existem.

- [ ] **Passo 3: Implementar o fluxo mínimo**

Solicitar recuperação recebe login; redefinir recebe código e nova senha;
ambas bloqueiam repetição em loading. O código e senha existem somente no
estado do componente até o envio e são limpos após sucesso/saída.

- [ ] **Passo 4: Executar verificações**

Execute: `npm test -- --runInBand tests/auth/presentation/password-recovery.test.tsx`, `npm run lint` e `npm run typecheck`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Commit**

```powershell
git add app/(auth) src/auth/presentation tests/auth/presentation
git commit -m "feat(auth): add password recovery flow [TASK-014]"
```

### Tarefa 5: Documentação, backlog e verificação final

**Arquivos:**

- Modificar: `README.md`, `AGENTS.md`, `TASKS.md`

**Consome:** Todas as entregas anteriores.

**Produz:** Documentação do modo demo restrito, TASK-008 a TASK-014 concluídas somente após qualidade verde e referências visuais versionadas.

- [ ] **Passo 1: Adicionar verificação documental que falha**

```powershell
if (-not (Select-String -Path README.md -Pattern 'APP_AUTH_MODE=demo' -Quiet)) { throw 'README não documenta o modo demo' }
```

- [ ] **Passo 2: Executar e confirmar falha**

Execute o bloco PowerShell do passo anterior.

Esperado: falha antes da documentação do modo demo.

- [ ] **Passo 3: Documentar e concluir apenas tasks verificadas**

Registre no README/AGENTS que demo é exclusivo de teste/desenvolvimento,
nunca armazena senha e deve ser removido da configuração de produção. Marque
TASK-008 a TASK-014 como `[x]` somente após o passo seguinte. Adicione as
imagens de referência fornecidas em `assets/images/examples` ao commit.

- [ ] **Passo 4: Executar verificação final**

Execute: `npm ci`, `npm test -- --runInBand`, `npm run lint`, `npm run typecheck`, `npm run format:check` e `npx expo export --platform web`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Commit**

```powershell
git add README.md AGENTS.md TASKS.md assets/images/examples
git commit -m "docs(auth): record milestone one completion [TASK-014]"
```

## Auto-revisão

| Requisito                          | Tarefa |
| ---------------------------------- | ------ |
| Demo restrito e integração futura  | 1      |
| Sessão, rotas, refresh e logout    | 2 e 3  |
| Login e primeiro acesso visual     | 3      |
| Recuperação e redefinição          | 4      |
| Documentação, referências e status | 5      |

O plano não depende de endpoint inventado, não persiste senha e usa as mesmas
interfaces (`AuthGateway`, `AuthSession`, `useAuth`) em todas as tarefas.
