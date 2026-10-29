"use client";

import { MotionConfig } from "framer-motion";

// Alla CRM-animeringar respekterar "Minska rörelse" i macOS/iOS.
export function CrmMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
