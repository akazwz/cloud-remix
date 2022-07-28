import type { ActionFunction, } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { generateKey, getExtension, hashArrayBuffer } from '~/src/utils'

// put post delete option
export const action: ActionFunction = async({ request, params }) => {
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
		// get form data
		const data = await request.formData()
		const file = data.get('file')
		if (!file || typeof file === 'string') {
			return json(
				{ msg: 'no file' },
				{ status: 400 }
			)
		}
		// get file extension by filename
		const ext = getExtension(file.name)
		// generate object key by extension
		const key = await generateKey(ext)
		// get file hash
		const hash = await hashArrayBuffer(await file.arrayBuffer())

		await NAME_SPACE.put(key, hash)

		// find object by hash
		const object = await MY_BUCKET.get(hash)
		// no hash object then put
		if (!object) {
			await MY_BUCKET.put(hash, file, {
				httpMetadata: {
					contentType: file.type,
				},
			})
		}

		const url = `${request.url}/${key}`
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