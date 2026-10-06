import type { TokenStorage } from '@/core/secure-storage';
import type { ChatMessage } from './message';

type WebSocketLike = Pick<
  WebSocket,
  'close' | 'send' | 'onopen' | 'onmessage' | 'onerror' | 'onclose'
>;

export function createChatRealtimeClient({
  apiUrl,
  groupId,
  tokenStorage,
  onMessage,
  onReconnect,
  createSocket = (url) => new WebSocket(url),
}: {
  apiUrl: string;
  groupId: string;
  tokenStorage: TokenStorage;
  onMessage(message: ChatMessage): void;
  onReconnect(): Promise<void> | void;
  createSocket?: (url: string) => WebSocketLike;
}) {
  let socket: WebSocketLike | undefined;
  let stopped = true;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let connectedOnce = false;

  const connect = async () => {
    if (stopped) return;
    const tokens = await tokenStorage.read();
    if (!tokens || stopped) return;
    const next = createSocket(toWebSocketUrl(apiUrl));
    socket = next;
    next.onopen = () => {
      next.send(
        frame('CONNECT', {
          'accept-version': '1.2',
          Authorization: `Bearer ${tokens.accessToken}`,
          'heart-beat': '10000,10000',
        }),
      );
    };
    next.onmessage = (event) => {
      for (const incoming of parseFrames(String(event.data))) {
        if (incoming.command === 'CONNECTED') {
          reconnectAttempt = 0;
          next.send(
            frame('SUBSCRIBE', {
              id: `group-${groupId}`,
              destination: `/topic/groups/${groupId}`,
              ack: 'auto',
            }),
          );
          if (connectedOnce) void onReconnect();
          connectedOnce = true;
        }
        if (incoming.command === 'MESSAGE') {
          try {
            const value: unknown = JSON.parse(incoming.body);
            if (isMessage(value)) onMessage(value);
          } catch {
            // An invalid broker message is ignored; REST remains authoritative.
          }
        }
      }
    };
    next.onerror = () => undefined;
    next.onclose = () => {
      if (socket === next) socket = undefined;
      if (!stopped) scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (reconnectTimer || stopped) return;
    const delay = Math.min(30_000, 1_000 * 2 ** reconnectAttempt++);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      void connect();
    }, delay);
  };

  return {
    start() {
      if (!stopped) return;
      stopped = false;
      void connect();
    },
    stop() {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
      socket?.close();
      socket = undefined;
    },
  };
}

function toWebSocketUrl(apiUrl: string) {
  const url = new URL(apiUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = `${url.pathname.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')}/ws`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

function frame(command: string, headers: Readonly<Record<string, string>>) {
  const serialized = Object.entries(headers)
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
  return `${command}\n${serialized}\n\n\0`;
}

function parseFrames(payload: string) {
  return payload
    .split('\0')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const separator = value.indexOf('\n\n');
      const head = separator >= 0 ? value.slice(0, separator) : value;
      const body = separator >= 0 ? value.slice(separator + 2) : '';
      return { command: head.split('\n')[0], body };
    });
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ChatMessage>;
  return (
    typeof item.id === 'string' &&
    typeof item.groupId === 'string' &&
    typeof item.authorId === 'string' &&
    typeof item.authorName === 'string' &&
    (item.content === null || typeof item.content === 'string') &&
    typeof item.sentAt === 'string' &&
    (item.editedAt === null || typeof item.editedAt === 'string') &&
    (item.deletedAt === null || typeof item.deletedAt === 'string')
  );
}
