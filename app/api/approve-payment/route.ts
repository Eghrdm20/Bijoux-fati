import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("BODY:", body)

    const paymentId = body.paymentId

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

    const text = await response.text()

    console.log("PI RESPONSE:", text)

    return NextResponse.json({
      success: response.ok,
      response: text,
    })
  } catch (e: any) {
    console.log("ERROR:", e)

    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    )
  }
}
