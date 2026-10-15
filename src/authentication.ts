import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cache } from "react";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/database";
import { ROLES } from "@/constants/roles";

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" && process.env.AUTH_DEV_BYPASS === "true";

// Configure NextAuth. `auth` itself isn't request-memoized by next-auth - every
// call re-runs the jwt callback below, which does its own prisma.user.findUnique -
// so it's wrapped in React's cache() further down instead of exported directly.
const { handlers, signIn, signOut, auth: uncachedAuth } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "sim_session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    // Google OAuth provider configuration
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/welcome",
    error: "/welcome",
  },
  callbacks: {
    // Only allow users that exist in the database to sign in
    async signIn({ user }) {
      if (!user.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      return !!dbUser;
    },

    // Enrich the JWT with user data from the database
    async jwt({ token, user }) {
      // Map user ID on initial sign in
      if (user) {
        token.id = user.id;
      }

      if (!token.email) return token;

      try {
        // Fetch user permissions and ID from database
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else {
          return null;
        }
      } catch (error) {
        console.error("JWT Callback Error:", error);
      }

      // Clean up token to keep it small and prevent header size errors
      const picture = token.picture as string;
      const isBase64Image = picture?.startsWith("data:image");

      return {
        id: (token.id as string) || (token.sub as string),
        email: token.email as string,
        name: token.name as string,
        picture: isBase64Image ? "/face.jpg" : picture,
        role: token.role as string,
      } as any;
    },

    // Pass data from the JWT to the session object
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    },
  },
});

async function getDevBypassSession() {
  const dbUser = await prisma.user.findFirst({
    where: { role: ROLES.admin },
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  if (!dbUser) return null;

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      image: dbUser.image,
      name: dbUser.name,
      role: dbUser.role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Every call site (layout, pages, form-content composition files, etc.) calls
// auth() independently and expects its own DB round trip - cache() collapses
// all of those into one prisma lookup per request instead of one per call site.
const cachedAuth = cache((...args: any[]) => {
  if (isDevAuthBypassEnabled && args.length === 0) {
    return getDevBypassSession();
  }

  return (uncachedAuth as (...authArgs: any[]) => ReturnType<typeof uncachedAuth>)(...args);
});

export const auth = cachedAuth as typeof uncachedAuth;
export { handlers, signIn, signOut };
