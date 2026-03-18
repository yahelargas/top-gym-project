import { useState, useEffect, useRef, useCallback } from "react";
import Card from "../Card/Card";
import Gauge from "../Gauge/Gauge";
import { useAnimatedCount } from "../../utils/useAnimatedCount";
import { fetchCount } from "../../utils/api";
import { getStatus, timeAgo } from "../../utils/helpers";
import { MAX_PEOPLE, DEMO_COUNT } from "../../utils/config";
import "../Gauge/Gauge.css";
import "./OccupancyCard.css";

// ------- Gym schedule helpers -------
const SCHEDULE = [
  { days: [0, 1, 2, 3, 4], ranges: [[6, 30, 12, 0], [14, 30, 21, 30]] }, // Sun–Thu
  { days: [5],              ranges: [[6, 30, 14, 0]] },                   // Fri
  { days: [6],              ranges: null },                                // Sat
];

const DAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function toMinutes(h, m) { return h * 60 + m; }

function getGymStatus(now = new Date()) {
  const day = now.getDay();
  const cur = toMinutes(now.getHours(), now.getMinutes());
  const todayRule = SCHEDULE.find(r => r.days.includes(day));

  if (todayRule?.ranges) {
    for (const [oh, om, ch, cm] of todayRule.ranges) {
      if (cur >= toMinutes(oh, om) && cur < toMinutes(ch, cm)) {
        return { isOpen: true };
      }
    }
  }

  for (let d = 0; d < 7; d++) {
    const checkDay = (day + d) % 7;
    const rule = SCHEDULE.find(r => r.days.includes(checkDay));
    if (!rule?.ranges) continue;
    for (const [oh, om] of rule.ranges) {
      const openMin = toMinutes(oh, om);
      if (d === 0 && openMin <= cur) continue;
      const timeStr = `${String(oh).padStart(2, "0")}:${String(om).padStart(2, "0")}`;
      const dayLabel = d === 0 ? "היום" : d === 1 ? "מחר" : `ביום ${DAY_NAMES_HE[checkDay]}`;
      return { isOpen: false, nextOpen: `יפתח ${dayLabel} ב-${timeStr}` };
    }
  }

  return { isOpen: false, nextOpen: "שעות הפתיחה אינן ידועות" };
}

// ------- Closed screen -------
function ClosedScreen({ nextOpen }) {
  return (
    <div className="closed-screen">
      <div className="closed-screen__lock">🔒</div>
      <p className="closed-screen__title">חדר הכושר סגור כרגע</p>
      <p className="closed-screen__next">{nextOpen}</p>
    </div>
  );
}

// ------- Loading bar -------
function LoadingBar() {
  return (
    <div className="loading-bar-wrap">
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
      <p className="loading-bar__label">טוען נתונים…</p>
    </div>
  );
}

// ------- Main card -------
export default function OccupancyCard() {
  const [count,        setCount]       = useState(DEMO_COUNT);
  const [lastUpdated,  setLastUpdated] = useState(null);   // null = never fetched yet
  const [spinning,     setSpinning]    = useState(false);
  const [loading,      setLoading]     = useState(true);
  const [timeLabel,    setTimeLabel]   = useState("");
  const [gymStatus,    setGymStatus]   = useState(getGymStatus());

  // Ref guard so two concurrent fetches can never run at once
  const isFetching = useRef(false);

  const display = useAnimatedCount(count);
  const status  = getStatus(display);

  // The real fetch — always hits Supabase fresh
  const refresh = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setSpinning(true);

    try {
      const c = await fetchCount();   // live call to Supabase every time
      setCount(c);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("[OccupancyCard] fetch error:", e);
    } finally {
      isFetching.current = false;
      setLoading(false);
      setTimeout(() => setSpinning(false), 500);
    }
  }, []);

  // Re-check gym open/closed every minute
  useEffect(() => {
    setGymStatus(getGymStatus());
    const t = setInterval(() => setGymStatus(getGymStatus()), 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch on mount
  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 60 s
  useEffect(() => {
    const t = setInterval(() => refresh(), 60000);
    return () => clearInterval(t);
  }, [refresh]);

  // Tick every second → "עודכן לפני X שניות"
  useEffect(() => {
    const tick = () => setTimeLabel(lastUpdated ? timeAgo(lastUpdated) : "");
    tick();                              // run immediately when lastUpdated changes
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // --- Closed state ---
  if (!gymStatus.isOpen) {
    return (
      <Card>
        <ClosedScreen nextOpen={gymStatus.nextOpen} />
      </Card>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <Card>
        <LoadingBar />
      </Card>
    );
  }

  // --- Normal state ---
  return (
    <Card>
      <div className="occupancy-card">
        <Gauge value={display} max={MAX_PEOPLE} />

        <div className="gauge-count">
          <span className="gauge-count__number">{display}</span>
          <span className="gauge-count__label">מתאמנים</span>
        </div>

        <span className={`status-badge status-badge--${status.key}`}>
          {status.label}
        </span>

        <button className="refresh-btn" onClick={refresh} disabled={spinning}>
          <span className={`refresh-btn__icon${spinning ? " refresh-btn__icon--spinning" : ""}`}>
            ↻
          </span>
          <span>{timeLabel}</span>
        </button>
      </div>
    </Card>
  );
}