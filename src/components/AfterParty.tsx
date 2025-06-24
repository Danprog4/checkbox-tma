import { EmptyCheckMark } from "./icons/EmptyChechMark";
import { ZoneCheckMark } from "./icons/ZoneCheckMark";
import type { Stand } from "../types/stand";
import { getIsZoneCompleted } from "../utils/getIsCompleted";
import { useQueryClient } from "@tanstack/react-query";

export const AfterParty = ({ stands }: { stands: Stand[] }) => {
  const queryClient = useQueryClient();
  const isCompleted = getIsZoneCompleted(stands, queryClient);
  return (
    <div className="rounded-[7px] h-[102px] p-4 flex items-center justify-between bg-gradient-to-r from-[#20A261] to-[#1C5C45]">
      <div className="flex flex-col gap-3">
        <span className="text-white text-2xl font-bold"> After Party</span>
      </div>
      {isCompleted ? <ZoneCheckMark /> : <EmptyCheckMark />}
    </div>
  );
};
