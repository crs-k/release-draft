import * as core from '@actions/core'
//import * as fs from 'fs'
import * as semver from 'semver'
import {context, getOctokit} from '@actions/github'

export async function run(): Promise<void> {
  try {
    // Get authenticated GitHub client
    const repoToken = core.getInput('repo-token', {required: true})
    core.setSecret(repoToken)
    const github = getOctokit(repoToken)

    // Get owner and repo from context of payload that triggered the action
    const {owner: currentOwner, repo: currentRepo} = context.repo

    /*     // Get the inputs from the workflow file
    const tagName = core.getInput('tag_name', {required: true})

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = tagName.replace('refs/tags/', '')
    const releaseName = core
      .getInput('release_name', {required: false})
      .replace('refs/tags/', '') */
    // const body = core.getInput('body', {required: false})
    // const draft = core.getInput('draft', {required: false}) === 'true'
    // const prerelease = core.getInput('prerelease', {required: false}) === 'true'
    const commitish = core.getInput('commitish', {required: false}) || 'main' //find default branch

    // const bodyPath = core.getInput('body_path', {required: false})
    const owner = core.getInput('owner', {required: false}) || currentOwner
    const repo = core.getInput('repo', {required: false}) || currentRepo
    /*     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bodyFileContent: any = null
    if (bodyPath !== '' && !!bodyPath) {
      try {
        bodyFileContent = fs.readFileSync(bodyPath, {encoding: 'utf8'})
      } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
      }
    } */

    //List most recent release
    const listReleaseResponse = await github.rest.repos.listReleases({
      owner,
      repo,
      per_page: 1,
      page: 1
    })

    //Check if release is a draft, assign tag, assign release id
    let targetTag = '0.1.0'
    let prevDraft = false
    let prevReleaseId = 0

    try {
      ;({
        data: [{tag_name: targetTag, draft: prevDraft, id: prevReleaseId}]
      } = listReleaseResponse)

      core.info(
        `Prev tag: ${targetTag}, Prev Release Type: ${prevDraft}, Prev Release ID: ${prevReleaseId}`
      )
    } catch (error) {
      if (error instanceof Error)
        core.info(
          `Failed to find tag with error: ${error.message}. Defaulting tag to ${targetTag}.`
        )
    }

    // Update Release
    //Check that a previous Release Draft exists
    if (prevDraft === true) {
      //Generate release notes based on previous release id
      const generateReleaseNotesResponse =
        await github.rest.repos.generateReleaseNotes({
          owner,
          repo,
          tag_name: targetTag
        })
      //Assign output for use in release update
      const {
        data: {name: updateName, body: updateBody}
      } = generateReleaseNotesResponse

      core.info(`Targeted: ${targetTag}`)
      core.info(`Generated Name: ${updateName}`)
      core.info(`Generated Body: ${updateBody}`)

      //Update existing draft
      const updateReleaseResponse = await github.rest.repos.updateRelease({
        owner,
        repo,
        release_id: prevReleaseId,
        tag_name: targetTag,
        name: updateName,
        body: updateBody
      })
      const {
        data: {id: updateReleaseId}
      } = updateReleaseResponse
      core.setOutput('update_id', updateReleaseId)
    } else {
      // Create a release
      // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release

      const cleanTag = semver.clean(targetTag) || '0.1.0'
      const nextTag = `v${semver.inc(cleanTag, 'patch')}` || 'v0.1.0'

      core.info(`Clean tag: ${cleanTag}`)
      core.info(`Previous tag: ${targetTag}`)
      core.info(`Next tag: ${nextTag}`)
      core.info(`Draft?: ${prevDraft}`)
      core.info(`Prev Release ID: ${prevReleaseId}`)

      const createReleaseResponse = await github.rest.repos.createRelease({
        owner,
        repo,
        tag_name: nextTag,
        name: nextTag,
        target_commitish: commitish,
        generate_release_notes: true
      })

      // Get the ID, html_url, and upload URL for the created Release from the response
      const {
        data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
      } = createReleaseResponse

      // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
      core.setOutput('id', releaseId)
      core.setOutput('html_url', htmlUrl)
      core.setOutput('upload_url', uploadUrl)
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with ${error.message}`)
  }
}
