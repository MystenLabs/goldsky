import express, { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

import logger from './logging';

const redisEnabled = process.env.REDIS_ENABLED || false;
logger.info(`Redis Enabled: ${redisEnabled}`);
const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';
let redisClient: RedisClientType | undefined;
if (redisEnabled) {
  logger.debug('Enabling Redis');
  const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  });
  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  (async () => {
    await redisClient.connect();
    logger.info('Connected to Redis');
  })();
}

const app = express();
const PORT = 2024;

app.use(express.json());
app.post('/', async (req: Request, res: Response) => {
  const { username: username } = req.body;
  logger.info(username);
  res.send(`Welcome ${username}`);
  logger.debug(await redisClient?.set('name', username));
});
app.get('/', (req: Request, res: Response) => res.send('hello worlds'));

app.listen(PORT, () => {
  logger.info(
    'Server is Successfully Running, and App is listening on port ' + PORT
  );
});
