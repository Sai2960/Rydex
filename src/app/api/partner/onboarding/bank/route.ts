import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

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

    const { accountHolder, accountNumber, upi, ifsc, mobileNumber } =
      await req.json();
    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
      return Response.json(
        { message: "send all bank details" },
        { status: 400 }
      );
    }

    // FIXED: find then create/update instead of upsert
    let partnerBank = await PartnerBank.findOne({ owner: user._id });

    if (partnerBank) {
      partnerBank.accountHolder = accountHolder;
      partnerBank.accountNumber = accountNumber;
      partnerBank.ifsc = ifsc;
      partnerBank.upi = upi;
      partnerBank.status = "added";
      await partnerBank.save();
    } else {
      partnerBank = await PartnerBank.create({
        owner: user._id,
        accountHolder,
        accountNumber,
        ifsc,
        upi,
        status: "added",
      });
    }

    user.mobileNumber = mobileNumber;
    user.partnerOnBoardingSteps = 3;
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(partnerBank, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `partner bank error ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const partnerBank = await PartnerBank.findOne({ owner: user._id });

    return Response.json(
      { mobileNumber: user.mobileNumber, partnerBank: partnerBank || null },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `get partner bank error ${error}` },
      { status: 500 }
    );
  }
}