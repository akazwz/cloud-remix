import type { R2Bucket } from '@miniflare/r2'

export {}

declare global{
	const MY_BUCKET: R2Bucket

	interface Crypto{
		digestStream: DigestStream
	}
}