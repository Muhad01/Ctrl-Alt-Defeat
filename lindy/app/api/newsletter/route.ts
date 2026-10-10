import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Send to Zapier webhook
    const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/16564147/2voqwyp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: "website_newsletter",
        timestamp: new Date().toISOString(),
      }),
    })

    if (!zapierResponse.ok) {
      throw new Error("Failed to submit to Zapier")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Newsletter submission error:", error)
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
  }
}
