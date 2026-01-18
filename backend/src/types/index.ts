// Chore Status
export type ChoreStatus = 'pending' | 'in_progress' | 'completed';

// Recurrence Types
export type RecurrenceType = 'daily' | 'weekly' | 'monthly';
export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
export type EndType = 'never' | 'date' | 'after';

// Recurrence Rule
export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  byWeekDay: WeekDay[] | null;
  byMonthDay: number[] | null;
  bySetPos: number | null;
  endType: EndType;
  endDate: string | null;
  endAfterOccurrences: number | null;
  rruleString: string;
}

// Team Member
export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

// Chore
export interface Chore {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  status: ChoreStatus;
  dueDate: string;
  recurrence: RecurrenceRule | null;
  parentChoreId: string | null;
  isRecurrenceInstance: boolean;
  createdAt: string;
  updatedAt: string;
}

// Data Store Structure
export interface DataStore {
  teamMembers: TeamMember[];
  chores: Chore[];
}

// API Request Types
export interface CreateTeamMemberRequest {
  name: string;
  email?: string | null;
  avatar?: string;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  email?: string | null;
  avatar?: string;
}

export interface CreateChoreRequest {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate: string;
  recurrence?: Omit<RecurrenceRule, 'rruleString'> | null;
}

export interface UpdateChoreRequest {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string;
  status?: ChoreStatus;
  recurrence?: Omit<RecurrenceRule, 'rruleString'> | null;
}

export interface UpdateChoreStatusRequest {
  status: ChoreStatus;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

// Calendar Query
export interface CalendarQuery {
  year: number;
  month: number;
  assigneeId?: string;
  status?: ChoreStatus[];
}

// Reminder Response
export interface ReminderCheckResponse {
  upcoming: Chore[];
  overdue: Chore[];
}
