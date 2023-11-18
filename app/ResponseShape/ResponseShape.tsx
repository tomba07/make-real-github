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
import { ChangeEvent, useState, useCallback } from 'react'
import { deployToGithub } from '../lib/deployToGithub'
import {
	GPT4VCompletionResponse,
	GPT4VMessage,
	MessageContent,
	fetchFromOpenAi,
} from '../lib/fetchFromOpenAi'

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
		const [inputValue, setInputValue] = useState('')
		const [pagesUrl, setPagesUrl] = useState('')
		const [repoUrl, setRepoUrl] = useState('')
		const [showGithubInfo, setShowGithubInfo] = useState(false)
		const [isDeploying, setIsDeploying] = useState(false)

		const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value)
		}, [])

		const generateRepoName = async () => {
			const prompt = await buildPromptForOpenAi()

			try {
				const apiKeyFromDangerousApiKeyInput = (
					document.body.querySelector('#openai_key_risky_but_cool') as HTMLInputElement
				)?.value

				const openAiResponse = await fetchFromOpenAi(apiKeyFromDangerousApiKeyInput, {
					model: 'gpt-4-1106-preview',
					max_tokens: 4096,
					temperature: 0,
					messages: prompt,
				})

				populateRepoNameInput(openAiResponse)
			} catch (e) {
				console.error(e)
				addToast({
					icon: 'cross-2',
					title: 'Something went wrong',
					description: (e as Error).message.slice(0, 100),
				})
			}
		}

		const populateRepoNameInput = async (openAiResponse: GPT4VCompletionResponse) => {
			if (openAiResponse.error) {
				throw new Error(openAiResponse.error.message)
			}

			setInputValue(openAiResponse.choices[0].message.content)
		}

		const buildPromptForOpenAi = async (): Promise<GPT4VMessage[]> => {
			const userMessages: MessageContent = [
				{
					type: 'text',
					text: `Create a meaningful github repo name. Use all lower case and dashes. A sample name is 'sample-repo-name'. The content of the repo is the following html which is surrounded by """. The name should describe the core functionality of the HTML content:
					"""
					${shape.props.html}
					"""
					Respond ONLY with the repository name.`,
				},
			]

			// combine the user prompt with the system prompt
			return [{ role: 'user', content: userMessages }]
		}

		const handleGithubClicked = useCallback(() => {
			setShowGithubInfo(!showGithubInfo)
			if (!showGithubInfo && inputValue.length === 0) {
				generateRepoName()
			}
		}, [showGithubInfo])

		const handleDeploy = useCallback(async () => {
			try {
				setIsDeploying(true)
				const response = await deployToGithub(inputValue, shape.props.html)
				setPagesUrl(response.pagesUrl)
				setRepoUrl(response.repoUrl)
			} catch (e: any) {
				console.error(e)
				let description
				if (e?.message?.includes('name already exists on this account')) {
					description =
						'The repository name already exists on your account. Please choose a different name.'
				} else {
					description = (e as Error).message.slice(0, 100)
				}
				addToast({
					icon: 'cross-2',
					title: 'Something went wrong',
					description,
				})
			} finally {
				setIsDeploying(false)
			}
		}, [inputValue, shape.props.html])

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
				{showGithubInfo && (
					<div className="github-info">
						<label style={{ whiteSpace: 'nowrap' }} htmlFor="github-input">
							Repo Name:
						</label>
						<input id="github-input" onChange={handleInputChange} value={inputValue} />
						<div
							style={{
								display: 'flex',
								flex: 'row',
								gap: '4px',
								alignItems: 'center',
								marginTop: 'var(--space-4)',
							}}
						>
							<button
								className="deployButton"
								onClick={handleDeploy}
								onPointerDown={stopEventPropagation}
								disabled={!inputValue?.trim() || isDeploying}
								style={{
									opacity: !inputValue?.trim() || isDeploying ? 0.5 : 1,
									cursor: !inputValue?.trim() || isDeploying ? 'auto' : 'pointer',
								}}
							>
								Deploy
							</button>
							{isDeploying && <DefaultSpinner />}
						</div>
						{repoUrl && (
							<div style={{ marginTop: 'var(--space-4)', pointerEvents: 'all' }}>
								<a
									href={repoUrl}
									target="_blank"
									rel="noopener noreferrer"
									onPointerDown={stopEventPropagation}
								>
									Link to Repo
								</a>
							</div>
						)}
						{pagesUrl && (
							<div>
								<a
									href={pagesUrl}
									target="_blank"
									rel="noopener noreferrer"
									onPointerDown={stopEventPropagation}
								>
									Link to Page
								</a>
							</div>
						)}
					</div>
				)}
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
						color: showGithubInfo ? 'grey' : 'black',
					}}
					onClick={() => {
						handleGithubClicked()
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
