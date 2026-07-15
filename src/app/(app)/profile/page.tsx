"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useHero } from "@/app/lib/useHero";
import { useHabitData } from "@/app/lib/useHabitData";
import { computeMomentum } from "@/app/lib/momentum";
import { StatusWindow } from "@/app/components/status-window/StatusWindow";
import { RankBadge } from "@/app/components/status/RankBadge";
import { ReportCard } from "@/app/components/profile/ReportCard";
import { LoreIntro } from "@/app/components/profile/LoreIntro";
import { AccountSettings } from "@/app/components/profile/AccountSettings";

export default function ProfilePage() {
  const { hero, patchProfile, setArchetype, patchFamiliar, loading } = useHero();
  const { habits, completions, loading: dataLoading } = useHabitData();

  const momentum = useMemo(
    () => (dataLoading ? undefined : computeMomentum(habits, completions)),
    [habits, completions, dataLoading]
  );

  if (loading || !hero) {
    return (
      <div className="flex-1 flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Column A — identity & weekly report */}
        <div className="flex flex-col gap-5">
          <StatusWindow hero={hero} momentum={momentum} />
          <LoreIntro hero={hero} />
          <ReportCard hero={hero} habits={habits} completions={completions} />
        </div>

        {/* Column B — rank & account settings */}
        <div className="flex flex-col gap-5">
          <RankBadge hero={hero} />
          <AccountSettings
            hero={hero}
            patchProfile={patchProfile}
            setArchetype={setArchetype}
            patchFamiliar={patchFamiliar}
          />
        </div>
      </div>
    </div>
  );
}
