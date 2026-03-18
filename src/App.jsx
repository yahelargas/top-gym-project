import "./styles/global.css";
import "./App.css";
import OccupancyCard from "./components/OccupancyCard/OccupancyCard";
import HoursCard     from "./components/HoursCard/HoursCard";
import ContactCard   from "./components/ContactCard/ContactCard";
import logo          from "./assets/rona-test.png";

export default function App() {
  return (
    <div className="app">
      <div className="app__page">
        <header className="app__header">
          <img src={logo} alt="Top Gym" className="app__logo" />
          <p className="app__subtitle">עומס נוכחי בחדר הכושר</p>
        </header>

        <OccupancyCard />
        <HoursCard />
        <ContactCard />
      </div>
    </div>
  );
}