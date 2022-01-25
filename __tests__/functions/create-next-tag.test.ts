jest.mock('@actions/core')
const core = require('@actions/core')
import {createNextTag} from '../../src/functions/create-next-tag'
import {github} from '../../src/functions/get-context'

jest.mock('../../src/functions/get-context')

describe('Create Next Tag Function', () => {
  test('Infos are set (semver compliant tag)', async () => {
    let targetTag = 'v1.2.3'

    //jest.mock('../../src/functions/get-context', () => bumpType)
    //const {bumpType} = require('../../src/functions/get-context')

    core.info = jest.fn()
    await createNextTag(targetTag)
    //expect(bumpType).toBe('patch')
    expect(core.info).toHaveBeenNthCalledWith(1, 'Generating Next tag...')
    expect(core.info).toHaveBeenNthCalledWith(2, `Bump Type: major`)
    expect(core.info).toHaveBeenNthCalledWith(3, `Next tag: v2.0.0`)
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
    expect(core.info).toHaveBeenNthCalledWith(3, `Bump Type: major`)
    expect(core.info).toHaveBeenNthCalledWith(4, `Next tag: v0.1.0`)
  })
})
