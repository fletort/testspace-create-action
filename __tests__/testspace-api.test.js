/**
 * Unit tests for src/testspace.js
 */
const { getProjects, createProject } = require('../src/testspace-api')
const { expect } = require('@jest/globals')

// Mock the axios library
const axios = require('axios')
jest.mock('axios')

// Mock the GitHub Actions core library
const core = require('@actions/core')
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

describe('getProjects', () => {
  it('calls the correct url with token header and returns list of projects', async () => {
    const mockProjectList = [
      {
        id: 123,
        name: 'user:project1',
        description: '',
        created_at: '2024-04-27T13:45:01.000-07:00',
        updated_at: '2024-04-27T13:45:01.000-07:00',
        is_private: false,
        archived: false,
        source_repo_url: 'https://github.com/user/project1',
        issues_provider: 'github:user/project1',
        spaces_url: 'https://user.testspace.com/api/projects/123/spaces'
      },
      {
        id: 256,
        name: 'user:project2',
        description: '',
        created_at: '2024-04-28T13:55:01.000-07:00',
        updated_at: '2024-04-28T13:55:01.000-07:00',
        is_private: false,
        archived: false,
        source_repo_url: 'https://github.com/user/project2',
        issues_provider: 'github:user/project2',
        spaces_url: 'https://user.testspace.com/api/projects/256/spaces'
      }
    ]
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'

    axios.get.mockImplementation(() =>
      Promise.resolve({ data: mockProjectList })
    )

    const projects = await getProjects(testUser, testToken)
    expect(projects).toBe(mockProjectList)
    expect(axios.get).toHaveBeenCalledWith(
      `https://${testUser}.testspace.com/api/projects`,
      expect.any(Object)
    )
    const axiosGetArgs = axios.get.mock.calls[0]
    expect(axiosGetArgs[1]).toMatchObject({
      headers: { Authorization: `Token ${testToken}` }
    })

    expect(axiosGetArgs[1].validateStatus(200)).toBeTruthy()
    expect(axiosGetArgs[1].validateStatus(201)).toBeFalsy()
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle reply http error from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const mockError = { response: { status: 403, data: "c'est une erreur" } }

    axios.get.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await getProjects(testUser, testToken)
    }).rejects.toThrow(Error)
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle no http reply case from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const mockError = { request: jest.mock() }

    axios.get.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await getProjects(testUser, testToken)
    }).rejects.toThrow(Error)
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle internal error from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const mockError = new Error()

    axios.get.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await getProjects(testUser, testToken)
    }).rejects.toThrow(Error)
  })
})

describe('createProject', () => {
  it('calls the correct url with token header and project information', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const testProject = 'user/project'

    axios.post.mockImplementation(() => Promise.resolve({ data: 'toto' }))

    const project = await createProject(testUser, testToken, testProject)

    expect(axios.post).toHaveBeenCalledWith(
      `https://${testUser}.testspace.com/api/projects`,
      expect.any(Object),
      expect.any(Object)
    )
    const axiosPostArgs = axios.post.mock.calls[0]
    expect(axiosPostArgs[2]).toMatchObject({
      headers: { Authorization: `Token ${testToken}` }
    })
    expect(axiosPostArgs[2].validateStatus(201)).toBeTruthy()
    expect(axiosPostArgs[2].validateStatus(200)).toBeFalsy()

    expect(axiosPostArgs[1]).toMatchObject({
      name: testProject.replace('/', ':'),
      source_repo: `github:${testProject}`,
      is_private: false
    })

    expect(project).toBe('toto')
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle reply http error from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const testProject = 'user/project'
    const mockError = { response: { status: 403, data: "c'est une erreur" } }

    axios.post.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await createProject(testUser, testToken, testProject)
    }).rejects.toThrow(Error)
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle no http reply case from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const testProject = 'user/project'
    const mockError = { request: jest.mock() }

    axios.post.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await createProject(testUser, testToken, testProject)
    }).rejects.toThrow(Error)
  })

  // https://axios-http.com/fr/docs/handling_errors
  it('handle internal error from axios exception', async () => {
    const testUser = 'user'
    const testToken = 'qsjkdhqjk'
    const testProject = 'user/project'
    const mockError = new Error()

    axios.post.mockImplementation(() => Promise.reject(mockError))

    await expect(async () => {
      await createProject(testUser, testToken, testProject)
    }).rejects.toThrow(Error)
  })
})
