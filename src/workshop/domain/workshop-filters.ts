export const workshopStatuses = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'CLOSED',
  'CANCELLED',
  'ARCHIVED',
] as const;

export type WorkshopStatus = (typeof workshopStatuses)[number];

export type WorkshopFilters = Readonly<{
  status?: WorkshopStatus;
  themeId?: string;
  categoryId?: string;
}>;

export type WorkshopFilterOption = Readonly<{
  id: string;
  name: string;
}>;

export type WorkshopFilterOptions = Readonly<{
  themes: readonly WorkshopFilterOption[];
  categories: readonly WorkshopFilterOption[];
}>;
