import { JetStreamConfig } from '@his-base/jetstream';
import 'dotenv/config';

export const serverConfig: JetStreamConfig & { dbUrl: string; dbName: string } =
  {
    servers: process.env.NATS_SERVERS
      ? process.env.NATS_SERVERS.split(',')
      : 'nats://localhost:4222',
    stream: process.env.NATS_STREAM || 'OPD',
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASS,
    dbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DATABASE || 'OPD',
  };
