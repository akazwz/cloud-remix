import type { LoaderFunction } from '@remix-run/cloudflare'

// get object by key
// 通过 key 获取 对象
export const loader: LoaderFunction = async({ params }) => {
	const { key } = params
	if (!key) return new Response('Object Not Found')

	const object = await MY_BUCKET.get(key)
	if (!object) return new Response('Object Not Found')

	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	return new Response(object.body, {
		status: 200,
		headers,
	})
}



