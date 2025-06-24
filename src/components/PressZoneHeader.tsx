import type { Stand } from "../types/stand";
import { EmptyCheckMark } from "./icons/EmptyChechMark";
import { ZoneCheckMark } from "./icons/ZoneCheckMark";

export const PressZoneHeader = ({
  stand,
  isVisited,
  onClick,
}: {
  stand: Stand;
  isVisited: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className="rounded-[7px] p-4 flex items-center justify-between bg-gradient-to-r from-[#20A261] to-[#1C5C45]"
      onClick={onClick}>
      <div className="flex flex-col gap-2">
        <div className="bg-black py-2 px-2 justify-center flex items-center rounded-full w-fit">
          <span className="text-white leading-none text-xs pt-[1px] font-bold uppercase whitespace-nowrap">
            {stand.category}
          </span>
        </div>
        <span className="text-white text-2xl font-bold">{stand.name}</span>
      </div>
      {isVisited ? <ZoneCheckMark /> : <EmptyCheckMark />}
    </div>
  );
};
