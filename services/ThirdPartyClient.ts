export async function sendTrips(payload: any[]) {

    const url = process.env.THIRD_PARTY_URL;

    if (!url) {

        throw new Error("THIRD_PARTY_URL is missing.");

    }

    const response = await fetch(url, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "x-api-key": process.env.THIRD_PARTY_API_KEY || ""

        },

        body: JSON.stringify(payload)

    });

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Broadcast failed (${response.status}) ${errorText}`
        );

    }

    return await response.json();

}