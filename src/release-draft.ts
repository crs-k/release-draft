import * as core from '@actions/core'
import {
  createDraft,
  generateUpdatedReleaseNotes,
  getRecentRelease,
  updateDraft
} from './get-context'
import clean from 'semver/functions/clean'
import inc from 'semver/functions/inc'

export async function run(): Promise<void> {
  try {
    //Check for existence of release draft
    const {0: targetTag, 1: prevDraft, 2: prevReleaseId} = await getRecentRelease()

    // Update Release
    //Check that a previous Release Draft exists
    if (prevDraft === true) {
      //Generate release notes based on previous release id
      const {0: updateName, 1: updateBody} = await generateUpdatedReleaseNotes(targetTag)

      //Update existing draft
      await updateDraft(targetTag, updateName, updateBody, prevReleaseId)
    } else {
      // Create a release
      //Clean and bump version
      const cleanTag = clean(targetTag) || '0.1.0'
      const bumpTag = inc(cleanTag, 'patch') || '0.1.0'
      const nextTag = `v${bumpTag}`

      core.info(`Next tag: ${nextTag}`)

      await createDraft(nextTag)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(`Action failed with ${error.message}`)
  }
}
