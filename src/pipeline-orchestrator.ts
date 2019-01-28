import logger from './logger';
import {
  fetchContributors,
  fetchRepositories,
  FetchRepositories,
  FetchContributors,
} from './pipeline-fetch';
import { ErrorHandler, FinishHandler, StartHandler } from './pipeline-handler';
import { saveTaskTwo } from './pipeline-stream';
import { PipelineConfig } from './config';
import {
  readContributors,
  readRepositories,
  readTaskTwoData,
  transformContributors,
  transformRepository,
  transformTaskResults,
  writeCSV,
} from './pipeline-stream';

export type Task = 1 | 2 | 3 | 4 | 5 | 6;

export const TASK_COUNT = 6;

/**
 *
 * Orchestrates the pipeline and decides what task to start the pipeline at
 *
 * @param task Task number identification
 * @param callbackfn Callback function called when the pipeline starts
 * @param callbackfn Callback function called when an error occurred
 * @param callbackfn Callback function called when the pipeline finished successfully
 */
export default (
  task: Task,
  onStart: StartHandler,
  onError: ErrorHandler,
  onFinish: FinishHandler,
) => {
  onStart();

  start(task, fetchRepositories, fetchContributors, onError, onFinish);
};

/**
 *
 * Orchestrates the pipeline and decides what task to start with
 *
 * @param task Task number identification
 * @param callbackfn Callback function called for fetching repositories
 * @param callbackfn Callback function  for fetching contributors
 * @param callbackfn Callback function called when an error occurred
 * @param callbackfn Callback function called when the pipeline finished successfully
 */
export const start = (
  task: Task,
  fetchRepositories: FetchRepositories,
  fetchContributors: FetchContributors,
  onError: ErrorHandler,
  onFinish: FinishHandler
) => {
  if (task === 1) {
    startFromBeginning(fetchRepositories, fetchContributors, onError, onFinish);

    return;
  }

  startFromTaskThree(fetchContributors, onError, onFinish);
};

/**
 *
 * Execute the pipeline from Task 1
 *
 * @param callbackfn Callback function called for fetching repositories
 * @param callbackfn Callback function  for fetching contributors
 * @param callbackfn Callback function called when an error occurred
 * @param callbackfn Callback function called when the pipeline finished successfully
 */
const startFromBeginning = (
  fetchRepositories: FetchRepositories,
  fetchContributors: FetchContributors,
  onError: ErrorHandler,
  onFinish: FinishHandler
) => {
  logger.info(`Feeding CSV from Github API`);

  readRepositories(fetchRepositories)
    .on('error', err => {
      onError(1, err);
    })
    .pipe(transformRepository())
    .pipe(saveTaskTwo())
    .pipe(readContributors(fetchContributors))
    .on('error', err => {
      onError(3, err);
    })
    .pipe(transformContributors())
    .pipe(writeCSV())
    .on('finish', onFinish);
};

/**
 *
 * Execute the pipeline from Task 3
 *
 * @param callbackfn Callback function  for fetching contributors
 * @param callbackfn Callback function called when an occurred in either of the 2 fetches
 * @param callbackfn Callback function called when the pipeline finished successfully
 */
const startFromTaskThree = (
  fetchContributors: FetchContributors,
  onError: ErrorHandler,
  onFinish: FinishHandler
) => {
  logger.info(`Feeding CSV from Github API from Task 3`);

  readTaskTwoData()
    .pipe(transformTaskResults())
    .pipe(readContributors(fetchContributors))
    .on('error', err => {
      onError(3, err);
    })
    .pipe(transformContributors())
    .pipe(writeCSV())
    .on('finish', onFinish);
};
