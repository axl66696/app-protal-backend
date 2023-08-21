import { Controller, Consumer } from '../decorators';
import { Json } from '../types';
import { AppService } from '../services/app.service';

@Controller('app')
export default class AppController {

  constructor(private readonly appService: AppService) {
    this.appService = new AppService();
  }

  @Consumer('create')
  handleMessageCreate(message: Json) {
    this.appService.processMessage(message);
  }
}
