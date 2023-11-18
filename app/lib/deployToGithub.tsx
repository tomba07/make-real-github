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

export async function deployToGithub(htmlContent: string) {
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
		await addHtmlContent(repoData.full_name, htmlContent)
	} catch (error) {
		console.error('Error creating repository:', error)
	}
}

async function addReadme(repoName: string) {
	try {
		const content = 'Hello, World! This is a README file.'
		await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
			owner: repoName.split('/')[0],
			repo: repoName.split('/')[1],
			path: 'README.md',
			message: 'Initial commit with README',
			content: btoa(content), // Base64 encode content
		})

		console.log('README added to the repository')
	} catch (error) {
		console.error('Error adding README:', error)
	}
}

async function addHtmlContent(repoFullName: string, htmlContent: string) {
	try {
		await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
			owner: repoFullName.split('/')[0],
			repo: repoFullName.split('/')[1],
			path: 'index.html',
			message: 'Add HTML Content',
			content: btoa(htmlContent), // Base64 encode content
		})

		console.log('HTML Content added to the repository')
	} catch (error) {
		console.error('Error adding HTML Content:', error)
	}
}
