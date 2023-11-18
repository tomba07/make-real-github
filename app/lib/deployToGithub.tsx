'use server'

import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { ResponseShape } from '../ResponseShape/ResponseShape'
import { getSelectionAsImageDataUrl } from './getSelectionAsImageDataUrl'
import {
	GPT4VCompletionResponse,
	GPT4VMessage,
	MessageContent,
	fetchFromOpenAi,
} from './fetchFromOpenAi'
import { Octokit } from '@octokit/core'

const token = process.env.GITHUB_API_KEY
const octokit = new Octokit({ auth: token })

export async function deployToGithub(html: String) {
	try {
		// Create a new repository
		const response = await octokit.request('POST /user/repos', {
			name: 'new-repo-name',
			private: false,
			description: 'This is a new repository',
		})

		const repoData = response.data
		console.log('Repository created:', repoData)

		// Add a README file
		await addReadme(repoData.full_name)
	} catch (error) {
		console.error('Error creating repository:', error)
	}
}

async function addReadme(repoName: String) {
	const content = 'Hello, World! This is a README file.'
	const response = await fetch(
		`https://api.github.com/repos/YOUR_GITHUB_USERNAME/${repoName}/contents/README.md`,
		{
			method: 'PUT',
			headers: {
				Authorization: `token ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: 'Initial commit with README',
				content: btoa(content), // Base64 encode content
			}),
		}
	)

	return response.json()
}
