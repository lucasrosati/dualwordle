import { useEffect, useState } from "react";
import { RankingTable } from "@/components/RankingTable";
import { STORAGE_KEY_RANKING, RankingEntry, mergeSort } from "@/utils/gameLogic";

const RankingPage = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY_RANKING);
    if (raw) setRanking(mergeSort(JSON.parse(raw)));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground">
      {/* RankingTable já exibe o título “Ranking” */}
      <RankingTable ranking={ranking} />
    </div>
  );
};

export default RankingPage;
