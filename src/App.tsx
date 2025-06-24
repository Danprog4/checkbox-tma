import { useEffect, useMemo } from "react";
import "./App.css";
import { Map } from "./components/Map";
import type { Stand } from "./types/stand";
import { PartnerItem } from "./components/PartnerItem";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authUser, getStands, visitStand, unvisitStand } from "./api";
import {
  init,
  mockTelegramEnv,
  retrieveRawInitData,
  swipeBehavior,
} from "@telegram-apps/sdk";
import { PressZoneHeader } from "./components/PressZoneHeader";
import { AfterParty } from "./components/AfterParty";

function App() {
  useEffect(() => {
    const themeParams = {
      accent_text_color: "#6ab2f2",
      bg_color: "#17212b",
      button_color: "#5288c1",
      button_text_color: "#ffffff",
      destructive_text_color: "#ec3942",
      header_bg_color: "#17212b",
      hint_color: "#708499",
      link_color: "#6ab3f3",
      secondary_bg_color: "#232e3c",
      section_bg_color: "#17212b",
      section_header_text_color: "#6ab3f3",
      subtitle_text_color: "#708499",
      text_color: "#f5f5f5",
    } as const;

    if (import.meta.env.DEV) {
      mockTelegramEnv({
        launchParams: {
          tgWebAppPlatform: "web",
          tgWebAppVersion: "8.0.0",
          tgWebAppData: import.meta.env.VITE_MOCK_INIT_DATA,
          tgWebAppThemeParams: themeParams,
          tgWebAppStartParam: "ref=3",
        },
      });
    }

    init();

    if (swipeBehavior.mount.isAvailable()) {
      console.log(
        "Swipe behavior is available",
        swipeBehavior.mount.isAvailable(),
        swipeBehavior.isVerticalEnabled()
      );
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }
  }, []);

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

  const groupedStands = useMemo(() => {
    if (!standsData) return { groups: [], afterPartyStands: [] };

    const pressZoneHeaders = standsData.filter(
      (stand: Stand) =>
        stand.category.length > 2 && stand.category !== "Afterparty"
    );

    const partnerItems = standsData.filter(
      (stand: Stand) =>
        stand.category.length <= 2 && stand.category !== "Afterparty"
    );

    const groups = [];
    for (let i = 0; i < pressZoneHeaders.length; i++) {
      const group = {
        header: pressZoneHeaders[i],
        partners: partnerItems.slice(i, i + 1),
      };
      groups.push(group);
    }

    const afterPartyStands = standsData.filter(
      (stand: Stand) => stand.category === "Afterparty"
    );

    return { groups, afterPartyStands };
  }, [standsData]);

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
      <div className="bg-[#20A261] h-screen w-screen px-4 py-4 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
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
    <div className="bg-[#20A261] min-h-screen w-screen px-4 py-4 overflow-y-auto overflow-x-hidden">
      <div className="bg-black h-full max-w-screen rounded-xl">
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
              {groupedStands.groups.map(
                (
                  group: { header: Stand; partners: Stand[] },
                  index: number
                ) => (
                  <div key={`group-${index}`} className="space-y-2">
                    <PressZoneHeader
                      stand={group.header}
                      isVisited={
                        queryClient.getQueryData([
                          visitStand.name,
                          group.header.id,
                        ]) ??
                        group.header.is_visited ??
                        false
                      }
                      onClick={() => handleVisitStand(group.header.id)}
                    />
                    {group.partners.map((stand: Stand) => (
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
                    ))}
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
