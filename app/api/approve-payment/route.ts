import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()

    console.log("PAYMENT ID:", paymentId)
    console.log("API KEY:", process.env.PI_API_KEY)

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    console.log("PI RESPONSE:", data)

    return NextResponse.json(data, {
      status: response.ok ? 200 : 500,
    })
  } catch (e: any) {
    console.log("ERROR:", e)

    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
