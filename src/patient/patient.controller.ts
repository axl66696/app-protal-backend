import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';

@Controller('patient')
export default class PatientController {
  @Consumer('create')
  createPatient(message: Json) {
    console.log('PatientController processing: ', message);
  }
}
