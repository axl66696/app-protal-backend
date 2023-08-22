import { ControllerMetadata } from '../interface';

export class ControllerService {
  getControllerMetadata(controller: any): ControllerMetadata {
    const ControllerClass = controller.constructor;
    return {
      subjectPrefix: Reflect.getMetadata('subjectPrefix', ControllerClass),
      subscribers: Reflect.getMetadata('subscribers', controller) || [],
    };
  }
}
