# Milestone 0 — Plano de Implementação da Fundação

> **Para agentes de implementação:** SUB-HABILIDADE OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos usam checkboxes (`- [ ]`) para acompanhamento.

**Objetivo:** Entregar a fundação Expo testável do `workshop_mobile`, cobrindo TASK-001 a TASK-007 sem inventar integrações da API.

**Arquitetura:** O Expo Router compõe apenas as rotas; `src/core` concentra configuração de ambiente, HTTP, erros e tokens seguros. Cada domínio começa com uma fronteira mínima em `src/<feature>/index.ts`, sem modelos, endpoints, mocks ou telas antes de sua task. O cliente HTTP usa `fetch` e devolve respostas JSON ou `AppError` normalizado, mantendo regras de negócio em futuras features.

**Stack:** Expo SDK 57, React Native 0.86, React 19, TypeScript estrito, Expo Router, `fetch`, Expo SecureStore, AsyncStorage, Jest/`jest-expo`, ESLint e Prettier.

**Especificação:** `docs/superpowers/specs/2026-09-18-milestone-0-foundation-design.md`

## Restrições globais

- Não criar endpoint, payload ou resposta que não exista no contrato OpenAPI da `workshop_api`.
- `EXPO_PUBLIC_API_URL` é configuração pública; nenhum segredo, senha ou token é armazenado no código ou em AsyncStorage.
- Os únicos valores aceitos para `APP_VARIANT` são `development`, `staging` e `production`.
- O armazenamento seguro pode manipular somente `accessToken` e `refreshToken`.
- O HTTP não implementa autenticação, refresh, retry automático ou fila offline neste milestone.
- Toda documentação criada deve estar em pt-BR.
- Cada tarefa termina com testes aplicáveis e um commit seguindo `<type>(<scope>): <description> [TASK-XXX]`.

---

## Estrutura de arquivos

| Arquivo                                           | Responsabilidade                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `app/_layout.tsx`                                 | Compor o `Stack` raiz do Expo Router.                                 |
| `app/index.tsx`                                   | Tela técnica mínima que confirma que a fundação iniciou.              |
| `src/core/config/environment.ts`                  | Validar e expor o ambiente público.                                   |
| `src/core/errors/app-error.ts`                    | Representar falhas normalizadas, sem texto técnico para UI.           |
| `src/core/http/http-client.ts`                    | Construir chamadas JSON com timeout e converter falhas em `AppError`. |
| `src/core/secure-storage/token-storage.ts`        | Persistir e limpar somente tokens em SecureStore.                     |
| `src/<feature>/index.ts`                          | Fronteira vazia e explícita de cada feature inicial.                  |
| `tests/core/config/environment.test.ts`           | Validar variáveis de ambiente.                                        |
| `tests/core/errors/app-error.test.ts`             | Validar categorização de falhas.                                      |
| `tests/core/http/http-client.test.ts`             | Validar URL, headers, serialização e timeout do HTTP.                 |
| `tests/core/secure-storage/token-storage.test.ts` | Validar chaves e chamadas ao SecureStore.                             |
| `.env.example`                                    | Documentar as variáveis públicas, com valores seguros de exemplo.     |
| `jest.config.js` e `jest.setup.ts`                | Configurar Jest Expo e mocks de módulos nativos.                      |
| `.eslintrc.cjs`, `.prettierrc.json`               | Tornar lint e formatação explícitos.                                  |

### Tarefa 1: Ferramentas, estrutura e inicialização (TASK-001, TASK-002 e TASK-003)

**Arquivos:**

- Modificar: `package.json`
- Modificar: `app.json`
- Criar: `app/_layout.tsx`
- Criar: `app/index.tsx`
- Criar: `src/core/index.ts`
- Criar: `src/shared/index.ts`
- Criar: `src/{auth,onboarding,profile,preferences,feed,workshop,registration,payment,calendar,group,chat,notification,evaluation,settings}/index.ts`
- Criar: `jest.config.js`
- Criar: `jest.setup.ts`
- Criar: `.eslintrc.cjs`
- Criar: `.prettierrc.json`
- Criar: `tests/app/startup.test.tsx`

**Consome:** O projeto Expo existente e o alias `@/*` já declarado em `tsconfig.json`.

**Produz:** Uma aplicação inicializável e os comandos `lint`, `format:check`, `test`, `test:watch` e `typecheck`; um módulo raiz disponível em `@/core` e fronteiras para todas as features do Milestone 0.

