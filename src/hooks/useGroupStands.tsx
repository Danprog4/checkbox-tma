import { useMemo } from "react";
import type { Stand } from "../types/stand";

type LayoutItem =
  | { type: "big"; header: Stand }
  | { type: "small"; partners: Stand[] };

export const useGroupStands = (standsData: Stand[]) => {
  return useMemo(() => {
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
};
