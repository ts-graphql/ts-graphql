#!/usr/bin/env bash

set -e

npx jest --coverage --coverageReporters=text-lcov | npx coveralls