- [ ] **Passo 1: Escrever o teste de inicialização que falha**

```tsx
import { render, screen } from '@testing-library/react-native';
import Index from '../../app/index';

it('renders the technical foundation screen', () => {
  render(<Index />);
  expect(screen.getByText('Fundação pronta')).toBeOnTheScreen();
});
```

- [ ] **Passo 2: Executar o teste para confirmar que falha**

Execute: `npm test -- --runInBand tests/app/startup.test.tsx`

Esperado: falha porque `app/index.tsx` e a configuração de teste ainda não existem.

- [ ] **Passo 3: Instalar somente as dependências de fundação e configurar os scripts**

```powershell
npx expo install @react-native-async-storage/async-storage expo-secure-store expo-notifications
npm install -D jest-expo @types/jest @testing-library/react-native eslint eslint-config-expo prettier eslint-config-prettier
```

Adicione ao `package.json` os scripts abaixo, preservando os scripts Expo existentes:

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

Configure o preset `jest-expo`, carregue `jest.setup.ts`, habilite o alias `@/` e configure o ambiente React Native. Em `jest.setup.ts`, importe `@testing-library/jest-native/extend-expect`.

- [ ] **Passo 4: Criar a árvore mínima e a tela técnica acessível**

```tsx
// app/index.tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View accessibilityRole="summary">
      <Text>Fundação pronta</Text>
    </View>
  );
}
```

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Crie todos os `index.ts` de feature com somente `export {};`, e crie
`src/core/index.ts` e `src/shared/index.ts` com `export {};`. Não inclua
telas, estado global, endpoints nem mocks. Adicione `expo-secure-store` e
`expo-notifications` à lista de plugins de `app.json`.

- [ ] **Passo 5: Executar o teste e os controles estáticos**

Execute: `npm test -- --runInBand tests/app/startup.test.tsx`, `npm run lint`, `npm run typecheck` e `npm run format:check`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 6: Criar o commit da tarefa**

```powershell
git add package.json package-lock.json app.json app src jest.config.js jest.setup.ts .eslintrc.cjs .prettierrc.json tests/app/startup.test.tsx
git commit -m "feat(foundation): initialize Expo application structure [TASK-001]"
```

### Tarefa 2: Ambientes configuráveis e validados (TASK-004)

**Arquivos:**

- Criar: `.env.example`
- Criar: `src/core/config/environment.ts`
- Criar: `src/core/config/index.ts`
- Criar: `tests/core/config/environment.test.ts`
- Modificar: `.gitignore`
- Modificar: `README.md`

**Consome:** `process.env` do Expo e o alias `@/` configurado na Tarefa 1.

**Produz:** `getEnvironment(input?: Record<string, string | undefined>): EnvironmentConfig`, onde `EnvironmentConfig` contém `variant: AppVariant` e `apiUrl: string` sem barra final.

- [ ] **Passo 1: Escrever os testes de ambiente que falham**

```ts
import { getEnvironment } from '@/core/config/environment';

it('returns a normalized public API URL for an accepted variant', () => {
  expect(
    getEnvironment({
      APP_VARIANT: 'staging',
      EXPO_PUBLIC_API_URL: 'https://staging.example.test/api/v1/',
    }),
  ).toEqual({
    variant: 'staging',
    apiUrl: 'https://staging.example.test/api/v1',
  });
});

it.each(['test', 'prod', ''])(
  'rejects an unsupported APP_VARIANT %s',
  (variant) => {
    expect(() =>
      getEnvironment({
        APP_VARIANT: variant,
        EXPO_PUBLIC_API_URL: 'https://api.example.test/api/v1',
      }),
    ).toThrow('APP_VARIANT inválido');
  },
);

it('rejects a missing or non-HTTP public API URL', () => {
  expect(() => getEnvironment({ APP_VARIANT: 'development' })).toThrow(
    'EXPO_PUBLIC_API_URL inválida',
  );
  expect(() =>
    getEnvironment({
      APP_VARIANT: 'development',
      EXPO_PUBLIC_API_URL: 'ftp://api.example.test',
    }),
  ).toThrow('EXPO_PUBLIC_API_URL inválida');
});
```

- [ ] **Passo 2: Executar os testes para confirmar que falham**

Execute: `npm test -- --runInBand tests/core/config/environment.test.ts`

Esperado: falha porque `getEnvironment` ainda não existe.

