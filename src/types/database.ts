// ── Table Row Types ──

export interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'rep' | 'member';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbInvitation {
  id: number;
  email: string;
  role: 'admin' | 'rep' | 'member';
  token: string;
  invited_by: number;
  accepted_at: string | null;
  created_at: string;
}

export interface DbCompany {
  id: number;
  name: string;
  industry: string | null;
  firm_size: string | null;
  website: string | null;
  source: string | null;
  status: 'Prospect' | 'Customer' | 'Former';
  lead_status: 'MQL' | 'SQL' | 'Qualified' | 'Unqualified';
  unqualify_reason: string | null;
  owner_id: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbContact {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  role: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbQualificationCheck {
  id: number;
  company_id: number;
  pain_and_value: string;
  timeline: string;
  budget_pricing_fit: string;
  person_in_position: string;
  qualified_at: string | null;
  qualified_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbSalesStage {
  id: number;
  name: string;
  stage_order: number;
  definition: string | null;
  entry_criteria: string | null;
  exit_criteria: string | null;
  required_fields: string[];
  is_active: boolean;
  created_at: string;
}

export interface DbLossReason {
  id: number;
  reason: string;
  is_active: boolean;
  created_at: string;
}

export interface DbOpportunity {
  id: number;
  company_id: number;
  primary_contact_id: number | null;
  stage_id: number;
  opportunity_type: 'New' | 'Upsell' | 'Renewal' | 'Pilot';
  service_description: string;
  source: string;
  deal_value: number;
  forecast_category: 'Pipeline' | 'Best Case' | 'Commit' | null;
  expected_close_date: string;
  contract_value: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  closed_reason_id: number | null;
  closed_reason_notes: string | null;
  closed_at: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface DbStageTransition {
  id: number;
  opportunity_id: number;
  from_stage_id: number | null;
  to_stage_id: number;
  transitioned_by: number;
  notes: string | null;
  created_at: string;
}

export interface DbActivity {
  id: number;
  company_id: number;
  contact_id: number | null;
  related_opportunity_id: number | null;
  activity_type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Prospecting Touch';
  notes: string | null;
  attachments: { name: string; url: string; type: string }[];
  logged_by: number;
  activity_timestamp: string;
  created_at: string;
}

export interface DbInactivityFlag {
  id: number;
  company_id: number | null;
  related_opportunity_id: number | null;
  flag_type: 'no_activity' | 'deal_aging' | 'past_expected_close' | 'stage_stale';
  flagged_at: string;
  resolved_at: string | null;
  resolved_by: number | null;
  created_at: string;
}

// ── View Types ──

export interface VPipelineByStage {
  stage_name: string;
  stage_order: number;
  deal_count: number;
  total_value: number;
  avg_value: number;
  avg_age_days: number;
}

export interface VActivityLeaderboard {
  user_id: number;
  rep_name: string;
  total_activities: number;
  calls: number;
  emails: number;
  meetings: number;
  prospecting: number;
}

export interface VAtRiskDeals {
  opportunity_id: number;
  company_name: string;
  stage_name: string;
  deal_value: number;
  expected_close_date: string;
  owner_id: number;
  owner_name: string;
  deal_age_days: number;
  days_in_stage: number | null;
  last_activity_at: string | null;
}

export interface VSalesCycle {
  opportunity_id: number;
  company_name: string;
  deal_value: number;
  closed_at: string | null;
  cycle_days: number;
}

// ── Database interface for Supabase client ──

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser;
        Insert: {
          id?: number;
          email: string;
          password_hash: string;
          first_name: string;
          last_name: string;
          role?: 'admin' | 'rep' | 'member';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          password_hash?: string;
          first_name?: string;
          last_name?: string;
          role?: 'admin' | 'rep' | 'member';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: DbCompany;
        Insert: {
          id?: number;
          name: string;
          industry?: string | null;
          firm_size?: string | null;
          website?: string | null;
          source?: string | null;
          status?: 'Prospect' | 'Customer' | 'Former';
          lead_status?: 'MQL' | 'SQL' | 'Qualified' | 'Unqualified';
          unqualify_reason?: string | null;
          owner_id: number;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          industry?: string | null;
          firm_size?: string | null;
          website?: string | null;
          source?: string | null;
          status?: 'Prospect' | 'Customer' | 'Former';
          lead_status?: 'MQL' | 'SQL' | 'Qualified' | 'Unqualified';
          unqualify_reason?: string | null;
          owner_id?: number;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: DbContact;
        Insert: {
          id?: number;
          company_id: number;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          title?: string | null;
          role?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          title?: string | null;
          role?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      qualification_checks: {
        Row: DbQualificationCheck;
        Insert: {
          id?: number;
          company_id: number;
          pain_and_value?: string;
          timeline?: string;
          budget_pricing_fit?: string;
          person_in_position?: string;
          qualified_at?: string | null;
          qualified_by?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number;
          pain_and_value?: string;
          timeline?: string;
          budget_pricing_fit?: string;
          person_in_position?: string;
          qualified_at?: string | null;
          qualified_by?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sales_stages: {
        Row: DbSalesStage;
        Insert: {
          id?: number;
          name: string;
          stage_order: number;
          definition?: string | null;
          entry_criteria?: string | null;
          exit_criteria?: string | null;
          required_fields?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          stage_order?: number;
          definition?: string | null;
          entry_criteria?: string | null;
          exit_criteria?: string | null;
          required_fields?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      loss_reasons: {
        Row: DbLossReason;
        Insert: {
          id?: number;
          reason: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          reason?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: DbOpportunity;
        Insert: {
          id?: number;
          company_id: number;
          primary_contact_id?: number | null;
          stage_id: number;
          opportunity_type: 'New' | 'Upsell' | 'Renewal' | 'Pilot';
          service_description: string;
          source: string;
          deal_value: number;
          forecast_category?: 'Pipeline' | 'Best Case' | 'Commit' | null;
          expected_close_date: string;
          contract_value?: number | null;
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          closed_reason_id?: number | null;
          closed_reason_notes?: string | null;
          closed_at?: string | null;
          owner_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number;
          primary_contact_id?: number | null;
          stage_id?: number;
          opportunity_type?: 'New' | 'Upsell' | 'Renewal' | 'Pilot';
          service_description?: string;
          source?: string;
          deal_value?: number;
          forecast_category?: 'Pipeline' | 'Best Case' | 'Commit' | null;
          expected_close_date?: string;
          contract_value?: number | null;
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          closed_reason_id?: number | null;
          closed_reason_notes?: string | null;
          closed_at?: string | null;
          owner_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stage_transitions: {
        Row: DbStageTransition;
        Insert: {
          id?: number;
          opportunity_id: number;
          from_stage_id?: number | null;
          to_stage_id: number;
          transitioned_by: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          opportunity_id?: number;
          from_stage_id?: number | null;
          to_stage_id?: number;
          transitioned_by?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: DbActivity;
        Insert: {
          id?: number;
          company_id: number;
          contact_id?: number | null;
          related_opportunity_id?: number | null;
          activity_type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Prospecting Touch';
          notes?: string | null;
          attachments?: unknown;
          logged_by: number;
          activity_timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number;
          contact_id?: number | null;
          related_opportunity_id?: number | null;
          activity_type?: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Prospecting Touch';
          notes?: string | null;
          attachments?: unknown;
          logged_by?: number;
          activity_timestamp?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inactivity_flags: {
        Row: DbInactivityFlag;
        Insert: {
          id?: number;
          company_id?: number | null;
          related_opportunity_id?: number | null;
          flag_type: 'no_activity' | 'deal_aging' | 'past_expected_close' | 'stage_stale';
          flagged_at?: string;
          resolved_at?: string | null;
          resolved_by?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number | null;
          related_opportunity_id?: number | null;
          flag_type?: 'no_activity' | 'deal_aging' | 'past_expected_close' | 'stage_stale';
          flagged_at?: string;
          resolved_at?: string | null;
          resolved_by?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_pipeline_by_stage: { Row: VPipelineByStage; Relationships: [] };
      v_activity_leaderboard: { Row: VActivityLeaderboard; Relationships: [] };
      v_at_risk_deals: { Row: VAtRiskDeals; Relationships: [] };
      v_sales_cycle: { Row: VSalesCycle; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
