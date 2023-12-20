import { Shift } from './shift.model';

export interface Employee {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  hourlyRateOvertime: number;
  shifts?: Shift[];
}
