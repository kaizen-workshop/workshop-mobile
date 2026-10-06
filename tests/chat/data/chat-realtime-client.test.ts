import { createChatRealtimeClient } from '@/chat/chat-realtime-client';

it('authenticates, subscribes and forwards valid committed messages', async () => {
  const sockets: Array<{
    send: jest.Mock;
    close: jest.Mock;
    onopen: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onerror: (() => void) | null;
    onclose: (() => void) | null;
  }> = [];
  const onMessage = jest.fn();
  const client = createChatRealtimeClient({
    apiUrl: 'https://api.example.test/api/v1',
    groupId: 'group-1',
    tokenStorage: {
      read: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      save: jest.fn(),
      clear: jest.fn(),
    },
    onMessage,
    onReconnect: jest.fn(),
    createSocket: () => {
      const socket = {
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null,
      };
      sockets.push(socket);
      return socket;
    },
  });

  client.start();
  await Promise.resolve();
  await Promise.resolve();
  const socket = sockets[0];
  socket.onopen?.();
  expect(socket.send).toHaveBeenCalledWith(
    expect.stringContaining('Authorization:Bearer access'),
  );

  socket.onmessage?.({ data: 'CONNECTED\nversion:1.2\n\n\0' });
  expect(socket.send).toHaveBeenCalledWith(
    expect.stringContaining('destination:/topic/groups/group-1'),
  );

  const message = {
    id: 'message-1',
    groupId: 'group-1',
    authorId: 'user-1',
    authorName: 'Ana',
    content: 'Olá',
    sentAt: '2026-10-02T12:00:00Z',
    editedAt: null,
    deletedAt: null,
  };
  socket.onmessage?.({
    data: `MESSAGE\ndestination:/topic/groups/group-1\n\n${JSON.stringify(message)}\0`,
  });
  expect(onMessage).toHaveBeenCalledWith(message);
  client.stop();
  expect(socket.close).toHaveBeenCalledTimes(1);
});
