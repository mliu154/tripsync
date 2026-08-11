import { encryptSecret, decryptSecret } from '@/crypto';
import { TripDocument } from '@/trip_types';
import { Types } from 'mongoose';

// Type Guard: Checks if the object has the encrypted username field
function isPopulatedUser(
  user: any
): user is { _id: Types.ObjectId; usernameEncrypted: string } {
  return user !== null && typeof user === 'object' && user.usernameEncrypted !== undefined;
}

export function decryptTripLegs(trip: TripDocument) {
  return {
    _id: trip._id.toString(),
    
    // Safely extract the raw ID
    userIds: trip.userIds.map(user => {
      if (isPopulatedUser(user)) {
        return user._id.toString();
      }
      return user.toString();
    }),
    
    // Safely extract AND decrypt the username
    usernames: trip.userIds.map(user => {
      if (isPopulatedUser(user)) {
        return decryptSecret(user.usernameEncrypted);
      }
      return "Unknown User";
    }),
    
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