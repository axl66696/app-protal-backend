import { Msg, PublishOptions } from 'nats';

export interface NatsServerConfig {
  servers: string | string[];
  stream: string;
  user?: string;
  pass?: string;
}

export interface SubscriberMetadata {
  subject: string;
  methodName: string;
}

export interface ReplierMetadata {
  subject: string;
  methodName: string;
}

export interface ControllerMetadata {
  consumer: string;
  subscribers: SubscriberMetadata[];
  repliers: ReplierMetadata[];
}

export interface RespondMsg extends Msg {
  respond: (payload: any, opts?: PublishOptions) => boolean;
}
