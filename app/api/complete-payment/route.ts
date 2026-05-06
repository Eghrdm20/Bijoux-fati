import { NextResponse } from "next/server"

const BASE_URL = "https://api.testnet.minepi.com"

export async function GET() {
  return NextResponse.json({
    status: "complete-payment route is working",
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const paymentId = body.paymentId
    const txid = body.txid

    if (!paymentId || !txid) {
      return NextResponse.json(
        {
          error: "paymentId and txid required",
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BASE_URL}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txid,
        }),
      }
    )

    const text = await response.text()

    console.log("COMPLETE RESPONSE:", text)

    return NextResponse.json({
      success: response.ok,
      response: text,
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    )
  }
}
