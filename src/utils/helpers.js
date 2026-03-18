export function getStatus(count) {
  if (count <= 12) return { label: "פנוי",    color: "#27ae60", bg: "#e8f7ee", key: "free"   };
  if (count <= 16) return { label: "בינוני",  color: "#e67e22", bg: "#fff4e0", key: "medium" };
  return             { label: "עמוס",       color: "#e74c3c", bg: "#fde8e8", key: "busy"   };
}

export function timeAgo(date) {
  const diffSec = Math.floor((Date.now() - date) / 1000);
  if (diffSec < 5)   return "עודכן כרגע";
  if (diffSec < 60)  return `עודכן לפני ${diffSec} שניות`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "עודכן לפני דקה";
  return `עודכן לפני ${diffMin} דקות`;
}