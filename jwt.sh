#!/bin/bash

interval=60 # second unit

while true; do
	echo "Running Playwright test at $(date)..."

	npx playwright test tests/jwt.spec.ts

	sleep ${interval}
done
