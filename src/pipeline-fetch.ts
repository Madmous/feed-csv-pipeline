import request from 'request';
import { Readable, TransformCallback } from 'stream';

import { getConfig } from './config';
import logger from './logger';
import { TaskTwo, createTaskFour } from './pipeline-task';

export type FetchRepositories = (stream: Readable) => void;

export type FetchContributors = (
  stream: Readable,
  taskOne: TaskTwo,
  done: TransformCallback
) => void;

type Setter = () => void;

type DefaultFetchRepositories = (stream: Readable) => void;

/**
 *
 * Either pushes API response to stream or emits an error
 *
 * @param stream
 */
let defaultFetchRepositories: DefaultFetchRepositories = stream => {
  const { githubUserName } = getConfig();

  const options = {
    url: `https://api.github.com/users/${githubUserName}/repos`,
    headers: {
      'User-Agent': 'madmous',
    },
  };

  logger.info(`FETCHING ${githubUserName} REPOSITORIES`);

  request(options, (_, response, body) => {
    const parsedBody = JSON.parse(body);

    if (response.statusCode != 200) {
      stream.emit(
        'error',
        JSON.stringify({ task: 'fetchRepositories', message: parsedBody })
      );
    } else {
      const repositoriesCount = parsedBody.length;

      logger.info(`Fetched ${repositoriesCount} repositories`);

      for (let i = 0; i < repositoriesCount; i++) {
        const repository = parsedBody[i];

        stream.push(repository);
      }

      stream.push(null);
    }
  });
};

/**
 *
 * A set of default mocked repositories values for test purposes
 *
 */
export const setSuccessfulRepositoriesForTests: Setter = () => {
  defaultFetchRepositories = stream =>
    setTimeout(() => {
      stream.push({ name: '404', created_at: '2011-01-26T19:01:12Z' });
      stream.push({ name: '404-proxy', created_at: '2011-01-26T19:01:12Z' });
      stream.push({ name: 'proxy', created_at: '2011-01-26T19:01:12Z' });
      stream.push(null);
    }, 0);
};

/**
 *
 * A mocked error from fetching repositories
 *
 */
export const setUnsuccessfulRepositoriesForTests: Setter = () => {
  defaultFetchRepositories = stream =>
    setTimeout(() => {
      stream.emit('error', 'API rate limit exceeded.');
    }, 0);
};

/**
 *
 * Fetches repositories from API
 *
 * @param stream
 */
export const fetchRepositories: FetchRepositories = stream => {
  defaultFetchRepositories(stream);
};

type DefaultFetchContributors = FetchContributors;

let defaultFetchContributors: DefaultFetchContributors = (
  stream,
  taskOne,
  done
) => {
  const { githubUserName } = getConfig();

  const options = {
    url: `https://api.github.com/repos/${githubUserName}/${
      taskOne.name
    }/contributors`,
    headers: {
      'User-Agent': 'madmous',
    },
  };

  logger.info(`FETCHING ${taskOne.name} CONTRIBUTORS`);

  request(options, (_, response, body) => {
    if (response.statusCode != 200) {
      stream.emit(
        'error',
        JSON.stringify({ task: 'fetchContributors', message: body })
      );
    } else {
      stream.push(createTaskFour(taskOne, body));

      done();
    }
  });
};

/**
 *
 * A set of default mocked contributors values for test purposes
 *
 */
export const setSuccessfulContributorsForTests: Setter = () => {
  defaultFetchContributors = (stream, data, done) =>
    setTimeout(() => {
      stream.push(
        createTaskFour(
          data,
          JSON.stringify([{ login: 'earth' }, { login: 'fire' }])
        )
      );
      done();
    }, 0);
};

/**
 *
 * A mocked error from fetching contributors
 *
 */
export const setUnsuccessfulContributorsForTests: Setter = () => {
  defaultFetchContributors = stream =>
    setTimeout(() => {
      stream.emit('error', 'API rate limit exceeded.');
    }, 0);
};

/**
 *
 * Fetches repositories from API
 *
 * @param stream
 */
export const fetchContributors: FetchContributors = (stream, data, done) => {
  defaultFetchContributors(stream, data, done);
};
