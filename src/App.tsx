import { useState } from "react";
import "./App.css";
import mapImage from "./assets/map.png";
import { zone1Partners, zone2Partners } from "./parthers-config";
import type { Partner } from "./types/parther";
import { PressZoneHeader } from "./components/PressZoneHeader";
import { PartnerItem } from "./components/PartnerItem";

function App() {
  const [isCompleted, setIsCompleted] = useState<
    {
      id: number;
      isCompleted: boolean;
    }[]
  >([]);

  const handlePartnerClick = (partner: Partner) => {
    const isPartnerCompleted = isCompleted.find(
      (item) => item.id === partner.id
    );

    if (isPartnerCompleted || partner.isCompleted) {
      return;
    } else {
      setIsCompleted([...isCompleted, { id: partner.id, isCompleted: true }]);
    }
  };

  return (
    <div className="bg-[#20A261] min-h-screen w-screen px-4 py-4 overflow-y-auto overflow-x-hidden">
      <div className="bg-black h-full max-w-screen rounded-xl">
        <div className="text-center flex justify-center py-9 px-[35px]">
          <div className="text-white text-nowrap text-3xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide">
            список стендов
          </div>
        </div>

        <div className="relative px-[10px] mb-5">
          <img
            src={mapImage}
            alt="map"
            className="w-full h-full object-cover rounded-xl"
          />

          <div className="text-white absolute text-wrap max-w-10 top-4 left-7 font-bold text-[28px] leading-none">
            Карта площадки
          </div>
        </div>

        <div className="space-y-10  pb-24 px-[10px]">
          <div className="space-y-3">
            <PressZoneHeader
              partners={zone1Partners}
              isCompleted={isCompleted}
            />
            <div className="space-y-2">
              {zone1Partners.map((partner) => (
                <PartnerItem
                  key={`col1-${partner.id}`}
                  partner={partner}
                  isCompleted={isCompleted}
                  isJetton={partner.isJetton}
                  onClick={() => handlePartnerClick(partner)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <PressZoneHeader
              partners={zone2Partners}
              isCompleted={isCompleted}
            />
            <div className="space-y-2">
              {zone2Partners.map((partner) => (
                <PartnerItem
                  key={`col2-${partner.id}`}
                  partner={partner}
                  isCompleted={isCompleted}
                  isJetton={partner.isJetton}
                  onClick={() => handlePartnerClick(partner)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
