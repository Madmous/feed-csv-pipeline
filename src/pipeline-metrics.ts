import fs from 'fs';
import { getCSVFile } from './config';

/**
 *
 * Reads the result file content, saves it on memory and parses it
 *
 */
export const getMetrics = () => {
  const content = fs.readFileSync(getCSVFile(), 'utf8');

  const metrics = content
    .split('\n')
    .map((line: string) => {
      const [name, createdAt, count] = line.split(';');
      return { name, createdAt, count };
    })
    .filter(line => line.name !== '');

  if (metrics.length === 0) {
    return { message: 'There are no metrics yet.' };
  }

  return metrics;
};
