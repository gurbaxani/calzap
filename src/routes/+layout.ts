import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pb';

export const prerender = true;
export const trailingSlash = 'always';

export const load = async ({ url }) => {
	if (browser) {
		const isAuthPath = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup');
		const isProtectedPath = url.pathname.startsWith('/dashboard') || 
								url.pathname.startsWith('/profile') || 
								url.pathname.startsWith('/logout');

		if (isProtectedPath && !pb.authStore.isValid) {
			throw redirect(303, '/login');
		}

		if (isAuthPath && pb.authStore.isValid) {
			throw redirect(303, '/dashboard');
		}
	}

	return {};
};