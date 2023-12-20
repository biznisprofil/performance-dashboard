import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { EmployeeService } from '@app/services';
import { Observable, shareReplay, map, filter, switchMap, takeUntil, Subject } from 'rxjs';
import { DashboardData } from '../core/models/dashboard-data.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { GeneralInfo } from '../core/models/general-info.model';
import { EmployeeList } from '../core/models/employee-list.model';
import { BulkEditComponent } from '../bulk-edit/bulk-edit.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  displayedColumns = ['select', 'name', 'email', 'totalClockedInTime', 'totalRegularAmount', 'totalOvertimeAmount'];

  selection = new SelectionModel<any>(true, []);

  dataSource!: MatTableDataSource<EmployeeList>;

  generalInfo!: GeneralInfo | undefined;

  readonly dashboardResponse: Observable<DashboardData<EmployeeList[]>> = this.generateDashboard();

  constructor(
    readonly employeeService: EmployeeService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef,
  ) {}

  generateDashboard(): Observable<DashboardData<EmployeeList[]>> {
    return this.employeeService.provideDashboardInfo().pipe(
      map((response) => {
        this.generalInfo = response.generalInfo;
        this.dataSource = new MatTableDataSource(response.employeeDetails);
        return response;
      }),
      shareReplay(1),
    );
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data?.length;

    return numSelected === numRows;
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  openEditModal(): void {
    const dialogRef = this.dialog.open(BulkEditComponent, {
      data: {
        employees: [...this.selection.selected],
      },
      minWidth: '600px',
    });

    const destroy$: Subject<boolean> = new Subject<boolean>();

    dialogRef
      .afterClosed()
      .pipe(
        filter((response) => !!response),
        switchMap(() => this.generateDashboard()),
        takeUntil(destroy$),
      )
      .subscribe((data) => {
        if (!data.isLoading) {
          this.cd.markForCheck();
          this.reset();
          destroy$.unsubscribe();
        }
      });
  }

  reset(): void {
    this.selection.clear();
  }
}
