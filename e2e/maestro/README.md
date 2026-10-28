# E2E (Maestro)

Pré-requisitos: API em `http://localhost:8082` com os dados de demonstração, development build
instalado no emulador (`npx expo run:android`), Metro rodando e [Maestro](https://maestro.mobile.dev).

```text
maestro test e2e/maestro/login-invalid.yaml
maestro test e2e/maestro/login-and-calendar.yaml
```

Os fluxos usam as contas de demonstração (`demo.ana`). `launch.yaml` limpa o estado do app, então a
sessão anterior é descartada.
