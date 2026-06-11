import { useState, useEffect, useMemo } from "react";
import Card from "../Card/Card";
import { fetchOccupancyHistory } from "../../utils/api";
import { MAX_PEOPLE } from "../../utils/config";
import "./OccupancyHistoryCard.css";

// Israel weekdays: 0 = Sunday, ..., 5 = Friday, 6 = Saturday
const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];

const MOCK_PROFILES = {
  // Sunday - Thursday
  weekday: {
    6: 4,  7: 12, 8: 18, 9: 22, 10: 17, 11: 9,  12: 1,  13: 0,
    14: 3, 15: 10, 16: 15, 17: 22, 18: 26, 19: 24, 20: 18, 21: 10, 22: 1
  },
  // Friday
  friday: {
    6: 3,  7: 10, 8: 16, 9: 22, 10: 25, 11: 23, 12: 16, 13: 8,
    14: 1, 15: 0,  16: 0,  17: 0,  18: 0,  19: 0,  20: 0,  21: 0, 22: 0
  }
};

// Reusable single Intl.DateTimeFormat instance to avoid heavy creation overhead
const jerusalemFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Jerusalem",
  year: "numeric", month: "numeric", day: "numeric",
  hour: "numeric", minute: "numeric", second: "numeric",
  weekday: "short", hour12: false
});

const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

const formatHour = (h) => {
  const hrVal = Math.floor(h);
  const minVal = h % 1 === 0.5 ? "30" : "00";
  return `${String(hrVal).padStart(2, "0")}:${minVal}`;
};

// Helper: Get Jerusalem timezone Date parts
function getJerusalemParts(date) {
  const parts = jerusalemFormatter.formatToParts(date);
  const partVal = (type) => parts.find(p => p.type === type).value;
  
  const hour = parseInt(partVal("hour"), 10);
  const minute = parseInt(partVal("minute"), 10);
  const weekdayShort = partVal("weekday");
  const day = dayMap[weekdayShort] ?? 0;
  
  return { day, hour, minute };
}

