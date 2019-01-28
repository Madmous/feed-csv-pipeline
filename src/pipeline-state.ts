import { Task } from './pipeline-orchestrator';
import logger from './logger';

type Free = {
  status: 'FREE';
};

type InProgress = {
  start: Date;
  status: 'IN_PROGRESS';
  currentTask: Task;
};

type Success = {
  start: Date;
  end: Date;
  status: 'SUCCESS';
};

type Failure = {
  status: 'FAILURE';
  task: Task;
};

type Pipeline = Free | InProgress | Success | Failure;

let pipeline: Pipeline = {
  status: 'FREE',
};

/**
 *
 * Sets the pipeline value to the next pipeline state
 *
 * @param pipeline next pipeline state
 */
export const setPipeline = (nextPipeline: Pipeline) => {
  logger.info('Setting pipeline to IN_PROGRESS');

  pipeline = nextPipeline;
};

/**
 *
 * Update the pipeline value after it finishes successfully
 *
 */
export const updateSuccessfulPipeline = () => {
  if (pipeline.status !== 'IN_PROGRESS') {
    logger.error(
      `Expected to update to "SUCCESS" from an "IN_PROGRESS" status and got "${
        pipeline.status
      }"`
    );
  } else {
    pipeline = {
      start: pipeline.start,
      end: new Date(),
      status: 'SUCCESS',
    };
  }
};

/**
 *
 * Update the pipeline value after an error
 *
 * @param task number of task where the error was encountered
 */
export const updateUnsuccessfulPipeline = (task: Task) => {
  if (pipeline.status !== 'IN_PROGRESS') {
    logger.error(
      `Expected to update to "FAILURE" from an "IN_PROGRESS" status and got "${
        pipeline.status
      }"`
    );
  } else {
    pipeline = {
      task,
      status: 'FAILURE',
    };
  }
};

export const getPipeline = () => pipeline;
