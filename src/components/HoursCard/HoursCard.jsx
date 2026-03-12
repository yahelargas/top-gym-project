import Card from "../Card/Card";
import "./HoursCard.css";

const HOURS = [
  { day: "ראשון – חמישי", times: ["06:30 – 12:00", "14:30 – 21:30"], isToday: true  },
  { day: "שישי",          times: ["06:30 – 14:00"],                   isToday: false },
  { day: "שבת",           times: null,                                 isToday: false },
];

export default function HoursCard() {
  return (
    <Card title="שעות פתיחה">
      {HOURS.map((row, i) => (
        <div key={i} className="hours-row">
          <div className="hours-row__times">
            {row.times
              ? row.times.map((t, j) => (
                  <div key={j} className="hours-row__time">{t}</div>
                ))
              : <span className="hours-row__closed">סגור</span>
            }
          </div>
          <div className={`hours-row__day${row.isToday ? " hours-row__day--today" : ""}`}>
            {row.isToday && <span className="hours-row__dot" />}
            {row.day}
          </div>
        </div>
      ))}
    </Card>
  );
}
