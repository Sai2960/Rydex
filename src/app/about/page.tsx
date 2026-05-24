"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { motion } from "motion/react";
import {
  MapPin,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Clock,
  Star,
  Truck,
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Rides Completed" },
  { value: "1200+", label: "Verified Drivers" },
  { value: "25+", label: "Cities Covered" },
  { value: "4.8★", label: "Average Rating" },
];

const values = [
  {
    icon: <Zap size={22} />,
    title: "Speed First",
    desc: "Instant booking with real-time driver matching. No waiting, no hassle — just ride.",
  },
  {
    icon: <Shield size={22} />,
    title: "Safety Always",
    desc: "Every driver is KYC verified with video screening, background checks, and live tracking.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Live Tracking",
    desc: "Track your ride in real-time from pickup to drop. Share your live location with loved ones.",
  },
  {
    icon: <Truck size={22} />,
    title: "Any Vehicle",
    desc: "Bikes, cabs, autos, or heavy transport — one platform for every journey, big or small.",
  },
  {
    icon: <Clock size={22} />,
    title: "24/7 Available",
    desc: "Round-the-clock service. Whether it's 3am or rush hour, RYDEX is always ready.",
  },
  {
    icon: <Star size={22} />,
    title: "Rated & Trusted",
    desc: "Transparent ratings for both riders and drivers. Community-built trust at every trip.",
  },
];

const team = [
  { name: "Sai Chandorkar", role: "Founder & CEO", initial: "S" },
  { name: "Mansi Chandorkar", role: "Head of Operations", initial: "M" },
  { name: "Sumedha Chandorkar", role: "Lead Engineer", initial: "S" },
  { name: "Sanjay Chandorkar", role: "Safety & Trust", initial: "S" },
];

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-white/60 mb-6">
            <Users size={12} />
            About RYDEX
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-6">
            Redefining How
            <br />
            <span className="text-white/40">India Moves.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">
            RYDEX is a next-generation vehicle booking platform built for
            everyone — from daily commuters to businesses needing heavy
            transport. Fast. Reliable. Fully automated.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-4xl font-black text-white tracking-tight">
                {s.value}
              </p>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1 font-medium">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-4">
              Our Mission
            </p>
            <h2 className="text-4xl font-black leading-tight mb-6">
              One Platform.
              <br />
              Every Journey.
            </h2>
            <p className="text-white/50 leading-relaxed mb-4">
              We started RYDEX with a simple belief — getting from A to B
              shouldn't be complicated or expensive. Whether you need a quick
              bike ride across town or a truck to move your business inventory,
              RYDEX connects you with verified drivers in seconds.
            </p>
            <p className="text-white/50 leading-relaxed">
              With Razorpay-powered seamless payments, live GPS tracking, OTP
              verified pickups and drops, and a fully automated partner
              onboarding system — RYDEX is built for the modern India.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3"
          >
            {["Bike", "Cab", "Auto", "Truck", "Tempo", "Van"].map(
              (vehicle, i) => (
                <div
                  key={vehicle}
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3"
                >
                  <Truck size={16} className="text-white/40" />
                  <span className="text-sm font-semibold text-white/70">
                    {vehicle}
                  </span>
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-3">
              What We Stand For
            </p>
            <h2 className="text-4xl font-black">Our Core Values</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-white">
                  {v.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-3">
              The People
            </p>
            <h2 className="text-4xl font-black">Behind RYDEX</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-white text-black font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {member.initial}
                </div>
                <p className="font-bold text-white text-sm">{member.name}</p>
                <p className="text-white/40 text-xs mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-black mb-4">Ready to Ride?</h2>
          <p className="text-white/40 mb-8">
            Join thousands of riders and drivers already on RYDEX.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-[0.97] text-sm tracking-wide"
            >
              Book a Ride
            </a>
            <a
              href="/contact"
              className="border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all active:scale-[0.97] text-sm tracking-wide"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}