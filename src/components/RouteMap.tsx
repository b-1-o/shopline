import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, CircleMarker } from "react-leaflet";
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
      map.fitBounds(
        L.latLngBounds(positions.map(([latitude, longitude]) => L.latLng(latitude, longitude))),
        { padding: [48, 48], maxZoom: 14, animate: true, duration: 0.55 }
      );
    } else if (positions.length === 1) {
      map.setView(positions[0], 13, { animate: true });
    }
  }, [map, signature, positions]);
  return null;
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t1 = window.setTimeout(() => map.invalidateSize({ animate: false }), 80);
    const t2 = window.setTimeout(() => map.invalidateSize({ animate: false }), 320);
    const onResize = () => map.invalidateSize({ animate: false });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

export default function RouteMap({
  stops,
  nearby = [],
  origin,
  theme = "light",
  routeEnabled = true
}: Props) {
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);

  const mappableStops = useMemo(
    () => stops.filter((stop) => typeof stop.latitude === "number" && typeof stop.longitude === "number"),
    [stops]
  );
  const mappableNearby = useMemo(
    () => nearby.filter((store) => typeof store.latitude === "number" && typeof store.longitude === "number"),
    [nearby]
  );
  const stopIds = useMemo(() => new Set(mappableStops.map((stop) => stop.id)), [mappableStops]);
  const extraPlaces = useMemo(
    () => mappableNearby.filter((store) => !stopIds.has(store.id)),
    [mappableNearby, stopIds]
  );

  const mapPositions = useMemo(() => {
    const pts: Position[] = [];
    if (origin) pts.push([origin.latitude, origin.longitude]);
    for (const stop of mappableStops) pts.push([stop.latitude!, stop.longitude!]);
    for (const store of extraPlaces) pts.push([store.latitude!, store.longitude!]);
    return pts;
  }, [origin, mappableStops, extraPlaces]);

  const signature = useMemo(
    () =>
      JSON.stringify({
        origin: origin ? [origin.latitude, origin.longitude] : null,
        stops: mappableStops.map((s) => [s.id, s.latitude, s.longitude]),
        nearby: extraPlaces.map((s) => [s.id, s.latitude, s.longitude]),
        theme,
        routeEnabled
      }),
    [origin, mappableStops, extraPlaces, theme, routeEnabled]
  );

  useEffect(() => {
    if (!routeEnabled || mappableStops.length === 0) {
      setRoute(null);
      setRouteError("");
      setLoadingRoute(false);
      return;
    }
    const points: Array<{ label?: string; latitude: number; longitude: number }> = [];
    if (origin) points.push({ label: "Start", latitude: origin.latitude, longitude: origin.longitude });
    for (const stop of mappableStops) {
      points.push({ label: stop.name, latitude: stop.latitude!, longitude: stop.longitude! });
    }
    if (points.length < 2) {
      setRoute(null);
      setRouteError("");
      return;
    }

    let cancelled = false;
    setLoadingRoute(true);
    setRouteError("");
    const query = new URLSearchParams({ points: JSON.stringify(points) });
    fetch("/api/route?" + query.toString())
      .then(async (response) => {
        const data = (await response.json()) as RouteApiResponse;
        if (!response.ok) throw new Error(data.error || "Route request failed");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setRoute(data.route || null);
        setRouteError(data.error || "");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setRoute(null);
        setRouteError(error.message || "Could not load driving route");
      })
      .finally(() => {
        if (!cancelled) setLoadingRoute(false);
      });

    return () => {
      cancelled = true;
    };
  }, [signature, routeEnabled, mappableStops, origin]);

  if (!mapPositions.length) {
    return (
      <div className="route-map-unavailable">
        <MapPinned size={28} />
        <strong>Map needs store coordinates</strong>
        <span>Enter a ZIP code or share your location, then search nearby stores again.</span>
      </div>
    );
  }

  const center: Position = mapPositions[0];
  const routeLine = route?.coordinates || [];
  const routed =
    routeEnabled && Boolean(route && route.source !== "Direct stop order" && route.distanceMeters > 0);
  const routeLabel = routeEnabled
    ? mappableStops.length
      ? mappableStops.length === 1
        ? "Your shopping stop"
        : "Your shopping route"
      : "Stores near you"
    : "Stores on the map";

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const osmFallback = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <section className="route-map-panel route-map-panel-polished">
      <div className="route-map-header">
        <div className="route-map-title-copy">
          <span className="route-map-kicker">
            <Navigation size={14} /> SHOPLINE MAP
          </span>
          <h3>{routeLabel}</h3>
          <p>
            {mappableStops.length
              ? "Pins show stores matched to your list. Drag and zoom the map freely."
              : "Nearby grocery locations around your search area."}
          </p>
        </div>
        <div className="route-map-header-meta">
          <span className="route-map-count">
            {mappableStops.length
              ? mappableStops.length + (mappableStops.length === 1 ? " planned stop" : " planned stops")
              : mappableNearby.length + " nearby places"}
          </span>
          {routed && (
            <span className="route-map-time">
              <Clock3 size={13} />
              {Math.max(1, Math.round((route?.durationSeconds || 0) / 60))} min
            </span>
          )}
        </div>
      </div>

      <div className={"route-map-canvas" + (tilesReady ? " is-ready" : "")}>
        {!tilesReady && (
          <div className="route-map-loading-overlay" aria-hidden>
            <span className="mini-spinner" />
            <span>Loading map…</span>
          </div>
        )}
        <MapContainer
          key={signature}
          center={center}
          zoom={12}
          scrollWheelZoom
          className="route-leaflet-map"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
            eventHandlers={{
              load: () => setTilesReady(true),
              tileerror: () => setTilesReady(true)
            }}
          />
          <TileLayer url={osmFallback} opacity={0} eventHandlers={{ load: () => setTilesReady(true) }} />
          <MapResizeFix />
          <FitMapToMarkers positions={mapPositions} />
          {routeEnabled && routeLine.length > 1 && (
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: theme === "dark" ? "#b5d779" : "#527f35",
                weight: 5,
                opacity: 0.94,
                lineCap: "round",
                lineJoin: "round",
                dashArray: routed ? undefined : "7 8"
              }}
            />
          )}
          {origin && (
            <>
              <CircleMarker
                center={[origin.latitude, origin.longitude]}
                radius={18}
                pathOptions={{
                  color: theme === "dark" ? "#e8c46a" : "#d39b4d",
                  fillColor: theme === "dark" ? "#e8c46a" : "#d39b4d",
                  fillOpacity: 0.12,
                  weight: 1
                }}
              />
              <Marker position={[origin.latitude, origin.longitude]} icon={markerIcon("YOU", "origin")}>
                <Popup>
                  <strong>Your starting point</strong>
                  <br />
                  Used only for this route.
                </Popup>
              </Marker>
            </>
          )}
          {mappableStops.map((stop, index) => (
            <Marker
              key={"stop-" + stop.id}
              position={[stop.latitude!, stop.longitude!]}
              icon={markerIcon(String(index + 1), "stop")}
            >
              <Popup>
                <strong>{stop.name}</strong>
                <br />
                {stop.address || "Address unavailable"}
                <br />
                {stop.itemCount} basket items matched
              </Popup>
            </Marker>
          ))}
          {extraPlaces.map((store) => (
            <Marker
              key={"nearby-" + store.id}
              position={[store.latitude!, store.longitude!]}
              icon={markerIcon("•", "nearby")}
            >
              <Popup>
                <strong>{store.name}</strong>
                <br />
                {store.address || "Address unavailable"}
                <br />
                {typeof store.distance === "number"
                  ? store.distance.toFixed(1) + " mi away"
                  : "Nearby shopping location"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="route-map-legend">
        <span>
          <i className="map-legend-stop">1</i> Planned stop
        </span>
        <span>
          <i className="map-legend-nearby">
            <Store size={11} />
          </i>{" "}
          Nearby store
        </span>
        <span>
          <i className="map-legend-origin">
            <LocateFixed size={11} />
          </i>{" "}
          Starting point
        </span>
      </div>

      <div className="route-map-foot">
        <span>
          <MapPinned size={14} /> Map © OpenStreetMap · CARTO
        </span>
        {loadingRoute ? (
          <span className="route-loading">
            <span className="mini-spinner" /> Finding a drivable route…
          </span>
        ) : routed ? (
          <span>
            <Route size={14} /> {(route!.distanceMeters / 1609.344).toFixed(1)} mi ·{" "}
            {Math.max(1, Math.round(route!.durationSeconds / 60))} min drive
          </span>
        ) : routeError ? (
          <span>Pins stay available — route details unavailable</span>
        ) : routeEnabled && mappableStops.length > 0 ? (
          <span>Waiting for route details</span>
        ) : (
          <span>Tap a pin for store details</span>
        )}
      </div>
    </section>
  );
}
