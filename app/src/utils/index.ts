import { nanoid } from 'nanoid/non-secure'

export const getExtension = (filename: string): string => {
	const pos = filename.lastIndexOf('.')
	if (pos === -1) {
		return ''
	}
	const adjustedPos = pos + '.'.length
	if (adjustedPos > filename.length) {
		return ''
	}
	return filename.slice(adjustedPos)
}

// 生成 key
export const generateKey = async(ext: string | undefined = undefined): Promise<string> => {
	let key = nanoid(7)
	if (ext) {
		key = key + '.' + ext
	}
	const object = await MY_BUCKET.get(key)
	if (!object) return key
	return await generateKey(ext)
}

export const hashArrayBuffer = async(data: ArrayBuffer) => {
	const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const ellipsisText = (text: string, length: number, ellipsis: string = '...'): string => {
	return text.slice(0, length) + ellipsis
}

export const ellipsisTextStartAndEnd = (text: string, start: number, end: number, ellipsis: string = '...'): string => {
	if (start > text.length || end > text.length) return text
	return text.slice(0, start) + ellipsis + text.slice(text.length - end, text.length)
}

export const ellipsisFilename = (filename: string, length: number) => {
	const extIndex = filename.lastIndexOf('.')
	const ext = filename.slice(extIndex, filename.length)
	return ellipsisText(filename, length) + ext
}

export const filesizeUnit = (size: number): string => {
	switch (true) {
		/*kb*/
		case size > 1024 && size < 1024 * 1024:
			return (size / 1024).toFixed(2) + 'KB'
		/*mb*/
		case size > 1024 * 1024 && size < 1024 * 1024 * 1024:
			return (size / 1024 / 1024).toFixed(2) + 'MB'
		/*gb*/
		case size > 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024:
			return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
		default:
			return size.toFixed(2) + 'B'
	}
}