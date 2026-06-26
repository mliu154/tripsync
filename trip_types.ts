import { Types } from 'mongoose';
export interface TripLeg {
  city: string;
  startDate: string;
  endDate: string;
}

export interface Trip {
  _id: string;
  userIds: string[];
  legs: TripLeg[];
}

export interface CreateTripRequest {
  legs: TripLeg[];
}

export type EncryptedTripLeg = {
  cityEncrypted: string;
  startDateEncrypted: string;
  endDateEncrypted: string;
};

export type TripDocument = {
  _id: Types.ObjectId;
  userIds: Types.ObjectId[];
  legs: EncryptedTripLeg[];
};

export type EditableTrip = {
  _id: string;
  legs: {
    city: string;
    startDate: string;
    endDate: string;
  }[];
};