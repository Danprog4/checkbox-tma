import { useEffect, useMemo, useState } from "react";
import "./App.css";

import type { Stand } from "./types/stand";
import { PartnerItem } from "./components/PartnerItem";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authUser, getStands, visitStand, unvisitStand } from "./api";

import { PressZoneHeader } from "./components/PressZoneHeader";
import { AfterParty } from "./components/AfterParty";
import { Loader } from "./components/Loader";

import { useGroupStands } from "./hooks/useGroupStands";
type LayoutItem =
  | { type: "big"; header: Stand }
  | { type: "small"; partners: Stand[] };

function App() {
  const [initData, setInitData] = useState<{ initData?: string }>();
  useEffect(() => {
    // register listener for account data
    const onTelegramDataReceived = (event: MessageEvent) => {
      if (event.data?.type === "TELEGRAM_DATA") {
        // load account data
        const webAppData = event.data.payload;
        setInitData(webAppData);
        console.log("Web app data:", webAppData);
      }
    };
    window.addEventListener("message", onTelegramDataReceived);

    // request TgTaps to send data to our listener
    window.parent.postMessage({ type: "REQUEST_TELEGRAM_DATA" }, "*");

    return () => {
      window.removeEventListener("message", onTelegramDataReceived);
    };
  }, []);

  console.log("Init data:", initData);
  console.log("Init data string:", initData?.initData);

  const user = useQuery({
    queryKey: [authUser.name, initData?.initData],
    queryFn: () => authUser(initData?.initData as string),
    enabled: !!initData?.initData,
  });

  const queryClient = useQueryClient();

  const token = useMemo(() => user.data?.access_token, [user.data]);

  const stands = useQuery({
    queryKey: [getStands.name],
    queryFn: () => getStands(token),
    enabled: !!token,
  });

  const standsData = useMemo(() => stands.data?.data?.stands, [stands.data]);

  console.log("Stands data:", stands.data);
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

  if (!initData?.initData || user.isLoading || stands.isLoading) {
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
    <div className="bg-black fixed pt-4 inset-0 px-4 overflow-hidden">
      <div className=" relative h-full w-full max-w-screen rounded-b-none rounded-xl overflow-x-hidden overflow-y-auto">
        {/* <div className="text-center flex justify-center pt-9 pb-7 px-[35px]">
          <div className="text-white text-nowrap text-3xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide">
            список стендов
          </div>
        </div> */}

        <div className="space-y-10 pb-24 ">
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
