import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type {
  DbCompany, DbContact, DbOpportunity, DbActivity,
  DbStageTransition, DbQualificationCheck, DbInactivityFlag,
  DbSalesStage, DbLossReason,
} from '../types/database';

interface DataContextType {
  companies: DbCompany[];
  contacts: DbContact[];
  opportunities: DbOpportunity[];
  activities: DbActivity[];
  stageTransitions: DbStageTransition[];
  qualificationChecks: DbQualificationCheck[];
  inactivityFlags: DbInactivityFlag[];
  salesStages: DbSalesStage[];
  lossReasons: DbLossReason[];
  /** All companies/opps/activities unfiltered — for total metrics (exec sees totals) */
  allCompanies: DbCompany[];
  allOpportunities: DbOpportunity[];
  allActivities: DbActivity[];
  loading: boolean;

  getStageById: (id: number) => DbSalesStage | undefined;
  getUserName: (userId: number) => string;

  addCompany: (c: { name: string; industry?: string; firm_size?: string; website?: string; source?: string; }) => Promise<DbCompany | null>;
  updateCompanyLeadStatus: (companyId: number, status: DbCompany['lead_status'], unqualifyReason?: string) => Promise<void>;
  addContact: (c: { company_id: number; first_name: string; last_name: string; email?: string; phone?: string; title?: string; role?: string; linkedin_url?: string; }) => Promise<DbContact | null>;
  updateContact: (id: number, fields: Partial<DbContact>) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  addActivity: (a: { company_id: number; contact_id?: number | null; related_opportunity_id?: number | null; activity_type: string; notes?: string; activity_timestamp?: string; attachments?: { name: string; url: string; type: string }[]; }) => Promise<void>;
  updateDealValue: (oppId: number, newValue: number) => Promise<void>;
  addOpportunity: (o: { company_id: number; opportunity_type: string; service_description: string; deal_value: number; source: string; expected_close_date: string; primary_contact_id?: number | null; notes?: string; }) => Promise<DbOpportunity | null>;
  updateOpportunity: (id: number, fields: Partial<DbOpportunity>) => Promise<void>;
  moveToStage: (oppId: number, targetStageId: number, notes?: string) => Promise<boolean>;
  pushbackStage: (oppId: number, reason: string) => Promise<boolean>;
  closeOpportunity: (oppId: number, won: boolean, reasonId?: number, notes?: string) => Promise<void>;
  reopenOpportunity: (oppId: number) => Promise<void>;
  saveQualification: (companyId: number, fields: { pain_and_value: string; timeline: string; budget_pricing_fit: string; person_in_position: string }) => Promise<void>;
  resolveFlag: (flagId: number) => Promise<void>;
  hasActivitySinceLastTransition: (oppId: number) => boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { dbUser, allUsers } = useAuth();

  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const [contacts, setContacts] = useState<DbContact[]>([]);
  const [opportunities, setOpportunities] = useState<DbOpportunity[]>([]);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [stageTransitions, setStageTransitions] = useState<DbStageTransition[]>([]);
  const [qualificationChecks, setQualificationChecks] = useState<DbQualificationCheck[]>([]);
  const [inactivityFlags, setInactivityFlags] = useState<DbInactivityFlag[]>([]);
  const [salesStages, setSalesStages] = useState<DbSalesStage[]>([]);
  const [lossReasons, setLossReasons] = useState<DbLossReason[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [
      { data: co }, { data: ct }, { data: op }, { data: ac },
      { data: st }, { data: qc }, { data: fl }, { data: ss }, { data: lr },
    ] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('contacts').select('*').order('last_name'),
      supabase.from('opportunities').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('activity_timestamp', { ascending: false }),
      supabase.from('stage_transitions').select('*').order('created_at', { ascending: false }),
      supabase.from('qualification_checks').select('*'),
      supabase.from('inactivity_flags').select('*').order('flagged_at', { ascending: false }),
      supabase.from('sales_stages').select('*').order('stage_order'),
      supabase.from('loss_reasons').select('*').eq('is_active', true).order('reason'),
    ]);
    setCompanies(co ?? []);
    setContacts(ct ?? []);
    setOpportunities(op ?? []);
    setActivities(ac ?? []);
    setStageTransitions(st ?? []);
    setQualificationChecks(qc ?? []);
    setInactivityFlags(fl ?? []);
    setSalesStages(ss ?? []);
    setLossReasons(lr ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Role-based filtering: reps see only their own data, exec/admin see all
  const role = dbUser?.role || 'rep';
  const myId = dbUser?.id;

  const myCompanyIds = useMemo(() => {
    if (role === 'exec' || role === 'admin') return null; // null = no filter
    return new Set(companies.filter(c => c.owner_id === myId).map(c => c.id));
  }, [companies, role, myId]);

  const filteredCompanies = useMemo(() => {
    if (!myCompanyIds) return companies;
    return companies.filter(c => myCompanyIds.has(c.id));
  }, [companies, myCompanyIds]);

  const filteredContacts = useMemo(() => {
    if (!myCompanyIds) return contacts;
    return contacts.filter(c => myCompanyIds.has(c.company_id));
  }, [contacts, myCompanyIds]);

  const filteredOpportunities = useMemo(() => {
    if (!myCompanyIds) return opportunities;
    return opportunities.filter(o => myCompanyIds.has(o.company_id));
  }, [opportunities, myCompanyIds]);

  const filteredActivities = useMemo(() => {
    if (!myCompanyIds) return activities;
    return activities.filter(a => myCompanyIds.has(a.company_id));
  }, [activities, myCompanyIds]);

  const filteredFlags = useMemo(() => {
    if (!myCompanyIds) return inactivityFlags;
    return inactivityFlags.filter(f => f.company_id && myCompanyIds.has(f.company_id));
  }, [inactivityFlags, myCompanyIds]);

  const getStageById = useCallback(
    (id: number) => salesStages.find(s => s.id === id),
    [salesStages],
  );

  const getUserName = useCallback(
    (userId: number) => {
      const u = allUsers.find(u => u.id === userId);
      return u ? `${u.first_name} ${u.last_name}` : 'Unknown';
    },
    [allUsers],
  );

  const addCompany = useCallback(async (c: {
    name: string; industry?: string; firm_size?: string; website?: string; source?: string;
  }) => {
    if (!dbUser) return null;
    const { data, error } = await supabase.from('companies').insert({
      name: c.name,
      industry: c.industry || null,
      firm_size: c.firm_size || null,
      website: c.website || null,
      source: c.source || null,
      status: 'Prospect',
      lead_status: 'MQL',
      owner_id: dbUser.id,
    }).select().single();
    if (!error && data) {
      setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      await supabase.from('qualification_checks').insert({
        company_id: data.id,
        pain_and_value: '',
        timeline: '',
        budget_pricing_fit: '',
        person_in_position: '',
      });
      const { data: qcData } = await supabase.from('qualification_checks').select('*').eq('company_id', data.id).single();
      if (qcData) setQualificationChecks(prev => [...prev, qcData]);
    }
    return data ?? null;
  }, [dbUser]);

  const updateCompanyLeadStatus = useCallback(async (companyId: number, status: DbCompany['lead_status'], unqualifyReason?: string) => {
    const updates: Record<string, unknown> = { lead_status: status };
    if (status === 'Unqualified' && unqualifyReason) {
      updates.unqualify_reason = unqualifyReason;
    } else {
      updates.unqualify_reason = null;
    }
    const { error } = await supabase.from('companies').update(updates).eq('id', companyId);
    if (!error) {
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, lead_status: status, unqualify_reason: status === 'Unqualified' ? (unqualifyReason || null) : null } : c));
    }
  }, []);

  const addContact = useCallback(async (c: {
    company_id: number; first_name: string; last_name: string;
    email?: string; phone?: string; title?: string; role?: string; linkedin_url?: string;
  }) => {
    const { data, error } = await supabase.from('contacts').insert({
      company_id: c.company_id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email || null,
      phone: c.phone || null,
      title: c.title || null,
      role: c.role || null,
      linkedin_url: c.linkedin_url || null,
    }).select().single();
    if (!error && data) {
      setContacts(prev => [...prev, data]);
    }
    return data ?? null;
  }, []);

  const updateContact = useCallback(async (id: number, fields: Partial<DbContact>) => {
    const { data, error } = await supabase.from('contacts').update(fields).eq('id', id).select().single();
    if (!error && data) {
      setContacts(prev => prev.map(c => c.id === id ? data : c));
    }
  }, []);

  const deleteContact = useCallback(async (id: number) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const addActivity = useCallback(async (a: {
    company_id: number;
    contact_id?: number | null;
    related_opportunity_id?: number | null;
    activity_type: string;
    notes?: string;
    activity_timestamp?: string;
    attachments?: { name: string; url: string; type: string }[];
  }) => {
    if (!dbUser) return;
    const { data, error } = await supabase.from('activities').insert({
      company_id: a.company_id,
      contact_id: a.contact_id ?? null,
      related_opportunity_id: a.related_opportunity_id ?? null,
      activity_type: a.activity_type as DbActivity['activity_type'],
      notes: a.notes || null,
      attachments: a.attachments || [],
      logged_by: dbUser.id,
      activity_timestamp: a.activity_timestamp || new Date().toISOString(),
    }).select().single();
    if (!error && data) {
      setActivities(prev => [data, ...prev]);
      setCompanies(prev => prev.map(c =>
        c.id === a.company_id ? { ...c, last_activity_at: data.activity_timestamp, updated_at: new Date().toISOString() } : c
      ));
    }
  }, [dbUser]);

  const addOpportunity = useCallback(async (o: {
    company_id: number; opportunity_type: string; service_description: string;
    deal_value: number; source: string; expected_close_date: string;
    primary_contact_id?: number | null; notes?: string;
  }) => {
    if (!dbUser) return null;
    const firstStage = salesStages.find(s => s.stage_order === 1);
    if (!firstStage) return null;
    const { data, error } = await supabase.from('opportunities').insert({
      company_id: o.company_id,
      opportunity_type: o.opportunity_type as DbOpportunity['opportunity_type'],
      service_description: o.service_description,
      deal_value: o.deal_value,
      source: o.source,
      stage_id: firstStage.id,
      expected_close_date: o.expected_close_date,
      primary_contact_id: o.primary_contact_id ?? null,
      owner_id: dbUser.id,
    }).select().single();
    if (!error && data) {
      setOpportunities(prev => [data, ...prev]);
      const { data: tr } = await supabase.from('stage_transitions').insert({
        opportunity_id: data.id,
        from_stage_id: null,
        to_stage_id: firstStage.id,
        transitioned_by: dbUser.id,
        notes: 'Opportunity created.',
      }).select().single();
      if (tr) setStageTransitions(prev => [tr, ...prev]);
    }
    return data ?? null;
  }, [dbUser, salesStages]);

  const updateOpportunity = useCallback(async (id: number, fields: Partial<DbOpportunity>) => {
    const { data, error } = await supabase.from('opportunities').update(fields).eq('id', id).select().single();
    if (!error && data) {
      setOpportunities(prev => prev.map(o => o.id === id ? data : o));
    }
  }, []);

  const updateDealValue = useCallback(async (oppId: number, newValue: number) => {
    if (!dbUser) return;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;
    const oldValue = opp.deal_value;
    const { error } = await supabase.from('opportunities').update({ deal_value: newValue, updated_at: new Date().toISOString() }).eq('id', oppId);
    if (error) return;
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, deal_value: newValue, updated_at: new Date().toISOString() } : o));
    // Log as activity
    const { data: actData } = await supabase.from('activities').insert({
      company_id: opp.company_id,
      related_opportunity_id: oppId,
      activity_type: 'Note' as const,
      notes: `[PRICING] Deal value updated from $${oldValue.toLocaleString()} to $${newValue.toLocaleString()}`,
      logged_by: dbUser.id,
      activity_timestamp: new Date().toISOString(),
    }).select().single();
    if (actData) {
      setActivities(prev => [actData, ...prev]);
      setCompanies(prev => prev.map(c =>
        c.id === opp.company_id ? { ...c, last_activity_at: actData.activity_timestamp } : c
      ));
    }
  }, [dbUser, opportunities]);

  // Check if there's been an activity specifically tagged to this opportunity since the last stage transition
  const hasActivitySinceLastTransition = useCallback((oppId: number): boolean => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return false;
    const lastTransition = stageTransitions.find(t => t.opportunity_id === oppId);
    const refTime = lastTransition ? new Date(lastTransition.created_at).getTime() : new Date(opp.created_at).getTime();
    return activities.some(a =>
      a.related_opportunity_id === oppId &&
      new Date(a.activity_timestamp).getTime() > refTime
    );
  }, [opportunities, stageTransitions, activities]);

  const moveToStage = useCallback(async (oppId: number, targetStageId: number, notes?: string): Promise<boolean> => {
    if (!dbUser) return false;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp || opp.stage_id === targetStageId) return false;

    const { error } = await supabase.from('opportunities').update({
      stage_id: targetStageId,
      updated_at: new Date().toISOString(),
    }).eq('id', oppId);
    if (error) return false;

    const { data: tr } = await supabase.from('stage_transitions').insert({
      opportunity_id: oppId,
      from_stage_id: opp.stage_id,
      to_stage_id: targetStageId,
      transitioned_by: dbUser.id,
      notes: notes || null,
    }).select().single();

    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage_id: targetStageId, updated_at: new Date().toISOString() } : o));
    if (tr) setStageTransitions(prev => [tr, ...prev]);
    return true;
  }, [dbUser, opportunities]);

  const pushbackStage = useCallback(async (oppId: number, reason: string): Promise<boolean> => {
    if (!dbUser) return false;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return false;
    const currentStage = salesStages.find(s => s.id === opp.stage_id);
    if (!currentStage) return false;
    const nonTerminal = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
    const prevStage = nonTerminal.find(s => s.stage_order === currentStage.stage_order - 1);
    if (!prevStage) return false;

    // Move stage back
    const moved = await moveToStage(oppId, prevStage.id, `Pushed back: ${reason}`);
    if (!moved) return false;

    // Auto-log pushback activity
    const { data: actData, error: actError } = await supabase.from('activities').insert({
      company_id: opp.company_id,
      related_opportunity_id: oppId,
      activity_type: 'Note' as const,
      notes: `[PUSHBACK] ${currentStage.name} → ${prevStage.name}: ${reason}`,
      logged_by: dbUser.id,
      activity_timestamp: new Date().toISOString(),
    }).select().single();
    if (!actError && actData) {
      setActivities(prev => [actData, ...prev]);
      setCompanies(prev => prev.map(c =>
        c.id === opp.company_id ? { ...c, last_activity_at: actData.activity_timestamp } : c
      ));
    }
    return true;
  }, [dbUser, opportunities, salesStages, moveToStage]);

  const closeOpportunity = useCallback(async (oppId: number, won: boolean, reasonId?: number, notes?: string) => {
    if (!dbUser) return;
    const targetStage = salesStages.find(s => s.name === (won ? 'Won' : 'Loss'));
    if (!targetStage) return;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;
    const now = new Date().toISOString();

    const updateFields: Partial<DbOpportunity> = {
      stage_id: targetStage.id,
      closed_at: now,
      updated_at: now,
    };
    if (won) {
      updateFields.contract_value = opp.deal_value;
      updateFields.contract_start_date = now.split('T')[0];
      updateFields.contract_end_date = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    } else {
      updateFields.closed_reason_id = reasonId ?? null;
      updateFields.closed_reason_notes = notes || null;
    }

    const { error } = await supabase.from('opportunities').update(updateFields).eq('id', oppId);
    if (error) return;

    const { data: tr } = await supabase.from('stage_transitions').insert({
      opportunity_id: oppId,
      from_stage_id: opp.stage_id,
      to_stage_id: targetStage.id,
      transitioned_by: dbUser.id,
      notes: notes || (won ? 'Deal closed won.' : 'Deal closed lost.'),
    }).select().single();

    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, ...updateFields } : o));
    if (tr) setStageTransitions(prev => [tr, ...prev]);

    if (won) {
      setCompanies(prev => prev.map(c => c.id === opp.company_id ? { ...c, status: 'Customer' } : c));
    }

    // Auto-log close activity
    const closeNoteText = won
      ? `[CLOSED WON] ${notes || 'Deal closed won.'}`
      : `[CLOSED LOST] ${notes || 'Deal closed lost.'}`;
    const { data: actData } = await supabase.from('activities').insert({
      company_id: opp.company_id,
      related_opportunity_id: oppId,
      activity_type: 'Note' as const,
      notes: closeNoteText,
      logged_by: dbUser.id,
      activity_timestamp: now,
    }).select().single();
    if (actData) {
      setActivities(prev => [actData, ...prev]);
      setCompanies(prev => prev.map(c =>
        c.id === opp.company_id ? { ...c, last_activity_at: now } : c
      ));
    }
  }, [dbUser, opportunities, salesStages]);

  const reopenOpportunity = useCallback(async (oppId: number) => {
    if (!dbUser) return;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp || !opp.closed_at) return;
    // Reopen to the last non-terminal stage (Verbal by default, or Discovery if no history)
    const nonTerminal = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
    const lastNonTerminalTransition = stageTransitions
      .filter(t => t.opportunity_id === oppId)
      .find(t => nonTerminal.some(s => s.id === t.from_stage_id));
    const targetStage = lastNonTerminalTransition
      ? salesStages.find(s => s.id === lastNonTerminalTransition.from_stage_id)
      : nonTerminal[0];
    if (!targetStage) return;

    const now = new Date().toISOString();
    const { error } = await supabase.from('opportunities').update({
      stage_id: targetStage.id,
      closed_at: null,
      closed_reason_id: null,
      closed_reason_notes: null,
      contract_value: null,
      updated_at: now,
    }).eq('id', oppId);
    if (error) return;

    const { data: tr } = await supabase.from('stage_transitions').insert({
      opportunity_id: oppId,
      from_stage_id: opp.stage_id,
      to_stage_id: targetStage.id,
      transitioned_by: dbUser.id,
      notes: 'Opportunity reopened.',
    }).select().single();

    setOpportunities(prev => prev.map(o => o.id === oppId ? {
      ...o, stage_id: targetStage.id, closed_at: null, closed_reason_id: null,
      closed_reason_notes: null, contract_value: null, updated_at: now,
    } : o));
    if (tr) setStageTransitions(prev => [tr, ...prev]);

    // Auto-log reopen activity
    const { data: actData } = await supabase.from('activities').insert({
      company_id: opp.company_id,
      related_opportunity_id: oppId,
      activity_type: 'Note' as const,
      notes: `[REOPENED] Opportunity reopened to ${targetStage.name}.`,
      logged_by: dbUser.id,
      activity_timestamp: now,
    }).select().single();
    if (actData) {
      setActivities(prev => [actData, ...prev]);
    }
  }, [dbUser, opportunities, salesStages, stageTransitions]);

  const saveQualification = useCallback(async (
    companyId: number,
    fields: { pain_and_value: string; timeline: string; budget_pricing_fit: string; person_in_position: string },
  ) => {
    const existing = qualificationChecks.find(q => q.company_id === companyId);
    if (existing) {
      const { data } = await supabase.from('qualification_checks')
        .update(fields)
        .eq('company_id', companyId)
        .select()
        .single();
      if (data) {
        setQualificationChecks(prev => prev.map(q => q.company_id === companyId ? data : q));
      }
    } else {
      const { data } = await supabase.from('qualification_checks').insert({
        company_id: companyId,
        ...fields,
      }).select().single();
      if (data) setQualificationChecks(prev => [...prev, data]);
    }
  }, [qualificationChecks]);

  const resolveFlag = useCallback(async (flagId: number) => {
    if (!dbUser) return;
    const { error } = await supabase.from('inactivity_flags').update({
      resolved_at: new Date().toISOString(),
      resolved_by: dbUser.id,
    }).eq('id', flagId);
    if (!error) {
      setInactivityFlags(prev => prev.map(f => f.id === flagId
        ? { ...f, resolved_at: new Date().toISOString(), resolved_by: dbUser.id }
        : f
      ));
    }
  }, [dbUser]);

  return (
    <DataContext.Provider value={{
      companies: filteredCompanies, contacts: filteredContacts,
      opportunities: filteredOpportunities, activities: filteredActivities,
      stageTransitions, qualificationChecks, inactivityFlags: filteredFlags,
      salesStages, lossReasons,
      allCompanies: companies, allOpportunities: opportunities, allActivities: activities,
      loading,
      getStageById, getUserName,
      addCompany, updateCompanyLeadStatus, addContact, updateContact, deleteContact, addActivity,
      updateDealValue, addOpportunity, updateOpportunity, moveToStage, pushbackStage, closeOpportunity, reopenOpportunity,
      saveQualification, resolveFlag, hasActivitySinceLastTransition,
      refreshData: fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}
