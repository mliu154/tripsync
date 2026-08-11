/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/trips/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import type { TripDocument } from "@/trip_types";
import jwt from "jsonwebtoken";
import TripObj from "@/models/TripObj";
import { encryptTripLegs, decryptTripLegs } from "@/TripMapper";
import { encryptSecret } from "@/crypto"; 
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();

    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload: { userId: string } = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as { userId: string };

    // Fetch the specific trip and populate the userIds to extract the usernames for the mapper
    const trip = (await TripObj.findOne({ _id: id, userIds: payload.userId })
      .populate('userIds', 'usernameEncrypted')) as unknown as TripDocument;

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Pass the full populated trip document through the mapper
    const decryptedTrip = decryptTripLegs(trip);

    return NextResponse.json(decryptedTrip);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload: { userId: string } = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as { userId: string };

    // Dynamically build the update object based on what was passed from the frontend
    const updateData: Record<string, unknown> = {};

    if (body.name) {
      updateData.nameEncrypted = encryptSecret(body.name);
    }

    if (body.legs && Array.isArray(body.legs)) {
      updateData.legs = body.legs.map((leg: any) => ({
        cityEncrypted: encryptSecret(leg.city),
        startDateEncrypted: encryptSecret(leg.startDate),
        endDateEncrypted: encryptSecret(leg.endDate),
        noteEncrypted: encryptSecret(leg.note || ""),
        attractions: (leg.attractions || []).map((attr: any) => ({
          nameEncrypted: encryptSecret(attr.name),
          descriptionEncrypted: encryptSecret(attr.description || ""),
        })),
      }));
    }

    if (body.hotels && Array.isArray(body.hotels)) {
      updateData.hotels = body.hotels.map((hotel: any) => ({
        hotelNameEncrypted: encryptSecret(hotel.hotelName),
        checkInEncrypted: encryptSecret(hotel.checkIn),
        checkOutEncrypted: encryptSecret(hotel.checkOut),
      }));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No data provided to update" }, { status: 400 });
    }

    const updated = await TripObj.findOneAndUpdate(
      { _id: id, userIds: payload.userId },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    
    if (!updated) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload: { userId: string } = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as { userId: string };
    
    const { id } = await params;
    
    const deleted = await TripObj.findOneAndDelete({
      _id: id,
      userIds: payload.userId,
    });
    
    if (!deleted) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}