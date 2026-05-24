import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }
    await connectDb();

    // ✅ STATS
    const totalPartners = await User.countDocuments({ role: "partner" });

    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });

    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });

    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    // ✅ GET PENDING PARTNERS FOR REVIEW
    const pendingPartners = await User.find({
      role: "partner",
      partnerStatus: "pending",
    }).sort({ createdAt: -1 });

    // ✅ OPTIONAL: attach vehicle type
    const partnerIds = pendingPartners.map((p) => p._id);

    const vehicles = await Vehicle.find({
      owner: { $in: partnerIds },
    });

    const vehicleMap = new Map(vehicles.map((v) => [String(v.owner), v.type]));

    const pendingPartnersReviews = pendingPartners.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleMap.get(String(p._id)) || "N/A",
    }));

    // ✅ VEHICLE REVIEWS
  // ✅ VEHICLE REVIEWS — only show after pricing is submitted (step 6+)
const pendingVehicles = await Vehicle.find({ status: "pending" })
  .populate({
    path: "owner",
    select: "name email partnerOnBoardingSteps",
    match: { partnerOnBoardingSteps: { $gte: 6 } },
  })
  .then((vehicles) => vehicles.filter((v) => v.owner !== null));
  
    return Response.json({
      stats: {
        totalPartners,
        totalApprovedPartners,
        totalPendingPartners,
        totalRejectedPartners,
      },
      pendingPartnersReviews,
      pendingVehicles,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ message: "dashboard error" }, { status: 500 });
  }
}
