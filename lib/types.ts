export type EventStatus = "draft" | "live" | "closed";
export type EventType =
  | "hackathon"
  | "ideathon"
  | "pitch_competition"
  | "innovation_challenge"
  | "workshop"
  | "other";
export type VenueType = "online" | "in_person" | "hybrid";
export type JoinCodeMode = "auto" | "custom";
export type FormFieldType =
  | "short_text"
  | "long_text"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "file";

export interface Organiser {
  id: string;
  email: string;
  name: string;
  organisation: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  organiser_id: string;
  name: string;
  type: EventType;
  theme: string | null;
  description: string | null;
  tagline: string | null;
  registration_start: string | null;
  registration_end: string | null;
  start_date: string | null;
  end_date: string | null;
  timezone: string;
  venue_type: VenueType | null;
  meeting_link: string | null;
  max_participants: number | null;
  join_code: string;
  join_code_mode: JoinCodeMode;
  status: EventStatus;
  expires_at: string | null;
  visitor_count: number;
  registration_count: number;
  submission_deadline: string | null;
  team_min: number | null;
  team_max: number | null;
  eligibility: string | null;
  contact_email: string | null;
  tracks: string[] | null;
  prizes: { place: number; label: string; value: string }[] | null;
  judging_criteria: { name: string; weight: number; expectations: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface EventBranding {
  id: string;
  event_id: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  background_color: string;
  accent_color: string;
  font_preset: string;
  created_at: string;
  updated_at: string;
}

export interface FormSection {
  id: string;
  event_id: string;
  title: string;
  order: number;
}

export interface FormField {
  id: string;
  event_id: string;
  section_id: string | null;
  label: string;
  type: FormFieldType;
  helper_text: string | null;
  required: boolean;
  char_limit: number | null;
  options: string[] | null;
  order: number;
}

export interface EventFaq {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  order: number;
}

export type NavigatorSubmissionStatus = "submitted" | "parsed" | "scored";

export interface NavigatorSubmission {
  id: string;
  created_at: string;
  consent_data: boolean;
  wants_report: boolean;
  first_name: string | null;
  email: string | null;
  source: string;
  problem_statement: string;
  domain: string;
  duration: string;
  pre_ai_thinking: string;
  ai_tools: string[];
  brief_quality: string;
  ai_redirections: string;
  self_tested: string;
  repo_url: string;
  extra_context: string | null;
  status: NavigatorSubmissionStatus;
}
