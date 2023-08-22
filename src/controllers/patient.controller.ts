import { Subscriber, Controller } from '../decorators';
import { PatientService } from '../services/patient.service';
import { JsMsg } from 'nats';

@Controller('patient')
export class PatientController {
  constructor(
    private readonly patientService: PatientService = new PatientService(),
  ) {}
  @Subscriber('create')
  createPatient(message: JsMsg, payload: any) {
    try {
      this.patientService.processMessage(payload);

      message.ack();
    } catch (error) {
      console.log('Error processing patient.create: ', error);
      message.nak();
    }
  }
}
