"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
	return (
		<div
			style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
			<button
				onClick={() => signIn("google")}
				style={{
					padding: "10px 20px",
					backgroundColor: "#4285F4",
					color: "white",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
					fontSize: "16	px",
				}}>
				Sign in with Google
			</button>
		</div>
	);
}
