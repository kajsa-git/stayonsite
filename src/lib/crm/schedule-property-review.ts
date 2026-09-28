import { after } from "next/server";
import { reviewPropertyContent } from "./property-content-review";

export function schedulePropertyReview(id: string) {
  after(async () => {
    try {
      const status = await reviewPropertyContent(id);
      // Uploads often complete during the first check. Only one worker holds
      // the lease; it immediately checks the final image set when needed.
      if (status === "pending") await reviewPropertyContent(id);
    } catch (error) { console.error("property-content-review:", error); }
  });
}
