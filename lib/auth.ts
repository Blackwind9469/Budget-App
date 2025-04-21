import { AuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyPassword } from "./password"
import { query } from "./db"
import { NextAuthOptions } from "next-auth"

// Next-Auth kullanıcı tipi için rol bilgisini ekliyoruz
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

// JWT içerisine rol desteği ekliyoruz
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'E-posta ve Şifre',
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Kullanıcı e-posta doğrulaması yapmış mı kontrol et
          if (!user.email_verified) {
            throw new Error("E-posta adresinizi doğrulamanız gerekiyor");
          }

          // Şifre doğrulaması yap
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorize hatası:', error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        console.log("Session callback - token mevcut");
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
      } else {
        console.log("Session callback - token yok");
      }

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await query(
        'SELECT * FROM users WHERE email = $1',
        [token.email ?? ""]
      );

      if (!dbUser.rows.length) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      const userData = dbUser.rows[0];

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.image,
      };
    },
    // OAuth ile giriş yapan kullanıcılar için signup callback ekleniyor
    async signIn({ user, account }) {
      // Eğer OAuth ile giriş yapıyorsa (Google, Github, Apple)
      if (account && account.provider !== 'credentials') {
        try {
          // Kullanıcının e-postası var mı kontrol et
          if (!user.email) {
            return false;
          }
          
          // Kullanıcı veritabanında var mı kontrol et
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );
          
          // Kullanıcı veritabanında yoksa otomatik kaydet
          if (!result.rowCount || result.rowCount === 0) {
            const userId = user.id;
            const userName = user.name || user.email?.split('@')[0] || 'User';
            
            await query(
              `INSERT INTO users (
                id, name, email, email_verified, image, role
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                userId,
                userName,
                user.email,
                new Date(), // OAuth ile giriş yapan kullanıcılar otomatik doğrulanmış kabul edilir
                user.image || null,
                'user'
              ]
            );
          } else {
            // Kullanıcı zaten varsa, e-posta doğrulamasını güncelle (eğer doğrulanmamışsa)
            if (!result.rows[0].email_verified) {
              await query(
                'UPDATE users SET email_verified = $1 WHERE email = $2',
                [new Date(), user.email]
              );
            }
          }
          
          return true;
        } catch (error) {
          console.error("OAuth giriş hatası:", error);
          return false;
        }
      }
      
      return true;
    },
    // Yönlendirme için callback
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback triggered:', { url, baseUrl });
      
      // Her durumda dashboard'a yönlendir (basit çözüm)
      return `${baseUrl}/dashboard`;
    }
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  }
}