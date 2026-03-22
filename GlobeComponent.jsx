/**
 * GlobeComponent.jsx — React component using react-globe.gl
 *
 * Usage: requires a React + build tool setup (Vite, CRA, etc.)
 * Install: npm install react-globe.gl three topojson-client
 *
 * For the plain HTML portfolio, see the vanilla globe.gl snippet
 * in the <section id="globe"> of index.html instead.
 */

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";

const LOCATIONS = [
  { name: "Washington DC",  lat: 38.9072,  lng: -77.0369 },
  { name: "San Francisco",  lat: 37.7749,  lng: -122.4194 },
  { name: "Canada",         lat: 56.1304,  lng: -106.3468 },
  { name: "Spain",          lat: 40.4168,  lng: -3.7038 },
  { name: "United Kingdom", lat: 51.5074,  lng: -0.1278 },
  { name: "Turkey",         lat: 39.9334,  lng: 32.8597 },
  { name: "India",          lat: 20.5937,  lng: 78.9629 },
  { name: "UAE",            lat: 23.4241,  lng: 53.8478 },
  { name: "Egypt",          lat: 26.8206,  lng: 30.8025 },
  { name: "Mozambique",     lat: -18.6657, lng: 35.5296 },
];

const ARCS = [
  ["Washington DC", "United Kingdom"],
  ["San Francisco",  "Spain"],
  ["Turkey",         "UAE"],
  ["India",          "Egypt"],
  ["United Kingdom", "Turkey"],
].map(([src, dst]) => {
  const s = LOCATIONS.find((l) => l.name === src);
  const d = LOCATIONS.find((l) => l.name === dst);
  return { startLat: s.lat, startLng: s.lng, endLat: d.lat, endLng: d.lng };
});

export default function GlobeComponent() {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hovered, setHovered]     = useState(null);

  // Load world polygons
  useEffect(() => {
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => setCountries(feature(topo, topo.objects.countries)));
  }, []);

  // Globe controls
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate      = true;
    g.controls().autoRotateSpeed = 0.3;
    g.controls().enableDamping   = true;
    g.controls().dampingFactor   = 0.05;
    g.scene().background         = null;
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: 600, background: "#0d0d0d" }}>
      <Globe
        ref={globeRef}
        width={600}
        height={600}
        backgroundColor="#0d0d0d"
        globeImageUrl={null}
        atmosphereColor="#FF8A00"
        atmosphereAltitude={0.08}
        showGraticules={false}
        /* Dotted world map */
        hexPolygonsData={countries.features}
        hexPolygonResolution={3}
        hexPolygonMargin={0.4}
        hexPolygonColor={() => "rgba(160,160,160,0.12)"}
        /* Points */
        pointsData={LOCATIONS}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => (hovered?.name === d.name ? "#ffaa33" : "#FF8A00")}
        pointAltitude={0.01}
        pointRadius={(d) => (hovered?.name === d.name ? 0.55 : 0.35)}
        pointResolution={16}
        pointLabel={(d) => `
          <div style="background:rgba(13,13,13,.88);border:1px solid #FF8A00;color:#fff;
               font-family:Inter,sans-serif;font-size:12px;padding:4px 10px;
               border-radius:4px;letter-spacing:.05em;">${d.name}</div>`}
        onPointHover={setHovered}
        /* Arcs */
        arcsData={ARCS}
        arcColor={() => "#FF8A00"}
        arcOpacity={0.25}
        arcStroke={0.4}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={3000}
      />
      {hovered && (
        <p style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: "translateX(-50%)", margin: 0,
          color: "#FF8A00", fontFamily: "Inter,sans-serif",
          fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
          opacity: 0.85, pointerEvents: "none",
        }}>
          {hovered.name}
        </p>
      )}
    </div>
  );
}
