import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "approve-payment route is working",
  })
}

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      )
    }

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
