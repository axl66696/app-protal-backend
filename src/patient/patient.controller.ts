import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';
import { PatientService } from './patient.service';

@Controller('patient')
export default class PatientController {
  constructor(private readonly patientService: PatientService) {
    this.patientService = new PatientService();
  }
  @Consumer('create')
  createPatient(message: Json) {
    this.patientService.processMessage(message);
  }
}
