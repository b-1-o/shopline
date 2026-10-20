import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { MapPinned, Route, Clock3 } from "lucide-react";
import type { RouteSummary, StoreStop } from "../types";
import "leaflet/dist/leaflet.css";

type Coordinates = { latitude: number; longitude: number };
type Props = { stops: StoreStop[]; origin?: Coordinates | null };
type RouteApiResponse = { route?: RouteSummary; error?: string };

function markerIcon(label: string, origin = false) {
  return L.divIcon({
    className: "shopline-leaflet-marker-shell",
    html: '<span class="shopline-leaflet-marker' + (origin ? " origin" : "") + '">' + label + "</span>",
    iconSize: [32, 38],
    iconAnchor: [16, 34],
    popupAnchor: [0, -32]
  });
}

export default function RouteMap({ stops, origin }: Props) {
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const mappableStops = useMemo(() => stops.filter((stop) =>
    typeof stop.latitude === "number" && typeof stop.longitude === "number"
  ), [stops]);
  const points = useMemo(() => [
    ...(origin ? [{ label: "Your location", latitude: origin.latitude, longitude: origin.longitude }] : []),
    ...mappableStops.map((stop) => ({ label: stop.name, latitude: stop.latitude!, longitude: stop.longitude! }))
  ], [origin?.latitude, origin?.longitude, mappableStops]);
  const signature = JSON.stringify(points);

  useEffect(() => {
    let active = true;
    if (points.length < 2) {
      setRoute(points.length === 1 ? { coordinates: [[points[0].latitude, points[0].longitude]], distanceMeters: 0, durationSeconds: 0, source: "Store location" } : null);
      setRouteError("");
      setLoadingRoute(false);
      return () => { active = false; };
    }
    setLoadingRoute(true);
    setRouteError("");
    fetch("/api/route?points=" + encodeURIComponent(signature))
      .then(async (response) => {
        const data = await response.json() as RouteApiResponse;
        if (!response.ok || !data.route) throw new Error(data.error || "Road route isn't available.");
        return data.route;
      })
      .then((data) => { if (active) setRoute(data); })
      .catch(() => {
        if (!active) return;
        setRoute({
          coordinates: points.map((point) => [point.latitude, point.longitude] as [number, number]),
          distanceMeters: 0,
          durationSeconds: 0,
          source: "Direct stop order"
        });
        setRouteError("Road directions are unavailable right now; the map shows the stop order as a direct line.");
      })
      .finally(() => { if (active) setLoadingRoute(false); });
    return () => { active = false; };
  }, [signature]);

  if (!mappableStops.length) {
    return <div className="route-map-unavailable"><MapPinned size={24}/><strong>Map pins need store coordinates</strong><span>Store names and the stop list remain available below. Check live prices again to refresh store details.</span></div>;
  }

  const allPositions: Array<[number, number]> = [
    ...(origin ? [[origin.latitude, origin.longitude] as [number, number]] : []),
    ...mappableStops.map((stop) => [stop.latitude!, stop.longitude!] as [number, number])
  ];
  const bounds = allPositions.length > 1 ? L.latLngBounds(allPositions) : undefined;
  const center: [number, number] = allPositions[0];
  const routeLine = route?.coordinates || allPositions;

  return (
    <section className="route-map-panel">
      <div className="route-map-header"><div><span className="route-map-kicker"><Route size={14}/> YOUR SHOPPING ROUTE</span><h3>{mappableStops.length === 1 ? "One convenient stop" : "Stops, in a smarter order"}</h3><p>{origin ? "Starting from the location you explicitly shared." : "Optimized stop order across the matched stores. It does not use a saved home address."}</p></div><span className="route-map-count">{mappableStops.length} {mappableStops.length === 1 ? "stop" : "stops"}</span></div>
      <MapContainer key={signature} center={center} zoom={12} bounds={bounds} boundsOptions={{ padding: [35, 35] }} scrollWheelZoom={false} className="route-leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routeLine.length > 1 && <Polyline positions={routeLine} pathOptions={{ color: "#62895b", weight: 4, opacity: .88, lineCap: "round", lineJoin: "round" }}/>}
        {origin && <Marker position={[origin.latitude, origin.longitude]} icon={markerIcon("YOU", true)}><Popup>Your shared starting location<br/>Only held for this session.</Popup></Marker>}
        {mappableStops.map((stop, index) => <Marker key={stop.id} position={[stop.latitude!, stop.longitude!]} icon={markerIcon(String(index + 1))}>
          <Popup><strong>{stop.name}</strong><br/>{stop.address}<br/>{stop.itemCount} items matched</Popup>
        </Marker>)}
      </MapContainer>
      <div className="route-map-foot"><span><MapPinned size={14}/> Map data © OpenStreetMap contributors</span>{loadingRoute ? <span className="route-loading"><span className="mini-spinner"/> Finding road route…</span> : route && route.distanceMeters > 0 ? <span><Route size={14}/> {(route.distanceMeters / 1000).toFixed(1)} km · <Clock3 size={13}/> {Math.max(1, Math.round(route.durationSeconds / 60))} min driving</span> : <span>Stop order shown below</span>}</div>
      {routeError && <p className="route-error-note">{routeError}</p>}
    </section>
  );
}