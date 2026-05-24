"use client";
import { IUser } from "@/models/user.model";
import { vehicleType } from "@/models/vehicle.model";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  CircleDashed,
  Clock,
  ImageIcon,
  IndianRupee,
  Truck,
  XCircle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface IVehicle {
  owner: IUser;
  type: vehicleType;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function page() {
  const { id } = useParams();
  const [data, setData] = useState<IVehicle>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await axios.get(`/api/admin/reviews/vehicle/${id}`);
        setData(result.data);
      } catch (error: any) {
        console.log(error.response?.data?.message ?? error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const { data } = await axios.get(
        `/api/admin/reviews/vehicle/${id}/approve`
      );
      console.log(data);
      setApproveLoading(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const { data } = await axios.post(
        `/api/admin/reviews/vehicle/${id}/reject`,
        { rejectionReason }
      );
      console.log(data);
      setRejectLoading(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      setRejectLoading(false);
    }
  };

  const statusConfig = {
    approved: {
      icon: <CheckCircle size={14} />,
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    rejected: {
      icon: <XCircle size={14} />,
      label: "Rejected",
      className: "bg-red-50 text-red-700 border border-red-200",
    },
    pending: {
      icon: <Clock size={14} />,
      label: "Pending Review",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
  };

  const currentStatus = data?.status
    ? statusConfig[data.status]
    : statusConfig.pending;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500 text-sm">
        Loading vehicle...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top nav */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                       hover:bg-gray-50 transition-all duration-150 text-gray-600"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {data?.owner?.name ?? "—"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {data?.owner?.email}
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${currentStatus.className}`}
          >
            {currentStatus.icon}
            {currentStatus.label}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Left — vehicle image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm"
        >
          {data?.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Vehicle"
              className="w-full h-[420px] object-cover"
            />
          ) : (
            <div className="h-[420px] flex flex-col items-center justify-center gap-3 bg-gray-50">
              <ImageIcon size={32} strokeWidth={1.5} className="text-gray-300" />
              <span className="text-sm text-gray-400">No image uploaded</span>
            </div>
          )}

          {data && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={13} />
                Registered{" "}
                {new Date(data.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  data.isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {data.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right — detail cards */}
        <div className="space-y-4">
          {/* Vehicle Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <Truck size={14} />
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                Vehicle Details
              </span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <DetailRow
                label="Vehicle Type"
                value={
                  data?.type
                    ? data.type.charAt(0).toUpperCase() + data.type.slice(1)
                    : "-"
                }
              />
              <Divider />
              <DetailRow
                label="Registration Number"
                value={data?.number ?? "-"}
                mono
              />
              <Divider />
              <DetailRow label="Model" value={data?.vehicleModel ?? "-"} />
            </div>
          </motion.div>

          {/* Pricing Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <IndianRupee size={14} />
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                Pricing Configuration
              </span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <PricingRow label="Base Fare" value={data?.baseFare ?? 0} />
              <Divider />
              <PricingRow label="Price Per KM" value={data?.pricePerKM ?? 0} />
              <Divider />
              <PricingRow
                label="Waiting Charge"
                value={data?.waitingCharge ?? 0}
                sublabel="/ min"
              />
            </div>
          </motion.div>

          {/* Rejection reason — only when rejected */}
          {data?.status === "rejected" && data.rejectionReason && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={14} className="text-red-500" />
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                  Rejection Reason
                </span>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">
                {data.rejectionReason}
              </p>
            </motion.div>
          )}

          {/* Admin Check — only when pending */}
          {data?.status === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Admin Check
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Verify documents carefully before approving.
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 flex flex-col gap-3">
                <button
                  onClick={() => setShowApprove(true)}
                  className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold
                             hover:bg-gray-800 active:scale-[0.98] transition-all duration-150"
                >
                  Approve
                </button>

                <button
                  onClick={() => setShowReject(true)}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold
                             hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Approve Modal ── */}
      <AnimatePresence>
        {showApprove && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Approve Vehicle?
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Confirm all information has been verified. This action will
                activate the vehicle on the platform.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                             text-gray-700 hover:bg-gray-50 transition-all duration-150"
                  onClick={() => setShowApprove(false)}
                  disabled={approveLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold
                             hover:bg-gray-800 transition-all duration-150 flex items-center justify-center gap-2
                             disabled:opacity-60"
                  onClick={handleApprove}
                  disabled={approveLoading}
                >
                  {approveLoading ? (
                    <CircleDashed size={16} className="animate-spin" />
                  ) : (
                    "Yes, Approve"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {showReject && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <XCircle size={20} className="text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Reject Vehicle?
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Please provide a reason. The partner will be notified.
              </p>
              <textarea
                placeholder="Enter rejection reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full mt-4 border border-gray-200 rounded-xl p-3 text-sm
                           text-gray-900 placeholder:text-gray-400 resize-none
                           focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
              />
              <div className="flex gap-3 mt-4">
                <button
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                             text-gray-700 hover:bg-gray-50 transition-all duration-150"
                  onClick={() => {
                    setShowReject(false);
                    setRejectionReason("");
                  }}
                  disabled={rejectLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold
                             hover:bg-red-700 transition-all duration-150 flex items-center justify-center gap-2
                             disabled:opacity-60"
                  onClick={handleReject}
                  disabled={rejectLoading || rejectionReason.trim() === ""}
                >
                  {rejectLoading ? (
                    <CircleDashed size={16} className="animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── small helpers ── */

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-sm text-gray-900 font-medium text-right ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PricingRow({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-semibold flex items-center gap-0.5">
        <IndianRupee size={13} strokeWidth={2.5} />
        {value.toLocaleString("en-IN")}
        {sublabel && (
          <span className="text-xs text-gray-400 font-normal ml-0.5">
            {sublabel}
          </span>
        )}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-50" />;
}

export default page;