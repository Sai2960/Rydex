"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { setUserData } from "@/redux/userSlice";
import AuthModal from "@/components/AuthModal";
import axios from "axios";
import { getSocket } from "@/lib/socket";

const Nav_Items = ["Home", "Bookings", "About Us", "Contact"];

function Nav({ onAuthRequired }: { onAuthRequired?: () => void }) {
  const pathName = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { userData } = useSelector((state: RootState) => state.user);
  const [pendingReqCount, setPendingReqCount] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogOut = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setProfileOpen(false);
  };
  const fetchCount = async () => {
    try {
      const { data } = await axios.get(
        "/api/partner/bookings/pending-requests-count",
      );
      console.log(data);
      setPendingReqCount(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData?.role == "partner") {
      fetchCount();
    }
  }, [userData?.role]);

  useEffect(() => {
    const socket = getSocket();
    console.log(socket);
    socket.on("new-booking", (data) => {
      setPendingReqCount((prev) => prev + 1);
    });
    return () => {
      socket.off("new-booking");
    };
  }, []);

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="logo"
            width={44}
            height={44}
            priority
            style={{ height: "auto" }}
          />
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {userData?.role == "partner" ? (
              <>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/"}
                >
                  Home
                </Link>
                <Link
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/pending-requests"}
                >
                  Pending Requests
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-[6px] bg-gradient-to-b from-zinc-600 to-zinc-800 border border-zinc-500/60 text-white text-[11px] font-semibold shadow-inner tracking-tight">
                    {pendingReqCount ?? 0}
                  </span>
                </Link>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/bookings"}
                >
                  Bookings
                </Link>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/active-ride"}
                >
                  Active Ride
                </Link>
              </>
            ) : (
              Nav_Items.map((item, index) => {
                let href;
                if (item == "Home") {
                  href = `/`;
                } else if (item == "Bookings") {
                  href = `/user/bookings`;
                } else if (item == "About Us") {
                  href = `/about`;
                } else if (item == "Contact") {
                  href = `/contact`;
                } else {
                  href = `/user/${item.toLowerCase()}`;
                }
                const active = href === pathName;
                return (
                  <Link
                    key={index}
                    href={href}
                    className={`text-sm font-medium transition ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    {item}
                  </Link>
                );
              })
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3 relative">
            {!userData ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-100 transition"
              >
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  className="w-11 h-11 rounded-full bg-white text-black font-bold"
                  onClick={() => setProfileOpen((p) => !p)}
                >
                  {userData.name.charAt(0).toUpperCase()}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border"
                    >
                      <div className="p-5">
                        <p className="font-semibold text-lg">{userData.name}</p>
                        <p className="text-xs uppercase text-gray-500 mb-4">
                          {userData.role}
                        </p>
                        {userData.role !== "partner" && (
                          <div
                            className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl "
                            onClick={() =>
                              router.push("/partner/onboarding/vehicle")
                            }
                          >
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Bike size={16} />
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Car size={16} />
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Truck size={16} />
                              </div>
                            </div>
                            Become a Partner
                            <ChevronRight size={16} className="ml-auto" />
                          </div>
                        )}
                        <button
                          className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
                          onClick={handleLogOut}
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center gap-2">
            {!userData ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-100 transition"
              >
                Login
              </button>
            ) : (
              <button
                className="w-10 h-10 rounded-full bg-white text-black font-bold"
                onClick={() => setProfileOpen((p) => !p)}
              >
                {userData.name.charAt(0).toUpperCase()}
              </button>
            )}
            <button
              className="text-white"
              onClick={() => setMenuOpen((p) => !p)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[85px] left-1/2 -translate-x-1/2 w-[92%] bg-[#0B0B0B] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden"
            >
           <div className="flex flex-col divide-y divide-white/10">
  {userData?.role === "partner" ? (
    <>
      <Link href="/" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-gray-300 hover:bg-white/5">Home</Link>
      <Link href="/partner/pending-requests" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-gray-300 hover:bg-white/5 flex items-center justify-between">
        Pending Requests
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-[6px] bg-gradient-to-b from-zinc-600 to-zinc-800 border border-zinc-500/60 text-white text-[11px] font-semibold">
          {pendingReqCount ?? 0}
        </span>
      </Link>
      <Link href="/partner/bookings" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-gray-300 hover:bg-white/5">Bookings</Link>
      <Link href="/partner/active-ride" onClick={() => setMenuOpen(false)} className="px-6 py-4 text-gray-300 hover:bg-white/5">Active Ride</Link>
    </>
  ) : (
    Nav_Items.map((item, index) => {
      let href;
      if (item == "Home") {
        href = `/`;
      } else if (item == "Bookings") {
        href = `/user/bookings`;
      } else if (item == "About Us") {
        href = `/about`;
      } else if (item == "Contact") {
        href = `/contact`;
      } else {
        href = `/user/${item.toLowerCase()}`;
      }
      return (
        <Link
          key={index}
          href={href}
          onClick={() => setMenuOpen(false)}
          className="px-6 py-4 text-gray-300 hover:bg-white/5"
        >
          {item}
        </Link>
      );
    })
  )}
</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Profile Bottom Sheet */}
      <AnimatePresence>
        {profileOpen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
            >
              <div className="p-5">
                <p className="font-semibold text-lg">{userData.name}</p>
                <p className="text-xs uppercase text-gray-500 mb-4">
                  {userData.role}
                </p>
                {userData.role !== "partner" && (
                  <div
                    className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
                    onClick={() => router.push("/partner/onboarding/vehicle")}
                  >
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Bike size={16} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Car size={16} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Truck size={16} />
                      </div>
                    </div>
                    Become a Partner
                    <ChevronRight size={16} className="ml-auto" />
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
                  onClick={handleLogOut}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Nav;
