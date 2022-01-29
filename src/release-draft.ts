import * as core from '@actions/core'
import {createDraft} from './functions/create-draft'
import {createNextTag} from './functions/create-next-tag'
import {createNotes} from './functions/create-notes'
import {getNextReleaseType} from './functions/get-next-release-type'
import {getOpenPullRequestExists} from './functions/get-pr-target-count'
import {getRecentRelease} from './functions/get-recent-release'
import {getReleaseType} from './functions/get-release-type'
import {publishStrategy} from './functions/get-context'
import {updateDraft} from './functions/update-draft'

export async function run(): Promise<void> {
  try {
    //Check for existence of release draft
    const {0: targetTag, 1: prevDraft, 2: prevReleaseId} = await getRecentRelease()

    // Update Release
    if (prevDraft === true) {
      //Generate release notes
      const {0: updateName, 1: updateBody} = await createNotes(targetTag)

      //Publish release if strategy is 'auto' and no open PRs exist
      if (publishStrategy === 'auto') {
        const openPullRequests = await getOpenPullRequestExists()
        if (openPullRequests === false) {
          await updateDraft(targetTag, updateName, updateBody, prevReleaseId, false)
        }
      } else {
        //Update existing draft
        await updateDraft(targetTag, updateName, updateBody, prevReleaseId, true)
      }
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
