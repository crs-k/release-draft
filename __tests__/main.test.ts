jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('semver')

const core = require('@actions/core')
const {context, getOctokit} = require('@actions/github')
import {run} from '../src/next-semver'

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
      data: {id: 'releaseId'}
    })

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    }

    const github = {
      rest: {
        repos: {listReleases, generateReleaseNotes, updateRelease}
      }
    }

    getOctokit.mockImplementation(() => github)
  })

  test('List Releases endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('owner')
      .mockReturnValueOnce('repo')
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('1')

    await run()

    expect(listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 1,
      page: 1
    })
  })

  test('Generate Release Notes endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('owner')
      .mockReturnValueOnce('repo')
      .mockReturnValueOnce('v1.0.0')

    await run()

    expect(generateReleaseNotes).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0'
    })
  })

  test('Update Release endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('owner')
      .mockReturnValueOnce('repo')
      .mockReturnValueOnce('releaseId')
      .mockReturnValueOnce('v1.0.0')

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
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('owner')
      .mockReturnValueOnce('repo')
      .mockReturnValueOnce('releaseId')
      .mockReturnValueOnce('v1.0.0')

    core.setOutput = jest.fn()
    await run()
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'update_id', 'releaseId')
  })

  test('Action fails elegantly', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('owner')
      .mockReturnValueOnce('repo')
      .mockReturnValueOnce('releaseId')
      .mockReturnValueOnce('v1.0.0')

    updateRelease.mockRestore()
    updateRelease.mockImplementation(() => {
      throw new Error('Error creating release')
    })
    core.setOutput = jest.fn()
    core.setFailed = jest.fn()

    await run()

    expect(updateRelease).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Action failed with Error creating release'
    )
    expect(core.setOutput).toHaveBeenCalledTimes(0)
  })
})
