"use client";
import React, { useEffect, useState,Suspense  } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bike,
  Car,
  MapPin,
  Truck,
  Navigation,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  XCircle,
  CheckCircle2,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { getSocket } from "@/lib/socket";

type Status =
  | "idle"
  | "rejected"
  | "requested"
  | "confirmed"
  | "started"
  | "awaiting_payment";

type PaymentMethod = "cash" | "online" | null;
type PaymentStep = "transition" | "select";

const VEHICLE_META: Record<string, { label: string; Icon: React.ElementType }> =
  {
    bike: { label: "Bike", Icon: Bike },
    auto: { label: "Auto", Icon: Car },
    car: { label: "Car", Icon: Car },
    loading: { label: "Loading", Icon: Truck },
    truck: { label: "Truck", Icon: Truck },
  };

function CheckoutPage () {
  const router = useRouter();
  const params = useSearchParams();
  const [pickUp] = useState(params.get("pickUp") || "");
  const [drop] = useState(params.get("drop") || "");

  const mobile = params.get("mobile");
  const pickUpLat = Number(params.get("pickUpLat"));
  const pickUpLon = Number(params.get("pickUpLon"));
  const dropLat = Number(params.get("dropLat"));
  const dropLon = Number(params.get("dropLon"));
  const vehicle = params.get("vehicle") || "";
  const driverId = params.get("driverId") || "";
  const vehicleId = params.get("vehicleId") || "";
  const fare = params.get("fare") || "";

  const { Icon } = VEHICLE_META[vehicle] ?? { Icon: Car };

  const [status, setStatus] = useState<Status>("idle");
  const [prevStatus, setPrevStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("transition");
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const handleRequestBooking = async () => {
    if (loading || status !== "idle") return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/booking/create", {
        driverId,
        vehicleId,
        pickUpAddress: pickUp,
        dropAddress: drop,
        pickUpLocation: { type: "Point", coordinates: [pickUpLon, pickUpLat] },
        dropLocation: { type: "Point", coordinates: [dropLon, dropLat] },
        fare,
        mobileNumber: mobile,
      });
      setBookingId(data?.booking?._id || data?._id || null);
      setStatus("requested");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      if (bookingId) {
        await axios.get(`/api/booking/${bookingId}/cancel`);
      }
      router.back();
    } catch (error) {
      console.log(error);
      router.back();
    }
  };

  const handleConfirmPayment = async () => {
    if (!bookingId || !paymentMethod) return;
    setLoading(true);
    try {
      if (paymentMethod == "online") {
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          alert("razorpay script failed to load");
        }

        const { data } = await axios.post("/api/payment/create", {
          bookingId: bookingId,
        });
        console.log(data);

        const paymentObject = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "RYDEX",
          description: "Ride Payment",
          order_id: data.orderId,
          handler: async function (response: any) {
            const { data } = await axios.post("/api/payment/verify", {
              bookingId: bookingId,
              ...response,
            });
            setLoading(false);

            if (data.success) {
              setStatus("confirmed");
              window.location.href = `/user/ride/${bookingId}`;
            }
          },
        });

        paymentObject.open();
      } else {
        const { data } = await axios.get(`/api/booking/${bookingId}/confirm`);
        setLoading(false);
        if (data.success) {
          setStatus("confirmed");
          window.location.href = `/user/ride/${bookingId}`;
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    socket.on("accept-booking", (data) => {
      setStatus(data);
    });
    socket.on("reject-booking", (data) => {
      setStatus(data);
    });
    return () => {
      socket.off("accept-booking");
      socket.off("reject-booking");
    };
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchActiveBooking = async () => {
    try {
      const { data } = await axios.get("/api/booking/active");
      if (!data.booking || data.booking === "idle") {
        setStatus("idle");
      } else {
        const newStatus = data.booking.bookingStatus as Status;
        setBookingId(data.booking._id || null);

        if (newStatus === "awaiting_payment") {
          setPaymentStep((prev) => {
            if (prev === "select") return "select";
            setTimeout(() => setPaymentStep("select"), 2500);
            return "transition";
          });
        }
        setStatus(newStatus);
        setBookingId(data.booking._id || null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    fetchActiveBooking();
  }, []);

  useEffect(() => {
    if (status === "idle") return;
    // Keep polling until payment step is fully shown
    if (status === "awaiting_payment" && paymentStep === "select") return;
    // Stop polling once confirmed — no need to keep hitting the server
    if (status === "confirmed") return;
    const interval = setInterval(fetchActiveBooking, 5000);
    return () => clearInterval(interval);
  }, [status, paymentStep]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderRightCard = () => {
    // ── IDLE ──
    if (status === "idle" || status === "rejected") {

      return (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col justify-between h-full"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
              Ready to go?
            </p>
            <h3 className="text-2xl font-black text-zinc-900 mb-6">
              Confirm Your Ride
            </h3>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-4">
              {[
                {
                  icon: <Clock size={14} />,
                  text: "Driver will respond within 2 minutes",
                },
                {
                  icon: <ShieldCheck size={14} />,
                  text: "Verified & insured drivers only",
                },
                {
                  icon: <CreditCard size={14} />,
                  text: "Pay after driver accepts",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-zinc-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleRequestBooking}
            disabled={loading}
            className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disabled:opacity-40
              text-white font-black text-sm rounded-2xl flex items-center justify-center
              gap-2.5 transition-colors shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <>
                <span>Request Ride</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }

    // ── AWAITING PAYMENT: Transition Screen ──
    if (status === "awaiting_payment" && paymentStep === "transition") {
      return (
        <motion.div
          key="driver-accepted"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center h-full gap-5"
        >
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
            <CheckCircle2
              size={40}
              className="text-zinc-700"
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-zinc-900 mb-1.5">
              Driver Accepted
            </h3>
            <p className="text-sm text-zinc-400 font-medium">
              Preparing payment options...
            </p>
          </div>
          <div className="w-full max-w-[200px] h-1 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-900 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.3, ease: "linear" }}
            />
          </div>
        </motion.div>
      );
    }

    // ── AWAITING PAYMENT: Payment Selection ──
    if (status === "awaiting_payment" && paymentStep === "select") {
      return (
        <motion.div
          key="payment-select"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-between h-full"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
              Almost there
            </p>
            <h3 className="text-2xl font-black text-zinc-900 mb-6">
              Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                  ${
                    paymentMethod === "cash"
                      ? "bg-zinc-900 border-zinc-900"
                      : "bg-zinc-50 border-zinc-100 hover:border-zinc-300"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${paymentMethod === "cash" ? "bg-white/10" : "bg-zinc-200"}`}
                >
                  <Wallet
                    size={18}
                    className={
                      paymentMethod === "cash" ? "text-white" : "text-zinc-500"
                    }
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-black ${paymentMethod === "cash" ? "text-white" : "text-zinc-900"}`}
                  >
                    Cash
                  </p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${paymentMethod === "cash" ? "text-zinc-300" : "text-zinc-400"}`}
                  >
                    Pay driver after ride
                  </p>
                </div>
                {paymentMethod === "cash" && (
                  <CheckCircle2
                    size={20}
                    className="text-white flex-shrink-0"
                    strokeWidth={2}
                  />
                )}
              </button>

              {/* Online */}
              <button
                onClick={() => setPaymentMethod("online")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                  ${
                    paymentMethod === "online"
                      ? "bg-zinc-900 border-zinc-900"
                      : "bg-zinc-50 border-zinc-100 hover:border-zinc-300"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${paymentMethod === "online" ? "bg-white/10" : "bg-zinc-200"}`}
                >
                  <CreditCard
                    size={18}
                    className={
                      paymentMethod === "online"
                        ? "text-white"
                        : "text-zinc-500"
                    }
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-black ${paymentMethod === "online" ? "text-white" : "text-zinc-900"}`}
                  >
                    Online Payment
                  </p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${paymentMethod === "online" ? "text-zinc-300" : "text-zinc-400"}`}
                  >
                    UPI · Card · Netbanking
                  </p>
                </div>
                {paymentMethod === "online" && (
                  <CheckCircle2
                    size={20}
                    className="text-white flex-shrink-0"
                    strokeWidth={2}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={handleConfirmPayment}
            disabled={!paymentMethod || confirmingPayment}
            className="w-full h-14 mt-6 bg-zinc-900 hover:bg-black disabled:opacity-40
              text-white font-black text-sm rounded-2xl flex items-center justify-center
              gap-2.5 transition-colors shadow-md"
          >
            {confirmingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : paymentMethod === "cash" ? (
              <>
                <Wallet size={15} />
                <span>Confirm Cash Ride</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }

    // ── CONFIRMED ──
    if (status === "confirmed") {
      return (
        <motion.div
          key="confirmed"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col flex-1 items-center justify-center gap-6 text-center h-full"
        >
          {/* Animated checkmark with ripple rings */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 14,
              delay: 0.1,
            }}
            className="relative flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
              <CheckCircle
                size={44}
                className="text-zinc-900"
                strokeWidth={1.5}
              />
            </div>
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.15 }}
                className="absolute inset-0 rounded-full border-2 border-zinc-900"
              />
            ))}
          </motion.div>

          {/* Text */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-zinc-900 mb-1.5"
            >
              Ride Confirmed!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 text-sm font-medium max-w-xs"
            >
              Your driver is on the way. Track live from the ride screen.
            </motion.p>
          </div>

          {/* Track Your Ride button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              window.location.href = `/user/ride/${bookingId}`;
            }}
            className="flex items-center gap-2.5 bg-zinc-900 hover:bg-black text-white
              font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-md"
          >
            Track Your Ride
            <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      );
    }

    // ── REQUESTED / STARTED: Spinner ──
    return (
      <motion.div
        key={`status-${status}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center h-full gap-6 py-4"
      >
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin" />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-black text-zinc-900 mb-1.5">
            {status === "requested" && "Finding Your Driver"}
            {status === "started" && "Ride in Progress"}
          </h3>
          <p className="text-sm text-zinc-400 font-medium">
            {status === "requested" && "Waiting for driver to accept..."}
            {status === "started" && "Enjoy your ride!"}
          </p>
        </div>

        {status === "requested" && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200
              bg-white text-zinc-700 text-sm font-semibold
              hover:bg-zinc-50 hover:border-zinc-300
              disabled:opacity-40 transition-all shadow-sm"
          >
            {cancelling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <XCircle size={15} className="text-zinc-500" />
                <span>Cancel Request</span>
              </>
            )}
          </motion.button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-12">
      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-zinc-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Booking
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">
            Checkout
          </h1>
          <p className="text-zinc-400 text-sm mt-1.5 font-medium">
            Review your ride and confirm
          </p>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT CARD — Ride Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
          >
            <div className="h-1 bg-zinc-900" />
            <div className="p-8 sm:p-10 flex flex-col flex-1">
              {/* Vehicle Row */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
                    Selected Vehicle
                  </div>
                  <div className="text-3xl font-black tracking-tight text-zinc-900 capitalize">
                    {vehicle}
                  </div>
                </div>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Icon size={24} className="text-white" />
                </div>
              </div>

              {/* Pickup & Drop */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8">
                <div className="flex items-stretch gap-4 px-5 pt-4 pb-3 border-b border-zinc-100">
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white ring-1 ring-zinc-400" />
                    <div
                      className="w-px flex-1 bg-zinc-300 my-1"
                      style={{ minHeight: 16 }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400 mb-1">
                      Pickup
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {pickUp}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center pt-4">
                    <MapPin size={13} className="text-zinc-300" />
                  </div>
                </div>

                <div className="flex items-stretch gap-4 px-5 pt-3 pb-4">
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white ring-1 ring-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400 mb-1">
                      Drop
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {drop}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start pt-4">
                    <Navigation size={13} className="text-zinc-300" />
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              {/* Fare */}
              <div className="flex items-end justify-between pt-6 border-t border-zinc-100">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
                    Total Fare
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">
                    Includes base + distance charges
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-zinc-400">₹</span>
                  <span className="text-5xl font-black tracking-tight text-zinc-900 leading-none">
                    {fare}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT CARD — Dynamic content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.14,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col min-h-[420px]"
          >
            <div className="h-1 bg-zinc-900" />
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
              <AnimatePresence mode="wait">{renderRightCard()}</AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

export default CheckoutPageWrapper;