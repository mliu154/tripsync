/* eslint-disable @typescript-eslint/no-explicit-any */
import { encryptSecret, decryptSecret } from '@/crypto';
import { TripDocument } from '@/trip_types';
import { Types } from 'mongoose';

// Type Guard: Checks if the object has the encrypted username field
function isPopulatedUser(
  user: any
): user is { _id: Types.ObjectId; usernameEncrypted: string } {
  return user !== null && typeof user === 'object' && user.usernameEncrypted !== undefined;
}

// NEW: Bulletproof decryption helper
function safeDecrypt(value: string | undefined, fallback: string = ""): string {
  if (!value) return fallback;
  
  // If the string doesn't contain our encryption delimiter, assume it's legacy plain-text data
  if (!value.includes(':')) return value;
  
  try {
    return decryptSecret(value);
  } catch (error) {
    console.error("Failed to decrypt value:", error);
    return fallback;
  }
}

export function decryptTripLegs(trip: TripDocument) {
  return {
    _id: trip._id.toString(),
    name: safeDecrypt(trip.nameEncrypted, "Untitled Trip"),
    
    userIds: trip.userIds.map(user => {
      if (isPopulatedUser(user)) return user._id.toString();
      return user.toString();
    }),
    
    usernames: trip.userIds.map(user => {
      if (isPopulatedUser(user)) return safeDecrypt(user.usernameEncrypted, "Unknown User");
      return "Unknown User";
    }),
    
    // NEW: Safely map hotels
    hotels: (trip.hotels || []).map(hotel => ({
      hotelName: safeDecrypt(hotel.hotelNameEncrypted, "Unknown Hotel"),
      checkIn: safeDecrypt(hotel.checkInEncrypted, ""),
      checkOut: safeDecrypt(hotel.checkOutEncrypted, ""),
    })),
    
    legs: trip.legs.map(leg => ({
      city: safeDecrypt(leg.cityEncrypted, "Unknown City"),
      startDate: safeDecrypt(leg.startDateEncrypted, "N/A"),
      endDate: safeDecrypt(leg.endDateEncrypted, "N/A"),
      note: safeDecrypt(leg.noteEncrypted, ""), // NEW
      // NEW: Safely map nested attractions
      attractions: (leg.attractions || []).map(attr => ({
        name: safeDecrypt(attr.nameEncrypted, ""),
        description: safeDecrypt(attr.descriptionEncrypted, ""),
      })),
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