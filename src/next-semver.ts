import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as semver from 'semver'
import {GitHub, context} from '@actions/github'

export async function run(): Promise<void> {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const repoToken = core.getInput('repo-token', {required: true})
    core.setSecret(repoToken)
    const github = new GitHub(repoToken)

    // Get owner and repo from context of payload that triggered the action
    const {owner: currentOwner, repo: currentRepo} = context.repo

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const tagName = core.getInput('tag_name', {required: true})

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = tagName.replace('refs/tags/', '')
    const releaseName = core
      .getInput('release_name', {required: false})
      .replace('refs/tags/', '')
    const body = core.getInput('body', {required: false})
    const draft = core.getInput('draft', {required: false}) === 'true'
    const prerelease = core.getInput('prerelease', {required: false}) === 'true'
    const commitish =
      core.getInput('commitish', {required: false}) || context.sha

    const bodyPath = core.getInput('body_path', {required: false})
    const owner = core.getInput('owner', {required: false}) || currentOwner
    const repo = core.getInput('repo', {required: false}) || currentRepo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bodyFileContent: any = null
    if (bodyPath !== '' && !!bodyPath) {
      try {
        bodyFileContent = fs.readFileSync(bodyPath, {encoding: 'utf8'})
      } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
      }
    }

    //Check for tags
    let execTag = ''
    let execErr = ''

    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          execTag += data.toString()
        },
        stderr: (data: Buffer) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          execErr += data.toString()
        }
      }
    }

    const prevTag = await exec.exec(
      'git describe --abbrev=0 --tags',
      [''],
      options
    )
    const cleanTag = semver.clean(execTag) || '6.6.6'
    const nextTag = semver.inc(cleanTag, 'patch')
    core.info(`'Clean tag: ${cleanTag}`)
    core.info(`'Previous tag: ${prevTag}`)
    core.info(`'Next tag: ${nextTag}`)

    // Create a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    const createReleaseResponse = await github.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: releaseName || tag,
      body: bodyFileContent || body,
      draft,
      prerelease,
      target_commitish: commitish
    })

    // Get the ID, html_url, and upload URL for the created Release from the response
    const {
      data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
    } = createReleaseResponse

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', releaseId)
    core.setOutput('html_url', htmlUrl)
    core.setOutput('upload_url', uploadUrl)
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with ${error.message}`)
  }
}
