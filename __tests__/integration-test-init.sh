#!/bin/bash

PROJECT_NAME="${GITHUB_REPOSITORY##*/}-int-test"
echo "PROJECT_NAME=${PROJECT_NAME}" >> "$GITHUB_ENV"
echo -e "Check if the project ${PROJECT_NAME} already exits, create it if needed."
project_exist=$(gh repo list --json name --jq ".[] | select(.name | contains(\"${PROJECT_NAME}\")) | .name")
if [[ -n $project_exist ]]; then
  echo -e "==> The project ${PROJECT_NAME} already exits."
else
  echo -e "==> The project ${PROJECT_NAME} is going to be created."
  gh repo create "$PROJECT_NAME" --public
  echo -e "==> The project ${PROJECT_NAME} is created."
fi
echo -e "Check if the project does not exits on TestSpace Side."
http_response=$(curl -o response.txt -w "%{response_code}" --no-progress-meter -X GET -H "Authorization: Token ${TESTSPACE_TOKEN}" "https://fletort.testspace.com/api/projects")
if [ "${http_response}" != "200" ]; then
  echo -e "FATAL: Error when trying to get project list from testspace (${http_response})."
  cat response.txt
  exit 1
fi
found=$(jq ".[] | select(.source_repo_url==\"https://github.com/${GITHUB_REPOSITORY_OWNER}/$PROJECT_NAME\")" response.txt)
if [[ -z "$found" ]]; then
echo -e "==> The TestSpace Project linked to github project ${PROJECT_NAME} does not exist."
else
  testspace_project_id=$(jq '.id' <<< "${found}")
  echo -e "==> The TestSpace Project linked to github project ${PROJECT_NAME} already exits with id $testspace_project_id. -> Delete it."
  http_response=$(curl -o response.txt -w "%{response_code}" --no-progress-meter -X DELETE -H "Authorization: Token ${TESTSPACE_TOKEN}" "https://fletort.testspace.com/api/projects/$testspace_project_id")
  if [ "${http_response}" != "204" ]; then
    echo -e "FATAL: Error when trying to delete the testspace project (${http_response})."
    cat response.txt
    exit 1
  fi
  echo -e "==> The TestSpace Project linked to github project ${PROJECT_NAME} does not exist anymore."
fi