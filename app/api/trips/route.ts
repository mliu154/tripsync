// /app/api/trips/route.ts

import mongoose, { Types } from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/dbConnect';
import TripObj from '@/models/TripObj';
import { encryptSecret, decryptSecret } from '@/crypto';
import { decryptTripLegs } from '@/TripMapper';
import { TripDocument, CreateTripRequest } from '@/trip_types';

// How the Trip document looks in MongoDB
type EncryptedTripLeg = {
  cityEncrypted: string;
  startDateEncrypted: string;
  endDateEncrypted: string;
};

// ----- GET Route: fetch all trips for the logged-in user -----
export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify JWT
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const userId = new mongoose.Types.ObjectId(payload.userId);

  // Fetch trips for this user
  const trips = (await TripObj.find({ userIds: userId }).populate('userIds', 'usernameEncrypted')) as unknown as TripDocument[];

  // Decrypt each leg
  const decryptedTrips = trips.map(trip => decryptTripLegs(trip));

  return NextResponse.json(decryptedTrips);
}

// ----- POST Route: create a new trip -----
export async function POST(request: NextRequest): Promise<Response> {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const userId = new mongoose.Types.ObjectId(payload.userId);

  // Validate request body
  const body = (await request.json()) as CreateTripRequest;

  if (!body.legs || !Array.isArray(body.legs) || body.legs.length === 0) {
    return NextResponse.json(
      { error: 'Trip must have at least one leg.' },
      { status: 400 }
    );
  }

  // Encrypt each leg
  const encryptedLegs = body.legs.map(leg => ({
    cityEncrypted: encryptSecret(leg.city),
    startDateEncrypted: encryptSecret(leg.startDate),
    endDateEncrypted: encryptSecret(leg.endDate),
    noteEncrypted: encryptSecret(leg.note || ""),
    attractions: (leg.attractions || []).map(attr => ({
      nameEncrypted: encryptSecret(attr.name),
      descriptionEncrypted: encryptSecret(attr.description || ""),
    })),
  }));

  const encryptedHotels = (body.hotels || []).map(hotel => ({
    hotelNameEncrypted: encryptSecret(hotel.hotelName),
    checkInEncrypted: encryptSecret(hotel.checkIn),
    checkOutEncrypted: encryptSecret(hotel.checkOut),
  }));

  // Save trip
  const trip = await TripObj.create({
    nameEncrypted: encryptSecret(body.name || 'Untitled Trip'),
    userIds: [userId],
    legs: encryptedLegs,
    hotels: encryptedHotels,
  });

  return NextResponse.json(trip, { status: 201 });
}