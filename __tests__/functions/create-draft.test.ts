jest.mock('@actions/core')
jest.mock('../../src/functions/get-default-branch')

const core = require('@actions/core')
import {createDraft} from '../../src/functions/create-draft'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')
let targetTag = 'v1.0.0'
let commitish = 'main'
let nextReleaseType = 'beta'

describe('Create Draft Function', () => {
  test('createRelease endpoint is called', async () => {
    await createDraft(targetTag, nextReleaseType)

    expect(github.rest.repos.createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: targetTag,
      name: targetTag,
      target_commitish: commitish,
      draft: true,
      generate_release_notes: true,
      prerelease: true
    })
  })

  test('Infos are set', async () => {
    core.info = jest.fn()
    await createDraft(targetTag, nextReleaseType)

    expect(core.info).toHaveBeenNthCalledWith(1, 'Creating Release Draft...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Release ID: '0'`)
    expect(core.info).toHaveBeenNthCalledWith(3, `HTML URL: ''`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Upload URL: ''`)
  })
})
