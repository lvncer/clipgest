import { Suspense } from "react";
import AppHeader from "@/components/layouts/AppHeader";
import LinksPageClient from "@/components/links/LinksPageClient";
import Footer from "@/components/layouts/Footer";

export default function Home() {
  return (
    <>
      <main className="min-h-screen max-w-4xl mx-auto mb-4">
        <AppHeader />
        <Suspense>
          <LinksPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
