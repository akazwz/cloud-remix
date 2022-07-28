import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

// get object by key
// 通过 key 获取 对象
export const loader: LoaderFunction = async({ params }) => {
	const { key } = params
	if (!key) {
		return json(
			{ msg: 'no key' },
			{ status: 400 },
		)
	}

	const hashRealKey = await NAME_SPACE.get(key)
	if (!hashRealKey) {
		return json(
			{ msg: 'key no found' },
			{ status: 404 },
		)
	}

	const object = await MY_BUCKET.get(hashRealKey)
	if (!object) {
		return json(
			{ msg: 'object no found' },
			{ status: 404 },
		)
	}

	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	return new Response(object.body, {
		status: 200,
		headers,
	})
}



