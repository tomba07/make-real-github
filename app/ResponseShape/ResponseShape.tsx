/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	Icon,
	TLBaseShape,
	stopEventPropagation,
	toDomPrecision,
	useIsEditing,
	useToasts,
	useEditor,
} from '@tldraw/tldraw'
import { ChangeEvent, useCallback } from 'react'
import { deployToGithub } from '../lib/deployToGithub'

export type ResponseShape = TLBaseShape<
	'response',
	{
		html: string
		w: number
		h: number
	}
>

export class ResponseShapeUtil extends BaseBoxShapeUtil<ResponseShape> {
	static override type = 'response' as const

	getDefaultProps(): ResponseShape['props'] {
		return {
			html: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false

	override component(shape: ResponseShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		const editor = useEditor()
		const { addToast } = useToasts()

		const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			if (process.env.NODE_ENV === 'development') {
				localStorage.setItem('github_repo_name', e.target.value)
			}
		}, [])

		const handleDeploy = useCallback(() => {
			// Implement what should happen when the button is clicked
			console.log('Deploy clicked with input value:', localStorage.getItem('github_repo_name'))
		}, [])

		const handleDeployToGithub = useCallback(
			async (html: string) => {
				console.log('deploy to github')
				try {
					const sUrl = await deployToGithub(html)
				} catch (e) {
					console.error(e)
					addToast({
						icon: 'cross-2',
						title: 'Something went wrong',
						description: (e as Error).message.slice(0, 100),
					})
				}
			},
			[editor, addToast]
		)

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{shape.props.html ? (
					<iframe
						className="tl-embed"
						srcDoc={shape.props.html}
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							border: 0,
							pointerEvents: isEditing ? 'auto' : 'none',
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				<div className="github-info">
					<input
						defaultValue={localStorage.getItem('makeitreal_key') ?? ''}
						onChange={handleInputChange}
					/>
					<button
						className="deployButton"
						onClick={handleDeploy}
						onPointerDown={stopEventPropagation}
					>
						Deploy
					</button>
				</div>
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						if (navigator && navigator.clipboard) {
							navigator.clipboard.writeText(shape.props.html)
							toast.addToast({
								icon: 'duplicate',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
				>
					<Icon icon="duplicate" />
				</div>
				<div
					style={{
						position: 'absolute',
						top: 30,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						handleDeployToGithub(shape.props.html)
					}}
					onPointerDown={stopEventPropagation}
				>
					<Icon icon="github" />
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: ResponseShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
