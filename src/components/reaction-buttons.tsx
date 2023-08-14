import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from '@clerk/clerk-react';
import styles from './react-buttons.module.css';
import { IconButton } from './icon-button';

const key = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

const UserBar = () => {
	const { user } = useUser();

	return (
		<div className={styles.user}>
			<span>oh hey what’s up {user?.firstName}?</span>
			<UserButton />
		</div>
	);
};

export const ReactionButtons = () => {
	return (
		<ClerkProvider publishableKey={key}>
			<SignedIn>
				<UserBar />
				<div className={styles.buttons}>
					<IconButton icon="heart" />
					<IconButton icon="light-bulb" />
				</div>
			</SignedIn>
			<SignedOut>
				<div className={styles.signIn}>
					<h1>Log in to add reactions</h1>
					<p>Log in with your email address or a social account.</p>
					<SignInButton />
					<SignUpButton />
					<p className={styles.small}>
						<strong>Why does this require a login?</strong> By requiring a
						login, it’s a little harder to spam these reactions. Your info won’t
						be used or shared.
					</p>
				</div>
			</SignedOut>
		</ClerkProvider>
	);
};
