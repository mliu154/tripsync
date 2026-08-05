import dbConnect from "@/dbConnect";
import TripObj from "@/models/TripObj";
import { decryptSecret } from "@/crypto";
import { sendTrips } from "./ThirdPartyClient";

export async function getBroadcastPayload() {
    await dbConnect();

    const trips = await TripObj.find({});

    return trips.map((trip) => ({
        id: trip._id,
        userIds: trip.userIds,
        legs: trip.legs.map((leg) => ({
            city: decryptSecret(leg.cityEncrypted),
            startDate: decryptSecret(leg.startDateEncrypted),
            endDate: decryptSecret(leg.endDateEncrypted)
        }))
    }));
}

export async function broadcastTrips() {

    await dbConnect();

    const trips = await TripObj.find({});

    const payload = trips.map((trip: any) => ({

        id: trip._id,

        userIds: trip.userIds,

        legs: trip.legs.map((leg: any) => ({

            city: decryptSecret(leg.cityEncrypted),

            startDate: decryptSecret(leg.startDateEncrypted),

            endDate: decryptSecret(leg.endDateEncrypted)

        }))

    }));


    const response = await sendTrips(payload);

    return {

        success: true,

        tripsBroadcasted: payload.length,

        thirdPartyResponse: response

    };

}