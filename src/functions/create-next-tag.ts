import * as assert from 'assert'
import * as core from '@actions/core'
import {ReleaseType} from 'semver'
import clean from 'semver/functions/clean'
import inc from 'semver/functions/inc'

const bump = core.getInput('bump', {required: false}) || 'patch'
let releaseType: ReleaseType

switch (bump) {
  case 'major':
    releaseType = 'major'
    break
  case 'minor':
    releaseType = 'minor'
    break
  case 'patch':
    releaseType = 'patch'
    break
  case 'premajor':
    releaseType = 'premajor'
    break
  case 'preminor':
    releaseType = 'preminor'
    break
  case 'prepatch':
    releaseType = 'prepatch'
    break
  case 'prerelease':
    releaseType = 'prerelease'
    break
}

export async function createNextTag(targetTag: string): Promise<string> {
  core.info('Generating Next tag...')
  let nextTag: string

  try {
    //Clean and bump version
    const cleanTag = clean(targetTag) || '0.1.0'
    const bumpTag = inc(cleanTag, releaseType) || '0.1.0'
    nextTag = `v${bumpTag}`

    assert.ok(nextTag, 'next tag cannot be empty')
  } catch (err) {
    core.info('Next tag failed to generate. Defaulting to v0.1.0')
    nextTag = 'v0.1.0'
  }
  const data = nextTag
  // Next tag
  core.info(`Bump Type: ${releaseType.toString()}`)
  core.info(`Next tag: ${nextTag}`)

  return data
}