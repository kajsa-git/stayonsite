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
    async signIn({ account }) {
      if (!account) return;
      await db
        .update(accounts)
        .set({
          access_token: account.access_token ?? undefined,
          refresh_token: account.refresh_token ?? undefined,
          expires_at: account.expires_at ?? undefined,
          scope: account.scope ?? undefined,
        })
        .where(
          and(
            eq(accounts.userId, account.userId),
            eq(accounts.provider, account.provider),
          ),
        );
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
