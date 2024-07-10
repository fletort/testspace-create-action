#!/bin/bash

http_response=$(curl -o response.txt -w "%{response_code}" --no-progress-meter -X DELETE -H "Authorization: Token ${TESTSPACE_TOKEN}" "https://fletort.testspace.com/api/projects/${TESTSPACE_PROJECT_ID}")
if [ "${http_response}" == "204" ]; then
	echo "TestSpace project deleted"
fi
