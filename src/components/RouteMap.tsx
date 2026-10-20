import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { MapPinned, Route, Clock3, Navigation, Store, LocateFixed } from "lucide-react";
import type { RouteSummary, StorePoint, StoreStop } from "../types";
import "leaflet/dist/leaflet.css";

type Coordinates = { latitude: number; longitude: number };
type Props = {
  stops: StoreStop[];
  nearby?: StorePoint[];
  origin?: Coordinates | null;
  originKind?: "precise" | "approximate";
  theme?: "dark" | "light";
  routeEnabled?: boolean;
};
type RouteApiResponse = { route?: RouteSummary; error?: string };
type Position = [number, number];

function markerIcon(label: string, variant: "stop" | "origin" | "nearby" = "stop") {
  const safeLabel = label.replace(/[<>&"']/g, "");
  return L.divIcon({
    className: "shopline-leaflet-marker-shell",
    html: '<span class="shopline-leaflet-marker ' + variant + '"><span>' + safeLabel + "</span></span>",
    iconSize: variant === "nearby" ? [28, 34] : [36, 42],
    iconAnchor: variant === "nearby" ? [14, 30] : [18, 38],
    popupAnchor: [0, -34]
  });
}

function FitMapToMarkers({ positions }: { positions: Position[] }) {
  const map = useMap();
  const signature = JSON.stringify(positions);
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions.map(([latitude, longitude]) => L.latLng(latitude, longitude))), {
        padding: [42, 42],
        maxZoom: 13,
        animate: false
      });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13, { animate: false });
    }
  }, [map, signature]);
  return null;
}

