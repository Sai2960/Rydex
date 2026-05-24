"use client";
import { vehicleType } from "@/models/vehicle.model";
import {
  ArrowRight,
  Bike,
  Car,
  Clock,
  Gauge,
  IndianRupee,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";

const VEHICLE_META: any = {
  bike: { label: "Bike", Icon: Bike },
  auto: { label: "Auto", Icon: Car },
  car: { label: "Car", Icon: Car },
  loading: { label: "Loading", Icon: Truck },
  truck: { label: "Truck", Icon: Truck },
};
interface IVehicle {
  owner: string;
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

function VehicleCard({
  vehicle,
  distance,
  onBook,
}: {
  vehicle: IVehicle;
  distance: number | undefined;
  onBook: () => void;
}) {
  const { Icon, label } = VEHICLE_META[vehicle.type];
  let estimated: number = 0;
  if (vehicle.baseFare && vehicle.pricePerKM && distance) {
    estimated = Math.round(vehicle.baseFare + vehicle.pricePerKM * distance);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.13)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white border border-zinc-200/80 rounded-3xl overflow-hidden flex flex-col group cursor-default"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.9)_0%,_transparent_70%)]" />

        <motion.img
          src={vehicle.imageUrl}
          alt={vehicle.vehicleModel}
          className="relative z-10 h-34 w-full object-contain px-4"
          style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.16))" }}
          whileHover={{
            scale: 1.07,
            filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.24))",
          }}
          transition={{ duration: 0.38 }}
        />

        {/* Type badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
          <Icon size={10} />
          {label}
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-sm">
          <Star size={9} className="fill-amber-400 text-amber-400" />
          <span className="text-zinc-800">4.8</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-100" />

      {/* Info Section */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-zinc-900 text-[15px] font-black tracking-tight leading-tight truncate capitalize">
            {vehicle.vehicleModel}
          </h3>
          <div className="mt-2 inline-flex items-center bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200/80">
            <span className="text-zinc-400 text-[10px] font-black tracking-[0.22em] font-mono uppercase">
              {vehicle.number}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shadow-sm">
          <Icon size={18} className="text-zinc-600" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={11} className="text-zinc-400" />
            <p className="text-zinc-400 text-[9px] uppercase tracking-widest font-bold">
              Per KM
            </p>
          </div>
          <p className="text-zinc-900 text-sm flex items-center font-black">
            <IndianRupee size={11} />
            {vehicle.pricePerKM}
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={11} className="text-zinc-400" />
            <p className="text-zinc-400 text-[9px] uppercase tracking-widest font-bold">
              Waiting
            </p>
          </div>
          <div className="text-zinc-900 text-sm font-black flex items-center">
            <IndianRupee size={11} />
            {vehicle.waitingCharge}
            <span>/min</span>
          </div>
        </div>

        <div className="col-span-2 flex items-end justify-between pt-3 border-t border-zinc-100">
          <div>
            <p className="text-zinc-400 text-[9px] uppercase tracking-widest font-bold mb-0.5">
              Est. Fare
            </p>
            <motion.div
              key={estimated}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-baseline gap-0.5"
            >
              <IndianRupee
                size={16}
                className="text-zinc-900 mb-0.5"
                strokeWidth={2.5}
              />
              <span className="text-zinc-900 text-3xl font-black tracking-tight leading-none">
                {estimated}
              </span>
            </motion.div>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={onBook}
            className=" flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-sm font-black px-6 py-3.5 rounded-2xl transition-colors shadow-md"
          >
            Book
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default VehicleCard;
