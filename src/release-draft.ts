import * as core from '@actions/core'
import clean from 'semver/functions/clean'
import {createDraft} from './functions/create-draft'
import {createNotes} from './functions/create-notes'
import {getRecentRelease} from './functions/get-recent-release'
import inc from 'semver/functions/inc'
import {updateDraft} from './functions/update-draft'

export async function run(): Promise<void> {
  try {
    //Check for existence of release draft
    const {0: targetTag, 1: prevDraft, 2: prevReleaseId} = await getRecentRelease()

    // Update Release
    //Check that a previous Release Draft exists
    if (prevDraft === true) {
      //Generate release notes based on previous release id
      const {0: updateName, 1: updateBody} = await createNotes(targetTag)

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
