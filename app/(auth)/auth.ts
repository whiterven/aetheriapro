import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'regular' | 'pro' | 'expert';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    firstName?: string | null;
    lastName?: string | null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'credentials',
      credentials: {},
      async authorize({ email, password }: any) {
        console.log('Auth: Starting authorization for email:', email);
        const users = await getUser(email);

        if (users.length === 0) {
          console.log('Auth: No user found with email:', email);
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;
        console.log('Auth: Found user:', { ...user, password: undefined });

        if (!user.password) {
          console.log('Auth: User has no password');
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);
        console.log('Auth: Password match result:', passwordsMatch);
        
        if (!passwordsMatch) return null;

        const userResult = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          type: 'regular' as const
        };
        console.log('Auth: Returning user:', userResult);
        return userResult;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },
});
