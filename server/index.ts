import type {
	PartyKitConnection,
	PartyKitRoom,
	PartyKitServer,
} from 'partykit/server';
import tmi from 'tmi.js';

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

interface PartyKitRoomWithTwitch extends PartyKitRoom {
	twitch?: tmi.Client;
}

export default {
	async onConnect(ws, room: PartyKitRoomWithTwitch) {
		const send = sendWithWebSocket(ws, room);

		try {
			room.twitch ||= new tmi.Client({
				connection: {
					secure: true,
					reconnect: true,
				},
				identity: {
					username: room.env.TWITCH_BOT_USER as string,
					password: room.env.TWITCH_OAUTH as string,
				},
				channels: ['jlengstorf'],
			});
			if (!['CONNECTING', 'OPEN'].includes(room.twitch.readyState())) {
				await room.twitch.connect();
			}

			if (room.twitch.readyState() !== 'OPEN') {
				console.log(room.twitch.readyState());
			}

			room.twitch.removeAllListeners();

			// handle chat messages
			room.twitch.on('message', (channel, meta, msg, self) => {
				if (self) return;

				if (meta['message-type'] === 'whisper') {
					return;
				}

				send({
					type: 'chat',
					data: {
						message: msg,
						channel,
						meta,
					},
				});
			});
		} catch (error) {
			console.log(error);
		}
	},
	onMessage(message, ws, room) {
		const send = sendWithWebSocket(ws, room);
		const { type, data } = JSON.parse(message as string);

		console.log({ type, data });

		switch (type) {
			case 'ping':
				send({ type, data: { message: 'pong' } });
				break;

			case 'reaction':
				send({ type, data: { type: data.type } });
				break;

			case 'highlight':
				send({
					type,
					data: { name: data.name, message: data.message },
				});
				break;

			case 'remove-highlight':
				send({ type, data: {} });
				break;

			default:
				send({ type, data });
		}
	},
} satisfies PartyKitServer;
