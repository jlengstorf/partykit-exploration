import { gsap } from 'gsap';
import { MouseEventHandler, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { send } from '../util/partykit';
import { Heart, LightBulb } from './icons';
import styles from './icon-button.module.css';

export const IconButton = ({ icon }: { icon: 'heart' | 'light-bulb' }) => {
	const { user } = useUser();
	const btn = useRef(null);
	const iconRef = useRef(null);

	function animate() {
		const timeline = gsap.timeline();

		timeline.set(iconRef.current, {
			y: 0,
			scale: 0.25,
			opacity: 1,
		});

		timeline.to(iconRef.current, {
			scale: 2,
			y: -10,
			opacity: 0,
			rotate: 'random(-15, 15)',
			duration: 0.25,
			ease: 'power2.out',
		});
	}

	function sendReaction() {
		animate();
		send({ type: 'reaction', data: { type: icon, user: user?.username } });
	}

	const handleClick: MouseEventHandler = sendReaction;
	const handleKeyPress = (event: KeyboardEvent) => {
		const key = icon === 'heart' ? '1' : '2';
		if (event.key === key) {
			sendReaction();
		}
	};

	useEffect(() => {
		document.addEventListener('keyup', handleKeyPress);

		return () => {
			document.removeEventListener('keyup', handleKeyPress);
		};
	}, [handleKeyPress]);

	const Icon = icon === 'heart' ? Heart : LightBulb;

	return (
		<button ref={btn} className={styles.button} onClick={handleClick}>
			<Icon />
			<Icon ref={iconRef} className={styles.animator} />
		</button>
	);
};
