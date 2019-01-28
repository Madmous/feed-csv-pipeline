import { Router } from 'express';

import logger from './logger';

import {
  setSuccessfulContributorsForTests,
  setSuccessfulRepositoriesForTests,
  setUnsuccessfulContributorsForTests,
  setUnsuccessfulRepositoriesForTests,
} from './pipeline-fetch';
import { onError, onFinish, onStart } from './pipeline-handler';
import { getMetrics } from './pipeline-metrics';
import start from './pipeline-orchestrator';
import { getPipeline } from './pipeline-state';
import { setPipelineConfig } from './config';

const setPipelineRoutes = (router: Router) => {
  setFeedCSVRoute(router);
  setMetricsRoute(router);
  setPipelineStateRoute(router);
  setTaskOverLoaders(router);
};

export default setPipelineRoutes;

const setFeedCSVRoute = (router: Router) => {
  router.post('/feed-csv', (req, res) => {
    if (getPipeline().status === 'IN_PROGRESS') {
      res.status(400);
      res.send({ message: 'A pipeline job already started.' });
    } else {
      setPipelineConfig(req.query);

      start(1, onStart, onError, onFinish);

      res.status(200);
      res.send({ message: 'Pipeline Job started.' });
    }
  });
};

const setMetricsRoute = (router: Router) => {
  router.get('/metrics', (_, res) => {
    logger.info('Getting metrics');

    res.setHeader('Content-Type', 'application/json');

    res.status(200);
    res.send(getMetrics());
  });
};

const setPipelineStateRoute = (router: Router) => {
  router.get('/pipeline-state', (_, res) => {
    res.status(200);
    res.send(getPipeline());
  });
};

const setTaskOverLoaders = (router: Router) => {
  router.post('/test/task1-success', (_, res) => {
    logger.info('Setting task one to successful');

    setSuccessfulRepositoriesForTests();

    res.status(200);
    res.send({ message: 'Successful Fetch repositories set' });
  });

  router.post('/test/task1-failure', (_, res) => {
    logger.info('Setting task one to unsuccessful');

    setUnsuccessfulRepositoriesForTests();

    res.status(200);
    res.send({ message: 'Unsuccessful Fetch repositories set' });
  });

  router.post('/test/task2-success', (_, res) => {
    logger.info('Setting task two to successful');

    setSuccessfulContributorsForTests();

    res.status(200);
    res.send({ message: 'Successful Fetch contributors set' });
  });

  router.post('/test/task2-failure', (_, res) => {
    logger.info('Setting task two to unsuccessful');

    setUnsuccessfulContributorsForTests();

    res.status(200);
    res.send({ message: 'Unsuccessful Fetch contributors set' });
  });
};
