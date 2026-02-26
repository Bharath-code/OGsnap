import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Sign Up</h2>
        <p style={{ marginBottom: 0 }}>
          Clerk is not configured. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Sign Up</h2>
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </section>
  );
}
