import * as core from '@actions/core'

import {createDraft} from './functions/create-draft'
import {createNextTag} from './functions/create-next-tag'
import {createNotes} from './functions/create-notes'
import {getNextReleaseType} from './functions/get-next-release-type'
import {getRecentRelease} from './functions/get-recent-release'
import {getReleaseType} from './functions/get-release-type'
import {updateDraft} from './functions/update-draft'

export async function run(): Promise<void> {
  try {
    //Check for existence of release draft
    const {0: targetTag, 1: prevDraft, 2: prevReleaseId} = await getRecentRelease()

    //Check previous release type
    //if (prevDraft === false && prevReleaseId !== 0) {

    //}

    // Update Release
    if (prevDraft === true) {
      //Generate release notes
      const {0: updateName, 1: updateBody} = await createNotes(targetTag)

      //Update existing draft
      await updateDraft(targetTag, updateName, updateBody, prevReleaseId)
    } else if (prevDraft === false && prevReleaseId !== 0) {
      const previousReleaseType = await getReleaseType(targetTag)
      const nextReleaseType = await getNextReleaseType(previousReleaseType)
      const nextTag = await createNextTag(targetTag, nextReleaseType)
      await createDraft(nextTag, nextReleaseType)
    } else {
      // Create a new draft
      const previousReleaseType = await getReleaseType(targetTag)
      const nextReleaseType = await getNextReleaseType(previousReleaseType)
      const nextTag = await createNextTag(targetTag, nextReleaseType)
      await createDraft(nextTag, nextReleaseType)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(`Action failed with ${error.message}`)
  }
}
