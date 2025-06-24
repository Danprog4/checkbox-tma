import type { Stand } from "../types/parther";

export const getIsZoneCompleted = (stands: Stand[]) => {
  return stands.every((stand) => stand.is_visited);
};