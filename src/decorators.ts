export function Controller(subjectPrefix: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    Reflect.defineMetadata('subjectPrefix', subjectPrefix, constructor);
  };
}

export function Consumer(subject = '') {
  return function (target: any, propertyKey: string) {
    const consumers = Reflect.getMetadata('consumers', target) || [];
    consumers.push({ subject, methodName: propertyKey });
    Reflect.defineMetadata('consumers', consumers, target);
  };
}
