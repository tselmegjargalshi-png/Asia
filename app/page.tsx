import { Providers } from "@/components/ui/Providers";
import { SceneLayer } from "@/components/ui/SceneLayer";
import { Nav } from "@/components/ui/Nav";
import { Anchors } from "@/components/ui/Anchors";
import { AccountDialog, LoginDialog } from "@/components/ui/Dialogs";
import { Hero } from "@/components/sections/Hero";
import { Standard } from "@/components/sections/Standard";
import { AsiaPillars } from "@/components/sections/AsiaPillars";
import { CardSection } from "@/components/sections/CardSection";
import { Payments } from "@/components/sections/Payments";
import { Global } from "@/components/sections/Global";
import { Wealth } from "@/components/sections/Wealth";
import { Security } from "@/components/sections/Security";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { Final } from "@/components/sections/Final";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <Providers>
      <a href="#main" className="sr-only z-[70] rounded-full bg-ivory px-5 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SceneLayer />
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <Standard />
        <AsiaPillars />
        <CardSection />
        <Payments />
        <Global />
        <Wealth />
        <Security />
        <ExperienceSection />
        <Final />
      </main>
      <Footer />
      <Anchors />
      <AccountDialog />
      <LoginDialog />
    </Providers>
  );
}
