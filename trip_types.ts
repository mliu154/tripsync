import { Types } from 'mongoose';

export interface Attraction {
  name: string;
  description: string;
}

export interface HotelStay {
  hotelName: string;
  checkIn: string;
  checkOut: string;
}

export interface TripLeg {
  city: string;
  startDate: string;
  endDate: string;
  note: string; // NEW
  attractions: Attraction[]; // NEW
}

export interface Trip {
  _id: string;
  name: string;
  userIds: string[];
  usernames: string[]; 
  legs: TripLeg[];
  hotels: HotelStay[]; // NEW
}

export interface CreateTripRequest {
  name: string;
  legs: TripLeg[];
  hotels: HotelStay[]; // NEW
}

export type EncryptedAttraction = {
  nameEncrypted: string;
  descriptionEncrypted: string;
};

export type EncryptedHotelStay = {
  hotelNameEncrypted: string;
  checkInEncrypted: string;
  checkOutEncrypted: string;
};

export type EncryptedTripLeg = {
  cityEncrypted: string;
  startDateEncrypted: string;
  endDateEncrypted: string;
  noteEncrypted: string; // NEW
  attractions: EncryptedAttraction[]; // NEW
};

export type TripDocument = {
  _id: Types.ObjectId;
  nameEncrypted: string;
  userIds: (Types.ObjectId | { _id: Types.ObjectId; usernameEncrypted: string })[];
  legs: EncryptedTripLeg[];
  hotels: EncryptedHotelStay[]; // NEW
};

export type EditableTrip = {
  _id: string;
  name: string;
  legs: TripLeg[];
  hotels: HotelStay[]; // NEW
};