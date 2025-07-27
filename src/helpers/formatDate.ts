import { formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const formatDate = (
  timestamp: bigint | number | undefined | null,
): string => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatDistanceToNow(date, { addSuffix: true });
};
