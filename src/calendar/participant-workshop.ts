export type ParticipantWorkshop = Readonly<{
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  modality: string;
}>;

export type ParticipantWorkshopPage = Readonly<{
  items: readonly ParticipantWorkshop[];
  page: number;
  hasMore: boolean;
}>;

export const participantWorkshopFilters = [
  'FUTURE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'WAITING_LIST',
] as const;
export type ParticipantWorkshopFilter =
  (typeof participantWorkshopFilters)[number];
