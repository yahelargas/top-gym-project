import "./styles/global.css";
import "./App.css";
import OccupancyCard from "./components/OccupancyCard/OccupancyCard";
import OccupancyHistoryCard from "./components/OccupancyCard/OccupancyHistoryCard";
import HoursCard     from "./components/HoursCard/HoursCard";
import ContactCard   from "./components/ContactCard/ContactCard";
import logo          from "./assets/rona-test.png";

export default function App() {
  return (
    <div className="app">
      <div className="app__page">
        <header className="app__header">
          <img src={logo} alt="Top Gym" className="app__logo" />
        </header>

        <OccupancyCard />
        <OccupancyHistoryCard />
        <HoursCard />
        <ContactCard />
      </div>
    </div>
  );
}