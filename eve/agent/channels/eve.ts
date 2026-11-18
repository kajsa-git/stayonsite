import { localDev, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// Agentens eget HTTP-API (/eve/v1/session m.m.). Kajsa pratar via Telegram, så API:t
// släpper bara in Vercels egna anrop (CLI:t och Kajsas andra driftsättningar) och
// lokal utveckling. Allt annat får 401. Hälsokollen /eve/v1/health är öppen.
export default eveChannel({
  auth: [vercelOidc(), localDev()],
});
