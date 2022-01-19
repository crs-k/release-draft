import * as core from '@actions/core'
import {createDraft} from './functions/create-draft'
import {createNextTag} from './functions/create-next-tag'
import {createNotes} from './functions/create-notes'
import {getRecentRelease} from './functions/get-recent-release'
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

      const nextTag = await createNextTag(targetTag)
      await createDraft(nextTag)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(`Action failed with ${error.message}`)
  }
}
