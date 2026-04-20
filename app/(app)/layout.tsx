import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-xl font-bold">
            Ahaa Event Hub
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
