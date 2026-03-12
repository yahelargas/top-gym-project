import "./styles/global.css";
import "./App.css";
import OccupancyCard from "./components/OccupancyCard/OccupancyCard";
import HoursCard     from "./components/HoursCard/HoursCard";
import ContactCard   from "./components/ContactCard/ContactCard";

export default function App() {
  return (
    <div className="app">
      <div className="app__page">
        <header className="app__header">
          <h1 className="app__title">Top Gym</h1>
          <p className="app__subtitle">עומס נוכחי בחדר הכושר</p>
        </header>

        <OccupancyCard />
        <HoursCard />
        <ContactCard />
      </div>
    </div>
  );
}
