jest.mock('@actions/core')

const core = require('@actions/core')
import {createNextTag} from '../../src/functions/create-next-tag'

describe('Create Next Tag Function', () => {
  test('Infos are set (semver compliant tag)', async () => {
    let targetTag = 'v1.2.3'
    core.info = jest.fn()
    await createNextTag(targetTag)

    expect(core.info).toHaveBeenNthCalledWith(1, 'Generating Next tag...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Bump Type: patch`)
    expect(core.info).toHaveBeenNthCalledWith(3, `Next tag: v1.2.4`)
  })

  test('Infos are set (semver noncompliant tag)', async () => {
    let targetTag = 'BAD'
    core.info = jest.fn()
    await createNextTag(targetTag)

    expect(core.info).toHaveBeenNthCalledWith(1, 'Generating Next tag...')
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `Next tag failed to generate. Defaulting to v0.1.0`
    )
    expect(core.info).toHaveBeenNthCalledWith(3, `Bump Type: patch`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Next tag: v0.1.0`)
  })
})
