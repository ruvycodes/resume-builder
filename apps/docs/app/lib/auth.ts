import { db } from "../db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { JWTPayload, SignJWT, importJWK } from "jose";
import { Session as NextAuthSession } from "next-auth";

interface Token extends JWT {
  uid: string;
  jwtToken: string;
}

export interface CustomSession extends NextAuthSession {
  user: {
    id: string;
    jwtToken: string;
    email: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || "secret";

  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(jwk);

  return jwt;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "email", type: "text", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
      },
      async authorize(credentials: any) {
        if (!credentials.username || !credentials.password) {
          return null;
        }

        const hashedPassword = await bcrypt.hash(credentials.password, 10);

        const userDb = await db.user.findFirst({
          where: {
            email: credentials.username,
          },
          select: {
            password: true,
            id: true,
            name: true,
          },
        });

        if (userDb) {
          if (await bcrypt.compare(credentials.password, userDb.password)) {
            const jwt = await generateJWT({
              id: userDb.id,
            });

            return {
              id: userDb.id,
              name: userDb.name,
              email: credentials.username,
              token: jwt,
            };
          } else {
            return null;
          }
        }

        try {
          // Sign up
          if (credentials.username.length < 3 || credentials.password.length < 3) {
            return null;
          }

          const user = await db.user.create({
            data: {
              email: credentials.username,
              name: credentials.username,
              password: hashedPassword,
            },
          });

          const jwt = await generateJWT({
            id: user.id,
          });

          return {
            id: user.id,
            name: credentials.username,
            email: credentials.username,
            token: jwt,
          };
        } catch (e) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "secr3t",
  callbacks: {
    session: async ({ session, token }) => {
      const newSession: CustomSession = session as CustomSession;
      if (newSession.user && token.uid) {
        newSession.user.id = token.uid as string;
        newSession.user.jwtToken = token.jwtToken as string;
      }
      return newSession!;
    },
    jwt: async ({ token, user }): Promise<JWT> => {
      const newToken = token as Token;

      if (user) {
        newToken.uid = user.id;
        newToken.jwtToken = (user as User).token;
      }
      return newToken;
    },
    //@ts-ignore
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if the user already exists
        const userDb = await db.user.findUnique({
          where: { email: user.email as string },
        });

        if (!userDb) {
          // Create a new user if they don't exist
          const newUser = await db.user.create({
            data: {
              email: user.email as string,
              name: user.name as string,
              password: 'GOOGLE_AUTH_' + Math.random().toString(36).slice(-8),
              // You might want to handle Google-specific logic here
              // For simplicity, we're just creating a record without a password
            },
          });

          const jwt = await generateJWT({
            id: newUser.id,
          });

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            token: jwt,
          };
        }

        // User already exists, return the existing user
        const jwt = await generateJWT({
          id: userDb.id,
        });

        return {
          id: userDb.id,
          name: userDb.name,
          email: userDb.email,
          token: jwt,
        };
      }

      return true; // Allow sign-in if not using Google provider
    },
  },
};
