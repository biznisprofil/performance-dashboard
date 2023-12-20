import { calculateShiftHours, calculateShiftPayment, generateDashboardInformation } from './calculate-util';

describe('Shift Calculations', () => {
  it('should calculate shift hours correctly', () => {
    const shift = {
      id: '1',
      employeeId: '1',
      clockIn: new Date('2023-01-01T08:00:00'),
      clockOut: new Date('2023-01-01T17:00:00'),
    };
    const hours = calculateShiftHours(shift);
    expect(hours).toEqual(9); // 9 hours between 8 AM and 5 PM
  });

  it('should calculate shift payment correctly', () => {
    const shift = {
      id: '1',
      employeeId: '1',
      clockIn: new Date('2023-01-01T08:00:00'),
      clockOut: new Date('2023-01-01T17:00:00'),
    };
    const payment = calculateShiftPayment(shift, 15, 20);
    expect(payment.regularHours).toEqual(8);
    expect(payment.overtimeHours).toEqual(1);
    expect(payment.regularAmount).toEqual(120); // 8 hours * $15
    expect(payment.overtimeAmount).toEqual(20); // 1 hour * $20
  });
});

describe('Dashboard Information', () => {
  it('should generate dashboard information correctly', () => {
    const employees = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        hourlyRate: 15,
        hourlyRateOvertime: 20,
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        hourlyRate: 18,
        hourlyRateOvertime: 25,
      },
    ];

    const shifts = [
      {
        id: '1',
        employeeId: '1',
        clockIn: new Date('2023-01-01T08:00:00'),
        clockOut: new Date('2023-01-01T17:00:00'),
      },
      {
        id: '2',
        employeeId: '1',
        clockIn: new Date('2023-01-02T20:00:00'),
        clockOut: new Date('2023-01-03T01:00:00'),
      },
      {
        id: '3',
        employeeId: '2',
        clockIn: new Date('2023-01-01T08:00:00'),
        clockOut: new Date('2023-01-01T17:00:00'),
      },
      {
        id: '4',
        employeeId: '2',
        clockIn: new Date('2023-01-02T20:00:00'),
        clockOut: new Date('2023-01-03T01:00:00'),
      },
    ];

    const dashboardInformation = generateDashboardInformation(employees, shifts);

    expect(dashboardInformation.employeeDetails.length).toEqual(employees.length);
  });
});
