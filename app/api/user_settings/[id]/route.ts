import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import jwt from "jsonwebtoken";
import TripObj from "@/models/TripObj";
import User from "@/models/User";
import { hashUsername } from "@/hashUsername";
import { cookies } from "next/headers";
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};
export async function POST(request: NextRequest, { params }: RouteContext) {
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
    if (!body.username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }
    const usernameHashed = hashUsername(body.username);
    const user = await User.findOne({
      usernameHash: usernameHashed,
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updated = await TripObj.findOneAndUpdate(
      { _id: id, userIds: payload.userId },
      {
        $addToSet: {
          userIds: user._id,
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
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
    if (trip.userIds.length === 1) {
      await TripObj.deleteOne({ _id: id });
      return NextResponse.json({
        message: "Trip deleted because it had no remaining users.",
      });
    } else {
      const updated = await TripObj.findOneAndUpdate(
        { _id: id, userIds: payload.userId },
        {
          $pull: {
            userIds: payload.userId,
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
    }
  } catch {
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
