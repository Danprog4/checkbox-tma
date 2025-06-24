import { useMemo } from "react";
import "./App.css";
import { Map } from "./components/Map";
import type { Stand } from "./types/stand";
import { PartnerItem } from "./components/PartnerItem";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authUser, getStands, visitStand, unvisitStand } from "./api";
import { retrieveRawInitData } from "@telegram-apps/sdk";
import { PressZoneHeader } from "./components/PressZoneHeader";
import { AfterParty } from "./components/AfterParty";
import { Loader } from "./components/Loader";
import { useInitTg } from "./hooks/useInitTg";
import { useGroupStands } from "./hooks/useGroupStands";
type LayoutItem =
  | { type: "big"; header: Stand }
  | { type: "small"; partners: Stand[] };

function App() {
  useInitTg();
  const initData = import.meta.env.VITE_MOCK_INIT_DATA ?? retrieveRawInitData();

  console.log("Init data:", initData);
  console.log("Retrieve raw init data:", retrieveRawInitData());
  const user = useQuery({
    queryKey: [authUser.name],
    queryFn: () => authUser(initData),
  });

  const queryClient = useQueryClient();

  const token = useMemo(() => user.data?.access_token, [user.data]);

  const stands = useQuery({
    queryKey: [getStands.name],
    queryFn: () => getStands(token),
    enabled: !!token,
  });

  const standsData = useMemo(() => stands.data?.data?.stands, [stands.data]);

  console.log("Stands data:", stands.data?.data);
  console.log("User data:", user.data);

  const groupedStands = useGroupStands(standsData);

  const visitStandMutation = useMutation({
    mutationFn: (standId: number) => visitStand(token, standId),
  });

  const unvisitStandMutation = useMutation({
    mutationFn: (standId: number) => unvisitStand(token, standId),
  });

  const handleVisitStand = (standId: number) => {
    const stand = standsData?.find((s: Stand) => s.id === standId);
    const isCurrentlyVisited =
      queryClient.getQueryData([visitStand.name, standId]) ??
      stand?.is_visited ??
      false;

    if (isCurrentlyVisited) {
      queryClient.setQueryData([visitStand.name, standId], false);
      unvisitStandMutation.mutate(standId);
    } else {
      queryClient.setQueryData([visitStand.name, standId], true);
      visitStandMutation.mutate(standId);
    }
  };

  if (user.isLoading || stands.isLoading) {
    return (
      <div className="bg-black h-screen w-screen px-4 py-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (user.error) {
    return (
      <div className="bg-[#20A261] min-h-screen w-screen px-4 py-4 flex items-center justify-center">
        <div className="text-white text-xl">Ошибка авторизации</div>
      </div>
    );
  }

  return (
    <div className="bg-[#20A261] fixed inset-0 px-4 py-4 overflow-hidden">
      <div className="bg-[#20A261] h-4 top-0 left-0 right-0 fixed z-50 "></div>

      <div className="bg-black relative h-full w-full max-w-screen rounded-xl overflow-x-hidden overflow-y-auto">
        <div className="text-center flex justify-center py-9 px-[35px]">
          <div className="text-white text-nowrap text-3xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide">
            список стендов
          </div>
        </div>

        <div className="relative px-[10px] mb-5">
          <Map />

          <div className="text-white absolute text-wrap max-w-10 top-4 left-7 font-bold text-[28px] leading-none">
            Карта площадки
          </div>
        </div>

        <div className="space-y-10 pb-24 px-[10px]">
          <div className="space-y-3">
            <div className="space-y-2">
              {(groupedStands.layout ?? []).map(
                (segment: LayoutItem, index: number) => (
                  <div key={`segment-${index}`} className="space-y-2">
                    {segment.type === "big" ? (
                      <PressZoneHeader
                        stand={segment.header}
                        isVisited={
                          queryClient.getQueryData([
                            visitStand.name,
                            segment.header.id,
                          ]) ??
                          segment.header.is_visited ??
                          false
                        }
                        onClick={() => handleVisitStand(segment.header.id)}
                      />
                    ) : (
                      segment.partners.map((stand: Stand) => (
                        <PartnerItem
                          key={`partner-${stand.id}`}
                          partner={stand}
                          isJetton={true}
                          isVisited={
                            queryClient.getQueryData([
                              visitStand.name,
                              stand.id,
                            ]) ??
                            stand.is_visited ??
                            false
                          }
                          onClick={() => handleVisitStand(stand.id)}
                        />
                      ))
                    )}
                  </div>
                )
              )}

              <AfterParty stands={standsData} />
              {groupedStands.afterPartyStands.map((stand: Stand) => (
                <PartnerItem
                  key={`afterparty-${stand.id}`}
                  partner={stand}
                  isJetton={false}
                  isVisited={
                    queryClient.getQueryData([visitStand.name, stand.id]) ??
                    stand.is_visited ??
                    false
                  }
                  onClick={() => handleVisitStand(stand.id)}
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
