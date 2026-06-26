import { encryptSecret, decryptSecret } from '@/crypto';
import { TripDocument } from '@/trip_types'
export function decryptTripLegs(trip: TripDocument) {
  return {
    _id: trip._id.toString(),
    userIds: trip.userIds.map(id => id.toString()),
    legs: trip.legs.map(leg => ({
      city: decryptSecret(leg.cityEncrypted),
      startDate: decryptSecret(leg.startDateEncrypted),
      endDate: decryptSecret(leg.endDateEncrypted),
    })),
  };
}

export function encryptTripLegs(
  legs: {
    city: string;
    startDate: string;
    endDate: string;
  }[]
) {
  return legs.map(leg => ({
    cityEncrypted: encryptSecret(leg.city),
    startDateEncrypted: encryptSecret(leg.startDate),
    endDateEncrypted: encryptSecret(leg.endDate),
  }));
}
