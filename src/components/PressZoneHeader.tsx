import { EmptyCheckMark } from "./icons/EmptyChechMark";
import { ZoneCheckMark } from "./icons/ZoneCheckMark";

export const PressZoneHeader = ({ category }: { category: string }) => {
  return (
    <div className="rounded-[7px] p-4 flex items-center justify-between bg-gradient-to-r from-[#20A261] to-[#1C5C45]">
      <div className="flex flex-col gap-3">
        <div className="bg-black py-[6px] w-[95px] flex items-center justify-center rounded-full">
          <span className="text-white mt-0.5 leading-none text-xs font-bold uppercase">
            {category}
          </span>
        </div>
        <span className="text-white text-2xl font-bold"> {category}</span>
      </div>
      {false ? <ZoneCheckMark /> : <EmptyCheckMark />}
    </div>
  );
};
