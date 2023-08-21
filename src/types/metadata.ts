export interface ControllerMetadata {
  subjectPrefix: string;
  consumers: ConsumerMeta[];
}

export interface ConsumerMeta {
  subject: string;
  methodName: string;
}
