// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client"; // Native client (promise that risolve in MongoClient)
import dbConnect from "@/lib/mongodb"; // Mongoose connection (se ti serve)

export const authOptions = {
	adapter: MongoDBAdapter(clientPromise),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_SECRET,
		}),
	],
	callbacks: {
		async session({ session, user }) {
			// assicurati che dbConnect ritorni/gestisca la connessione correttamente
			await dbConnect();
			session.user.id = user.id;
			return session;
		},
	},
	
};

// crea l'handler e lo ri-esporti come handler per GET e POST (pattern consigliato)
const handler = NextAuth(authOptions);	

export { handler as GET, handler as POST };
