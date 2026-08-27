"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { PlayerBar } from "@/components/player/PlayerBar";
import { PlayerInit } from "@/components/player/PlayerInit";
import { ResumeBar } from "@/components/player/ResumeBar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPlayerPage = pathname?.includes("/player");
  return (
    <AuthGuard>
      <PlayerInit />
      <Sidebar />
      <div
        className={cn(
          "min-h-screen pb-[calc(80px+env(safe-area-inset-bottom))] lg:ml-sidebar lg:pb-[calc(90px+env(safe-area-inset-bottom))]",
          {
            "!pb-0 lg:!pb-0": isPlayerPage,
          },
        )}
      >
        <Header />
        <main className="px-4 pb-8 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <PlayerBar />
      <ResumeBar />
    </AuthGuard>
  );
}
