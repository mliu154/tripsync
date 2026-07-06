import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import type { Trip, CreateTripRequest } from "@/trip_types";
import jwt from "jsonwebtoken";
import TripObj from "@/models/TripObj";
import { encryptTripLegs, decryptTripLegs } from "@/TripMapper";
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

    const trip = await TripObj.findOne({ _id: id, userIds: payload.userId });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Pass the full trip document, not just legs
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
    if (!Array.isArray(body.legs)) {
      return NextResponse.json(
        { error: "Invalid trip format" },
        { status: 400 },
      );
    }
    const encryptedLegs = encryptTripLegs(body.legs);
    const updated = await TripObj.findOneAndUpdate(
      { _id: id, userIds: payload.userId },
      {
        $set: {
          legs: encryptedLegs,
        },
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
