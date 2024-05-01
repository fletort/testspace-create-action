/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')

// Test Data
const repoAlreadyCreated = 'user/project1'
const existingProject = {
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
}

const repoToCreate = 'user/project2'
const domain = 'user'
const token = 'azerty'
const createdProject = {
  id: 256,
  name: 'user:project2',
  description: 'STUB',
  created_at: '2024-04-27T13:45:01.000-07:00',
  updated_at: '2024-04-27T13:45:01.000-07:00',
  is_private: false,
  archived: false,
  source_repo_url: 'https://github.com/user/project2',
  issues_provider: 'github:user/project2',
  spaces_url: 'https://user.testspace.com/api/projects/123/spaces'
}

// Spy the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const infoMock = jest.spyOn(core, 'info').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Spy the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the web api call
jest.mock('../src/testspace-api')
const { getProjects, createProject } = require('../src/testspace-api')
getProjects.mockImplementation(() => Promise.resolve([existingProject]))
createProject.mockImplementation(() => Promise.resolve(createdProject))

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('create a new testspace projet if not existing', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repository':
          return repoToCreate
        case 'domain':
          return domain
        case 'token':
          return token
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that Get Project was used
    expect(getProjects).toHaveBeenCalledTimes(1)
    expect(getProjects).toHaveBeenCalledWith(domain, token)

    // Verify that Create Project was used
    expect(createProject).toHaveBeenCalledTimes(1)
    expect(createProject).toHaveBeenCalledWith(domain, token, repoToCreate)

    // Verifiy Information Send on project Creation
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      'TestSpace Project is going to be created'
    )
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      `The TestSpace Project ${createdProject.name} was created with id ${createdProject.id}`
    )

    // Verifiy Output Send to core function
    expect(setOutputMock).toHaveBeenCalledWith('id', createdProject.id)
    expect(setOutputMock).toHaveBeenCalledWith('name', createdProject.name)

    // Verif no Error Send to core function
    expect(setFailedMock).toHaveBeenCalledTimes(0)
  })

  it('does not create a new testspace projet if existing', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repository':
          return repoAlreadyCreated
        case 'domain':
          return domain
        case 'token':
          return token
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that Get Project was used
    expect(getProjects).toHaveBeenCalledTimes(1)
    expect(getProjects).toHaveBeenCalledWith(domain, token)

    // Verify that Create Project was not used
    expect(createProject).toHaveBeenCalledTimes(0)

    // Verifiy Information Send on project Creation
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `The TestSpace Project ${existingProject.name} already exists with id ${existingProject.id}`
    )

    // Verifiy Output Send to core function
    expect(setOutputMock).toHaveBeenCalledWith('id', existingProject.id)
    expect(setOutputMock).toHaveBeenCalledWith('name', existingProject.name)

    // Verif no Error Send to core function
    expect(setFailedMock).toHaveBeenCalledTimes(0)
  })

  it('return error on get api problem', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repository':
          return repoToCreate
        case 'domain':
          return domain
        case 'token':
          return token
      }
    })

    // Mock get API with Exception
    getProjects.mockImplementation(() => Promise.reject(new Error('stub')))

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that Get Project was used
    expect(getProjects).toHaveBeenCalledTimes(1)
    expect(getProjects).toHaveBeenCalledWith(domain, token)

    // Verify that Create Project was not used
    expect(createProject).toHaveBeenCalledTimes(0)

    // Verif Error Send to core function
    expect(setFailedMock).toHaveBeenCalledTimes(1)
  })

  it('return error on create api problem', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repository':
          return repoToCreate
        case 'domain':
          return domain
        case 'token':
          return token
      }
    })

    // Mock createProject API with Exception
    getProjects.mockImplementation(() => Promise.resolve([existingProject]))
    createProject.mockImplementation(() => Promise.reject(new Error('stub')))

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that Get Project was used
    expect(getProjects).toHaveBeenCalledTimes(1)
    expect(getProjects).toHaveBeenCalledWith(domain, token)

    // Verify that Create Project was used
    expect(createProject).toHaveBeenCalledTimes(1)
    expect(createProject).toHaveBeenCalledWith(domain, token, 'user/project2')

    // Verif Error Send to core function
    expect(setFailedMock).toHaveBeenCalledTimes(1)
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'token':
          throw new Error('Input required and not supplied: token')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: token'
    )
  })
})
