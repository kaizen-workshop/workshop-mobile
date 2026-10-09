export type WorkshopStatus =
  'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED' | 'ARCHIVED';

export type WorkshopModality = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type PaymentMethod = 'FREE' | 'PIX' | 'CREDIT_CARD';

export type ManagedWorkshop = Readonly<{
  id: string;
  title: string;
  description: string;
  themeId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  modality: WorkshopModality;
  price: number;
  registrationStart: string;
  registrationEnd: string;
  maximumParticipants: number;
  paymentMethod: PaymentMethod;
  championship: boolean;
  additionalInformation?: string | null;
  status: WorkshopStatus;
  scheduledPublishAt?: string | null;
}>;

/** Fields accepted by POST/PUT /workshops. */
export type WorkshopInput = Readonly<{
  title: string;
  description: string;
  image: string | null;
  themeId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  modality: WorkshopModality;
  price: number;
  registrationStart: string;
  registrationEnd: string;
  maximumParticipants: number;
  paymentMethod: PaymentMethod;
  championship: boolean;
  additionalInformation: string | null;
}>;

export type WorkshopTransition = 'publish' | 'close' | 'cancel' | 'archive';

export type Dashboard = Readonly<{
  workshops: number;
  publishedWorkshops: number;
  registrations: number;
  confirmedRegistrations: number;
  waitingListRegistrations: number;
  attendedRegistrations: number;
}>;

export type AttendanceStatus =
  'ATTENDED' | 'NOT_ATTENDED' | 'JUSTIFIED_ABSENCE' | 'ABSENT';

export type ManagedParticipant = Readonly<{
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  wegRegistration?: string | null;
  registrationStatus: string;
  paymentStatus: string;
  attendanceStatus: AttendanceStatus | null;
}>;

export type WorkshopPayment = Readonly<{
  paymentId: string;
  registrationId: string;
  participantName: string;
  participantEmail: string;
  amount: number;
  status: string;
  method: string;
}>;

export type Taxonomy = Readonly<{ id: string; name: string }>;

export type PostInput = Readonly<{
  title: string;
  content: string;
  image: string | null;
  workshopId: string | null;
  categoryId: string | null;
  highlight: boolean;
}>;

/** What can be done to a workshop in each state, per the API lifecycle rules. */
export function availableTransitions(
  status: WorkshopStatus,
): readonly WorkshopTransition[] {
  switch (status) {
    case 'DRAFT':
    case 'SCHEDULED':
      return ['publish'];
    case 'PUBLISHED':
      return ['close', 'cancel'];
    case 'CLOSED':
      return ['archive'];
    default:
      return [];
  }
}

/** Only draft or scheduled workshops can be edited. */
export function isEditable(status: WorkshopStatus) {
  return status === 'DRAFT' || status === 'SCHEDULED';
}

export const statusLabels: Record<WorkshopStatus, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  CLOSED: 'Encerrado',
  CANCELLED: 'Cancelado',
  ARCHIVED: 'Arquivado',
};
