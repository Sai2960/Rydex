"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Headphones,
} from "lucide-react";
import { useState } from "react";

const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: "Email Us",
    value: "rydex9702@gmail.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: <Phone size={20} />,
    label: "Call Us",
    value: "+91 8591627541",
    sub: "Mon–Sat, 9am to 9pm",
  },
  {
    icon: <MapPin size={20} />,
    label: "Head Office",
    value: "Mumbai, Maharashtra",
    sub: "India — 400001",
  },
  {
    icon: <Clock size={20} />,
    label: "Support Hours",
    value: "24/7 Available",
    sub: "Emergency line always open",
  },
];

const faqs = [
  {
    q: "How do I track my ride?",
    a: "Open your active booking — the live map auto-updates your driver's position in real time.",
  },
  {
    q: "How does OTP verification work?",
    a: "You receive a 4-digit OTP on your phone. Share it with your driver at pickup and drop to confirm the ride.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major UPI apps, credit/debit cards, and net banking via Razorpay. Cash is also accepted.",
  },
  {
    q: "How do I become a RYDEX partner?",
    a: "Register on the platform, complete video KYC, and submit your vehicle documents. Our team reviews within 48 hours.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate send — wire up to your sendMail.ts or an API route
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-white/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-white/60 mb-6">
            <Headphones size={12} />
            Get in Touch
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-5">
            We're Here
            <br />
            <span className="text-white/40">To Help.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Have a question, issue, or feedback? Reach out — our team responds
            fast.
          </p>
        </motion.div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-6 py-14 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-white">
                {c.icon}
              </div>
              <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-1">
                {c.label}
              </p>
              <p className="font-bold text-white text-sm">{c.value}</p>
              <p className="text-white/40 text-xs mt-1">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form + FAQ */}
      <section className="px-6 py-16 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-white/40" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30">
                Send a Message
              </p>
            </div>
            <h2 className="text-3xl font-black mb-8">Drop Us a Line</h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-4">
                  <Send size={20} />
                </div>
                <h3 className="font-black text-xl mb-2">Message Sent!</h3>
                <p className="text-white/50 text-sm">
                  We'll get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Sai Chandorkar"
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@email.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors resize-none placeholder:text-white/20"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.name ||
                    !form.email ||
                    !form.message
                  }
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 disabled:opacity-40 active:scale-[0.97] transition-all text-sm tracking-wide flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">
              Common Questions
            </p>
            <h2 className="text-3xl font-black mb-8">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                  <p className="font-bold text-white text-sm mb-2">{faq.q}</p>
                  <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}