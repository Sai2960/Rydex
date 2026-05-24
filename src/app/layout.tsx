import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/lib/Provider";
import ReduxProvider from "@/redux/ReduxProvider";
import InitUser from "@/InitUser";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import SocketInitializer from "@/components/SocketInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RYDEX - Smart Vehicle Booking Platform",
  description:
    "RYDEX ek modern multi-vendor vehicle booking platform hai jahan users aasaani se cars, bikes aur commercial vehicles book kar sakte hain. Secure login, verified owners aur transparent pricing ke saath RYDEX mobility ko simple aur reliable banata hai.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  await connectDb();
  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id")
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          <ReduxProvider>
            <InitUser />
            {user?._id && <SocketInitializer userId={user._id.toString()} />}
            {children}
          </ReduxProvider>
        </Provider>
      </body>
    </html>
  );
}