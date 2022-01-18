import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {generateUpdatedReleaseNotes, getDefaultBranch, getRecentRelease} from './get-context'
import clean from 'semver/functions/clean'
import inc from 'semver/functions/inc'

export async function run(): Promise<void> {
  try {
    // Get authenticated GitHub client
    const repoToken = core.getInput('repo-token', {required: true})
    core.setSecret(repoToken)
    const github = getOctokit(repoToken)

    // Get owner and repo from context of payload that triggered the action
    const {owner: owner, repo: repo} = context.repo

    //Find default branch
    const defaultBranch = await getDefaultBranch(repoToken, owner, repo)
    const commitish = core.getInput('commitish', {required: false}) || defaultBranch //find default branch

    //Check if release is a draft, assign tag, assign release id
    const listReleaseResponse = await getRecentRelease(repoToken, owner, repo)
    const {0: targetTag, 1: prevDraft, 2: prevReleaseId} = listReleaseResponse

    // Update Release
    //Check that a previous Release Draft exists
    if (prevDraft === true) {
      //Generate release notes based on previous release id
      const generateReleaseNotesResponse = await generateUpdatedReleaseNotes(
        repoToken,
        owner,
        repo,
        targetTag
      )

      //Assign output for use in release update
      const {0: updateName, 1: updateBody} = generateReleaseNotesResponse

      //Update existing draft
      const updateReleaseResponse = await github.rest.repos.updateRelease({
        owner,
        repo,
        release_id: prevReleaseId,
        tag_name: targetTag,
        name: updateName,
        body: updateBody,
        draft: true
      })

      // Get the ID, html_url, and upload URL for the created Release from the response
      const {
        data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
      } = updateReleaseResponse

      // Set output variables
      core.setOutput('id', releaseId)
      core.setOutput('html_url', htmlUrl)
      core.setOutput('upload_url', uploadUrl)
    } else {
      // Create a release
      //Clean and bump version
      const cleanTag = clean(targetTag) || '0.1.0'
      const bumpTag = inc(cleanTag, 'patch') || '0.1.0'
      const nextTag = `v${bumpTag}`

      core.info(`Next tag: ${nextTag}`)

      const createReleaseResponse = await github.rest.repos.createRelease({
        owner,
        repo,
        tag_name: nextTag,
        name: nextTag,
        target_commitish: commitish,
        draft: true,
        generate_release_notes: true
      })

      // Get the ID, html_url, and upload URL for the created Release from the response
      const {
        data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
      } = createReleaseResponse

      // Set output variables
      core.setOutput('id', releaseId)
      core.setOutput('html_url', htmlUrl)
      core.setOutput('upload_url', uploadUrl)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(`Action failed with ${error.message}`)
  }
}
