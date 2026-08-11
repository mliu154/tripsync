import { NextRequest, NextResponse } from "next/server";
import { getBroadcastPayload, broadcastTrips } from "@/services/BroadcastService";



export async function GET() {
    try {
        const payload = await getBroadcastPayload();

        return NextResponse.json({
            success: true,
            totalTrips: payload.length,
            trips: payload
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {

    try {

        const result = await broadcastTrips();

        return NextResponse.json(result, {
            status: 200
        });

    }
    catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );

    }

}