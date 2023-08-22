import { ControllerMetadata } from '../interface';

export class ControllerService {
  async getAllControllers() {
    const controllers = await import('../controllers');
    return Object.values(controllers).map((Class) => new Class());
  }

  getControllerMetadata(controller: any): ControllerMetadata {
    const ControllerClass = controller.constructor;
    return {
      subjectPrefix: Reflect.getMetadata('subjectPrefix', ControllerClass),
      subscribers: Reflect.getMetadata('subscribers', controller) || [],
    };
  }
}
