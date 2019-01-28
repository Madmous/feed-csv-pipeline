import { TaskFive } from './pipeline-task';
/**
 *
 * Transforms the ISOString to YYYY-mM-DD format
 *
 * @param date ISOString format
 */
export const formatDate = (date: string): string => date.split('T')[0];

/**
 *
 * Transforms response from the API
 *
 * @param response
 */

export const formatContributors = (taskFive: TaskFive): string =>
  `${taskFive.name};${taskFive.createdAt};${taskFive.contributorsCount}\n`;
