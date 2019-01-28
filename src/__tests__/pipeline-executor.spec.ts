import logger from '../logger';
import { start } from '../pipeline-orchestrator';
import { transformContributors } from '../pipeline-stream';
import { aRepository } from '../test-builders';
import { formatDate } from '../pipeline-formatter';
import { resetContributors } from '../contributors-referential';
import {
  readRepositories,
  transformRepository,
  readContributors,
} from '../pipeline-stream';

const API_ERROR_MESSAGE = 'API rate limit exceeded.';

const DEFAULT_REPOSITORIES = [
  aRepository({ name: '404', created_at: '2011-01-26T19:01:12Z' }),
  aRepository({ name: '404-proxy', created_at: '2011-01-26T19:01:12Z' }),
  aRepository({ name: 'proxy', created_at: '2011-01-26T19:01:12Z' }),
];

const DEFAULT_TRANSFORMED_REPOSITORIES = DEFAULT_REPOSITORIES.map(
  repository => ({
    name: repository.name,
    createdAt: formatDate(repository.created_at),
  })
);

const DEFAULT_CONTRIBUTORS = [
  { name: '404', createdAt: '2011-01-26', contributors: [{ login: 'earth' }] },
  {
    name: '404-proxy',
    createdAt: '2011-01-26',
    contributors: [{ login: 'earth' }],
  },
  {
    name: 'proxy',
    createdAt: '2011-01-26',
    contributors: [{ login: 'earth' }],
  },
];
const DEFAULT_TRANSFORMED_CONTRIBUTORS = [
  '404;2011-01-26;1\n',
  '404-proxy;2011-01-26;0\n',
  'proxy;2011-01-26;0\n',
];

const fetchRepositoriesSuccessfully = (stream: any) => {
  setTimeout(() => {
    DEFAULT_REPOSITORIES.forEach(repository => {
      stream.push(repository);
    });
    stream.push(null);
  }, 0);
};

const fetchRepositoriesUnsuccessfully = (stream: any) => {
  setTimeout(() => {
    stream.emit('error', API_ERROR_MESSAGE);
  }, 0);
};

const fetchContributorsSuccessfully = (stream: any, data: any, done: any) => {
  setTimeout(() => {
    stream.push({ ...data, contributors: [{ login: 'earth' }] });
    done();
  }, 0);
};

const fetchContributorsUnsuccessfully = (stream: any, data: any) => {
  setTimeout(() => {
    stream.emit('error', API_ERROR_MESSAGE);
  }, 0);
};

describe('Pipeline', () => {
  beforeEach(resetContributors);

  it('should only call the finish handler when starting from task 1', done => {
    const onError = (err: any) => {
      logger.error(err);
      throw new Error('error handler should not be called.');
    };

    const onFinish = () => {
      done();
    };

    start(
      1,
      fetchRepositoriesSuccessfully,
      fetchContributorsSuccessfully,
      onError,
      onFinish
    );
  });

  it('should only call the finish handler when starting from task 3', done => {
    const onError = (err: any) => {
      logger.error(err);
      throw new Error('error handler should not be called.');
    };

    const onFinish = () => {
      done();
    };

    start(
      3,
      fetchRepositoriesSuccessfully,
      fetchContributorsSuccessfully,
      onError,
      onFinish
    );
  });

  it('should not cal the finish handler when repositories were fetched unsuccessfully', done => {
    const onFinish = () => {
      throw new Error('Finish handler should not be called.');
    };

    const onError = () => {
      done();
    };

    start(
      1,
      fetchRepositoriesUnsuccessfully,
      fetchContributorsSuccessfully,
      onError,
      onFinish
    );
  });

  it('should not call the finish handler when contributors were fetched unsuccessfully', done => {
    const onFinish = () => {
      throw new Error('This finish handler should not be called.');
    };

    const onError = () => {
      done();
    };

    start(
      1,
      fetchRepositoriesSuccessfully,
      fetchContributorsUnsuccessfully,
      onError,
      onFinish
    );
  });
});

describe('Repositories', () => {
  beforeEach(resetContributors);

  it('should return a stream of repositories when the fetch is successful', done => {
    const repositories: any = [];

    const stream = readRepositories(fetchRepositoriesSuccessfully);

    stream.on('data', repository => {
      repositories.push(repository);
    });

    stream.on('end', () => {
      expect(repositories).toEqual(DEFAULT_REPOSITORIES);
      done();
    });

    stream.on('error', () => {
      throw new Error('Error event should not be emitted');
    });
  });

  it('should transform repositories', done => {
    const transformedRepositories: any = [];

    const stream = readRepositories(fetchRepositoriesSuccessfully).pipe(
      transformRepository()
    );

    stream.on('data', repository => {
      transformedRepositories.push(repository);
    });

    stream.on('end', () => {
      expect(transformedRepositories).toEqual(DEFAULT_TRANSFORMED_REPOSITORIES);
      done();
    });

    stream.on('error', () => {
      throw new Error('Error event should not be emitted');
    });
  });

  it('should return a stream of repositories when the fetch is successful', done => {
    const repositories: any = [];

    const stream = readRepositories(fetchRepositoriesSuccessfully);

    stream.on('data', repository => {
      repositories.push(repository);
    });

    stream.on('end', () => {
      expect(repositories).toEqual(DEFAULT_REPOSITORIES);
      done();
    });

    stream.on('error', () => {
      throw new Error('Error event should not be emitted');
    });
  });

  it('should emit an error when the fetch is unsuccessful', done => {
    const stream = readRepositories(fetchRepositoriesUnsuccessfully);

    stream.on('data', () => {
      throw new Error('Data event should not be emitted');
    });

    stream.on('error', err => {
      expect(err).toEqual(API_ERROR_MESSAGE);
      done();
    });
  });
});

describe('Contributors', () => {
  beforeEach(resetContributors);

  it('should return a stream of contributors when the fetch is successful', done => {
    const contributors: any = [];

    const stream = readRepositories(fetchRepositoriesSuccessfully)
      .pipe(transformRepository())
      .pipe(readContributors(fetchContributorsSuccessfully));

    stream.on('data', (contributor: any) => {
      contributors.push(contributor);
    });

    stream.on('end', () => {
      expect(contributors).toEqual(DEFAULT_CONTRIBUTORS);
      done();
    });

    stream.on('error', (err: string) => {
      throw new Error('Error event should not be emitted');
    });
  });

  it('should transform contributors', done => {
    const transformedContributors: any = [];

    const stream = readRepositories(fetchRepositoriesSuccessfully)
      .pipe(transformRepository())
      .pipe(readContributors(fetchContributorsSuccessfully))
      .pipe(transformContributors());

    stream.on('data', (contributor: any) => {
      transformedContributors.push(contributor);
    });

    stream.on('end', () => {
      expect(transformedContributors).toEqual(DEFAULT_TRANSFORMED_CONTRIBUTORS);
      done();
    });

    stream.on('error', (err: string) => {
      throw new Error('Error event should not be emitted');
    });
  });

  it('should emit an error when the fetch is unsuccessful', done => {
    const stream = readRepositories(fetchRepositoriesSuccessfully).pipe(
      readContributors(fetchContributorsUnsuccessfully)
    );

    stream.on('data', () => {
      throw new Error('Data event should not be emitted');
    });

    stream.on('error', err => {
      expect(err).toEqual(API_ERROR_MESSAGE);
      done();
    });
  });
});
