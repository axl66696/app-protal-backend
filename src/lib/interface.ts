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
