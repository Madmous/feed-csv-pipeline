# Data Pipeline

This repository main goal is :

- to architecture a simple but reliable data pipeline,
- to process data and compute metrics,
- and to build a JSON API delivering these metrics.

## Workflow

The main workflow has 6 tasks. With retries, keep in mind that the orchestrator can change the starting task.

- Fetch repositories
- Extract name
- Save current task in a file
- Fetch contributors and extract contribution count
- Transform to line
- Write line in csv

## Design choices

The data pipeline is written with streams because of the following advantages:

- time efficiency: parallelize task with pipe lining
- space efficiency: data is not stored
- readability: composability by piping streams between them

With API calls, there is always a risk of having errors. To ensure the pipeline handle retries efficiently, a file "taskOneToTwo.txt" is created once the repositories are extracted and transformed. If the next api call fails, we can retry the workflow starting from task 3.

This approach helps us save a potential API call that could either fail again, fetch too much data and make us wait a long time before having our data.

Plus, with Github API rate limit, it is important to save API calls.

## Prerequisites

First things first you will need to install all modules needed for the server

```
yarn install
```

Start the server with nodemon and automatically restart the application when files change.

```
yarn dev
```

Start the server without nodemon

```
yarn start
```

## API Features

### Start

To start the pipeline and start feeding data to your CSV, simply run the command below. bear in mind that the you cannot execute 2 pipelines at the same time. You will get an error if you are trying to start the pipeline if it is already running.

```bash
curl -X POST \http://localhost:8080/feed-csv
```

You can add query parameters to change the github user name and the retry interval;

```bash
curl -X POST 'http://localhost:8080/feed-csv?github-username=madmous&retry-interval=5'
```

### Pipeline state

The pipeline can be in 4 different states: FREE, IN_PROGRESS, SUCCESS and FAILURE.

```bash
curl -X GET \http://localhost:8080/pipeline-state
```

### Metrics

Once the pipeline finished successfully, check your metrics:

```bash
curl -X GET \http://localhost:8080/metrics
```

### Change dynamically fetch callbacks

This feature is really powerful and useful for testing errors such has Github rate limits and pipeline retries.

You can dynamically change the 2 callback functions used to fetch repositories and contributors.

Behind the scene, mocked functions are used to either simulate a successful or an unsuccessful response.

#### Set fetch repositories to be successful

```bash
curl -X POST \http://localhost:8080/test/task1-success
```

#### Set fetch repositories to be unsuccessful

```bash
curl -X POST \http://localhost:8080/test/task1-failure
```

#### Set fetch contributors to be successful

```bash
curl -X POST \http://localhost:8080/test/task2-success
```

#### Set fetch contributors to be unsuccessful

```bash
curl -X POST \http://localhost:8080/test/task2-failure
```

### Retries

The pipeline is implemented with retries in mind. Any failing task can be retried. At the moment, only failures at task 1 and 3 can be retried; since they involve IO, they are the main bottleneck for insuring reliability.

From the previous pipeline status, the orchestrator decides where to start at.

#### Fail fetching repositories

To test the retry on a potential fail during the repositories fetch follow these steps:

1. Set the fetch repositories to fail and retry every 5 seconds

```bash
curl -X POST \http://localhost:8080/test/task1-failure
```

2. Start the pipeline

```bash
curl -X POST \http://localhost:8080/feed-csv?interval=5
```

3. Set back the fetch repositories to success whenever you want to

```bash
curl -X POST \http://localhost:8080/test/task1-success
```

#### Fail fetching contributors

Following up on the repositories follow these steps to activate a retry on the contributors:

1. Set the fetch repositories to fail and retry every 5 seconds

```bash
curl -X POST \http://localhost:8080/test/task2-failure
```

2. Start the pipeline

```bash
curl -X POST \http://localhost:8080/feed-csv?interval:5
```

3. Set back the fetch repositories to success whenever you want to

```bash
curl -X POST \http://localhost:8080/test/task2-success
```

## Running the tests

There are 4 different scripts to run tests: test, test:api, test:watch and test:watch-api.
The tests use their own taskOneToTwo text file and result csv file to keep; sitting under the **tests** folder and will be purged before running tests.

#### Run all tests

```
yarn test:all
```

#### Run all tests and watch changes

```
yarn test:watch-all
```

#### Run stream tests

```
yarn test
```

#### Run stream tests and watch changes

```
yarn test:watch
```

#### Run api tests and watch changes

```
yarn test:api
```

#### Run api tests and watch changes

```
yarn test:watch-api
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Improvements

- Write task results on S3 instead of file system
- Replace the Set data structure
- The fetchContributors function reads from API and transform. The transform should be extracted in another stream to improve testability and readability. Currently, it is not possible to easily test the code that counts new contributors.
- Optimize the retry process. Especially the contributors one. An error at this task means a lot of API calls that have to be done again.
- Fetch functions are too tight with the stream implementation. Remove stream argument the functions and hide it behind a callback. For example the fetch signature could become fetch(onData, onError, onFinish); pushing data into the stream and / or emit errors.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
