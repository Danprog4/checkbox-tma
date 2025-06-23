import type { Partner } from "../types/parther";
import { getIsZoneCompleted } from "../utils/getIsCompleted";
import { getPartnerCompletionStatus } from "../utils/getPartnerCompletionStatus";
import { EmptyCheckMark } from "./icons/EmptyChechMark";
import { ZoneCheckMark } from "./icons/ZoneCheckMark";

export const PressZoneHeader = ({
  partners,
  isCompleted,
}: {
  partners: Partner[];
  isCompleted: { id: number; isCompleted: boolean }[];
}) => {
  const partnersWithUpdatedStatus = partners.map((partner) => ({
    ...partner,
    isCompleted: getPartnerCompletionStatus(partner, isCompleted),
  }));
  const isZoneComplete = getIsZoneCompleted(partnersWithUpdatedStatus);

  return (
    <div className="rounded-[7px] p-4 flex items-center justify-between bg-gradient-to-r from-[#20A261] to-[#1C5C45]">
      <div className="flex flex-col gap-3">
        <div className="bg-black py-[6px] w-[95px] flex items-center justify-center rounded-full">
          <span className="text-white mt-0.5 leading-none text-xs font-bold uppercase">
            PRESS ZONE
          </span>
        </div>
        <span className="text-white text-2xl font-bold">NUTRA LEADS</span>
      </div>
      {isZoneComplete ? <ZoneCheckMark /> : <EmptyCheckMark />}
    </div>
  );
};
