import { API_URL, DEMO_COUNT } from "./config";

export async function fetchCount() {
  try {
    console.log("[TopGym] Fetching from:", API_URL);
    const res = await fetch(API_URL);

    if (!res.ok) {
      console.warn("[TopGym] Server error:", res.status);
      return DEMO_COUNT;
    }

    const data = await res.json();
    console.log("[TopGym] Response:", data);

    // /unknown-devices מחזיר רשימה → סופרים את האורך
    if (Array.isArray(data))                      return data.length;

    // fallbacks
    if (typeof data === "number")                 return data;
    if (typeof data.count === "number")           return data.count;
    if (typeof data.unknown_devices === "number") return data.unknown_devices;

    const firstArr = Object.values(data).find(v => Array.isArray(v));
    if (firstArr) return firstArr.length;

    console.warn("[TopGym] Unknown format, using demo count");
    return DEMO_COUNT;
  } catch (err) {
    console.warn("[TopGym] Fetch failed:", err.message, "— using demo count");
    return DEMO_COUNT;
  }
}
