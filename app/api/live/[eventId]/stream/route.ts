import { NextResponse } from "next/server"

// This would be a WebSocket endpoint in a real application
// For now, we'll just return a mock response
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  return new NextResponse(JSON.stringify({ message: "WebSocket connections not supported in this demo" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