- [ ] **Passo 3: Implementar a validação mínima do ambiente**

```ts
export const appVariants = ['development', 'staging', 'production'] as const;
export type AppVariant = (typeof appVariants)[number];

export type EnvironmentConfig = Readonly<{
  variant: AppVariant;
  apiUrl: string;
}>;

export function getEnvironment(
  input: Record<string, string | undefined> = process.env,
): EnvironmentConfig {
  const variant = input.APP_VARIANT;
  if (!appVariants.includes(variant as AppVariant)) {
    throw new Error(
      'APP_VARIANT inválido. Use development, staging ou production.',
    );
  }
  const rawApiUrl = input.EXPO_PUBLIC_API_URL;
  try {
    const url = new URL(rawApiUrl ?? '');
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new Error();
    return {
      variant: variant as AppVariant,
      apiUrl: url.toString().replace(/\/$/, ''),
    };
  } catch {
    throw new Error(
      'EXPO_PUBLIC_API_URL inválida. Informe uma URL HTTP(S) absoluta.',
    );
  }
}
```

Crie `.env.example` com `APP_VARIANT=development` e
`EXPO_PUBLIC_API_URL=https://api.example.test/api/v1`. Garanta que `.env`,
`.env.development`, `.env.staging` e `.env.production` estão ignorados, sem
ignorar o exemplo. Documente no README a origem externa da URL e que variáveis
`EXPO_PUBLIC_*` não podem ser segredos.

- [ ] **Passo 4: Executar os testes e controles estáticos**

Execute: `npm test -- --runInBand tests/core/config/environment.test.ts`, `npm run lint`, `npm run typecheck` e `npm run format:check`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Criar o commit da tarefa**

```powershell
git add .env.example .gitignore README.md src/core/config tests/core/config
git commit -m "feat(config): add validated public environments [TASK-004]"
```

### Tarefa 3: Erros normalizados e cliente HTTP (TASK-005 e TASK-007)

**Arquivos:**

- Criar: `src/core/errors/app-error.ts`
- Criar: `src/core/errors/index.ts`
- Criar: `src/core/http/http-client.ts`
- Criar: `src/core/http/index.ts`
- Criar: `tests/core/errors/app-error.test.ts`
- Criar: `tests/core/http/http-client.test.ts`

**Consome:** `EnvironmentConfig` de `@/core/config/environment`.

**Produz:** `AppError`, `toAppError(error: unknown): AppError`, `HttpClient` e
`createHttpClient(config: EnvironmentConfig, fetchImpl?: typeof fetch): HttpClient`.

- [ ] **Passo 1: Escrever testes de erros e HTTP que falham**

```ts
import { AppError, toAppError } from '@/core/errors/app-error';

it.each([
  [400, 'bad_request'],
  [401, 'unauthorized'],
  [403, 'forbidden'],
  [404, 'not_found'],
  [409, 'conflict'],
  [500, 'server'],
])('maps HTTP status %i to %s', (status, category) => {
  expect(
    toAppError(new AppError({ category: 'unknown', status })),
  ).toMatchObject({ category, status });
});

it('keeps a machine-readable business code without using API text as UI copy', () => {
  const error = toAppError(
    new AppError({
      category: 'bad_request',
      status: 400,
      code: 'WORKSHOP_FULL',
      technicalMessage: 'Full',
    }),
  );
  expect(error.code).toBe('WORKSHOP_FULL');
  expect(error.userMessage).not.toContain('Full');
});
```

```ts
import { createHttpClient } from '@/core/http/http-client';

it('joins URL, sends JSON headers, and serializes a body', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), { status: 201 }),
    );
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );
  await expect(
    client.request<{ id: string }>({
      path: '/sessions',
      method: 'POST',
      body: { login: 'user' },
    }),
  ).resolves.toEqual({ id: '1' });
  expect(fetchImpl).toHaveBeenCalledWith(
    'https://api.example.test/api/v1/sessions',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: '{"login":"user"}',
    }),
  );
});

it('returns a timeout category when its abort signal fires', async () => {
  jest.useFakeTimers();
  const fetchImpl = jest.fn(
    (_url, init) =>
      new Promise((_resolve, reject) =>
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        ),
      ),
  );
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
    25,
  );
  const request = client.request({ path: '/health' });
  await jest.advanceTimersByTimeAsync(25);
  await expect(request).rejects.toMatchObject({ category: 'timeout' });
});
```

