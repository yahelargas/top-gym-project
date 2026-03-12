import Card from "../Card/Card";
import "./ContactCard.css";

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%"  stopColor="#fdf497"/>
        <stop offset="10%" stopColor="#fdf497"/>
        <stop offset="50%" stopColor="#fd5949"/>
        <stop offset="68%" stopColor="#d6249f"/>
        <stop offset="100%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad)"/>
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
  </svg>
);

const CONTACTS = [
  {
    icon: "📍", iconClass: "map",
    text: "מתחם מסחרי שריגים לי-און",
    href: "https://maps.google.com",
    isLink: false,
  },
  {
    icon: "📞", iconClass: "phone",
    text: "050-4446548",
    href: "tel:0504446548",
    isLink: true,
  },
  {
    icon: <InstagramIcon />, iconClass: "instagram",
    text: "@topgymis",
    href: "https://www.instagram.com/topgymis",
    isLink: true,
  },
  {
    icon: "💬", iconClass: "whatsapp",
    text: "קבוצת WhatsApp",
    href: "https://wa.me/9720504446548",
    isLink: true,
  },
];

export default function ContactCard() {
  return (
    <Card title="צור קשר">
      {CONTACTS.map((c, i) => (
        <a
          key={i}
          href={c.href}
          className="contact-row"
          target={c.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
        >
          <span className={`contact-row__text${c.isLink ? " contact-row__text--link" : ""}`}>
            {c.text}
          </span>
          <span className={`contact-row__icon contact-row__icon--${c.iconClass}`}>
            {c.icon}
          </span>
        </a>
      ))}
    </Card>
  );
}
