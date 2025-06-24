import { EmptyCheckMark } from "./icons/EmptyChechMark";
import { PartnerCheckMark } from "./icons/PartnerCheckMark";
import coin from "../assets/coin.png";
import type { Stand } from "../types/stand";

export const PartnerItem = ({
  partner,
  isJetton,
  onClick,
  isVisited,
}: {
  partner: Stand;
  isJetton: boolean;
  onClick: (partner: Stand) => void;
  isVisited: boolean;
}) => {
  return (
    <div className="bg-[#262626] rounded-[7px] p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex pt-0.5 items-center ${partner.category.length >= 3 ? "text-xs" : "text-xs"} justify-center text-[#20A261] font-bold border-2 border-[#20A261]`}>
          {partner.category.slice(0, 3)}
        </div>
        <span className="text-white text-lg font-semibold">{partner.name}</span>
      </div>

      <div
        onClick={() => onClick(partner)}
        className="cursor-pointer flex items-center gap-5">
        {isJetton ? <img src={coin} alt="coin" className="w-8 h-8" /> : null}
        {isVisited ? <PartnerCheckMark /> : <EmptyCheckMark />}
      </div>
    </div>
  );
};
