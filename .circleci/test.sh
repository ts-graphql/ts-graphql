#!/usr/bin/env bash

set -eo pipefail

npx jest -w 1 --coverage --coverageReporters=text-lcov | npx coveralls
