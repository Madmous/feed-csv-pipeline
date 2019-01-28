import { Readable, Transform, Writable, Duplex } from 'stream';
import fs from 'fs';

import logger from './logger';
import { formatContributors } from './pipeline-formatter';
import { getCSVFile, getTxtFile } from './config';
import { FetchRepositories, FetchContributors } from './pipeline-fetch';
import { createTaskTwo } from './pipeline-task';
import {
  TaskTwo,
  TaskFour,
  createTaskFive,
} from './pipeline-task';

/**
 *
 * Readable stream from text file
 *
 */
export const readTaskTwoData = () => {
  logger.info('READ TASK ONE to THREE RESULTS');

  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  const readStream = fs.createReadStream(getTxtFile(), {
    encoding: 'utf8',
  });

  readStream.on('data', (chunk: string) => {
    logger.info('READING LINE');

    chunk.split('\n').forEach((line: string) => {
      stream.push(line);
    });
  });

  readStream.on('end', () => {
    stream.push(null);
  });

  return stream;
};

/**
 *
 * Transform stream that receives a string and parsed it to a JSON
 *
 */
export const transformTaskResults = () => {
  logger.info('TRANSFORM TASK ONE to THREE RESULTS');

  return new Transform({
    objectMode: true,
    transform: (chunk: string, _, done) => {
      try {
        const parsed = JSON.parse(chunk);
        done(null, parsed);
      } catch (e) {
        logger.warn(`Could not parse line "${chunk}"`);
        done(null);
      }
    },
  });
};

/**
 *
 * Readable stream from an API
 *
 * @param callbackfn Callback function for fetching repositories
 */
export const readRepositories = (fetch: FetchRepositories) => {
  logger.info('READ REPOSITORIES');

  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  fetch(stream);

  return stream;
};

/**
 *
 * Transform stream that extract the repository name and creates an object with it
 *
 */
export const transformRepository = () => {
  logger.info('TRANSFORM REPOSITORIES');

  return new Transform({
    objectMode: true,
    transform: (chunk, _, done) => {
      done(null, createTaskTwo(chunk));
    },
  });
};

/**
 *
 * Duplex stream that reads from a text file
 *
 */
export const saveTaskTwo = () => {
  logger.info('SAVE TASK ONE RESULTS');

  const stream = new Duplex({
    objectMode: true,
    read() {},
    write: (chunk: TaskTwo, _, done) => {
      const writeStream = fs.createWriteStream(getTxtFile(), {
        flags: 'a+',
      });

      writeStream.once('open', () => {
        writeStream.write(`${JSON.stringify(chunk)}\n`);

        stream.push(chunk);
        done();
      });
    },
    final: () => {
      stream.push(null);
    },
  });

  return stream;
};

/**
 *
 * Duplex stream that fetches from an API
 *
 * @param callbackfn Callback function for fetching contributors
 */
export const readContributors = (fetch: FetchContributors) => {
  logger.info('READ CONTRIBUTORS');

  const stream = new Duplex({
    objectMode: true,
    read() {},
    write: (chunk: TaskTwo, _, done) => {
      fetch(stream, chunk, done);
    },
    final: () => {
      stream.push(null);
    },
  });

  return stream;
};

/**
 *
 * Transform stream that concatenates the repository and the contributors count
 *
 */
export const transformContributors = () => {
  logger.info('TRANSFORM CONTRIBUTORS');

  return new Transform({
    objectMode: true,
    transform: (taskFour: TaskFour, _, done) => {
      done(null, formatContributors(createTaskFive(taskFour)));
    },
  });
};

/**
 *
 * Writable stream that writes the result to a CSV file
 *
 */
export const writeCSV = () => {
  return new Writable({
    objectMode: true,
    write: (chunk: string, _, done) => {
      const writeStream = fs.createWriteStream(getCSVFile(), {
        flags: 'a+',
      });

      writeStream.once('open', () => {
        writeStream.write(chunk);
        done();
      });
    },
  });
};
