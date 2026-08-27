import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { PlayerBar } from "@/components/player/PlayerBar";
import { PlayerInit } from "@/components/player/PlayerInit";
import { ResumeBar } from "@/components/player/ResumeBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PlayerInit />
      <Sidebar />
      <div className="ml-sidebar min-h-screen pb-player">
        <Header />
        <main className="px-8 pb-8">{children}</main>
      </div>
      <PlayerBar />
      <ResumeBar />
    </AuthGuard>
  );
}
