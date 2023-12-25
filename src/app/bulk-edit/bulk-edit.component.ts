import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeList } from '../core/models/employee-list.model';
import { Shift } from '../core/models/shift.model';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService, ShiftService } from '@app/services';
import { Employee } from '../core/models/employee.model';

@Component({
  selector: 'app-bulk-edit',
  templateUrl: './bulk-edit.component.html',
  styleUrls: ['./bulk-edit.component.scss'],
})
export class BulkEditComponent {
  bulkEditForm!: FormGroup;
  shifts: Shift[] | any;
  employees!: FormArray;
  showShiftsTable = false;
  dataSource = new MatTableDataSource<AbstractControl>();

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly fb: FormBuilder,
    private readonly shiftService: ShiftService,
    private readonly employeeService: EmployeeService,
  ) {
    this.retrieveShifts();
  }

  retrieveShifts(): void {
    const ids: string[] = this.data.employees.map((e: EmployeeList) => e.id);
    this.shiftService.listByEmployeesId(ids).subscribe((response) => {
      this.shifts = response;
      console.log(this.shifts);
      this.dataSource = new MatTableDataSource(this.shifts);
      this.createForm();
    });
  }

  createForm(): void {
    this.bulkEditForm = this.fb.group({
      employees: this.createEmployeesForm(this.data.employees),
    });
    this.employees = this.bulkEditForm.get('employees') as FormArray;
  }

  createEmployeesForm(employees: EmployeeList[]): FormArray {
    return this.fb.array(
      employees.map((employee) =>
        this.fb.group({
          id: this.fb.control(employee.id, []),
          name: this.fb.control(employee.name, []),
          hourlyRate: this.fb.control(employee.hourlyRate, []),
          overtimeHourlyRate: this.fb.control(employee.overtimeHourlyRate, []),
          shifts: this.createShiftsForm(
            this.shifts.filter((s: Shift) => s.employeeId === employee.id),
          ),
        }),
      ),
    );
  }

  createShiftsForm(shifts: Shift[]): FormArray {
    return this.fb.array(
      shifts.map((shift: Shift) =>
        this.fb.group({
          shiftId: this.fb.control(shift.id),
          employeeId: this.fb.control(shift.employeeId),
          clockIn: this.fb.control(shift.clockIn),
          clockOut: this.fb.control(shift.clockOut),
        }),
      ),
    );
  }

  onClockInChange(clockIn: Date) {
    this.bulkEditForm.patchValue({
      employees: this.bulkEditForm.value.employees.map((employee: Employee) => {
        return {
          ...employee,
          shifts: employee.shifts
            ? employee.shifts.map((shift: Shift) => {
              return {
                ...shift,
                clockIn: clockIn,
              };
            })
            : [],
        };
      }),
    });
  }

  onClockOutChange(clockOut: Date) {
    this.bulkEditForm.patchValue({
      employees: this.bulkEditForm.value.employees.map((employee: Employee) => {
        return {
          ...employee,
          shifts: employee.shifts
            ? employee.shifts.map((shift: Shift) => {
              return {
                ...shift,
                clockOut: clockOut,
              };
            })
            : [],
        };
      }),
    });
  }

  getDirtyValues(form: any): any {
    const dirtyValues: any = {};
    Object.keys(form.controls).forEach((key) => {
      const currentControl = form.controls[key];
      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[key] = this.getDirtyValues(currentControl);
        } else {
          dirtyValues[key] = currentControl.value;
        }
      }
    });
    return dirtyValues;
  }

  onSave() {
    const employees = this.bulkEditForm.getRawValue().employees;

    console.log(this.getDirtyValues(this.bulkEditForm)); // check only for changed values

    for (const employee of employees) {
      this.employeeService.patch(employee.id, employee).subscribe((data) => {
        this.dialogRef.close(data);
      });
      const shifts = employee.shifts;
      //// Not the best way to do this, it should be refactored together with template
      // for (const shift of shifts) {
      //   this.shiftService.patch(shift.shiftId, shift).subscribe((data) => {
      //     this.dialogRef.close(data);
      //   });
      // }
    }
  }
}