- [ ] **Passo 2: Executar os testes para confirmar que falham**

Execute: `npm test -- --runInBand tests/core/errors/app-error.test.ts tests/core/http/http-client.test.ts`

Esperado: falha porque os módulos de erro e HTTP ainda não existem.

- [ ] **Passo 3: Implementar contratos pequenos e explícitos**

```ts
export type ErrorCategory =
  | 'network'
  | 'timeout'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'unknown';

export class AppError extends Error {
  readonly category: ErrorCategory;
  readonly status?: number;
  readonly code?: string;
  readonly technicalMessage?: string;
  readonly userMessage: string;

  constructor(input: {
    category: ErrorCategory;
    status?: number;
    code?: string;
    technicalMessage?: string;
  }) {
    super();
    Object.assign(this, input, {
      userMessage: 'Não foi possível concluir esta ação. Tente novamente.',
    });
  }
}
```

```ts
export type HttpRequest = Readonly<{
  path: string;
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
}>;
export type HttpClient = Readonly<{
  request<T>(request: HttpRequest): Promise<T>;
}>;

export function createHttpClient(
  config: EnvironmentConfig,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15_000,
): HttpClient {
  /* implementar somente os comportamentos dos testes */
}
```

O cliente deve aceitar somente `path` relativo, rejeitar URL absoluta, juntar a
base sem barras duplicadas, usar `Accept: application/json`, acrescentar
`Content-Type: application/json` apenas quando houver corpo, chamar
`JSON.stringify`, chamar `response.json()` em respostas de sucesso e
transformar respostas não-2xx, abort e TypeError de rede com `toAppError`.
Extraia `code` somente de um campo JSON explícito `code` quando o corpo for um
objeto; nunca derive comportamento da mensagem humana recebida.

- [ ] **Passo 4: Executar testes e controles estáticos**

Execute: `npm test -- --runInBand tests/core/errors/app-error.test.ts tests/core/http/http-client.test.ts`, `npm run lint`, `npm run typecheck` e `npm run format:check`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Criar o commit da tarefa**

```powershell
git add src/core/errors src/core/http tests/core/errors tests/core/http
git commit -m "feat(core): add HTTP client and normalized errors [TASK-005]"
```

### Tarefa 4: Armazenamento seguro de tokens (TASK-006)

**Arquivos:**

- Criar: `src/core/secure-storage/token-storage.ts`
- Criar: `src/core/secure-storage/index.ts`
- Criar: `tests/core/secure-storage/token-storage.test.ts`
- Modificar: `jest.setup.ts`

**Consome:** `expo-secure-store`, instalado na Tarefa 1.

**Produz:** `createTokenStorage(store?: SecureStoreAdapter): TokenStorage`, com
`read(): Promise<SessionTokens | null>`, `save(tokens: SessionTokens): Promise<void>` e `clear(): Promise<void>`.

- [ ] **Passo 1: Escrever o teste de armazenamento seguro que falha**

```ts
import { createTokenStorage } from '@/core/secure-storage/token-storage';

const adapter = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

it('persists only access and refresh tokens in secure storage', async () => {
  const storage = createTokenStorage(adapter);
  await storage.save({ accessToken: 'access', refreshToken: 'refresh' });
  expect(adapter.setItemAsync).toHaveBeenNthCalledWith(
    1,
    'workshop.accessToken',
    'access',
  );
  expect(adapter.setItemAsync).toHaveBeenNthCalledWith(
    2,
    'workshop.refreshToken',
    'refresh',
  );
});

it('returns null if either token is unavailable and clears both keys', async () => {
  adapter.getItemAsync
    .mockResolvedValueOnce('access')
    .mockResolvedValueOnce(null);
  const storage = createTokenStorage(adapter);
  await expect(storage.read()).resolves.toBeNull();
  await storage.clear();
  expect(adapter.deleteItemAsync).toHaveBeenCalledWith('workshop.accessToken');
  expect(adapter.deleteItemAsync).toHaveBeenCalledWith('workshop.refreshToken');
});
```

- [ ] **Passo 2: Executar o teste para confirmar que falha**

Execute: `npm test -- --runInBand tests/core/secure-storage/token-storage.test.ts`

Esperado: falha porque `createTokenStorage` ainda não existe.

- [ ] **Passo 3: Implementar o adaptador limitado a tokens**

