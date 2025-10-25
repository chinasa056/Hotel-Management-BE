export interface CheckInOptions {
  reservationId: string;
  checkInTime?: Date;
}

export interface CheckOutOptions {
  reservationId: string;
  checkOutTime?: Date;
}

export interface ICheckInOutService {
  checkIn(options: CheckInOptions): Promise<void>;
  checkOut(options: CheckOutOptions): Promise<void>;
}