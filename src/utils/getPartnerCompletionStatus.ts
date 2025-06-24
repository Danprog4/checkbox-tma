import type { Partner } from "../types/stand";

export const getPartnerCompletionStatus = (
  partner: Partner,
  isCompleted: { id: number; isCompleted: boolean }[]
): boolean => {
  const isPartnerCompleted = isCompleted.find(
    (item) => item.id === partner.id
  );
    return isPartnerCompleted
      ? isPartnerCompleted.isCompleted
      : partner.isCompleted;
  };