import { API_URL, DEMO_COUNT,DATA_API_URL, API_KEY } from "./config";
import { supabase } from './supabaseClient';

export async function fetchCount() {
  try {
    // We select the number_of_users column from our top_gym table
    const { data, error } = await supabase
      .from('top_gym')
      .select('number_of_users')
      .single(); // Since you only have one row

    if (error) {
      console.warn("[TopGym] Supabase error:", error.message);
      return 0;
    }

    return data ? data.number_of_users : 0;
  } catch (err) {
    console.error("[TopGym] Unexpected error:", err);
    return 0;
  }
}
  

//     console.log("[TopGym] Fetching from:", API_URL);
//     const res = await fetch(API_URL);

//     if (!res.ok) {
//       console.warn("[TopGym] Server error:", res.status);
//       return DEMO_COUNT;
//     }

//     const data = await res.json();
//     console.log("[TopGym] Response:", data);

//     // /unknown-devices מחזיר רשימה → סופרים את האורך
//     if (Array.isArray(data))                      return data.length;

//     // fallbacks
//     if (typeof data === "number")                 return data;
//     if (typeof data.count === "number")           return data.count;
//     if (typeof data.unknown_devices === "number") return data.unknown_devices;

//     const firstArr = Object.values(data).find(v => Array.isArray(v));
//     if (firstArr) return firstArr.length;

//     console.warn("[TopGym] Unknown format, using demo count");
//     return DEMO_COUNT;
//   } catch (err) {
//     console.warn("[TopGym] Fetch failed:", err.message, "— using demo count");
//     return DEMO_COUNT;
//   }
// }
