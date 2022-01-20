jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('assert')

const core = require('@actions/core')
import {getRecentRelease} from '../../src/functions/get-recent-release'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')

describe('Get Recent Release Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('listReleases endpoint is called', async () => {
    await getRecentRelease()

    expect(github.rest.repos.listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 1,
      page: 1
    })
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await getRecentRelease()

    expect(core.info).toHaveBeenNthCalledWith(1, 'Retrieving the most recent release...')
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `Previous release cannot be found with reason Cannot read properties of undefined (reading 'data'). Defaulting tag.`
    )
    expect(core.info).toHaveBeenNthCalledWith(3, `Tag Name: '0.1.0'`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Draft: 'false'`)
    expect(core.info).toHaveBeenNthCalledWith(5, `Release ID: '0'`)
  })
})
