jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('assert')

const core = require('@actions/core')
import {createNotes} from '../../src/functions/create-notes'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')
let targetTag = 'v1.0.0'

describe('Create Notes Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('createNotes endpoint is called', async () => {
    await createNotes(targetTag)

    expect(github.rest.repos.generateReleaseNotes).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: targetTag
    })
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await createNotes(targetTag)

    expect(core.info).toHaveBeenNthCalledWith(1, 'Generating Release Notes...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Release Notes failed to generate.`)
    expect(core.info).toHaveBeenNthCalledWith(3, `Generated name: 'Unnamed'`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Generated body: 'Unnamed'`)
  })
})
