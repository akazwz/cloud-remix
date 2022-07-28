import { useRef, useState, } from 'react'
import type { DragEvent } from 'react'
import {
	AspectRatio,
	Box,
	Text,
	Heading,
	HStack,
	Input,
	Tooltip,
	VStack,
	Spacer,
	IconButton,
	useColorModeValue,
	useToast,
	useClipboard,
} from '@chakra-ui/react'
import { Copy, Correct, FileAdditionOne, UploadOne } from '@icon-park/react'
import axios from 'axios'

import { ColorModeToggle } from '~/components/ColorModeToggle'
import { ellipsisTextStartAndEnd, filesizeUnit } from '~/src/utils'

const Index = () => {
	const inputRef = useRef<HTMLInputElement>(null)

	const [filename, setFilename] = useState<string>('')
	const [filesize, setFilesize] = useState<number | null>(null)
	const [progress, setProgress] = useState(0)
	const [url, setUrl] = useState<string>('')

	const [borderColor, setBorderColor] = useState<string>('')

	const toast = useToast()

	// 弹出选择文件
	const handleSelectFile = () => {
		inputRef.current?.click()
	}

	// 选择文件之后
	const handleFileChange = async() => {
		// 获取文件
		const file = inputRef.current?.files?.item(0)
		if (!file) {
			return
		}
		await upload(file)
	}

	// 拖拽上传文件
	const handleBoxOnDrop = async(e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setBorderColor('')
		const file = e.dataTransfer.files.item(0)
		if (!file) return
		await upload(file)
	}

	const upload = async(file: File) => {
		// 上传之前重置 进度
		setProgress(0)
		setFilename(file.name)
		setFilesize(file.size)
		setUrl('')
		// 限制文件大小 1 GB
		if (file.size > 100 * 1024 * 1024) {
			toast({
				title: 'Max File Size is 100MB',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		const form = new FormData()
		form.append('file', file)
		const res = await axios.put(`/cloud`,
			form,
			{
				onUploadProgress: (progressEvent: ProgressEvent) => {
					const p = (progressEvent.loaded / progressEvent.total) * 100
					setProgress(p)
				}
			}
		)
		const { url } = res.data
		setUrl(url)
	}

	return (
		<Box maxW="md" mx="auto" p={3}>
			<ColorModeToggle />
			<Heading textAlign="center">
				Remix Cloud
			</Heading>
			{/* 上传 box, 可以点击选择文件上传， 可以拖拽上传 */}
			<Box
				m={3}
				onClick={handleSelectFile}
				onDragOver={(e) => {
					e.preventDefault()
					setBorderColor('blue.500')
				}}
				onDragLeave={(e) => {
					e.preventDefault()
					setBorderColor('')
				}}
				onDrop={handleBoxOnDrop}
			>
				{/*  */}
				<AspectRatio maxW="700px" ratio={21 / 9}>
					<Box borderWidth={3} borderStyle="dashed" borderColor={borderColor} rounded="lg">
						<VStack>
							<UploadOne size={70} strokeWidth={2} />
						</VStack>
					</Box>
				</AspectRatio>
				<Input
					type="file"
					hidden
					ref={inputRef}
					multiple={false}
					onChange={handleFileChange}
				/>
			</Box>
			{
				filesize && <UploadItem
					filename={filename}
					filesize={filesize}
					hashing={false}
					progress={progress}
					url={url}
				/>
			}
		</Box>
	)
}

interface UploadItemProps{
	filename: string
	filesize: number
	progress: number
	hashing: boolean
	url: string
}

export const UploadItem = ({ filename, filesize, hashing, progress, url }: UploadItemProps) => {
	const tooltipBg = useColorModeValue('white', 'black')
	const tooltipColor = useColorModeValue('black', 'white')
	const progressBg = useColorModeValue('blue.100', 'blue.900')

	const { onCopy, hasCopied } = useClipboard(url)

	const icon = hasCopied
		? <Correct theme="filled" fill="green" size={21} />
		: <Copy theme="filled" size={21} onClick={onCopy} />

	return (
		<Box borderWidth={1} p={0} rounded="lg" height="70px" alignItems="flex-start" overflow="hidden">
			{/* 进度条背景 */}
			<Box
				width={`${progress}%`}
				height={'70px'}
				bg={progressBg}
				rounded="lg"
				roundedRight={0}
			>
			</Box>
			{/* 相对定位内容： 上传文件信息， 文件名， 文件大小等 */}
			<HStack w="full" position="relative" height="70px" p={3} mt="-70px">
				<Box>
					<FileAdditionOne size={45} strokeWidth={2} />
				</Box>
				<VStack spacing={0} alignItems="start" overflow="hidden">
					<Box>
						{/* 文件名全称 tooltip */}
						<Tooltip
							hasArrow
							bg={tooltipBg}
							color={tooltipColor}
							label={filename}
						>
							{/* 文件名过长缩略 */}
							<Text fontWeight="semibold">{ellipsisTextStartAndEnd(filename, 7, 7)}</Text>
						</Tooltip>
					</Box>
					<Text fontWeight="semibold" color="gray.500">{filesizeUnit(filesize)}</Text>
				</VStack>
				<Spacer />
				{/* 复制 */}
				{
					url.length > 1
						? (<IconButton aria-label="copy" icon={icon} />)
						: null
				}
			</HStack>
		</Box>
	)
}

export default Index