import type { Partner } from "../types/parther";

export const getIsZoneCompleted = (partners: Partner[]) => {
  return partners.every((partner) => partner.isCompleted);
};