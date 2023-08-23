import 'reflect-metadata';

export function Controller(consumer: string) {
  return (constructor: Function) => {
    Reflect.defineMetadata('consumer', consumer, constructor);
  };
}

export function Subscriber(subject = '') {
  return (target: any, propertyKey: string) => {
    const subscribers = Reflect.getMetadata('subscribers', target) || [];
    subscribers.push({ subject, methodName: propertyKey });
    Reflect.defineMetadata('subscribers', subscribers, target);
  };
}

export function Replier(subject = '') {
  return (target: any, propertyKey: string) => {
    const repliers = Reflect.getMetadata('repliers', target) || [];
    repliers.push({ subject, methodName: propertyKey });
    Reflect.defineMetadata('repliers', repliers, target);
  };
}
