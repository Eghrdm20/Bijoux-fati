import { NextResponse } from "next/server"

const BASE_URL = "https://api.testnet.minepi.com"

export async function GET() {
  return NextResponse.json({
    status: "approve-payment route is working",
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("BODY:", body)

    const paymentId = body.paymentId

    if (!paymentId) {
      return NextResponse.json(
        {
          error: "paymentId is required",
        },
        { status: 400 }
      )
    }

    console.log("PAYMENT ID:", paymentId)
    console.log("USING TESTNET API")

    const response = await fetch(
      `${BASE_URL}/v2/payments/${paymentId}/approve`,
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
