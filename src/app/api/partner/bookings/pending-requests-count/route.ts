import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const count = await Booking.countDocuments({
      driver: new mongoose.Types.ObjectId(session.user.id),
      bookingStatus: "requested",
    });

    return NextResponse.json(count);
  } catch (error) {
    return NextResponse.json({ message: `error: ${error}` }, { status: 500 });
  }
}