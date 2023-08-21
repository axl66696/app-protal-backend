import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';
import { PatientService } from '../services/patient.service';
import { JsMsg } from 'nats';

@Controller('patient')
export default class PatientController {
  constructor(private readonly patientService: PatientService) {
    this.patientService = new PatientService();
  }
  @Consumer('create')
  createPatient(message: JsMsg, payload: Json) {
    try {
      this.patientService.processMessage(payload);

      message.ack();
    } catch (error) {
      console.log('Error processing patient.create: ', error);
      message.nak();
    }
  }
}