```ts
export type SessionTokens = Readonly<{
  accessToken: string;
  refreshToken: string;
}>;
export type SecureStoreAdapter = Pick<
  typeof SecureStore,
  'getItemAsync' | 'setItemAsync' | 'deleteItemAsync'
>;
export type TokenStorage = Readonly<{
  read(): Promise<SessionTokens | null>;
  save(tokens: SessionTokens): Promise<void>;
  clear(): Promise<void>;
}>;
```

Use as chaves constantes `workshop.accessToken` e `workshop.refreshToken`.
Não exponha operação para senha, não use AsyncStorage, e não registre valores
em logs. O mock em `jest.setup.ts` deve conter apenas os três métodos usados.

- [ ] **Passo 4: Executar o teste e os controles estáticos**

Execute: `npm test -- --runInBand tests/core/secure-storage/token-storage.test.ts`, `npm run lint`, `npm run typecheck` e `npm run format:check`.

Esperado: todos finalizam com código 0.

- [ ] **Passo 5: Criar o commit da tarefa**

```powershell
git add src/core/secure-storage tests/core/secure-storage jest.setup.ts
git commit -m "feat(auth): add secure token storage [TASK-006]"
```

### Tarefa 5: Documentação, atualização do backlog e verificação final (TASK-001 a TASK-007)

**Arquivos:**

- Modificar: `README.md`
- Modificar: `AGENTS.md`
- Modificar: `TASKS.md`

**Consome:** Todos os módulos e comandos verificados nas tarefas anteriores.

**Produz:** A stack formalmente registrada, decisões de foundation justificadas, a ausência do OpenAPI registrada como suposição, e TASK-001 a TASK-007 marcadas como concluídas somente se todas as verificações forem verdes.

- [ ] **Passo 1: Escrever uma verificação documental que falha**

```powershell
@('README.md', 'AGENTS.md') | ForEach-Object {
  if (-not (Select-String -Path $_ -Pattern 'Expo SDK 57' -Quiet)) { throw "$$_ precisa registrar a stack" }
}
```

- [ ] **Passo 2: Executar a verificação para confirmar que falha**

Execute o bloco PowerShell acima.

Esperado: falha porque a stack ainda é apresentada como indefinida.

- [ ] **Passo 3: Atualizar documentação e tasks após os comandos verdes**

No README e AGENTS, registre as decisões exatas da stack, a responsabilidade
de cada dependência, os comandos de qualidade, a configuração por ambiente e
a regra de que OpenAPI ausente impede a criação de endpoints/payloads. Em
`TASKS.md`, substitua apenas os estados de TASK-001 a TASK-007 por `[x]`, após
as verificações desta tarefa passarem. Não altere milestones posteriores.

- [ ] **Passo 4: Executar a verificação documental novamente**

Execute o bloco PowerShell do Passo 1.

Esperado: finaliza com código 0.

- [ ] **Passo 5: Executar a verificação final da fundação**

Execute: `npm ci`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test -- --runInBand` e `npx expo export --platform web`.

Esperado: todos finalizam com código 0; o último comando cria apenas o artefato ignorado `dist/`. Se as ferramentas Android/iOS estiverem disponíveis, execute também `npx expo run:android --no-install` e `npx expo run:ios --no-install`; caso contrário, registre explicitamente que a plataforma não está disponível, sem marcar uma falha inexistente como sucesso.

- [ ] **Passo 6: Criar o commit da tarefa**

```powershell
git add README.md AGENTS.md TASKS.md
git commit -m "docs(foundation): record stack and milestone completion [TASK-007]"
```

## Auto-revisão do plano

### Cobertura da especificação

| Requisito da especificação                                          | Tarefa do plano     |
| ------------------------------------------------------------------- | ------------------- |
| Stack Expo, Router, TypeScript, lint e testes                       | Tarefa 1 e Tarefa 5 |
| Estrutura por feature e separação de `core`                         | Tarefa 1            |
| Ambientes e URL externa sem segredo                                 | Tarefa 2            |
| HTTP com timeout, JSON e sem endpoints inventados                   | Tarefa 3            |
| Mapeamento de erros de rede, timeout, 4xx, 5xx e códigos de negócio | Tarefa 3            |
| Tokens exclusivamente em armazenamento seguro                       | Tarefa 4            |
| Atualização dos documentos e Definition of Done                     | Tarefa 5            |

Não há lacunas de escopo, placeholders ou inconsistências de tipos entre as
interfaces declaradas pelas tarefas.
