jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('assert')

const core = require('@actions/core')
const branch = require('../../src/functions/get-default-branch')
import {getDefaultBranch} from '../../src/functions/get-default-branch'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')

describe('Get Default Branch Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('getDefaultBranch endpoint is called', async () => {
    await getDefaultBranch()

    expect(github.rest.repos.get).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo'
    })
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await getDefaultBranch()

    expect(core.info).toHaveBeenNthCalledWith(1, 'Retrieving the default branch name...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Default branch: ''`)
  })
})
