import logger from './logger';

const getDirname = () => {
  if (process.env.NODE_ENV === 'test') {
    return './src/__tests__';
  }

  return './src';
};

export const getTxtFile = () => `${getDirname()}/taskTwo.txt`;

export const getCSVFile = () => `${getDirname()}/result.csv`;

export type PipelineConfig = {
  retryInterval: number;
  githubUserName: string;
};

/**
 * Careful when setting the interval; if it is too small, it will overlap with the current job being executed
 * Github has an hour rate limit so we are setting the default value to one hour (3600 seconds)
 */
let config: PipelineConfig = {
  retryInterval: 3600,
  githubUserName: 'Algolia',
};

export const getConfig = () => config;

export const setPipelineConfig = (query: any) => {
  const oldConfig = { ...config };

  const retryInterval = query['retry-interval'];
  const githubUserName = query['github-username'];

  if (retryInterval) {
    config.retryInterval = retryInterval;
  }

  if (githubUserName) {
    config.githubUserName = githubUserName;
  }

  logger.info(
    `Old config  was changed from ${JSON.stringify(
      oldConfig
    )} to ${JSON.stringify(config)}`
  );
};
