import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

type Props = {
  driverLocation: [number, number] | null;
  pickUpLocation: [number, number] | null;
  dropLocation: [number, number] | null;
  mapStatus: "arriving" | "ongoing" | "completed";
  onStats: (data: {
    distanceToPickUp: number;
    etaToPickUp: number;
    distanceToDrop: number;
    etaToDrop: number;
  }) => void;
};

const pickUpIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
    <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;
      font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;
      white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;
      box-shadow:0 2px 12px rgba(0,0,0,0.25);">PICKUP</div>
    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
    <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;
      border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15),0 3px 10px rgba(0,0,0,0.3);"></div>
  </div>`,
  className: "",
  iconSize: [90, 58],
  iconAnchor: [45, 58],
});

const dropIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
    <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;
      font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;
      white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;
      box-shadow:0 2px 12px rgba(0,0,0,0.25);">DROP</div>
    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
    <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;
      border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15),0 3px 10px rgba(0,0,0,0.3);"></div>
  </div>`,
  className: "",
  iconSize: [90, 58],
  iconAnchor: [45, 58],
});

const driverIcon = new L.DivIcon({
  html: `<div style="
    width:52px; height:52px;
    display:flex; align-items:center; justify-content:center;
    transform-origin:center;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    filter: drop-shadow(0 6px 18px rgba(0,0,0,0.5));
  ">
    <div style="
      background:#0a0a0a;
      width:46px; height:46px;
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 0 0 3px #fff,0 0 0 5px #0a0a0a,0 8px 28px rgba(0,0,0,0.5);
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 11L6.5 6.5H17.5L19 11" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="3" y="11" width="18" height="7" rx="2" stroke="white" stroke-width="1.6"/>
        <circle cx="7.5" cy="18.5" r="1.5" fill="white"/>
        <circle cx="16.5" cy="18.5" r="1.5" fill="white"/>
        <path d="M3 14H21" stroke="white" stroke-width="1" opacity="0.35"/>
      </svg>
    </div>
  </div>`,
  className: "",
  iconSize: [52, 52],
  iconAnchor: [26, 26],
});

// Decodes OSRM polyline6 encoded string into [lat, lon][] array
// polyline6 has 1e6 precision vs standard polyline's 1e5
const decodePolyline6 = (encoded: string): [number, number][] => {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lat / 1e6, lng / 1e6]);
  }
  return coords;
};

// Fetches road-snapped route coords using polyline6 (much more detailed than geojson)
const getRoadRoute = async (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
): Promise<{ coords: [number, number][]; distance: number; duration: number }> => {
  try {
    const res = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=polyline6`,
      { timeout: 8000 },
    );
    const route = res.data.routes?.[0];
    if (!route) return { coords: [], distance: 0, duration: 0 };
    return {
      coords: decodePolyline6(route.geometry),
      distance: route.distance ?? 0,
      duration: route.duration ?? 0,
    };
  } catch {
    return { coords: [], distance: 0, duration: 0 };
  }
};

function LiveRideMap({
  driverLocation,
  dropLocation,
  pickUpLocation,
  mapStatus,
  onStats,
}: Props) {
  const [routeToPickUp, setRouteToPickUp] = useState<[number, number][]>([]);
  const [routeToDrop, setRouteToDrop] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!driverLocation || !pickUpLocation || !dropLocation) return;

    const [pLat, pLon] = pickUpLocation;
    const [dLat, dLon] = dropLocation;
    const [drLat, drLon] = driverLocation;

    const fetchRoutes = async () => {
      try {
        if (mapStatus === "arriving") {
          const [toPickUp, toDrop] = await Promise.all([
            getRoadRoute(drLat, drLon, pLat, pLon),
            getRoadRoute(pLat, pLon, dLat, dLon),
          ]);

          setRouteToPickUp(toPickUp.coords);
          setRouteToDrop(toDrop.coords);

          onStats?.({
            distanceToPickUp: toPickUp.distance / 1000,
            etaToPickUp: toPickUp.duration / 60,
            distanceToDrop: toDrop.distance / 1000,
            etaToDrop: toDrop.duration / 60,
          });
        } else {
          setRouteToPickUp([]);
          const toDrop = await getRoadRoute(drLat, drLon, dLat, dLon);
          setRouteToDrop(toDrop.coords);

          onStats?.({
            distanceToPickUp: 0,
            etaToPickUp: 0,
            distanceToDrop: toDrop.distance / 1000,
            etaToDrop: toDrop.duration / 60,
          });
        }
      } catch (error) {
        console.log("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, [driverLocation, mapStatus]);

  const showPickUpRoute = mapStatus === "arriving" && routeToPickUp.length > 0;
  const showDropRoute = mapStatus !== "completed" && routeToDrop.length > 0;
  const center = pickUpLocation ?? ([20.5937, 78.9629] as [number, number]);

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <style>{`
        .leaflet-container { font-family: -apple-system, system-ui, sans-serif; }
        .leaflet-top.leaflet-left { left: auto !important; right: 12px !important; top: 12px !important; }
      `}</style>
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {pickUpLocation && (
          <Marker position={pickUpLocation} icon={pickUpIcon} />
        )}

        {dropLocation && (
          <Marker position={dropLocation} icon={dropIcon} />
        )}

        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon} />
        )}

        {showPickUpRoute && (
          <Polyline
            positions={routeToPickUp}
            smoothFactor={1}
            pathOptions={{
              color: "#0a0a0a",
              weight: 5,
              dashArray: "1 14",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {showDropRoute && (
          <Polyline
            positions={routeToDrop}
            smoothFactor={1}
            pathOptions={{
              color: "#0a0a0a",
              weight: 5,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LiveRideMap;