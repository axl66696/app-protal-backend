import { Injectable } from '@nestjs/common';
import { Json } from 'src/types';

@Injectable()
export class OrderService {
  processMessage(message: Json) {
    console.log('OrderService processing: ', message);
  }
}
