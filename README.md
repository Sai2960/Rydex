# 🚗 Rydex — Vehicle Booking Platform

A full-stack vehicle booking platform built with **Next.js**, **TypeScript**, **Socket.IO**, **Leaflet Maps**, and **Photon API** for real-time ride matching between users and partners.

---

## 📁 Project Structure

```
Rydex/
├── public/                        # Static assets
├── socketServer/                  # Standalone Socket.IO server
│   ├── models/
│   │   └── user.model.js          # Socket user model
│   ├── index.js                   # Socket server entry point
│   ├── package.json
│   └── .env                       # Socket server environment variables
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── about/
│   │   ├── admin/                 # Admin dashboard routes
│   │   ├── api/                   # API route handlers
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── chat/
│   │   │   └── partner/
│   │   │       ├── bookings/
│   │   │       │   ├── [id]/
│   │   │       │   ├── otp/
│   │   │       │   ├── pending/
│   │   │       │   └── pending-requests-count/
│   │   │       ├── earning/
│   │   │       ├── my-active/
│   │   │       └── onboarding/
│   │   │           ├── bank/
│   │   │           ├── documents/
│   │   │           ├── pricing/
│   │   │           ├── vehicle/
│   │   │           └── video-kyc/
│   │   ├── payment/
│   │   ├── user/
│   │   │   ├── active-ride/
│   │   │   ├── bookings/
│   │   │   └── me/
│   │   ├── vehicles/
│   │   ├── contact/
│   │   ├── partner/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/                # Reusable UI components
│   │   ├── ActionCard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminEarning.tsx
│   │   ├── AnimatedCard.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CompletedScreen.tsx
│   │   ├── ContentList.tsx
│   │   ├── DocPreview.tsx
│   │   ├── Footer.tsx
│   │   ├── GeoUpdater.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Kpi.tsx
│   │   ├── LiveRideMap.tsx        # Real-time map with Leaflet
│   │   ├── Nav.tsx
│   │   ├── PanelContent.tsx
│   │   ├── PartnerDashboard.tsx
│   │   ├── PartnerEarning.tsx
│   │   ├── PricingModal.tsx
│   │   ├── PublicHome.tsx
│   │   ├── RejectionCard.tsx
│   │   ├── RideChat.tsx
│   │   ├── SearchMap.tsx          # Location search with Photon API
│   │   ├── SocketInitializer.tsx
│   │   ├── StatusCard.tsx
│   │   ├── TabButton.tsx
│   │   ├── VehicleCard.tsx
│   │   └── VehicleSlider.tsx
│   ├── hooks/
│   │   └── useGetMe.tsx           # Custom hook for user session
│   ├── lib/
│   │   ├── cloudinary.ts          # Image upload (Cloudinary)
│   │   ├── db.ts                  # Database connection
│   │   ├── Provider.tsx           # Global context providers
│   │   ├── razorpay.ts            # Payment gateway
│   │   ├── sendMail.ts            # Email notifications
│   │   └── socket.ts              # Socket.IO client setup
│   ├── models/                    # Mongoose data models
│   │   ├── booking.model.ts
│   │   ├── chatMessage.model.ts
│   │   ├── partnerBank.model.ts
│   │   ├── partnerDocs.model.ts
│   │   ├── user.model.ts
│   │   └── vehicle.model.ts
│   └── redux/                     # State management
│       ├── auth.ts
│       ├── global.d.ts
│       ├── InitUser.ts
│       └── proxy.ts
├── .env.local                     # Environment variables
├── next.config.ts
├── tailwind.config / postcss.config.mjs
├── tsconfig.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

## 🌟 Features

### 👤 User
- Register / Login with OTP auth
- Search pickup & drop locations using **Photon API**
- View live ride on interactive **Leaflet map**
- Real-time chat with partner during ride
- Booking history and active ride tracking
- Secure payment via **Razorpay**

### 🤝 Partner (Driver)
- Partner onboarding with KYC (documents, bank, vehicle, video)
- Accept/Reject pending booking requests
- OTP-based ride start verification
- Real-time location broadcasting via **Socket.IO**
- Earnings dashboard

### 🛠️ Admin
- Dashboard with KPIs and analytics
- Manage partners, users, vehicles, and bookings
- Approve/reject partner onboarding documents
- View earnings and platform metrics

---

## 🗺️ Maps & Location

### Leaflet (Interactive Maps)
Used for rendering live ride maps and tracking vehicles in real time.

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

> ⚠️ Since Leaflet is client-side only, always wrap map components with `dynamic(() => import(...), { ssr: false })` in Next.js.

### Photon API (Geocoding)
Used for location search (finding latitude & longitude from place names). Photon is a **free, open-source** geocoding API powered by OpenStreetMap — no API key required.

**Endpoint:**
```
GET https://photon.komoot.io/api/?q={search_term}&limit=5
```

**Example usage in `SearchMap.tsx`:**
```typescript
const searchLocation = async (query: string) => {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
  );
  const data = await res.json();
  return data.features.map((f: any) => ({
    name: f.properties.name,
    city: f.properties.city,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
};
```

**Example Response:**
```json
{
  "features": [
    {
      "geometry": { "coordinates": [72.8777, 19.0760] },
      "properties": { "name": "Mumbai", "city": "Mumbai", "country": "India" }
    }
  ]
}
```

---

## ⚡ Real-Time with Socket.IO

The project uses a **separate Express + Socket.IO server** (`/socketServer`) for real-time features.

### Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Partner/User joins booking room |
| `location-update` | Partner → Server | Partner broadcasts GPS location |
| `location-broadcast` | Server → User | Server forwards location to user |
| `ride-started` | Server → Both | Notifies ride has begun |
| `ride-completed` | Server → Both | Notifies ride is done |
| `chat-message` | Client ↔ Server | Real-time in-ride messaging |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Real-time | Socket.IO (separate server) |
| Database | MongoDB + Mongoose |
| Maps | Leaflet / React-Leaflet |
| Geocoding | Photon API (komoot) |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer (sendMail.ts) |
| State | Redux Toolkit |
| Auth | Custom JWT / OTP |

---

## 🔧 Environment Variables

Create a `.env.local` file in the root:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/rydex

# Auth
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your@gmail.com
MAIL_PASS=your_app_password

# Socket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Create a `.env` file inside `/socketServer`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/rydex
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Sai2960/Rydex.git
cd Rydex

# Install main app dependencies
npm install

# Install socket server dependencies
cd socketServer
npm install
cd ..
```

### Running the App

**Terminal 1 — Next.js App:**
```bash
npm run dev
```

**Terminal 2 — Socket Server:**
```bash
cd socketServer
node index.js
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 👥 Roles & Access

| Role | Access |
|---|---|
| **User** | Book rides, track live, chat, payments |
| **Partner** | Accept rides, update location, earnings |
| **Admin** | Full platform management, KYC approvals |

---

## 📦 Key Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "mongoose": "^8.x",
  "socket.io-client": "^4.x",
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x",
  "razorpay": "^2.x",
  "cloudinary": "^2.x",
  "redux-toolkit": "^2.x",
  "tailwindcss": "^3.x"
}
```

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

*Built with ❤️ by Sai2960*
