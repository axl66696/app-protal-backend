import { Controller, Subscriber } from '@his-base/jetstream';
import { PatientService } from '@his-model/nats-oriented-services';
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
