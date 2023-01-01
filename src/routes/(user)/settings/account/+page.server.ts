import { error, redirect } from '@sveltejs/kit'
import type { ClientResponseError } from 'pocketbase'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login')
	}
}

export const actions: Actions = {
	updateEmail: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData())

		try {
			await locals.pb
				.collection('users')
				.requestEmailChange(data?.email.toString())
		} catch (err) {
			console.log(`Error: ${err}`)
			const e = err as ClientResponseError
			throw error(e.status, e.data.message)
		}

		return {
			success: true,
			// data,
		}
	},
	updateUsername: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData())

		try {
			await locals.pb
				.collection('users')
				.getFirstListItem(`username = "${data?.username}"`)
		} catch (err) {
			const e = err as ClientResponseError
			if (e.status === 404) {
				try {
					let { username } = await locals.pb
						.collection('users')
						.update(locals.user.id, { username: data?.username })
					locals.user.username = username
					return {
						success: true,
						data: { username },
					}
				} catch (err) {
					console.log(`Error: ${err}`)
					throw error(e.status, e.data.message)
				}
			}
			console.log(`Error: ${err}`)
			throw error(e.status, e.data.message)
		}

		return {
			success: true,
			// data,
		}
	},
}