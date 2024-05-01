const core = require('@actions/core')
const { createProject, getProjects } = require('./testspace-api')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const repo = core.getInput('repository', { required: true })
    const token = core.getInput('token', { required: true })
    const domain = core.getInput('domain', { required: true })

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Get Projects already defined`)
    const projects = await getProjects(domain, token)
    core.debug(`Defined Projects are ${projects}`)

    let project = projects.find(
      element => element.source_repo_url === `https://github.com/${repo}`
    )
    if (project === undefined) {
      core.info(`TestSpace Project is going to be created`)
      project = await createProject(domain, token, repo)
      core.info(
        `The TestSpace Project ${project.name} was created with id ${project.id}`
      )
    } else {
      core.info(
        `The TestSpace Project ${project.name} already exists with id ${project.id}`
      )
    }

    // Set outputs for other workflow steps to use
    core.setOutput('id', project.id)
    core.setOutput('name', project.name)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
