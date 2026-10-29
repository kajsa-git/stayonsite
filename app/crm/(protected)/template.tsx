"use client";

import { motion } from "framer-motion";

// template (inte layout) monteras om vid varje sidbyte → mjuk inglidning.
// Bara opacity + liten y-förskjutning: inga headings blir osynliga för någon
// crawler här (CRM:et är noindex), och vyerna behåller sin egen layout.
export default function CrmTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
