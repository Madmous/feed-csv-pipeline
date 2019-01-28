import logger from './logger';
import router from './index';

const port = 8080;

router.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});