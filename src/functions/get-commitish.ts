import * as core from '@actions/core'
import {getDefaultBranch} from './get-default-branch'

export async function getCommitish(): Promise<string> {
  const defaultBranch = await getDefaultBranch()

  const commitish = core.getInput('commitish', {required: false}) || defaultBranch

  core.info(`Commitish: '${commitish}'`)

  return commitish
}
