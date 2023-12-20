import { GeneralInfo } from './general-info.model';

export interface DashboardData<T> {
  isLoading?: boolean;
  employeeDetails?: T;
  generalInfo?: GeneralInfo;
}
