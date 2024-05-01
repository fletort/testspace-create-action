const core = require('@actions/core')
const axios = require('axios')

async function getProjects(domain, token) {
  try {
    const projects_res = await axios.get(
      `https://${domain}.testspace.com/api/projects`,
      {
        headers: { Authorization: `Token ${token}` },
        validateStatus(status) {
          return status === 200
        }
      }
    )
    return projects_res.data
  } catch (err) {
    // https://axios-http.com/fr/docs/handling_errors
    if (err.response) {
      // The request was made and the server responded with an error status code
      throw new Error(
        `Error ${err.response.status} when trying to get project list from testspace (${domain}). ${JSON.stringify(err.response.data)}`
      )
    } else if (err.request) {
      // The request was made but no response was received
      throw new Error(
        `Timeout (no reply) when trying to get project list from testspace (${domain}).`
      )
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Internal Error: ${err.message}`)
    }
  }
}

async function createProject(domain, token, githubRepo) {
  try {
    const response = await axios.post(
      `https://${domain}.testspace.com/api/projects`,
      {
        name: githubRepo.replace('/', ':'),
        source_repo: `github:${githubRepo}`,
        is_private: false
      },
      {
        headers: { Authorization: `Token ${token}` },
        validateStatus(status) {
          return status === 201
        }
      }
    )
    return response.data
  } catch (err) {
    // https://axios-http.com/fr/docs/handling_errors
    if (err.response) {
      // The request was made and the server responded with an error status code
      throw new Error(
        `Error ${err.response.status} when trying to create project for repo ${githubRepo} in testspace (${domain}). ${JSON.stringify(err.response.data)}`
      )
    } else if (err.request) {
      // The request was made but no response was received
      throw new Error(
        `Timeout (no reply) when trying to create project for repo ${githubRepo} in testspace (${domain})`
      )
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Internal Error: ${err.message}`)
    }
  }
}

module.exports = {
  getProjects,
  createProject
}
