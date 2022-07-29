import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import mime from 'mime-types'

// get object by key
// 通过 key 获取 对象
export const loader: LoaderFunction = async({ request, params }) => {
	const { key } = params
	// 参数错误
	if (!key) {
		return json(
			{ msg: 'no key' },
			{ status: 400 },
		)
	}

	const url = new URL(request.url)
	// key.ext?d=1
	const download = url.searchParams.get('d')

	let mimeType = 'application/octet-stream'
	if (!download) {
		mimeType = mime.lookup(key) || 'application/octet-stream'
	}

	const pos = key.lastIndexOf('.')
	// real store in kv key
	const realKey = pos === -1 ? key : key.slice(0, pos)

	// store in r2 key
	const r2Key = await NAME_SPACE.get(realKey)
	if (!r2Key) {
		return json(
			{ msg: 'key no found' },
			{ status: 404 },
		)
	}

	const object = await MY_BUCKET.get(r2Key)
	if (!object) {
		return json(
			{ msg: 'object no found' },
			{ status: 404 },
		)
	}

	const headers = new Headers()
	headers.set('Content-Type', mimeType)
	headers.set('etag', object.httpEtag)
	return new Response(object.body, {
		status: 200,
		headers,
	})
}



