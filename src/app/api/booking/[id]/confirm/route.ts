import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDb();
    const bookingId = (await context.params).id;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "booking is not found." },
        { status: 400 },
      );
    }

    booking.paymentStatus = "cash";
    booking.bookingStatus = "confirmed";
    await booking.save();

    return NextResponse.json(
      { success: true, message: "booking confirmed with cash payment" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `cash confirm error $
                        {error}`,
      },
      { status: 500 },
    );
  }
}
