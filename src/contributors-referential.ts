import logger from './logger';
import { TaskFour } from './pipeline-task';

let contributorsReferential = new Set();

export const resetContributors = () => {
  contributorsReferential = new Set();
};

export const hasAlready = (name: string) => contributorsReferential.has(name);

export const addContributors = (name: string) =>
  contributorsReferential.add(name);

export const computeContributorsCountNew = (taskFour: TaskFour) => {
  const { name: repository, contributors } = taskFour;
  let count = 0;
  const contributorsCount = contributors.length;

  for (let i = 0; i < contributorsCount; i++) {
    const { login } = contributors[i];

    if (contributorsReferential.has(login)) {
      logger.debug(`${login} already contributed`);
    } else {
      contributorsReferential.add(login);
      count++;
    }
  }

  logger.info(
    `${repository} has ${count} new contributors out of ${contributorsCount} total`
  );

  return count;
};
