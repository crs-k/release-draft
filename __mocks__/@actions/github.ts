export const context = {
  repo: {
    owner: 'owner',
    repo: 'repo'
  }
}

const github = {
  rest: {
    repos: {
      get: jest.fn(),
      listReleases: jest.fn(),
      generateReleaseNotes: jest.fn(),
      updateRelease: jest.fn(),
      createRelease: jest.fn()
    }
  }
}

export const getOctokit = jest.fn().mockImplementation(() => github)
