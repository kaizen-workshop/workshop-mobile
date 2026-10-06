# Política offline por feature

Esta política classifica o comportamento permitido quando a rede está instável.
Ela acompanha os contratos implementados e documentados pela API.
A API continua sendo a fonte de verdade e toda escrita sincronizada deve refletir
o resultado confirmado pelo backend.

## Classificações

- `READ-CACHEABLE`: pode exibir a última leitura persistida, identificada como
  conteúdo salvo e sujeita a expiração e atualização posterior.
- `WRITE-RETRYABLE`: pode ser reenviada de forma controlada somente quando a
  operação tiver identidade estável e garantia de idempotência adequada.
- `WRITE-ONLINE-ONLY`: exige conexão e não entra em fila automática.

## Matriz por domínio

| Domínio/operação               | Classificação       | Regra                                                                          |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------ |
| Sessão, login e troca de senha | `WRITE-ONLINE-ONLY` | Nunca persistir senha; falhas exigem ação consciente do usuário.               |
| Feed e detalhes de posts       | `READ-CACHEABLE`    | Preservar a ordem recebida e informar quando o conteúdo for salvo.             |
| Lista e detalhes de workshops  | `READ-CACHEABLE`    | Campos opcionais continuam opcionais no cache.                                 |
| Preferências (leitura)         | `READ-CACHEABLE`    | Revalidar quando houver conexão.                                               |
| Preferências (alteração)       | `WRITE-RETRYABLE`   | `PUT` substitui o conjunto completo; repetir exige preservar o mesmo snapshot. |
| Curtidas                       | `WRITE-RETRYABLE`   | `PUT`/`DELETE` expressam o estado desejado e permitem rollback visual.         |
| Comentários                    | `WRITE-RETRYABLE`   | Criação reutiliza UUID idempotente; edição e exclusão dependem de autorização. |
| Inscrição e cancelamento       | `WRITE-RETRYABLE`   | Reutilizar a mesma chave de idempotência durante o retry da mesma operação.    |
| Pagamento                      | `WRITE-ONLINE-ONLY` | Nunca repetir cobrança automaticamente.                                        |
| Calendário e histórico         | `READ-CACHEABLE`    | Derivar da mesma fonte sincronizada de workshops quando aplicável.             |
| Grupos autorizados             | `READ-CACHEABLE`    | Cache não concede acesso; a autorização precisa ser revalidada pela API.       |
| Histórico e mensagens recentes | `READ-CACHEABLE`    | Paginar, limitar retenção e reconciliar pelo identificador retornado pela API. |
| Envio de mensagem              | `WRITE-RETRYABLE`   | Reutilizar a mesma UUID enquanto o conteúdo da tentativa não mudar.            |
| Notificações                   | `READ-CACHEABLE`    | Push não substitui a sincronização da central.                                 |
| Marcar notificação como lida   | `WRITE-RETRYABLE`   | Repetir mantém o recurso lido; rollback visual ocorre em falha.                |
| Avaliação                      | `WRITE-RETRYABLE`   | Reenvio idempotente mantém conteúdo e UUID; elegibilidade permanece na API.    |

## Regras de cache e sincronização

1. Todo registro local tem versão de esquema, `updatedAt` e expiração explícita.
2. Conteúdo expirado não é tratado como leitura atual; pode ser removido com
   segurança e buscado novamente.
3. `ETag`, `updatedAfter` e cursores são usados somente nos recursos que os
   expõem; a reconciliação incremental completa permanece na TASK-065.
4. Uma falha de refresh preserva o cache legível, mas não transforma uma
   escrita pendente em sucesso. Durante uma falha de conectividade na
   inicialização, somente um access token local ainda não expirado mantém a
   sessão de leitura; rejeição do servidor ou token expirado limpa a sessão.
5. Logout remove tokens e dados sensíveis. Cache compartilhável deve ser
   particionado por usuário ou removido para impedir vazamento entre contas.
6. Pagamentos, autenticação e outras escritas online-only nunca entram na fila
   genérica de retry.

## Conflitos ainda dependentes do contrato

A estratégia de conflito será definida por domínio na `TASK-067`. Até lá, não
há regra universal de “última escrita vence”. Operações marcadas como
condicionais permanecem desabilitadas para retry automático enquanto a API não
documentar idempotência, identificadores e respostas de conflito.
