import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }

    await connectDb();

    const vehicleId = (await context.params).id;

    const vehicle = await Vehicle.findById(vehicleId).populate({
      path: "owner",
      select: "name email",
    });
    if (!vehicle) {
      return Response.json({ message: "vehicle not found" }, { status: 404 });
    }

    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `vehicle review get error ${error}` },
      { status: 500 },
    );
  }
}
