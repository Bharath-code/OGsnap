import { SignIn } from "@clerk/nextjs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
          Clerk is not configured. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-2xl">Login</h2>
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </Card>
  );
}
