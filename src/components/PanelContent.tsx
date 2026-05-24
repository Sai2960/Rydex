"use client";
import { RootState } from "@/redux/store";
import {
  Bike,
  Car,
  Clock,
  IndianRupee,
  MessageCircle,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import RideChat from "./RideChat";

const getVehicleIcon = (vehicleType?: string) => {
  switch (vehicleType?.toLowerCase()) {
    case "bike":
      return <Bike size={18} className="text-white" />;
    case "auto":
      return <Car size={18} className="text-white" />;
    case "truck":
      return <Truck size={18} className="text-white" />;
    case "car":
    default:
      return <Car className="w-4 h-4 text-white" />;
  }
};

function BookingListItem({ booking }: { booking: any }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
          <User size={26} className="text-zinc-300" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-zinc-900" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white font-bold text-base truncate">
            {booking?.user?.name || "customer"}
          </p>
          <div className="flex items-center gap-1 bg-zinc-800 px-3 py-1.5 rounded-full flex-shrink-0">
            <IndianRupee size={12} className="text-amber-400" />
            <span className="text-white text-sm font-bold">{booking.fare}</span>
          </div>
        </div>
        {booking?.user?.phone && (
          <p className="text-zinc-400 text-sm mt-0.5 truncate">
            {booking.user.phone}
          </p>
        )}
      </div>
    </div>
  );
}

function PanelContent({
  isActive,
  displayDistance,
  displayEta,
  cfg,
  status,
  booking,
  bookingList,
  paymentStatus,
  canChat,
  chatOpen,
  onChatToggle,
  currentRole,
}: any) {
  return (
    <div className="flex flex-col pt-5 pb-4 gap-3">
      {/* ETA + Fare Cards */}
      {isActive && (
        <div className="mx-5 lg:mx-6 grid grid-cols-2 gap-2">
          {/* ETA Card */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-zinc-600" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                ETA
              </p>
              <p className="text-lg font-black text-zinc-900 leading-none mt-0.5">
                {Math.round(displayEta)} <span>min</span>
              </p>
            </div>
          </div>

          {/* Fare Card */}
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Fare
              </p>
              <p className="text-lg font-black text-white leading-none mt-0.5">
                {booking?.fare || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      {booking?.user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-5 lg:mx-6"
        >
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
                <User size={26} className="text-zinc-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-zinc-950" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">
                {booking.user.name || ""}
              </p>

              {booking?.paymentStatus && paymentStatus ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      paymentStatus.cls ?? "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {paymentStatus.label}
                  </span>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm mt-0.5 truncate">
                  {booking.user.phone || ""}
                </p>
              )}
            </div>

            {/* Fare Badge */}
            {booking?.fare && (
              <div className="flex-shrink-0 flex items-center gap-1 bg-zinc-800 rounded-xl px-3 py-1.5">
                <IndianRupee size={13} className="text-amber-400" />
                <p className="text-white text-sm font-bold">{booking.fare}</p>
              </div>
            )}

            {/* Rating Badge */}
            {booking.user.rating && (
              <div className="flex-shrink-0 bg-zinc-800 rounded-xl px-3 py-1.5">
                <p className="text-white text-sm font-bold">
                  {booking.user.rating}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Booking List */}
      {bookingList && bookingList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-5 lg:mx-6 flex flex-col gap-2"
        >
          {bookingList.map((item: any, index: number) => (
            <motion.div
              key={item.id ?? index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <BookingListItem booking={item} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Call + Chat Buttons — always OUTSIDE and BELOW the list */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mx-5 lg:mx-6 flex gap-3"
        >
          {/* Call Button */}
          {booking?.userMobileNumber && (
            <a
              href={`tel:${booking.userMobileNumber}`}
              className={`flex flex-1 items-center justify-center gap-2
                bg-zinc-100 hover:bg-zinc-200 active:scale-[0.97]
                transition-all text-zinc-900 py-3.5 rounded-2xl text-sm font-semibold`}
            >
              <Phone size={15} />
              Call
            </a>
          )}

          {/* Message Button */}
          {canChat && (
            <button
              onClick={onChatToggle}
              className={`flex flex-1 items-center justify-center gap-2
                active:scale-[0.97] transition-all py-3.5 rounded-2xl text-sm font-semibold
                ${
                  chatOpen
                    ? "bg-zinc-200 text-zinc-900"
                    : "bg-zinc-900 hover:bg-zinc-800 text-white"
                }`}
            >
              <MessageCircle size={15} />
              {chatOpen ? "Close Chat" : "Message"}
            </button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {chatOpen && canChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-5 lg:mx-6 overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden border border-zinc-100 h-[460px]">
              <RideChat
                currentRole={currentRole}
                bookingId={booking._id}
                userName={booking?.user?.name || "customer"}
                driverName={booking.driver.name || "driver"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {booking?.vehicle && (
        <div className="mx-5 lg:mx-6">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
              {getVehicleIcon(booking.vehicle.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Your Vehicle
              </p>
              <p className="text-sm font-bold text-zinc-900 truncate">
                {booking.vehicle.vehicleModel ?? "vehicle"}
              </p>
            </div>

            <div className="flex-shrink-0 bg-zinc-900 px-3 py-1.5 rounded-lg">
              <p className="text-white text-xs font-black tracking-widest font-mono">
                {booking.vehicle.number ?? "number"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-5 lg:mx-6">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-zinc-100">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div
                className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-whi
        shadow-sm"
              />
              <div className='w-px bg-zinc-200 mt-1" style={{ height: 20 }} ' />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold text-zinc-400 uppercase
        tracking-wider mb-0.5"
              >
                PickUp
              </p>
              <p className='text-sm text-zinc-800 leading-snug'>{booking?.pickUpAddress}</p>
            </div>
          </div>



             <div className="flex gap-3 p-4 border-b border-zinc-100">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div
                className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-whi
        shadow-sm"
              />
              <div className='w-px bg-zinc-200 mt-1" style={{ height: 20 }} ' />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold text-zinc-400 uppercase
        tracking-wider mb-0.5"
              >
                Drop
              </p>
              <p className='text-sm text-zinc-800 leading-snug'>{booking?.dropAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelContent;
