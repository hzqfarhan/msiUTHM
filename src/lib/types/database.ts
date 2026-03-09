/**
 * Database type definitions for Supabase.
 * These mirror the schema defined in the SQL migration.
 * In production, generate these with `supabase gen types typescript`.
 */

export type UserRole = 'user' | 'admin';

export interface Profile {
    id: string;
    full_name: string | null;
    role: UserRole;
    community_role: 'student' | 'staff' | 'alumni' | 'community' | null;
    faculty: string | null;
    batch: string | null;
    volunteering_interests: string[] | null;
    notification_preferences: Record<string, unknown> | null;
    onboarding_completed: boolean;
    avatar_url: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface Mosque {
    id: string;
    name: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    timezone: string;
    zone_code: string;
    contact_info: Record<string, string> | null;
    created_at: string;
    updated_at: string;
}

export interface PrayerTimesCache {
    id: string;
    mosque_id: string;
    date: string;
    subuh: string;
    syuruk: string;
    zohor: string;
    asar: string;
    maghrib: string;
    isyak: string;
    created_at: string;
}

export interface IqamahSetting {
    id: string;
    mosque_id: string;
    prayer_name: string;
    offset_minutes: number;
    fixed_time: string | null;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    mosque_id: string;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    location: string | null;
    poster_url: string | null;
    tags: string[];
    is_published: boolean;
    created_by: string | null;
    max_participants: number | null;
    created_at: string;
    updated_at: string;
}

export interface EventRsvp {
    id: string;
    event_id: string;
    user_id: string | null;
    guest_name: string | null;
    guest_phone: string | null;
    status: string;
    created_at: string;
}

export interface EventCheckin {
    id: string;
    event_id: string;
    user_id: string;
    checked_in_at: string;
}

export interface Announcement {
    id: string;
    mosque_id: string;
    title: string;
    body: string | null;
    category: 'general' | 'urgent' | 'event' | 'facilities';
    image_url: string | null;
    is_published: boolean;
    pinned: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Facility {
    id: string;
    mosque_id: string;
    name: string;
    description: string | null;
    category: string | null;
    location_hint: string | null;
    photos: string[];
    image_url: string | null;
    has_wheelchair_access: boolean;
    opening_hours: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
    updated_at: string;
}

export interface FeedbackReport {
    id: string;
    mosque_id: string;
    user_id: string | null;
    category: string | null;
    description: string;
    photo_url: string | null;
    facility_id: string | null;
    status: 'new' | 'acknowledged' | 'resolved';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface VolunteerOpportunity {
    id: string;
    mosque_id: string;
    title: string;
    description: string | null;
    event_id: string | null;
    slots_needed: number | null;
    deadline: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface VolunteerSignup {
    id: string;
    opportunity_id: string;
    user_id: string;
    message: string | null;
    created_at: string;
}

export interface PushSubscription {
    id: string;
    user_id: string;
    endpoint: string;
    keys: Record<string, string>;
    created_at: string;
}

export interface AnalyticsEvent {
    id: string;
    event_name: string;
    session_id: string | null;
    user_id: string | null;
    page_path: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface DonationInfo {
    id: string;
    mosque_id: string;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    qr_image_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CommunityChatMessage {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
}

// Prayer name type for consistency
export type PrayerName = 'subuh' | 'syuruk' | 'zohor' | 'asar' | 'maghrib' | 'isyak';

export const PRAYER_NAMES: PrayerName[] = ['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];

// Helper type: make all fields optional except specified required ones
type TableDef<Row, RequiredInsertKeys extends keyof Row = never> = {
    Row: Row;
    Insert: Omit<Partial<Row>, RequiredInsertKeys> & Pick<Row, RequiredInsertKeys>;
    Update: Partial<Row>;
    Relationships: Array<{
        foreignKeyName: string;
        columns: string[];
        isOneToOne: boolean;
        referencedRelation: string;
        referencedColumns: string[];
    }>;
};

// Supabase Database type for generic client typing
export interface Database {
    public: {
        Tables: {
            profiles: TableDef<Profile, 'id'>;
            mosques: TableDef<Mosque, 'name'>;
            prayer_times_cache: TableDef<PrayerTimesCache, 'mosque_id' | 'date' | 'subuh' | 'syuruk' | 'zohor' | 'asar' | 'maghrib' | 'isyak'>;
            iqamah_settings: TableDef<IqamahSetting, 'mosque_id' | 'prayer_name'>;
            events: TableDef<Event, 'mosque_id' | 'title' | 'start_at'>;
            event_rsvps: TableDef<EventRsvp, 'event_id'>;
            event_checkins: TableDef<EventCheckin, 'event_id' | 'user_id'>;
            announcements: TableDef<Announcement, 'mosque_id' | 'title'>;
            facilities: TableDef<Facility, 'mosque_id' | 'name'>;
            feedback_reports: TableDef<FeedbackReport, 'mosque_id' | 'description'>;
            volunteer_opportunities: TableDef<VolunteerOpportunity, 'mosque_id' | 'title'>;
            volunteer_signups: TableDef<VolunteerSignup, 'opportunity_id' | 'user_id'>;
            push_subscriptions: TableDef<PushSubscription, 'user_id' | 'endpoint' | 'keys'>;
            analytics_events: TableDef<AnalyticsEvent, 'event_name'>;
            donation_info: TableDef<DonationInfo, 'mosque_id'>;
            community_chat_messages: TableDef<CommunityChatMessage, 'user_id' | 'message'>;
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}
