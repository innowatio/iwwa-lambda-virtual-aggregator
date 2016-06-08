[![Build Status](https://travis-ci.org/innowatio/iwwa-lambda-virtual-aggregator.svg?branch=master)](https://travis-ci.org/innowatio/iwwa-lambda-virtual-aggregator)
[![codecov.io](https://codecov.io/github/innowatio/iwwa-lambda-virtual-aggregator/coverage.svg?branch=master)](https://codecov.io/github/innowatio/iwwa-lambda-virtual-aggregator?branch=master)

# iwwa-lambda-virtual-aggregator

Lambda function to aggregate virtual-pods

## Deployment

This project deployment is automated with Lambdafile. For more info [`lambda-boilerplate`](https://github.com/lk-architecture/lambda-boilerplate/).

### Configuration

The following environment variables are needed to configure the function:

- `MONGODB_URL` __string__ *required*: URL of the MongoDB endpoint
- `DEBUG` __boolean__ *optional*: set to `true` if you want more log from [`kinesis-router`](https://github.com/lk-architecture/kkinesis-router/).

### Run test

In order to run tests locally a MongoDB instance and a `MONGODB_URL` environment
param are needed.
Then, just run `npm run test` command.