export default function RouteMap({ stops, nearby = [], origin, originKind, theme = "light", routeEnabled = true }: Props) {
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const mappableStops = useMemo(() => stops.filter((stop) =>
    typeof stop.latitude === "number" && typeof stop.longitude === "number"
  ), [stops]);
  const mappableNearby = useMemo(() => nearby.filter((store) =>
    typeof store.latitude === "number" && typeof store.longitude === "number"
  ), [nearby]);
  const stopIds = useMemo(() => new Set(mappableStops.map((stop) => stop.id)), [mappableStops]);
  const extraPlaces = useMemo(() => mappableNearby.filter((store) => !stopIds.has(store.id)), [mappableNearby, stopIds]);
  const points = useMemo(() => [
    ...(origin ? [{ label: originKind === "approximate" ? "ZIP area" : "Your location", latitude: origin.latitude, longitude: origin.longitude }] : []),
    ...mappableStops.map((stop) => ({ label: stop.name, latitude: stop.latitude!, longitude: stop.longitude! }))
  ], [origin?.latitude, origin?.longitude, originKind, mappableStops]);
  const signature = JSON.stringify({ points, routeEnabled });
  const mapPositions: Position[] = [
    ...(origin ? [[origin.latitude, origin.longitude] as Position] : []),
    ...mappableStops.map((stop) => [stop.latitude!, stop.longitude!] as Position),
    ...extraPlaces.map((store) => [store.latitude!, store.longitude!] as Position)
  ];

  useEffect(() => {
    let active = true;
    if (!routeEnabled || points.length < 2) {
      setRoute(null);
      setRouteError("");
      setLoadingRoute(false);
      return () => { active = false; };
    }
    setLoadingRoute(true);
    setRouteError("");
    fetch("/api/route?points=" + encodeURIComponent(JSON.stringify(points)))
      .then(async (response) => {
        const data = await response.json() as RouteApiResponse;
        if (!response.ok || !data.route) throw new Error(data.error || "Road route isn't available.");
        return data.route;
      })
      .then((data) => { if (active) setRoute(data); })
      .catch(() => {
        if (!active) return;
        setRoute({
          coordinates: points.map((point) => [point.latitude, point.longitude] as Position),
          distanceMeters: 0,
          durationSeconds: 0,
          source: "Direct stop order"
        });
        setRouteError("Road directions are unavailable right now. Store pins and your stop list remain available.");
      })
      .finally(() => { if (active) setLoadingRoute(false); });
    return () => { active = false; };
  }, [signature]);

  if (!mapPositions.length) {
    return <div className="route-map-unavailable"><MapPinned size={25}/><strong>Map needs store coordinates</strong><span>Enter a ZIP code or share your location, then search nearby stores again.</span></div>;
  }

  const center: Position = mapPositions[0];
  const routeLine = route?.coordinates || [];
  const routed = routeEnabled && Boolean(route && route.source !== "Direct stop order" && route.distanceMeters > 0);
  const routeLabel = routeEnabled
    ? mappableStops.length
      ? (mappableStops.length === 1 ? "One shopping stop" : "Your shopping route")
      : "Nearby stores around your area"
    : "Explore stores on the map";

  return (
    <section className="route-map-panel">
      <div className="route-map-header">
        <div className="route-map-title-copy">
          <span className="route-map-kicker"><Navigation size={14}/> SHOPLINE MAP</span>
          <h3>{routeLabel}</h3>
          <p>{originKind === "precise"
            ? "Starting from the location you chose to share; it is used for this session only."
            : originKind === "approximate"
              ? "Pins are centered around your ZIP area, not an exact home address."
              : "Store pins use returned shop coordinates. Share your location to plan from your current position."}</p>
        </div>
        <div className="route-map-header-meta">
          <span className="route-map-count">{mappableStops.length ? mappableStops.length + (mappableStops.length === 1 ? " planned stop" : " planned stops") : mappableNearby.length + " nearby places"}</span>
          {routed && <span className="route-map-time"><Clock3 size={13}/>{Math.max(1, Math.round((route?.durationSeconds || 0) / 60))} min</span>}
        </div>
      </div>
      <div className="route-map-canvas">
        <MapContainer key={signature} center={center} zoom={11} scrollWheelZoom={false} className="route-leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
          />
          <FitMapToMarkers positions={mapPositions}/>
          {routeEnabled && routeLine.length > 1 && <Polyline
            positions={routeLine}
            pathOptions={{ color: theme === "dark" ? "#b5d779" : "#527f35", weight: 5, opacity: .94, lineCap: "round", lineJoin: "round", dashArray: routed ? undefined : "7 8" }}
          />}
          {origin && <Marker position={[origin.latitude, origin.longitude]} icon={markerIcon(originKind === "approximate" ? "ZIP" : "YOU", "origin")}>
            <Popup><strong>{originKind === "approximate" ? "Approximate ZIP center" : "Your shared location"}</strong><br/>{originKind === "approximate" ? "Neighborhood-level starting point." : "Used for this route only; it is not saved."}</Popup>
          </Marker>}
          {mappableStops.map((stop, index) => <Marker key={"stop-" + stop.id} position={[stop.latitude!, stop.longitude!]} icon={markerIcon(String(index + 1), "stop")}>
            <Popup><strong>{stop.name}</strong><br/>{stop.address || "Address unavailable"}<br/>{stop.itemCount} basket items matched</Popup>
          </Marker>)}
          {extraPlaces.map((store) => <Marker key={"nearby-" + store.id} position={[store.latitude!, store.longitude!]} icon={markerIcon("•", "nearby")}>
            <Popup><strong>{store.name}</strong><br/>{store.address || "Address unavailable"}<br/>{typeof store.distance === "number" ? store.distance.toFixed(1) + " mi away" : "Nearby shopping location"}</Popup>
          </Marker>)}
        </MapContainer>
      </div>
      <div className="route-map-legend">
        <span><i className="map-legend-stop">1</i> Planned stop</span>
        <span><i className="map-legend-nearby"><Store size={11}/></i> Nearby store</span>
        <span><i className="map-legend-origin"><LocateFixed size={11}/></i> {originKind === "approximate" ? "ZIP area" : "Starting point"}</span>
      </div>
      <div className="route-map-foot">
        <span><MapPinned size={14}/> Map © OpenStreetMap · CARTO</span>
        {loadingRoute
          ? <span className="route-loading"><span className="mini-spinner"/> Finding a drivable route…</span>
          : routed
            ? <span><Route size={14}/> {(route!.distanceMeters / 1609.344).toFixed(1)} mi · {Math.max(1, Math.round(route!.durationSeconds / 60))} min drive</span>
            : routeError
              ? <span>Stop pins stay available</span>
              : routeEnabled && mappableStops.length > 0
                ? <span>Waiting for route details</span>
                : <span>Tap a pin for store details</span>}
      </div>
      {routeError && <p className="route-error-note">{routeError}</p>}
    </section>
  );
}
