import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <p style={{ marginBottom: 0 }}>
          Clerk is not configured. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </section>
  );
}
