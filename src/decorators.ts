import 'reflect-metadata';

export function Controller(subjectPrefix: string) {
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
