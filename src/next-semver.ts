import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as semver from 'semver'
import {context, getOctokit} from '@actions/github'

export async function run(): Promise<void> {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const repoToken = core.getInput('repo-token', {required: true})
    core.setSecret(repoToken)
    const github = getOctokit(repoToken)

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
    const commitish = core.getInput('commitish', {required: false}) || 'main' //find default branch

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

    //Check for tags & propose next tag
    let execTag = '0.1.0'
    const options = {
      listeners: {
        stdout: data => {
          execTag = data.toString()
        }
      }
    }
    try {
      await exec.exec('git describe --abbrev=0 --tags', [], options)
    } catch (error) {
      if (error instanceof Error)
        core.info(
          `Git failed to find tag with error: ${error.message}. Defaulting tag to v0.1.0`
        )
    }
    const cleanTag = semver.clean(execTag) || '0.0.0'
    const nextTag = `v${semver.inc(cleanTag, 'patch')}` || 'v0.1.0'
    core.info(`'Clean tag: ${cleanTag}`)
    core.info(`'Previous tag: ${execTag}`)
    core.info(`'Next tag: ${nextTag}`)

    // List releases
    /*     const listReleaseResponse = await github.rest.repos.listReleases({
      owner,
      repo,
      per_page: 1,
      page: 1
    }) */

    // Create a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    const createReleaseResponse = await github.rest.repos.createRelease({
      owner,
      repo,
      tag_name: nextTag,
      name: releaseName || nextTag || tag,
      body: bodyFileContent || body,
      draft,
      prerelease,
      target_commitish: commitish,
      generate_release_notes: true
    })

    // Get the ID, html_url, and upload URL for the created Release from the response
    const {
      data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
    } = createReleaseResponse

    /*     //Create release notes
    try {
      await github.rest.repos.generateReleaseNotes({
        owner,
        repo,
        tag_name: nextTag
      })
    } catch (error) {
      if (error instanceof Error)
        core.info(`Failed to generate release notes: ${error.message}.`)
    } */

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', releaseId)
    core.setOutput('html_url', htmlUrl)
    core.setOutput('upload_url', uploadUrl)
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with ${error.message}`)
  }
}
