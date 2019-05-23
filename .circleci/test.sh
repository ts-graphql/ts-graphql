#!/usr/bin/env bash

set -eo pipefail

npx jest --coverage --coverageReporters=text-lcov | npx coveralls
