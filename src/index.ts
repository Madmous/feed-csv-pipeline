import express from 'express';

import setPipelineRoutes from './pipeline-route';

const router = express();

setPipelineRoutes(router);

export default router;
