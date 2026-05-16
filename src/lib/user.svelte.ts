import { pb } from './pb';

function createUser() {
	let user = $state(pb.authStore.record);
	let isValid = $state(pb.authStore.isValid);

	pb.authStore.onChange((token, record) => {
		user = record;
		isValid = pb.authStore.isValid;
	}, true);

	return {
		get user() { return user; },
		get isValid() { return isValid; },
		logout() {
			pb.authStore.clear();
		}
	};
}

export const auth = createUser();
