export type WorkshopAttachment = Readonly<{
  id: string;
  name: string;
  contentType?: string;
}>;

export type WorkshopDetails = Readonly<{
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  theme?: string;
  category?: string;
  /** yyyy-MM-dd, last day of the workshop. */
  endDate?: string;
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
  modality?: string;
  priceLabel?: string;
  registrationPeriodLabel?: string;
  capacityLabel?: string;
  responsibleNames?: readonly string[];
  attachments?: readonly WorkshopAttachment[];
  additionalInformation?: string;
}>;
