// decorators.ts
import 'reflect-metadata';

export function Controller(subjectPrefix: string) {
    return function (constructor: Function) {
        Reflect.defineMetadata('subjectPrefix', subjectPrefix, constructor);
    };
}

 
export function Consumer(subject: string = '') {
    return function (target: any, propertyKey: string) {
        const consumers = Reflect.getMetadata('consumers', target) || [];
        consumers.push({ subject, methodName: propertyKey });
        Reflect.defineMetadata('consumers', consumers, target);
    };
}

