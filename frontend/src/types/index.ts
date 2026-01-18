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

// Form inputs
export interface CreateTeamMemberInput {
  name: string;
  email?: string | null;
  avatar?: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  email?: string | null;
  avatar?: string;
}

export interface RecurrenceInput {
  type: RecurrenceType;
  interval: number;
  byWeekDay?: WeekDay[] | null;
  byMonthDay?: number[] | null;
  bySetPos?: number | null;
  endType: EndType;
  endDate?: string | null;
  endAfterOccurrences?: number | null;
}

export interface CreateChoreInput {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate: string;
  recurrence?: RecurrenceInput | null;
}

export interface UpdateChoreInput {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string;
  status?: ChoreStatus;
  recurrence?: RecurrenceInput | null;
}

// Filter state
export interface ChoreFilters {
  assigneeId: string | null;
  status: ChoreStatus[] | null;
}

// Calendar day with chores
export interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  chores: Chore[];
}
