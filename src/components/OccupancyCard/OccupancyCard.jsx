import { useState, useEffect, useCallback } from "react";
import Card from "../Card/Card";
import Gauge from "../Gauge/Gauge";
import { useAnimatedCount } from "../../utils/useAnimatedCount";
import { fetchCount } from "../../utils/api";
import { getStatus, timeAgo } from "../../utils/helpers";
import { MAX_PEOPLE, DEMO_COUNT } from "../../utils/config";
import "../Gauge/Gauge.css";
import "./OccupancyCard.css";

export default function OccupancyCard() {
  const [count,       setCount]       = useState(DEMO_COUNT);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [spinning,    setSpinning]    = useState(false);
  const [timeLabel,   setTimeLabel]   = useState(timeAgo(new Date()));

  const display = useAnimatedCount(count);
  const status  = getStatus(display);

  const refresh = useCallback(async () => {
    setSpinning(true);
    const c = await fetchCount();
    setCount(c);
    setLastUpdated(new Date());
    setTimeout(() => setSpinning(false), 500);
  }, []);

  // Fetch on mount + auto-refresh every 60s
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh]);

  // Update timestamp label every 30s
  useEffect(() => {
    setTimeLabel(timeAgo(lastUpdated));
    const t = setInterval(() => setTimeLabel(timeAgo(lastUpdated)), 30000);
    return () => clearInterval(t);
  }, [lastUpdated]);

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

        <button className="refresh-btn" onClick={refresh}>
          <span className={`refresh-btn__icon${spinning ? " refresh-btn__icon--spinning" : ""}`}>
            ↻
          </span>
          <span>{timeLabel}</span>
        </button>
      </div>
    </Card>
  );
}
