import { QueryClient } from "@tanstack/react-query";
import { visitStand } from "../api";
import type { Stand } from "../types/stand";

export const getIsZoneCompleted = (stands: Stand[], queryClient: QueryClient) => {
  return stands.filter((stand) => stand.category === "Afterparty").every(
    (stand) => {
      const visitedFromCache = queryClient.getQueryData([visitStand.name, stand.id]);
      return visitedFromCache === true || stand.is_visited === true;
    }
  );
};
