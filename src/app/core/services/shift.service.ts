import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '@app/environment';
import { Shift } from '../models/shift.model';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private readonly routeUrl = 'shifts';

  constructor(private readonly http: HttpClient) {}

  listByEmployeesId(ids: string[]): Observable<Shift[]> {
    return this.http
      .get<Shift[]>(`${environment.api}/${this.routeUrl}`)
      .pipe(
        map((shifts: Shift[]) =>
          shifts.filter((el) => ids.includes(el.employeeId)),
        ),
      );
  }

  list(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${environment.api}/${this.routeUrl}`);
  }

  patch(shiftId: number, body: Shift): Observable<Shift[]> {
    return this.http.patch<Shift[]>(
      `${environment.api}/${this.routeUrl}/${shiftId}`,
      body,
    );
  }
}
