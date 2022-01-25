import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

const repoToken = core.getInput('repo-token', {required: true})
core.setSecret(repoToken)
export const github = getOctokit(repoToken)
export const {owner: owner, repo: repo} = context.repo
export const bumpType = core.getInput('bump', {required: false})
export const releaseStrategy = core.getInput('release-strategy', {required: false})
