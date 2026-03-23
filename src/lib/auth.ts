import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
          google: { 
              clientId: process.env.GOOGLE_CLIENT_ID as string, 
              clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
          }, 
          github: { 
                     clientId: process.env.GITHUB_CLIENT_ID as string, 
                     clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
                 }, 
      },
});
