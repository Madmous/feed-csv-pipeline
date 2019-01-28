import logger from './logger';
import start, { Task } from './pipeline-orchestrator';
import { resetContributors } from './contributors-referential';
import { getConfig } from './config';
import {
  setPipeline,
  updateSuccessfulPipeline,
  updateUnsuccessfulPipeline,
} from './pipeline-state';

export type ErrorHandler = (task: Task, error: Error) => void;

export type StartHandler = () => void;

export type FinishHandler = () => void;

export type RetryHandler = (task: Task) => () => void;

let retry: NodeJS.Timeout = null;

/**
 *
 * Retry handler that either starts the task from scratch or not
 *
 * @param task number of task where the error was encountered
 */
export const onRetry: RetryHandler = task => () => {
  logger.info(
    `The pipeline previously failed on task ${task}. Retrying again.`
  );

  if (task === 1) {
    start(1, onStart, onError, onFinish);
  } else {
    start(3, onStart, onError, onFinish);
  }
};

/**
 *
 * Error handler that updates the pipeline and sets the retry. It also resets the contributors Set since we will fetch contributors again
 *
 * @param task number of task where the error was encountered
 * @param error the error encountered
 */
export const onError: ErrorHandler = (task, error) => {
  logger.error(error);

  updateUnsuccessfulPipeline(task);
  resetContributors();

  clearInterval(retry);

  const { retryInterval } = getConfig();
  
  retry = setInterval(onRetry(task), retryInterval * 1000);
};

/**
 *
 * Finish handler that updates the pipeline and clears the retry. It also resets the contributors Set since we will fetch contributors again
 *
 */
export const onFinish: FinishHandler = () => {
  logger.info('Batch successfully finished');

  updateSuccessfulPipeline();
  resetContributors();

  clearInterval(retry);
};

/**
 *
 * Start handler that updates the pipeline state
 *
 */
export const onStart = () => {
  setPipeline({
    start: new Date(),
    status: 'IN_PROGRESS',
    currentTask: 1,
  });
};
