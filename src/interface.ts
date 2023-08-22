export interface NatsServerConfig {
  servers: string | string[];
  stream: string;
}

export interface SubscriberMetadata {
  subject: string;
  methodName: string;
}

export interface ControllerMetadata {
  subjectPrefix: string;
  subscribers: SubscriberMetadata[];
}
