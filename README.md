# Guide to use 'nx' package

This package is an extension for the next-auth package and can be integrated with existing next-auth based projects with minimal configuration

## Installation

```bash
npm install @shvmsnju/nx
```

## Setup

Inside your nextjs project inside 'pages/api/auth/[...nextauth].ts' use this code

```Typescript
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import allowSingleSession from '@shvmsnju/nx';

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],

  callbacks: {
    async jwt({ token, account }: { token: any; account?: any }) {
      // Add this line for managing single session
      token = allowSingleSession(token, account, 10000, false);
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.authenticated = token.authenticated;
      return session;
    },
  },
};

export default NextAuth(authOptions);

```

## Configuration

```Typescript
token = allowSingleSession(token, account, 10000, false);
```

### Parameters:

- token: Pass the token from jwt callback function
- account: Pass the account from jwt callback function
- sessionRefresh: The third parameter is session refresh time in milliseconds and it will determine the intervals at which the session key will be refreshed
- dev: (true/false) - for development keep this option true because nx uses in memory storage for maintaining session key and everytime you make any change the in memory cache will get cleared. By default it is false.

## Concepts

nx uses in memory caching to store the session key and user information and this session key gets refreshed at every interval(mentioned by the user) and thus only one session key will be valid at one time across all the clients.

## Warning

Everytime the server is restarted the in memory cache gets cleared and every user has to login again. I am working on solving this issue. One way to do this is to store the cache details in a persistent storage and reload from there on session startup.
