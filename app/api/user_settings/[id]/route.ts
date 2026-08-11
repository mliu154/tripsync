// app/api/user_settings/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import jwt from "jsonwebtoken";
import TripObj from "@/models/TripObj";
import User from "@/models/User";
import { hashUsername } from "@/hashUsername";
import { cookies } from "next/headers";
import { Types } from "mongoose";

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

    // --- CHANGED: Safely parse the request body to handle both Leave (no body) and Remove (body exists)
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};

    // --- CHANGED: Default the target user to the logged-in user (Leave Trip logic)
    let targetUserId = payload.userId;

    // --- CHANGED: If a username was provided, switch to "Remove User" logic
    if (body.username) {
      const usernameHashed = hashUsername(body.username);
      const userToRemove = await User.findOne({ usernameHash: usernameHashed });
      
      if (!userToRemove) {
        return NextResponse.json({ error: "Target user to remove not found." }, { status: 404 });
      }
      
      targetUserId = userToRemove._id.toString();

      // --- CHANGED: Verify Permissions. Only the Owner (Index 0) can remove OTHER users.
      const ownerId = trip.userIds[0].toString();
      if (ownerId !== payload.userId && targetUserId !== payload.userId) {
        return NextResponse.json({ error: "Only the trip owner can remove other members." }, { status: 403 });
      }
    }

    // --- CHANGED: Prevent removing a user who isn't actually in the trip array
    if (!trip.userIds.map((uid: Types.ObjectId) => uid.toString()).includes(targetUserId)) {
        return NextResponse.json({ error: "User is not a member of this trip." }, { status: 400 });
    }

    // --- CHANGED: Target the specific user being removed instead of strictly the logged-in user
    if (trip.userIds.length === 1 && trip.userIds[0].toString() === targetUserId) {
      await TripObj.deleteOne({ _id: id });
      return NextResponse.json({
        message: "Trip deleted because it had no remaining users.",
      });
    } else {
      const updated = await TripObj.findOneAndUpdate(
        { _id: id, userIds: payload.userId },
        {
          $pull: {
            userIds: targetUserId, // CHANGED: Pulls the specific target user ID
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );
      
      if (!updated) {
        return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
      }
      
      return NextResponse.json(updated);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}