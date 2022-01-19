jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('semver/functions/clean')
jest.mock('semver/functions/inc')
//jest.mock('../src/functions/get-context')

import {github, owner, repo} from '../src/functions/get-context'
import {createNotes} from '../src/functions/create-notes'

/* eslint-disable no-undef */
describe('Existing Draft Release Update', () => {
  let listReleases
  let generateReleaseNotes
  let updateRelease

  beforeEach(() => {
    listReleases = jest.fn().mockReturnValueOnce({
      data: [{tag_name: 'v1.0.0', draft: true, id: 'releaseId'}]
    })

    generateReleaseNotes = jest.fn().mockReturnValueOnce({
      data: {name: 'updateName', body: 'updateBody'}
    })

    updateRelease = jest.fn().mockReturnValueOnce({
      data: {id: 'releaseId', html_url: 'htmlUrl', upload_url: 'uploadUrl'}
    })
  })

  test('2 + 3 = 5', () => {
    expect(2 + 3).toBe(5)
  })
  /*
  test('List Releases endpoint is called', async () => {
    jest.mock('../src/functions/get-context', () => ({
      get owner () {
        return 'owner' // set some default value
      }
    }))
    await createNotes('1.0.0')

    expect(createNotes).toHaveBeenCalledWith({
      targetTag: '1.0.0'
    })
  })

  test('Generate Release Notes endpoint is called', async () => {
    await run()

    expect(generateReleaseNotes).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0'
    })
  })

  test('Update Release endpoint is called', async () => {
    await run()

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      release_id: 'releaseId',
      tag_name: 'v1.0.0',
      name: 'updateName',
      body: 'updateBody',
      draft: true
    })
  })

  test('Outputs are set', async () => {
    core.setOutput = jest.fn()
    await run()
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'id', 'releaseId')
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'html_url', 'htmlUrl')
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'upload_url', 'uploadUrl')
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await run()

    expect(core.info).toHaveBeenNthCalledWith(1, 'Targeted: v1.0.0')
    expect(core.info).toHaveBeenNthCalledWith(2, 'Draft?: true')
    expect(core.info).toHaveBeenNthCalledWith(3, 'Previous Release ID: releaseId')
    expect(core.info).toHaveBeenNthCalledWith(4, 'Generated Name: updateName')
    expect(core.info).toHaveBeenNthCalledWith(5, 'Generated Body: updateBody')
  })

  test('Action fails elegantly', async () => {
    updateRelease.mockRestore()
    updateRelease.mockImplementation(() => {
      throw new Error('Error creating release')
    })
    core.setOutput = jest.fn()
    core.setFailed = jest.fn()

    await run()

    expect(updateRelease).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith('Action failed with Error creating release')
    expect(core.setOutput).toHaveBeenCalledTimes(0)
  })
})

describe('New Draft Release Creation', () => {
  let listReleases
  let createRelease

  beforeEach(() => {
    listReleases = jest.fn().mockReturnValueOnce({
      data: [{tag_name: undefined, draft: null, id: null}] //changed to nulls to test fresh repos
    })

    createRelease = jest.fn().mockReturnValueOnce({
      data: {id: 'releaseId', html_url: 'htmlUrl', upload_url: 'uploadUrl'}
    })

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    }

    const github = {
      rest: {
        repos: {listReleases, createRelease}
      }
    }

    getOctokit.mockImplementation(() => github)
  })

  test('List Releases endpoint is called', async () => {
    await run()

    expect(listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 1,
      page: 1
    })
  })

  test('Create Release endpoint is called', async () => {
    core.getInput = jest.fn().mockReturnValueOnce('main')

    await run()

    expect(createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v0.1.0',
      name: 'v0.1.0',
      target_commitish: 'main',
      draft: true,
      generate_release_notes: true
    })
  })

  test('Outputs are set', async () => {
    core.setOutput = jest.fn()
    await run()

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'id', 'releaseId')
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'html_url', 'htmlUrl')
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'upload_url', 'uploadUrl')
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await run()

    expect(core.info).toHaveBeenNthCalledWith(1, 'Targeted: 0.1.0')
    expect(core.info).toHaveBeenNthCalledWith(2, 'Draft?: false')
    expect(core.info).toHaveBeenNthCalledWith(3, 'Previous Release ID: 0')
    expect(core.info).toHaveBeenNthCalledWith(4, 'Next tag: v0.1.0')
  })

  test('Action fails elegantly', async () => {
    createRelease.mockRestore()
    createRelease.mockImplementation(() => {
      throw new Error('Error creating release')
    })
    core.setOutput = jest.fn()
    core.setFailed = jest.fn()

    await run()

    expect(createRelease).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith('Action failed with Error creating release')
    expect(core.setOutput).toHaveBeenCalledTimes(0)
  }) */
})
