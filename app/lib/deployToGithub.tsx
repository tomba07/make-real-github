'use server'

import { Octokit } from '@octokit/core'

const token = process.env.GITHUB_API_KEY
const octokit = new Octokit({ auth: token })

export type RepoCreationResponse = {
	repoUrl: string
	pagesUrl: string
}

export async function deployToGithub(
	repoName: string,
	htmlContent: string
): Promise<RepoCreationResponse> {
	// Create a new repository
	const response = await octokit.request('POST /user/repos', {
		name: repoName,
		private: false,
		description: 'This is a new repository',
	})

	const repoData = response.data,
		repoUrl = repoData.full_name

	console.log('Repository created:', repoData)
	await addHtmlContent(repoUrl, htmlContent)
	console.log('HTML content added')
	const pagesUrl = await enableGitHubPages(repoUrl)

	return { pagesUrl, repoUrl }
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

async function enableGitHubPages(repoFullName: string): Promise<string> {
	try {
		await octokit.request('POST /repos/{owner}/{repo}/pages', {
			owner: repoFullName.split('/')[0],
			repo: repoFullName.split('/')[1],
			source: {
				branch: 'main',
				path: '/',
			},
		})

		console.log('GitHub Pages enabled for the repository')
		return `https://${repoFullName.split('/')[0]}.github.io/${repoFullName.split('/')[1]}/`
	} catch (error) {
		console.error('Error enabling GitHub Pages:', error)
		return ''
	}
}
