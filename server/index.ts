import type { PartyConnection, Party, PartyKitServer } from 'partykit/server';
import tmi from 'tmi.js';

function sendWithWebSocket(_ws: PartyConnection, room: Party) {
	return (message: { type: string; data: object }) => {
		room.broadcast(
			JSON.stringify({
				...message,
				room: {
					id: room.id,
					connections: Array.from(room.getConnections()).length,
				},
			})
		);
	};
}

interface PartyWithTwitch extends Party {
	twitch?: tmi.Client;
}

export default {
	async onConnect(ws, room: PartyWithTwitch) {
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

				if (meta['msg-id'] === 'highlighted-message') {
					send({
						type: 'highlight',
						data: {
							name: meta['display-name'],
							message: msg,
						},
					});
				}
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
