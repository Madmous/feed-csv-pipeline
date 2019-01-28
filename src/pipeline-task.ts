import { computeContributorsCountNew } from './contributors-referential';
import { formatDate } from './pipeline-formatter';

export type TaskTwo = {
  name: string;
  createdAt: string;
};

export type TaskFour = TaskTwo & { contributors: any };

export type TaskFive = TaskTwo & { contributorsCount: number };

export const createTaskTwo = (data: any): TaskTwo => ({
  name: data.name,
  createdAt: formatDate(data.created_at),
});

export const createTaskFour = (taskOne: TaskTwo, body: any): TaskFour => ({
  ...taskOne,
  contributors: JSON.parse(body),
});

export const createTaskFive = (taskFour: TaskFour): TaskFive => ({
  name: taskFour.name,
  createdAt: taskFour.createdAt,
  contributorsCount: computeContributorsCountNew(taskFour),
});
