import type {
  PartyKitConnection,
  PartyKitRoom,
  PartyKitServer,
} from 'partykit/server';

function sendWithWebSocket(_ws: PartyKitConnection, room: PartyKitRoom) {
  return (message: { type: string; data: object }) => {
    room.broadcast(
      JSON.stringify({
        ...message,
        room: {
          id: room.id,
          connections: room.connections.size,
        },
      })
    );
  };
}

export default {
  onMessage(message, ws, room) {
    const send = sendWithWebSocket(ws, room);
    const { type, data } = JSON.parse(message as string);

    switch (type) {
      case 'ping':
        send({ type: 'ping', data: { message: 'pong' } });
        break;

      case 'reaction':
        send({ type: 'reaction', data: { type: data.type } });
        break;

      default:
        send({ type, data });
    }
  },
} satisfies PartyKitServer;