export default function OccupancyHistoryCard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0); // Default to Sunday (0)
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  // Set default tab based on current Israel day on mount
  useEffect(() => {
    const jparts = getJerusalemParts(new Date());
    // If today is Saturday (6), default to Sunday (0)
    setSelectedDay(jparts.day === 6 ? 0 : jparts.day);
    setCurrentTime(jparts);

    // Keep current time updated every minute
    const interval = setInterval(() => {
      setCurrentTime(getJerusalemParts(new Date()));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch occupancy history from Supabase
  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchOccupancyHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load occupancy history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Pre-process date parts of history once when loaded
  const processedHistory = useMemo(() => {
    return history.map(item => {
      const parts = getJerusalemParts(new Date(item.created_at));
      return {
        ...item,
        jerusalemDay: parts.day,
        jerusalemHour: parts.hour
      };
    });
  }, [history]);

  // Process data to get hourly averages for the selected day of the week
  // Hours to show on graph: 06:30, 07:00, 08:00, ..., 21:00, 21:30
  const hoursRange = useMemo(() => [6.5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21.5], []);

  const chartData = useMemo(() => {
    return hoursRange.map((hr) => {
      // Filter history records matching selected day and hour
      const records = processedHistory.filter(item => 
        item.jerusalemDay === selectedDay && item.jerusalemHour === Math.floor(hr)
      );

      let avg = 0;
      let isMock = false;

      if (records.length >= 3) {
        // Calculate real average
        const sum = records.reduce((acc, curr) => acc + curr.occupancy_count, 0);
        avg = Math.round(sum / records.length); // Round to whole number
      } else {
        // Fallback to mock profile for that hour
        const profile = selectedDay === 5 ? MOCK_PROFILES.friday : MOCK_PROFILES.weekday;
        avg = profile[Math.floor(hr)] ?? 0;
        isMock = true;
      }

      return { hour: hr, count: avg, isMock };
    });
  }, [processedHistory, selectedDay, hoursRange]);

  // Graph dimensions
  const svgWidth = 360;
  const svgHeight = 160;
  const paddingLeft = 24;
  const paddingRight = 12;
  const paddingTop = 20;
  const paddingBottom = 24;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Map data to SVG coordinates
  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.count / MAX_PEOPLE) * chartHeight;
      return { x, y, hour: d.hour, count: d.count };
    });
  }, [chartData, chartWidth, chartHeight, paddingLeft, paddingTop]);

  // Calculate SVG paths
  const { linePath, areaPath } = useMemo(() => {
    let linePath = "";
    let areaPath = "";

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
        const cpY2 = p1.y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }

      areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    return { linePath, areaPath };
  }, [points, paddingTop, chartHeight]);

  // Calculate Current Time vertical indicator line (only if selected tab matches current day)
  const currentTimeX = useMemo(() => {
    if (currentTime && currentTime.day === selectedDay) {
      const currentDecimalHour = currentTime.hour + (currentTime.minute / 60);
      if (currentDecimalHour >= 6.5 && currentDecimalHour <= 21.5) {
        // Find which interval currentDecimalHour falls into
        let idx = 0;
        for (let i = 0; i < hoursRange.length - 1; i++) {
          if (currentDecimalHour >= hoursRange[i] && currentDecimalHour <= hoursRange[i + 1]) {
            idx = i;
            break;
          }
        }
        const t0 = hoursRange[idx];
        const t1 = hoursRange[idx + 1];
        const fractionInInterval = (currentDecimalHour - t0) / (t1 - t0);
        const totalFraction = (idx + fractionInInterval) / (hoursRange.length - 1);
        return paddingLeft + totalFraction * chartWidth;
      }
    }
    return null;
  }, [currentTime, selectedDay, paddingLeft, chartWidth, hoursRange]);

  const handleTouch = (e) => {
    if (!points.length) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - svgRect.left;
    findClosestPoint(touchX);
  };

  const handleMouseMove = (e) => {
    if (!points.length) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    findClosestPoint(mouseX);
  };

  const findClosestPoint = (x) => {
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setHoveredIndex(closestIndex);
  };

  // Check if current display uses any mock data
  const hasMockData = chartData.some(d => d.isMock);

  return (
    <Card title="צפי עומס לפי שעות">
      <div className="occupancy-history">
        {/* Day Selector Tabs */}
        <div className="day-selector">
          {DAY_LABELS.map((label, idx) => (
            <button
              key={idx}
              className={`day-tab ${selectedDay === idx ? "day-tab--active" : ""}`}
              onClick={() => {
                setSelectedDay(idx);
                setHoveredIndex(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="history-loading">
            <div className="history-spinner" />
            <p>טוען נתונים היסטוריים...</p>
          </div>
        ) : (
          <div className="chart-container">

            <svg
              className="chart-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouch}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchEnd={() => setHoveredIndex(null)}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-blue)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines (Horizontal) */}
              {[0, 10, 20, 30].map((val) => {
                const y = paddingTop + chartHeight - (val / MAX_PEOPLE) * chartHeight;
                return (
                  <g key={val} className="grid-line-group">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      className="grid-line"
                    />
                    <text
                      x={paddingLeft - 6}
                      y={y + 4}
                      className="grid-label-y"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area */}
              {areaPath && (
                <path d={areaPath} fill="url(#chartAreaGradient)" />
              )}

              {/* Line Path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--color-blue)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Current Time Indicator Line */}
              {currentTimeX !== null && (
                <g>
                  <line
                    x1={currentTimeX}
                    y1={paddingTop}
                    x2={currentTimeX}
                    y2={paddingTop + chartHeight}
                    className="current-time-line"
                  />
                  <circle
                    cx={currentTimeX}
                    cy={paddingTop}
                    r="4"
                    fill="var(--color-red)"
                  />
                  <text
                    x={currentTimeX}
                    y={paddingTop - 6}
                    className="current-time-text"
                  >
                    השעה הנוכחית
                  </text>
                </g>
              )}

              {/* X Axis Labels (Hours) */}
              {points.filter((_, idx) => idx % 2 === 0).map((p) => (
                <text
                  key={p.hour}
                  x={p.x}
                  y={paddingTop + chartHeight + 16}
                  className="grid-label-x"
                >
                  {formatHour(p.hour)}
                </text>
              ))}

              {/* Hover interactions */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <g>
                  {/* Vertical hover line */}
                  <line
                    x1={points[hoveredIndex].x}
                    y1={paddingTop}
                    x2={points[hoveredIndex].x}
                    y2={paddingTop + chartHeight}
                    className="hover-line"
                  />
                  {/* Glowing dot on path */}
                  <circle
                    cx={points[hoveredIndex].x}
                    cy={points[hoveredIndex].y}
                    r="6"
                    className="hover-dot"
                  />
                  <circle
                    cx={points[hoveredIndex].x}
                    cy={points[hoveredIndex].y}
                    r="3"
                    fill="var(--color-blue)"
                  />
                </g>
              )}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredIndex].y / svgHeight) * 100 - 15}%`
                }}
              >
                <div className="tooltip-hour">{formatHour(points[hoveredIndex].hour)}</div>
                <div className="tooltip-count">
                  <span>{points[hoveredIndex].count}</span>
                  <span className="tooltip-unit">מתאמנים</span>
                </div>
              </div>
            )}
          </div>
        )}
        

      </div>
    </Card>
  );
}
