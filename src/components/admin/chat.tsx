import { useEffect, useState } from 'react';
import { init, send } from '../../util/partykit';
import styles from './chat.module.css';

export const Chat = () => {
	const [chat, setChat] = useState<Array<any>>([]);

	useEffect(() => {
		init({
			log: (msg) => {
				console.log(msg);
			},
			onMessage({ type, data }) {
				if (type !== 'chat') {
					return;
				}

				setChat((messages) => [{ data }, ...messages]);
			},
		});
	}, []);

	return (
		<>
			<button
				onClick={() => {
					send({
						type: 'remove-highlight',
						data: {},
					});
				}}
			>
				hide highlighted chat
			</button>
			<ul className={styles.chat}>
				{chat.map(({ data }) => {
					return (
						<li key={data.meta.id}>
							<p>
								<strong>{data.meta['display-name']}: </strong> {data.message}
							</p>
							<div className={styles.actions}>
								<button
									onClick={() => {
										send({
											type: 'highlight',
											data: {
												name: data.meta['display-name'],
												message: data.message,
											},
										});
									}}
								>
									highlight
								</button>
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
};
