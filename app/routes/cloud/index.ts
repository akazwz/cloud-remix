import type { ActionFunction, } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { generateKey, hashArrayBuffer } from '~/src/utils'

// put post delete option
export const action: ActionFunction = async({ request }) => {
	switch (request.method) {
		case 'PUT':
		case 'POST':
			return await putObject(request)
		default:
			return json(
				{ msg: 'method not allowed' },
				{ status: 405 }
			)
	}
}

// put object
const putObject = async(request: Request) => {
	try {
		// get data
		const data = await request.arrayBuffer()

		// get file extension
		const ext = request.headers.get('file-extension')
		// generate object key by extension
		const key = await generateKey()
		// get file hash
		const hash = await hashArrayBuffer(data)

		await NAME_SPACE.put(key, hash)

		// find object by hash
		const object = await MY_BUCKET.get(hash)
		// no hash object then put
		if (!object) {
			await MY_BUCKET.put(hash, data)
		}

		const url = ext ? `${request.url}/${key}.${ext}` : `${request.url}/${key}`
		return json(
			{
				url,
			},
			{ status: 201, },
		)
	} catch (e: any) {
		console.log(e)
		return json(
			{
				msg: e.message,
			},
			{ status: 400, },
		)
	}
}