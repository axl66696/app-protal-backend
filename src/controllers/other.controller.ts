// controllers/other.controller.ts
import { Controller, Consumer } from '../decorators';
import { Json } from '../types';
import { OtherService } from '../services/other.service';

@Controller('other')
export default class OtherController {
  constructor(private readonly otherService: OtherService) {
    this.otherService = new OtherService();
  }

  @Consumer('update')
  handleUpdate(message: Json) {
    this.otherService.processMessage(message);
  }
}
