export function getStatus(count) {
  if (count <= 10) return { label: "פנוי",     color: "#27ae60", bg: "#e8f7ee", key: "free"   };
  if (count <= 14) return { label: "עמוס",     color: "#e67e22", bg: "#fff4e0", key: "medium" };
  return             { label: "עמוס מאוד",  color: "#e74c3c", bg: "#fde8e8", key: "busy"   };
}

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 1)   return "עודכן כרגע";
  if (diff === 1) return "עודכן לפני דקה";
  return `עודכן לפני ${diff} דקות`;
}
