import PartySocket from 'partysocket';
import { throttle } from './throttle';

const partySocket = new PartySocket({
	host: import.meta.env.PUBLIC_PARTYKIT_SERVER,
	room: import.meta.env.PUBLIC_PARTYKIT_ROOM,
});

export const send = throttle((msg: { type: string; data: any }) => {
	partySocket.send(JSON.stringify(msg));
});

type InitArguments = {
	log: (msg: any) => void;
	onMessage: (data: { type: string; data: any }) => void;
};

export function init({ log = () => {}, onMessage = () => {} }: InitArguments) {
	partySocket.onmessage = (event: MessageEvent) => {
		const { type, data, room } = JSON.parse(event.data as string);

		onMessage({ type, data });

		log(`there are ${room.connections} people connected`);
	};

	partySocket.onopen = () => {
		send({ type: 'ping', data: { message: 'ping' } });
		log('opened connection');
	};

	partySocket.onerror = (err: any) => {
		log(err);
	};

	partySocket.onclose = (event: CloseEvent) => {
		log('closed connection:');
		log(event);
	};
}
