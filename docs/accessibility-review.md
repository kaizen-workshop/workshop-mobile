# Revisão de acessibilidade — TASK-080

Escopo revisado: autenticação e recuperação de senha, onboarding de
preferências, estados compartilhados, feed, lista e detalhes de workshops e
navegação principal existentes em setembro de 2026.

## Verificações concluídas

- títulos de tela e seções relevantes expostos como cabeçalhos;
- campos de formulário e ações com nomes acessíveis;
- seleção de preferências exposta como checkbox com estado marcado;
- loading, erro e conteúdo offline anunciados semanticamente;
- ações assíncronas expõem os estados ocupado e desabilitado;
- controles interativos existentes respeitam alvo mínimo de 48 pontos;
- formulários podem rolar quando teclado ou fonte ampliada reduzem a área útil;
- cards e anexos sem ação permanecem conteúdo de leitura, sem falso papel de
  botão;
- combinações atuais de texto possuem contraste mínimo WCAG AA de 4,5:1;
- informação não depende somente de cor: erros, offline, seleção e loading
  também possuem texto, papel ou estado semântico.

## Validação recorrente

Os testes automatizados cobrem nomes, papéis e estados acessíveis, tamanho
mínimo de toque e contraste dos tokens usados. `npm test`, `npm run typecheck`,
`npm run lint` e `npm run format:check` devem continuar fazendo parte da
validação.

## Validação manual de release

Antes de distribuir um binário, validar em dispositivo físico:

- ordem e foco com TalkBack no Android e VoiceOver no iOS;
- entrada e retorno do teclado em cada formulário;
- fontes nos maiores tamanhos configuráveis pelo sistema;
- orientação, zoom e contraste alto suportados pela plataforma;
- rótulos nativos da barra de abas e anúncios durante navegação.

Essa etapa permanece um checklist de release porque o ambiente Jest não
reproduz leitores de tela, configurações de fonte nem serviços de
acessibilidade nativos.
