import { Json } from 'src/types';

export class PatientService {
  processMessage(message: Json) {
    console.log('PatientService processing: ', message);
  }
}
