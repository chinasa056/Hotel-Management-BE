export interface AvailabilityFilters {
  start_date?: string ;
  end_date?: string;
  date?: string;
  room_type?: string;
  room_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AvailableRoom {
  room_id: string;
  room_type: string;
  status: string;
  rate: number;
}

export interface AvailabilityResponse {
  available_rooms: AvailableRoom[];
  total: number;
  page: number;
  limit: number;
}

export interface AvailabilitySummaryResponse {
  room_types: Array<{ room_type: string; count: number }>;
}

export interface RoomDayAvailabilityResponse {
  room_id: string;
  available_dates: string[];
}

export interface SingleDateAvailabilityResponse {
  status: 'free' | 'booked';
  room_id?: string;
  reservation_id?: string;
}

export interface IAvailabilityService {
  getAvailableRooms(filters: AvailabilityFilters): Promise<AvailabilityResponse>;

  getAvailabilitySummary(filters: AvailabilityFilters): Promise<AvailabilitySummaryResponse>;

  getRoomDayAvailability(filters: AvailabilityFilters): Promise<RoomDayAvailabilityResponse>;

  getSingleDateAvailability(filters: AvailabilityFilters): Promise<SingleDateAvailabilityResponse>;
}