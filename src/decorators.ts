import 'reflect-metadata';

export function Controller(subjectPrefix: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    Reflect.defineMetadata('subjectPrefix', subjectPrefix, constructor);
  };
}

export function Subscriber(subject = '') {
  return function (target: any, propertyKey: string) {
    const subscribers = Reflect.getMetadata('subscribers', target) || [];
    subscribers.push({ subject, methodName: propertyKey });
    Reflect.defineMetadata('subscribers', subscribers, target);
  };
}
