import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Ahaa Event Hub</h1>
      <p className="text-lg text-gray-400 mb-8 text-center max-w-md">
        Create fully branded, shareable event pages with custom submission forms — in minutes.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/signup"
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/auth/login"
          className="rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 hover:border-gray-400 transition-colors"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
