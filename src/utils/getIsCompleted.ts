import type { Stand } from "../types/stand";

export const getIsZoneCompleted = (stands: Stand[]) => {
  return stands.every((stand) => stand.is_visited);
};