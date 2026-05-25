"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nordic-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-2xl font-semibold text-nordic-900 tracking-tight">StayOnSite CRM</div>
        <p className="text-sm text-muted-foreground text-center">
          Internt säljverktyg — logga in med ditt Google-konto.
        </p>
        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/crm" })}
        >
          Logga in med Google
        </Button>
      </div>
    </div>
  );
}
