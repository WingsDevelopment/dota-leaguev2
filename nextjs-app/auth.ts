import NextAuth, { User } from "next-auth";
import Discord from "next-auth/providers/discord";

export interface ExtendedUser extends User {
  discordId?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  trustHost: true,
  callbacks: {
    // This callback runs whenever a JWT is created or updated.
    async jwt({ token, account }) {
      // When the user first signs in, 'account' will be defined.
      if (account) {
        // Save the Discord user id from account.providerAccountId into the token.
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    // This callback runs whenever a session is checked.
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          discordId: token.discordId,
        } as ExtendedUser,
      };
    },
  },
});
