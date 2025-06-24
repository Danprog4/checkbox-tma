import { useEffect, useMemo } from "react";
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

  const groupedStands = useMemo(() => {
    if (!standsData)
      return { layout: [], afterPartyStands: [] } as {
        layout: LayoutItem[];
        afterPartyStands: Stand[];
      };

    const afterPartyStands = standsData.filter(
      (stand: Stand) => stand.category === "Afterparty"
    );

    const regularStands = standsData.filter(
      (stand: Stand) => stand.category !== "Afterparty"
    );

    // Малые стенды имеют формат "Буква + цифры" (A1, A12, М4 ...)
    const smallRegex = /^[A-Za-zА-Яа-я]\d+$/;

    const partners = regularStands.filter((stand: Stand) =>
      smallRegex.test(stand.category)
    );

    const bigHeaders = regularStands.filter(
      (stand: Stand) => !smallRegex.test(stand.category)
    );

    // Нормализуем букву сектора (латиница/кириллица)
    const CYRILLIC_TO_LATIN: Record<string, string> = {
      А: "A",
      В: "B",
      С: "C",
      Е: "E",
      Н: "H",
      К: "K",
      М: "M",
      О: "O",
      Р: "P",
      Т: "T",
      Х: "X",
      У: "Y",
    };

    const normalizeLetter = (letter: string) => {
      const upper = letter.toUpperCase();
      return CYRILLIC_TO_LATIN[upper] ?? upper;
    };

    const getSectorLetter = (category: string) =>
      normalizeLetter(category.charAt(0));

    // 1. Группируем маленькие стенды по первой букве
    const letterGroupsMap = new globalThis.Map<string, Stand[]>();
    partners.forEach((p: Stand) => {
      const letter = getSectorLetter(p.category);
      if (!letterGroupsMap.has(letter)) {
        letterGroupsMap.set(letter, []);
      }
      letterGroupsMap.get(letter)!.push(p);
    });

    // Числовая сортировка внутри группы
    const comparePartners = (a: Stand, b: Stand) => {
      const numA = parseInt(a.category.slice(1));
      const numB = parseInt(b.category.slice(1));
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.category.localeCompare(b.category);
    };

    const lettersSorted = Array.from<string>(letterGroupsMap.keys()).sort(
      (a: string, b: string) => a.localeCompare(b)
    );

    const smallGroups = lettersSorted.map((letter) => ({
      letter,
      partners: letterGroupsMap.get(letter)!.sort(comparePartners),
    }));

    // 2. Сортируем большие стенды по категории (можно изменить критерий)
    const bigSorted = [...bigHeaders].sort((a: Stand, b: Stand) =>
      a.category.localeCompare(b.category)
    );

    // 3. Чередуем блоками: 4 больших → 1 группа маленьких → 4 больших → ...
    const layout: LayoutItem[] = [];
    let bigPtr = 0;
    let smallPtr = 0;

    while (bigPtr < bigSorted.length || smallPtr < smallGroups.length) {
      // Добавляем до 4 больших стендов
      const chunkEnd = Math.min(bigPtr + 3, bigSorted.length);
      for (let i = bigPtr; i < chunkEnd; i++) {
        layout.push({ type: "big", header: bigSorted[i] });
      }
      bigPtr = chunkEnd;

      // Затем одну группу маленьких, если осталось
      if (smallPtr < smallGroups.length) {
        layout.push({
          type: "small",
          partners: smallGroups[smallPtr].partners,
        });
        smallPtr++;
      }
    }

    return { layout, afterPartyStands } as {
      layout: LayoutItem[];
      afterPartyStands: Stand[];
    };
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
