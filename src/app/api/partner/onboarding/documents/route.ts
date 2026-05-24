import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import PartnerDocs from "@/models/partnerDocs.model";
import { NextRequest } from "next/server";
import uploadOnCloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 404 });
    }

    const formdata = await req.formData();
    const aadhar = formdata.get("aadhar") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;

    if (!aadhar || !license || !rc) {
      return Response.json(
        { message: "all documents are required" },
        { status: 400 }
      );
    }

    const updatePayload: any = { status: "pending" };

    // Upload Aadhar
    const aadharUrl = await uploadOnCloudinary(aadhar);
    if (!aadharUrl) {
      return Response.json(
        { message: "aadhar upload failed" },
        { status: 500 }
      );
    }
    updatePayload.aadharUrl = aadharUrl;

    // Upload License
    const licenseUrl = await uploadOnCloudinary(license);
    if (!licenseUrl) {
      return Response.json(
        { message: "license upload failed" },
        { status: 500 }
      );
    }
    updatePayload.licenseUrl = licenseUrl;

    // Upload RC
    const rcUrl = await uploadOnCloudinary(rc);
    if (!rcUrl) {
      return Response.json(
        { message: "rc upload failed" },
        { status: 500 }
      );
    }
    updatePayload.rcUrl = rcUrl;

    // Save docs using findOneAndUpdate (upsert)
    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    // Update onboarding step if not already past step 2
    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
    }
    else{
      user.partnerOnBoardingSteps = 3;
    }
     user.partnerStatus="pending"
    await user.save();

    return Response.json(partnerDocs, { status: 201 });

  } catch (error) {
    return Response.json(
      { message: `partner docs error ${error}` },
      { status: 500 }
    );
  }
}

