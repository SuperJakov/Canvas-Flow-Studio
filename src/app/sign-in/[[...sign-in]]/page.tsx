import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <SignIn
        appearance={{
          baseTheme: dark,
        }}
      />
    </div>
  );
}
