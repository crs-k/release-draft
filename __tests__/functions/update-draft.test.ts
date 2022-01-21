jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('assert')

const core = require('@actions/core')
import {updateDraft} from '../../src/functions/update-draft'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')
let targetTag = 'v1.0.0'
let updateName = 'updateName'
let updateBody = 'updateBody'
let prevReleaseId = 0

describe('Update Draft Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('updateDraft endpoint is called', async () => {
    await updateDraft(targetTag, updateName, updateBody, prevReleaseId)

    expect(github.rest.repos.updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      release_id: prevReleaseId,
      tag_name: targetTag,
      name: updateName,
      body: updateBody,
      draft: true
    })
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await updateDraft(targetTag, updateName, updateBody, prevReleaseId)

    expect(core.info).toHaveBeenNthCalledWith(1, 'Updating Release Draft...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Release ID: '0'`)
    expect(core.info).toHaveBeenNthCalledWith(3, `HTML URL: ''`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Upload URL: ''`)
  })

  /*   test('Outputs are set', async () => {
    core.output = jest.fn()
    await updateDraft(targetTag, updateName, updateBody, prevReleaseId)

    expect(core.output).toHaveBeenNthCalledWith(1, 'Updating Release Draft...')
    expect(core.output).toHaveBeenNthCalledWith(2, `Release ID: '0'`)
    expect(core.output).toHaveBeenNthCalledWith(3, `HTML URL: ''`)
    expect(core.output).toHaveBeenNthCalledWith(4, `Upload URL: ''`)
  })  */
})
