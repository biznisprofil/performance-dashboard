import { Employee } from 'src/app/core/models/employee.model';
import { Shift } from 'src/app/core/models/shift.model';

export function calculateShiftHours(shift: Shift): number {
  const diffInMilliseconds = Math.abs(
    new Date(shift.clockOut).getTime() - new Date(shift.clockIn).getTime(),
  );
  return diffInMilliseconds / (60 * 60 * 1000);
}

export function calculateShiftPayment(
  shift: Shift,
  hourlyRate: number,
  overtimeRate: number,
): {
  regularHours: number;
  overtimeHours: number;
  regularAmount: number;
  overtimeAmount: number;
} {
  const totalHours = calculateShiftHours(shift);
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(totalHours - 8, 0);
  const regularAmount = regularHours * hourlyRate;
  const overtimeAmount = overtimeHours * overtimeRate;
  return { regularHours, overtimeHours, regularAmount, overtimeAmount };
}

export const generateDashboardInformation = (
  employees: Employee[],
  shifts: Shift[],
) => {
  let totalClockedInTime = 0;
  let totalRegularAmount = 0;
  let totalOvertimeAmount = 0;

  const employeeDetails = employees.map((employee) => {
    const shiftsForEmployee = shifts.filter(
      (shift) => shift.employeeId === employee.id,
    );

    const employeeShiftDetails = shiftsForEmployee.map((shift) => {
      const { regularAmount, overtimeAmount } = calculateShiftPayment(
        shift,
        employee.hourlyRate,
        employee.hourlyRateOvertime,
      );
      totalClockedInTime += calculateShiftHours(shift);
      totalRegularAmount += regularAmount;
      totalOvertimeAmount += overtimeAmount;

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        hourlyRate: employee.hourlyRate,
        overtimeHourlyRate: employee.hourlyRateOvertime,
        totalClockedInTime: calculateShiftHours(shift),
        regularAmount,
        overtimeAmount,
      };
    });

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      hourlyRate: employee.hourlyRate,
      overtimeHourlyRate: employee.hourlyRateOvertime,
      totalClockedInTime: employeeShiftDetails.reduce(
        (total, shift) => total + shift.totalClockedInTime,
        0,
      ),
      totalRegularAmount: employeeShiftDetails.reduce(
        (total, shift) => total + shift.regularAmount,
        0,
      ),
      totalOvertimeAmount: employeeShiftDetails.reduce(
        (total, shift) => total + shift.overtimeAmount,
        0,
      ),
    };
  });

  return {
    employeeDetails,
    generalInfo: {
      totalEmployees: employees.length,
      totalClockedInTime,
      totalRegularAmount,
      totalOvertimeAmount,
    },
  };
};
