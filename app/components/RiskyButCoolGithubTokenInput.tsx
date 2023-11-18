import { Icon, useBreakpoint } from '@tldraw/tldraw'
import { ChangeEvent, useCallback } from 'react'

export function RiskyButCoolGithubTokenInput() {
	const breakpoint = useBreakpoint()

	// Store the API key locally, but ONLY in development mode
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (process.env.NODE_ENV === 'development') {
			localStorage.setItem('github_token', e.target.value)
		}
	}, [])

	const handleQuestionMessage = useCallback(() => {
		window.alert(
			`If you have a Github token, you can put it in this input and it will be used for deploying to Github.\n\nSee https://github.com/settings/tokens to get a token.\n\nPutting such tokens into boxes is generally a bad idea! If you have any concerns, create a token and then delete it after using this site.`
		)
	}, [])

	return (
		<div
			className={`your-own-api-key github-token ${
				breakpoint < 5 ? 'your-own-api-key__mobile' : ''
			}`}
		>
			<div className="your-own-api-key__inner">
				<div className="input__wrapper">
					<input
						id="github_token"
						defaultValue={localStorage.getItem('github_token') ?? ''}
						onChange={handleChange}
					/>
				</div>
				<button className="question__button" onClick={handleQuestionMessage}>
					<Icon icon="question" />
				</button>
			</div>
		</div>
	)
}
