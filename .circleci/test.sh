#!/usr/bin/env bash

set -e

output=$(npx jest --coverage --coverageReporters=text-lcov)

echo "${output}" | npx coveralls
