import Card from "../Card/Card";
import "./HoursCard.css";

const HOURS = [
  { day: "ראשון – חמישי", times: ["06:30 – 12:00", "14:30 – 21:30"], days: [0,1,2,3,4] },
  { day: "שישי",          times: ["06:30 – 14:00"],                   days: [5]         },
  { day: "שבת",           times: null,                                 days: [6]         },
];

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "6px", color: "#8a90a0" }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function HoursCard() {
  const today = new Date().getDay(); // 0=Sun, 5=Fri, 6=Sat

  return (
    <Card title={<>שעות פתיחה <ClockIcon /></>}>
      {HOURS.map((row, i) => {
        const isToday = row.days.includes(today);
        return (
          <div key={i} className={`hours-row${isToday ? " hours-row--today" : ""}`}>
            <div className={`hours-row__day${isToday ? " hours-row__day--today" : ""}`}>
              {isToday && <span className="hours-row__dot" />}
              {row.day}
            </div>
            <div className="hours-row__times">
              {row.times
                ? row.times.map((t, j) => (
                    <div key={j} className="hours-row__time">{t}</div>
                  ))
                : <span className="hours-row__closed">סגור</span>
              }
            </div>
          </div>
        );
      })}
    </Card>
  );
}