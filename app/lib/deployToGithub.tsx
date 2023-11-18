'use server'

import { Octokit } from '@octokit/core'

export type RepoCreationResponse = {
	repoUrl: string
	pagesUrl: string
}

export async function deployToGithub(
	repoName: string,
	htmlContent: string,
	providedApiKey: string | undefined
): Promise<RepoCreationResponse> {
	const token =
		providedApiKey && providedApiKey.trim().length > 0 ? providedApiKey : process.env.GITHUB_TOKEN
	const octokit = new Octokit({ auth: token })
	// Create a new repository
	const response = await octokit.request('POST /user/repos', {
		name: repoName,
		private: false,
		description: `${repoName} made real with tldraw and ChatGPT Vision!`,
	})

	const repoData = response.data,
		fullName = repoData.full_name,
		repoUrl = repoData.html_url

	console.log('Repository created:')
	await addHtmlContent(fullName, htmlContent, octokit)
	console.log('HTML content added')
	const pagesUrl = await enableGitHubPages(fullName, octokit)

	return { pagesUrl, repoUrl }
}

export async function checkGitHubPagesDeployment(pagesUrl: string): Promise<boolean> {
	try {
		const response = await fetch(pagesUrl)

		if (response.ok) {
			console.log('GitHub Pages deployed successfully.')
			return true
		} else {
			console.log(`Site not deployed yet.`)
			return false
		}
	} catch (error) {
		console.error('Error checking GitHub Pages:', error)
		return false
	}
}

async function addHtmlContent(repoFullName: string, htmlContent: string, octokit: Octokit) {
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

async function enableGitHubPages(repoFullName: string, octokit: Octokit): Promise<string> {
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
