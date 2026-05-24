"use client";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

type props = {
  pickUp: string;
  drop: string;
  pickUpLat?: number;
  pickUpLon?: number;
  dropLat?: number;
  dropLon?: number;
  onChange: (p: string, d: string) => void;
  onDistance: (d: number) => void;
};

function FitBounds({ p1, p2 }: { p1: [number, number]; p2: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.fitBounds([p1, p2], { padding: [72, 72], maxZoom: 15, animate: true, duration: 1 });
  }, [p1, p2, map]);
  return null;
}

function MapReady({ onReady }: { onReady: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.whenReady(() => {
      setTimeout(onReady, 600);
    });
  }, [map]);
  return null;
}

function MapClickListener({
  mode,
  onPickup,
  onDrop,
}: {
  mode: "pickup" | "drop" | null;
  onPickup: (lat: number, lon: number, name: string) => void;
  onDrop: (lat: number, lon: number, name: string) => void;
}) {
  useMapEvents({
    async click(e) {
      if (!mode) return;
      const { lat, lng } = e.latlng;
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "en" } }
        );
        const name =
          data?.display_name?.split(",").slice(0, 3).join(", ") ??
          `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (mode === "pickup") onPickup(lat, lng, name);
        else onDrop(lat, lng, name);
      } catch {
        const name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (mode === "pickup") onPickup(lat, lng, name);
        else onDrop(lat, lng, name);
      }
    },
  });
  return null;
}

/* ── helpers ── */
function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

/* ── Premium Loading Screen ── */
function PremiumLoader({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        pointerEvents: visible ? "all" : "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
        background: "#f8f8f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        fontFamily: "'DM Sans', -apple-system, system-ui, sans-serif",
      }}
    >
      {/* Animated pin + arc */}
      <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Spinning arc */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          style={{ position: "absolute", inset: 0, animation: "spinArc 1.1s linear infinite" }}
        >
          <circle cx="36" cy="36" r="30" stroke="#e4e4e4" strokeWidth="2.5" />
          <path
            d="M36 6 A30 30 0 0 1 66 36"
            stroke="#0a0a0a"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Pin icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z" />
          <circle cx="12" cy="8" r="2.2" fill="#0a0a0a" stroke="none" />
        </svg>
      </div>

      {/* Text block */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "#0a0a0a",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Loading Map
        </p>
        <p
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "#a1a1aa",
            margin: 0,
            letterSpacing: "0.02em",
            animation: "fadeSubtitle 2s ease-in-out infinite alternate",
          }}
        >
          Plotting your route…
        </p>
      </div>

      <style>{`
        @keyframes spinArc {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSubtitle {
          from { opacity: 0.4; }
          to   { opacity: 1; }
        }
        .leaflet-top.leaflet-left {
          left: auto !important;
          right: 12px !important;
          top: 12px !important;
        }
      `}</style>
    </div>
  );
}

function SearchMap({
  pickUp,
  drop,
  pickUpLat,
  pickUpLon,
  dropLat,
  dropLon,
  onChange,
  onDistance,
}: props) {
  const [p1, setP1] = useState<[number, number]>();
  const [p2, setP2] = useState<[number, number]>();
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeKm, setRouteKm] = useState<number>();
  const [routeDurationSec, setRouteDurationSec] = useState<number>();
  const [pickUpIcon, setPickUpIcon] = useState<any>();
  const [dropIcon, setDropIcon] = useState<any>();
  const [clickMode, setClickMode] = useState<"pickup" | "drop" | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const markerHtml = (label: string) =>
        `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
          <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;
            font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;
            white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;
            box-shadow:0 2px 12px rgba(0,0,0,0.25);">${label}</div>
          <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
          <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;
            border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15),0 3px 10px rgba(0,0,0,0.3);"></div>
        </div>`;

      setPickUpIcon(
        new L.DivIcon({
          html: markerHtml("PICKUP"),
          className: "",
          iconSize: [90, 58],
          iconAnchor: [45, 58],
        })
      );
      setDropIcon(
        new L.DivIcon({
          html: markerHtml("DROP"),
          className: "",
          iconSize: [90, 58],
          iconAnchor: [45, 58],
        })
      );
    })();
  }, []);

  const fetchRoute = async (pt1: [number, number], pt2: [number, number]) => {
    setRouteLoading(true);
    try {
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${pt1[1]},${pt1[0]};${pt2[1]},${pt2[0]}?overview=full&geometries=geojson`
      );
      if (data?.routes?.[0]) {
        const coords: [number, number][] =
          data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
        setRouteCoords(coords);
        const roadKm =
          Math.round((data.routes[0].distance / 1000) * 10) / 10;
        const durationSec: number = data.routes[0].duration; // seconds
        setRouteKm(roadKm);
        setRouteDurationSec(durationSec);
        onDistance(roadKm);
      } else {
        setRouteCoords([]);
        setRouteDurationSec(undefined);
      }
    } catch {
      setRouteCoords([]);
      setRouteDurationSec(undefined);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    if (pickUpLat && pickUpLon) setP1([pickUpLat, pickUpLon]);
    if (dropLat && dropLon) setP2([dropLat, dropLon]);
    if (pickUpLat && pickUpLon && dropLat && dropLon) {
      fetchRoute([pickUpLat, pickUpLon], [dropLat, dropLon]);
    }
  }, [pickUpLat, pickUpLon, dropLat, dropLon]);

  useEffect(() => {
    if (p1 && p2) fetchRoute(p1, p2);
  }, [p1, p2]);

  const handlePickupClick = (lat: number, lon: number, name: string) => {
    setP1([lat, lon]);
    onChange(name, drop);
    setClickMode(null);
  };

  const handleDropClick = (lat: number, lon: number, name: string) => {
    setP2([lat, lon]);
    onChange(pickUp, name);
    setClickMode(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/* ── Premium loading overlay ── */}
      <PremiumLoader visible={!mapReady} />

      {/* ── Toolbar ── */}
      {mapReady && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex gap-2">
          <button
            onClick={() =>
              setClickMode(clickMode === "pickup" ? null : "pickup")
            }
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all border
              ${
                clickMode === "pickup"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
              }`}
          >
            📍 Move Pickup
          </button>
          <button
            onClick={() => setClickMode(clickMode === "drop" ? null : "drop")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md transition-all border
              ${
                clickMode === "drop"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
              }`}
          >
            🏁 Move Drop
          </button>
        </div>
      )}

      {clickMode && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 z-[999]
          bg-zinc-800/90 text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow"
        >
          Tap anywhere on map to set{" "}
          {clickMode === "pickup" ? "pickup" : "drop"} location
        </div>
      )}

      {/* ── Route loading pill ── */}
      {routeLoading && mapReady && (
        <div
          className="absolute top-4 right-4 z-[999] bg-white border border-zinc-200
          rounded-full px-3 py-1.5 shadow-md flex items-center gap-2"
        >
          <div className="w-3 h-3 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
            Calculating route
          </span>
        </div>
      )}

      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={p1 ?? [20.5937, 78.9629]}
        zoom={p1 ? 13 : 5}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapReady onReady={() => setMapReady(true)} />

        <MapClickListener
          mode={clickMode}
          onPickup={handlePickupClick}
          onDrop={handleDropClick}
        />

        {p1 && pickUpIcon && (
          <Marker
            position={p1}
            icon={pickUpIcon}
            draggable
            eventHandlers={{
              dragend: async (e) => {
                const { lat, lng } = e.target.getLatLng();
                try {
                  const { data } = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    { headers: { "Accept-Language": "en" } }
                  );
                  const name =
                    data?.display_name?.split(",").slice(0, 3).join(", ") ??
                    `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                  setP1([lat, lng]);
                  onChange(name, drop);
                } catch {
                  setP1([lat, lng]);
                }
              },
            }}
          />
        )}

        {p2 && dropIcon && (
          <Marker
            position={p2}
            icon={dropIcon}
            draggable
            eventHandlers={{
              dragend: async (e) => {
                const { lat, lng } = e.target.getLatLng();
                try {
                  const { data } = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    { headers: { "Accept-Language": "en" } }
                  );
                  const name =
                    data?.display_name?.split(",").slice(0, 3).join(", ") ??
                    `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                  setP2([lat, lng]);
                  onChange(pickUp, name);
                } catch {
                  setP2([lat, lng]);
                }
              },
            }}
          />
        )}

        {p1 && p2 && (
          <>
            {routeCoords.length > 0 ? (
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: "#09090b", weight: 3 }}
              />
            ) : (
              <Polyline
                positions={[p1, p2]}
                pathOptions={{
                  color: "#09090b",
                  weight: 3,
                  dashArray: "8 6",
                }}
              />
            )}
            <FitBounds p1={p1} p2={p2} />
          </>
        )}
      </MapContainer>

      {/* ── Distance + Duration badge ── */}
      {routeKm && !routeLoading && (
        <div
          className="absolute top-24 left-4 z-[999] pointer-events-none"
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: 999,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "-apple-system, system-ui, sans-serif",
          }}
        >
          {/* Road icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2h-2"/>
            <polyline points="9 18 9 7 15 7"/>
          </svg>

          {/* Distance */}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#09090b", letterSpacing: "-0.01em" }}>
            {routeKm} km
          </span>

          {/* Divider */}
          <div style={{ width: 1, height: 14, background: "#d4d4d8" }} />

          {/* Clock icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>

          {/* Duration */}
          <span style={{ fontSize: 13, fontWeight: 600, color: "#52525b", letterSpacing: "-0.01em" }}>
            {routeDurationSec !== undefined ? formatDuration(routeDurationSec) : "—"}
          </span>
        </div>
      )}
    </div>
  );
}

export default SearchMap;