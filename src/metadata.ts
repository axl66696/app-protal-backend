export interface SubscriberMetadata {
  subject: string;
  methodName: string;
}

export interface ControllerMetadata {
  subjectPrefix: string;
  subscribers: SubscriberMetadata[];
}
