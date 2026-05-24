import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();
  await connectDb();
  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email })
    : null;

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {user?._id && <GeoUpdater userId={user._id.toString()} />}
      <Nav />
      {user?.role === "partner" ? <PartnerDashboard /> : <PublicHome />}
      <Footer />
    </div>
  );
}
