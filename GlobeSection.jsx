"use client";

/**
 * GlobeSection.jsx
 *
 * Install:
 *   npm install @splinetool/react-spline
 *
 * Usage:
 *   import GlobeSection from "@/components/GlobeSection";
 *   <GlobeSection />
 *
 * ─── HOW BADGE → GLOBE NAVIGATION WORKS ─────────────────────────────────────
 *
 * On badge click, this component calls two Spline methods:
 *
 *   1. spline.setVariable("activeLocation", loc.splineVar)
 *      Sets a global Spline variable.  In Spline editor:
 *        • Open Variables panel → add a String variable named "activeLocation"
 *        • In each camera / state machine, add a "Variable changes" trigger
 *          and check if activeLocation === "spain" (etc.) to fire the camera move.
 *
 *   2. spline.emitEvent("mouseDown", loc.splineEvent)
 *      Fires a mouseDown on a named invisible trigger object.  In Spline editor:
 *        • Add one transparent box per location, named exactly as in splineEvent
 *        • Give each box a Look At / Camera Transition state triggered by mouseDown
 *
 * Use whichever approach your scene already supports.  Both are called; the one
 * that doesn't apply will silently no-op.
 *
 * ─── WHAT TO CONFIGURE IN SPLINE ────────────────────────────────────────────
 *
 *   Option A – Variables (recommended):
 *     1. Variables panel → add String "activeLocation", default value "spain"
 *     2. Per location camera state: trigger = Variable > activeLocation = "<value>"
 *     3. Add a smooth camera transition (ease-in-out, ~1s) to each state
 *
 *   Option B – Named trigger objects:
 *     1. Add 10 invisible box objects, one per location
 *     2. Name each exactly as listed in `splineEvent` below
 *     3. Attach a camera focus / look-at action on mouseDown
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useCallback } from "react";
import Spline from "@splinetool/react-spline/next";

const SCENE = "loading...";

const LOCATIONS = [
  { id: "washington-dc",  label: "Washington DC",  splineVar: "washington-dc",  splineEvent: "Washington DC"  },
  { id: "san-francisco",  label: "San Francisco",  splineVar: "san-francisco",  splineEvent: "San Francisco"  },
  { id: "canada",         label: "Canada",         splineVar: "canada",         splineEvent: "Canada"         },
  { id: "spain",          label: "Spain",          splineVar: "spain",          splineEvent: "Spain"          },
  { id: "united-kingdom", label: "United Kingdom", splineVar: "united-kingdom", splineEvent: "United Kingdom" },
  { id: "turkey",         label: "Turkey",         splineVar: "turkey",         splineEvent: "Turkey"         },
  { id: "india",          label: "India",          splineVar: "india",          splineEvent: "India"          },
  { id: "uae",            label: "UAE",            splineVar: "uae",            splineEvent: "UAE"            },
  { id: "egypt",          label: "Egypt",          splineVar: "egypt",          splineEvent: "Egypt"          },
  { id: "mozambique",     label: "Mozambique",     splineVar: "mozambique",     splineEvent: "Mozambique"     },
];

export default function GlobeSection() {
  const splineRef  = useRef(null);
  const [active, setActive]   = useState("spain");
  const [ready, setReady]     = useState(false);

  /* ── fire both Spline integration methods ── */
  const triggerLocation = useCallback((spline, locationId) => {
    const loc = LOCATIONS.find((l) => l.id === locationId);
    if (!loc || !spline) return;

    // Method A – global variable
    try { spline.setVariable("activeLocation", loc.splineVar); } catch (_) {}

    // Method B – named trigger object event
    try { spline.emitEvent("mouseDown", loc.splineEvent); } catch (_) {}
  }, []);

  const onLoad = useCallback((spline) => {
    splineRef.current = spline;
    setReady(true);
    triggerLocation(spline, "spain"); // default focus
  }, [triggerLocation]);

  const handleBadge = (locationId) => {
    setActive(locationId);
    triggerLocation(splineRef.current, locationId);
  };

  return (
    <section style={s.root}>

      {/* ── WORLDWIDE label ── */}
      <span style={s.worldwideTag}>Worldwide</span>

      {/* ── Main body ── */}
      <div style={s.body}>

        {/* Globe */}
        <div style={s.globeWrap}>
          <Spline scene={SCENE} onLoad={onLoad} style={s.splineEl} />
          {/* Radial vignette so globe bleeds into the black background */}
          <div style={s.vignette} aria-hidden />
          {/* Skeleton while Spline loads */}
          {!ready && <div style={s.skeleton} />}
        </div>

        {/* Locations panel */}
        <aside style={s.panel}>
          <p style={s.panelTitle}>Locations</p>
          <ul style={s.badgeList}>
            {LOCATIONS.map((loc) => {
              const isActive = active === loc.id;
              return (
                <li key={loc.id} style={s.badgeItem}>
                  <button
                    onClick={() => handleBadge(loc.id)}
                    style={isActive ? { ...s.badge, ...s.badgeActive } : s.badge}
                    aria-pressed={isActive}
                  >
                    {loc.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const TOKEN = {
  bg:          "#000",
  text:        "#fff",
  muted:       "rgba(255,255,255,0.35)",
  border:      "rgba(255,255,255,0.10)",
  borderHover: "rgba(255,255,255,0.30)",
  borderActive:"rgba(255,255,255,0.72)",
  font:        "'Inter', system-ui, sans-serif",
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  root: {
    position:       "relative",
    width:          "100%",
    minHeight:      "100vh",
    background:     TOKEN.bg,
    color:          TOKEN.text,
    fontFamily:     TOKEN.font,
    display:        "flex",
    flexDirection:  "column",
    padding:        "48px 48px 0",
    boxSizing:      "border-box",
    overflow:       "hidden",
  },

  worldwideTag: {
    fontSize:        10,
    fontWeight:      500,
    letterSpacing:   "0.18em",
    textTransform:   "uppercase",
    color:           TOKEN.muted,
    marginBottom:    32,
    userSelect:      "none",
  },

  body: {
    flex:            1,
    display:         "grid",
    gridTemplateColumns: "1fr 180px",
    gap:             "0 56px",
    alignItems:      "start",
  },

  /* Globe column */
  globeWrap: {
    position:        "relative",
    height:          "calc(100vh - 140px)",
    marginLeft:      -48,
    overflow:        "hidden",
  },

  splineEl: {
    width:           "100%",
    height:          "100%",
    border:          "none",
    display:         "block",
  },

  vignette: {
    position:        "absolute",
    inset:           0,
    pointerEvents:   "none",
    background:      "radial-gradient(ellipse 65% 60% at 42% 50%, transparent 50%, #000 92%)",
  },

  skeleton: {
    position:        "absolute",
    inset:           0,
    background:      "#000",
  },

  /* Sidebar */
  panel: {
    paddingTop:      4,
  },

  panelTitle: {
    fontSize:        10,
    fontWeight:      500,
    letterSpacing:   "0.18em",
    textTransform:   "uppercase",
    color:           TOKEN.muted,
    margin:          "0 0 20px",
    userSelect:      "none",
  },

  badgeList: {
    listStyle:       "none",
    margin:          0,
    padding:         0,
    display:         "flex",
    flexDirection:   "column",
    gap:             8,
  },

  badgeItem: {
    display:         "flex",
  },

  badge: {
    display:         "inline-flex",
    alignItems:      "center",
    justifyContent:  "center",
    padding:         "6px 16px",
    borderRadius:    999,
    border:          `1px solid ${TOKEN.border}`,
    background:      "transparent",
    color:           TOKEN.muted,
    fontSize:        11,
    fontWeight:      400,
    letterSpacing:   "0.04em",
    fontFamily:      TOKEN.font,
    cursor:          "pointer",
    whiteSpace:      "nowrap",
    transition:      "color 0.22s ease, border-color 0.22s ease",
    // hover is handled inline via onMouseEnter/Leave or CSS class — see note below
  },

  badgeActive: {
    color:           TOKEN.text,
    borderColor:     TOKEN.borderActive,
  },
};
