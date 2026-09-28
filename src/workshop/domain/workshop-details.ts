export type WorkshopAttachment = Readonly<{
  id: string;
  name: string;
}>;

export type WorkshopDetails = Readonly<{
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  theme?: string;
  category?: string;
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
