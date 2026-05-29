import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./schema";
import { and, eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  events: {
    // DrizzleAdapter uppdaterar inte scope/refresh_token vid återinloggning — gör det manuellt.
    async signIn({ user, account }) {
      if (!account || !user?.id) return;
      const patch: Record<string, unknown> = {};
      if (account.access_token) patch.access_token = account.access_token;
      if (account.refresh_token) patch.refresh_token = account.refresh_token;
      if (account.expires_at) patch.expires_at = account.expires_at;
      if (account.scope) patch.scope = account.scope;
      if (!Object.keys(patch).length) return;
      await db
        .update(accounts)
        .set(patch)
        .where(and(eq(accounts.userId, user.id), eq(accounts.provider, account.provider)));
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Attach approved status
        const dbUser = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.id, user.id),
        });
        (session.user as typeof session.user & { approved: boolean }).approved =
          dbUser?.approved ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/crm/login",
  },
});
