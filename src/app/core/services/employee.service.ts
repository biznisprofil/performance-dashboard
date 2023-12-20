import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, startWith } from 'rxjs';
import { environment } from '@app/environment';
import { Employee } from '../models/employee.model';
import { DashboardData } from '../models/dashboard-data.model';
import { ShiftService } from './shift.service';
import { EmployeeList } from '../models/employee-list.model';
import { generateDashboardInformation } from 'src/app/shared/utils/calculate-util';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly routeUrl = 'employees';

  constructor(
    private readonly http: HttpClient,
    private readonly shiftService: ShiftService,
  ) {}

  provideDashboardInfo(): Observable<DashboardData<EmployeeList[]>> {
    return forkJoin([this.list(), this.shiftService.list()]).pipe(
      map(([employees, shifts]) => {
        const dashboardInfo = generateDashboardInformation(employees, shifts);
        return {
          employeeDetails: dashboardInfo.employeeDetails,
          generalInfo: dashboardInfo.generalInfo,
          isLoading: false,
        };
      }),
      catchError(() => {
        return of({ isLoading: false });
      }),
      startWith({ isLoading: true }),
    );
  }

  list(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.api}/${this.routeUrl}`);
  }

  patch(employeeId: number, body: Employee): Observable<Employee[]> {
    return this.http.patch<Employee[]>(`${environment.api}/${this.routeUrl}/${employeeId}`, body);
  }
}
