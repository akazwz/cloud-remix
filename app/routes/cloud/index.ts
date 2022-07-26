import type { ActionFunction, } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { nanoid } from 'nanoid/non-secure'

export const action: ActionFunction = async({ request, params }) => {
	const data = await request.arrayBuffer()

	const ext = request.headers.get('file-extension')
	const key = await generateKey(ext)

	const hash = await HashArrayBuffer(data)

	if (!data) {
		return json(
			{ msg: 'no data' },
			{ status: 400 }
		)
	}

	const url = request.url + '/' + key

	switch (request.method) {
		case 'PUT':
			const object = await MY_BUCKET.put(key, data, {
				httpMetadata: {
					contentType: request.headers.get('Content-Type') || undefined,
				},
			})
			if (!object) {
				return json(
					{ msg: 'put failed' },
					{ status: 400 }
				)
			}

			return json(
				{
					msg: 'put success',
					key,
					url,
					hash,
					etag: object.etag
				},
				{ status: 201 },
			)
		default:
			return json(
				{ msg: 'Method Not Allowed' },
				{ status: 405 }
			)
	}
}

// 生成 key
const generateKey = async(ext: string | null): Promise<string> => {
	let key = nanoid(7)
	if (ext) {
		key = key + '.' + ext
	}
	const object = await MY_BUCKET.get(key)
	if (!object) return key
	return await generateKey(ext)
}

const HashArrayBuffer = async(data: ArrayBuffer) => {
	const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}