import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "complete-payment route is working",
  })
}

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: "paymentId and txid are required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.ok ? 200 : 500,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
