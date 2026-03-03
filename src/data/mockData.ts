// ============================================================
// MOCK DATA — Sales Operating System
// ============================================================

export interface Company {
  id: string;
  name: string;
  industry: string;
  firmSize: string;
  headcount: number;
  website: string;
  status: 'Prospect' | 'Customer' | 'Former';
  source: string;
  owner: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  contactType: 'Lead' | 'Customer' | 'Other';
  source: string;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesStage {
  id: number;
  name: string;
  stageOrder: number;
  definition: string;
  entryCriteria: string;
  exitCriteria: string;
  requiredFields: string[];
  isTerminal: boolean;
}

export interface Opportunity {
  id: string;
  companyId: string;
  primaryContactId: string;
  opportunityType: 'New' | 'Upsell' | 'Renewal' | 'Pilot';
  stageId: number;
  source: string;
  dealValue: number | null;
  forecastCategory: 'Pipeline' | 'Best Case' | 'Commit' | null;
  expectedCloseDate: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  closedAt: string | null;
  closedReason: string | null;
  closedNotes: string | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
  stageEnteredAt: string;
}

export interface Activity {
  id: string;
  activityType: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Prospecting Touch';
  relatedObjectType: 'Contact' | 'Opportunity';
  relatedObjectId: string;
  owner: string;
  notes: string;
  timestamp: string;
}

export interface StageTransition {
  id: string;
  opportunityId: string;
  fromStageId: number | null;
  toStageId: number;
  transitionedBy: string;
  transitionedAt: string;
  notes: string;
}

export interface QualificationCheck {
  id: string;
  contactId: string;
  opportunityId: string | null;
  budget: boolean;
  authority: boolean;
  need: boolean;
  timing: boolean;
  notes: string;
  qualifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InactivityFlag {
  id: string;
  relatedObjectType: 'Contact' | 'Opportunity';
  relatedObjectId: string;
  flagType: string;
  flaggedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

// ── Sales Stages ──
export const salesStages: SalesStage[] = [
  { id: 1, name: 'Lead', stageOrder: 1, definition: 'Contact exists, not yet qualified.', entryCriteria: 'Contact captured via any source', exitCriteria: '≥1 activity logged + qualification scheduled', requiredFields: ['source'], isTerminal: false },
  { id: 2, name: 'Sales Working Lead', stageOrder: 2, definition: 'Active engagement underway, qualification incomplete.', entryCriteria: '≥1 activity logged', exitCriteria: 'BANT qualified', requiredFields: ['source'], isTerminal: false },
  { id: 3, name: 'Opportunity', stageOrder: 3, definition: 'Legitimate qualified deal.', entryCriteria: 'BANT qualified + meeting held', exitCriteria: 'Demo/proposal delivered', requiredFields: ['expected_close_date', 'opportunity_type'], isTerminal: false },
  { id: 4, name: 'Evaluation', stageOrder: 4, definition: 'Buyer actively evaluating.', entryCriteria: 'Demo or proposal delivered', exitCriteria: 'Verbal commitment', requiredFields: ['expected_close_date', 'forecast_category', 'deal_value'], isTerminal: false },
  { id: 5, name: 'Commit', stageOrder: 5, definition: 'Verbal commitment pending paperwork.', entryCriteria: 'Verbal commitment received', exitCriteria: 'Contract signed or deal lost', requiredFields: ['expected_close_date', 'forecast_category', 'deal_value'], isTerminal: false },
  { id: 6, name: 'Closed Won', stageOrder: 6, definition: 'Deal won.', entryCriteria: 'Contract signed', exitCriteria: '', requiredFields: ['deal_value', 'contract_start_date', 'contract_end_date'], isTerminal: true },
  { id: 7, name: 'Closed Lost', stageOrder: 7, definition: 'Deal lost.', entryCriteria: 'Deal lost at any stage', exitCriteria: '', requiredFields: ['closed_reason'], isTerminal: true },
];

// ── Companies ──
export const companies: Company[] = [
  { id: 'comp-1', name: 'Sterling & Associates LLP', industry: 'Corporate Law', firmSize: '51-200', headcount: 120, website: 'sterlinglaw.com', status: 'Customer', source: 'Referral', owner: 'Nick Kringas', notes: 'Top tier corporate firm, strong relationship.', createdAt: '2025-06-15T10:00:00Z', updatedAt: '2026-01-20T14:00:00Z' },
  { id: 'comp-2', name: 'Blackwood Legal Group', industry: 'Litigation', firmSize: '11-50', headcount: 35, website: 'blackwoodlegal.com', status: 'Prospect', source: 'Website', owner: 'Nick Kringas', notes: 'Interested in case management module.', createdAt: '2025-09-10T08:30:00Z', updatedAt: '2026-02-01T11:00:00Z' },
  { id: 'comp-3', name: 'Meridian Law Partners', industry: 'IP Law', firmSize: '11-50', headcount: 28, website: 'meridianlaw.com', status: 'Prospect', source: 'Podcast', owner: 'Nick Kringas', notes: 'Heard about us from Legal Tech Today podcast.', createdAt: '2025-10-05T09:00:00Z', updatedAt: '2026-01-28T16:30:00Z' },
  { id: 'comp-4', name: 'Whitfield & Drake', industry: 'Family Law', firmSize: '2-10', headcount: 8, website: 'whitfielddrake.com', status: 'Customer', source: 'Beehive', owner: 'Nick Kringas', notes: 'Small firm, very engaged. Using basic plan.', createdAt: '2025-04-20T12:00:00Z', updatedAt: '2025-12-15T10:00:00Z' },
  { id: 'comp-5', name: 'Apex Litigation Corp', industry: 'Litigation', firmSize: '200+', headcount: 450, website: 'apexlit.com', status: 'Prospect', source: 'Website', owner: 'Nick Kringas', notes: 'Enterprise prospect. Decision pending Q1 budget.', createdAt: '2025-11-01T14:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'comp-6', name: 'Harbor Point Legal', industry: 'Real Estate Law', firmSize: '11-50', headcount: 22, website: 'harborpointlegal.com', status: 'Prospect', source: 'Referral', owner: 'Nick Kringas', notes: 'Referred by Sterling & Associates.', createdAt: '2025-12-01T11:00:00Z', updatedAt: '2026-02-15T08:00:00Z' },
  { id: 'comp-7', name: 'Crestview Partners', industry: 'Tax Law', firmSize: '2-10', headcount: 6, website: 'crestviewpartners.com', status: 'Former', source: 'Website', owner: 'Nick Kringas', notes: 'Churned in 2025. Budget constraints.', createdAt: '2024-08-10T10:00:00Z', updatedAt: '2025-08-10T10:00:00Z' },
  { id: 'comp-8', name: 'Orion Legal Services', industry: 'Immigration Law', firmSize: '51-200', headcount: 85, website: 'orionlegal.com', status: 'Prospect', source: 'Website', owner: 'Nick Kringas', notes: 'High volume practice, needs automation.', createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-02-20T14:00:00Z' },
  { id: 'comp-9', name: 'Pinnacle Law Firm', industry: 'Corporate Law', firmSize: '51-200', headcount: 150, website: 'pinnaclelaw.com', status: 'Customer', source: 'Referral', owner: 'Nick Kringas', notes: 'Major account. Using enterprise plan.', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2026-01-10T12:00:00Z' },
  { id: 'comp-10', name: 'Redwood & Finch', industry: 'Criminal Law', firmSize: '11-50', headcount: 18, website: 'redwoodfinch.com', status: 'Prospect', source: 'Podcast', owner: 'Nick Kringas', notes: 'Early stage, exploring options.', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-25T11:00:00Z' },
];

// ── Contacts ──
export const contacts: Contact[] = [
  { id: 'cont-1', companyId: 'comp-1', firstName: 'James', lastName: 'Sterling', email: 'j.sterling@sterlinglaw.com', phone: '+1 (212) 555-0101', title: 'Managing Partner', contactType: 'Customer', source: 'Referral', lastActivityAt: '2026-02-20T14:00:00Z', createdAt: '2025-06-15T10:00:00Z', updatedAt: '2026-02-20T14:00:00Z' },
  { id: 'cont-2', companyId: 'comp-1', firstName: 'Michelle', lastName: 'Torres', email: 'm.torres@sterlinglaw.com', phone: '+1 (212) 555-0102', title: 'Director of Operations', contactType: 'Customer', source: 'Referral', lastActivityAt: '2026-02-18T10:00:00Z', createdAt: '2025-07-01T09:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'cont-3', companyId: 'comp-2', firstName: 'David', lastName: 'Blackwood', email: 'd.blackwood@blackwoodlegal.com', phone: '+1 (312) 555-0201', title: 'Founding Partner', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-22T11:00:00Z', createdAt: '2025-09-10T08:30:00Z', updatedAt: '2026-02-22T11:00:00Z' },
  { id: 'cont-4', companyId: 'comp-2', firstName: 'Lisa', lastName: 'Park', email: 'l.park@blackwoodlegal.com', phone: '+1 (312) 555-0202', title: 'Office Manager', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-10T09:00:00Z', createdAt: '2025-09-15T10:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'cont-5', companyId: 'comp-3', firstName: 'Robert', lastName: 'Chen', email: 'r.chen@meridianlaw.com', phone: '+1 (415) 555-0301', title: 'Senior Partner', contactType: 'Lead', source: 'Podcast', lastActivityAt: '2026-02-15T16:00:00Z', createdAt: '2025-10-05T09:00:00Z', updatedAt: '2026-02-15T16:00:00Z' },
  { id: 'cont-6', companyId: 'comp-4', firstName: 'Amanda', lastName: 'Whitfield', email: 'a.whitfield@whitfielddrake.com', phone: '+1 (617) 555-0401', title: 'Partner', contactType: 'Customer', source: 'Beehive', lastActivityAt: '2026-01-28T12:00:00Z', createdAt: '2025-04-20T12:00:00Z', updatedAt: '2026-01-28T12:00:00Z' },
  { id: 'cont-7', companyId: 'comp-5', firstName: 'Michael', lastName: 'Reeves', email: 'm.reeves@apexlit.com', phone: '+1 (213) 555-0501', title: 'CTO', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-24T14:00:00Z', createdAt: '2025-11-01T14:00:00Z', updatedAt: '2026-02-24T14:00:00Z' },
  { id: 'cont-8', companyId: 'comp-5', firstName: 'Karen', lastName: 'Hughes', email: 'k.hughes@apexlit.com', phone: '+1 (213) 555-0502', title: 'VP of Legal Operations', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-20T10:00:00Z', createdAt: '2025-11-05T11:00:00Z', updatedAt: '2026-02-20T10:00:00Z' },
  { id: 'cont-9', companyId: 'comp-6', firstName: 'Thomas', lastName: 'Harbor', email: 't.harbor@harborpointlegal.com', phone: '+1 (305) 555-0601', title: 'Managing Partner', contactType: 'Lead', source: 'Referral', lastActivityAt: '2026-02-25T09:00:00Z', createdAt: '2025-12-01T11:00:00Z', updatedAt: '2026-02-25T09:00:00Z' },
  { id: 'cont-10', companyId: 'comp-7', firstName: 'Emily', lastName: 'Crest', email: 'e.crest@crestviewpartners.com', phone: '+1 (512) 555-0701', title: 'Partner', contactType: 'Other', source: 'Website', lastActivityAt: '2025-07-15T10:00:00Z', createdAt: '2024-08-10T10:00:00Z', updatedAt: '2025-07-15T10:00:00Z' },
  { id: 'cont-11', companyId: 'comp-8', firstName: 'Raj', lastName: 'Patel', email: 'r.patel@orionlegal.com', phone: '+1 (646) 555-0801', title: 'Director of Technology', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-26T11:00:00Z', createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-02-26T11:00:00Z' },
  { id: 'cont-12', companyId: 'comp-9', firstName: 'Victoria', lastName: 'Pinnacle', email: 'v.pinnacle@pinnaclelaw.com', phone: '+1 (202) 555-0901', title: 'CEO', contactType: 'Customer', source: 'Referral', lastActivityAt: '2026-02-12T15:00:00Z', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2026-02-12T15:00:00Z' },
  { id: 'cont-13', companyId: 'comp-10', firstName: 'Nathan', lastName: 'Redwood', email: 'n.redwood@redwoodfinch.com', phone: '+1 (503) 555-1001', title: 'Founding Partner', contactType: 'Lead', source: 'Podcast', lastActivityAt: '2026-02-24T10:00:00Z', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-24T10:00:00Z' },
  { id: 'cont-14', companyId: 'comp-6', firstName: 'Samantha', lastName: 'Cruz', email: 's.cruz@harborpointlegal.com', phone: '+1 (305) 555-0602', title: 'Associate', contactType: 'Lead', source: 'Referral', lastActivityAt: '2026-02-18T14:00:00Z', createdAt: '2025-12-10T10:00:00Z', updatedAt: '2026-02-18T14:00:00Z' },
  { id: 'cont-15', companyId: 'comp-8', firstName: 'Diana', lastName: 'Morales', email: 'd.morales@orionlegal.com', phone: '+1 (646) 555-0802', title: 'Managing Partner', contactType: 'Lead', source: 'Website', lastActivityAt: '2026-02-22T16:00:00Z', createdAt: '2026-01-10T11:00:00Z', updatedAt: '2026-02-22T16:00:00Z' },
];

// ── Opportunities ──
export const opportunities: Opportunity[] = [
  { id: 'opp-1', companyId: 'comp-1', primaryContactId: 'cont-1', opportunityType: 'Upsell', stageId: 4, source: 'Referral', dealValue: 48000, forecastCategory: 'Best Case', expectedCloseDate: '2026-03-15', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-02-20T14:00:00Z', stageEnteredAt: '2026-02-01T10:00:00Z' },
  { id: 'opp-2', companyId: 'comp-2', primaryContactId: 'cont-3', opportunityType: 'New', stageId: 3, source: 'Website', dealValue: 24000, forecastCategory: 'Pipeline', expectedCloseDate: '2026-04-30', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-22T11:00:00Z', stageEnteredAt: '2026-02-10T09:00:00Z' },
  { id: 'opp-3', companyId: 'comp-5', primaryContactId: 'cont-7', opportunityType: 'New', stageId: 4, source: 'Website', dealValue: 120000, forecastCategory: 'Best Case', expectedCloseDate: '2026-03-31', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2025-12-10T14:00:00Z', updatedAt: '2026-02-24T14:00:00Z', stageEnteredAt: '2026-02-05T11:00:00Z' },
  { id: 'opp-4', companyId: 'comp-6', primaryContactId: 'cont-9', opportunityType: 'New', stageId: 2, source: 'Referral', dealValue: null, forecastCategory: null, expectedCloseDate: null, contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2026-01-20T11:00:00Z', updatedAt: '2026-02-25T09:00:00Z', stageEnteredAt: '2026-02-15T09:00:00Z' },
  { id: 'opp-5', companyId: 'comp-3', primaryContactId: 'cont-5', opportunityType: 'New', stageId: 5, source: 'Podcast', dealValue: 36000, forecastCategory: 'Commit', expectedCloseDate: '2026-03-05', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2025-11-15T09:00:00Z', updatedAt: '2026-02-26T10:00:00Z', stageEnteredAt: '2026-02-20T10:00:00Z' },
  { id: 'opp-6', companyId: 'comp-8', primaryContactId: 'cont-11', opportunityType: 'New', stageId: 3, source: 'Website', dealValue: 60000, forecastCategory: 'Pipeline', expectedCloseDate: '2026-05-15', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-02-26T11:00:00Z', stageEnteredAt: '2026-02-18T10:00:00Z' },
  { id: 'opp-7', companyId: 'comp-9', primaryContactId: 'cont-12', opportunityType: 'Renewal', stageId: 6, source: 'Referral', dealValue: 72000, forecastCategory: 'Commit', expectedCloseDate: '2026-01-31', contractStartDate: '2026-02-01', contractEndDate: '2027-01-31', closedAt: '2026-01-28T16:00:00Z', closedReason: null, closedNotes: 'Annual renewal completed.', owner: 'Nick Kringas', createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-01-28T16:00:00Z', stageEnteredAt: '2026-01-28T16:00:00Z' },
  { id: 'opp-8', companyId: 'comp-7', primaryContactId: 'cont-10', opportunityType: 'Renewal', stageId: 7, source: 'Website', dealValue: 12000, forecastCategory: null, expectedCloseDate: '2025-07-31', contractStartDate: null, contractEndDate: null, closedAt: '2025-08-05T10:00:00Z', closedReason: 'Budget constraints', closedNotes: 'Firm downsizing, cannot justify spend.', owner: 'Nick Kringas', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-08-05T10:00:00Z', stageEnteredAt: '2025-08-05T10:00:00Z' },
  { id: 'opp-9', companyId: 'comp-10', primaryContactId: 'cont-13', opportunityType: 'New', stageId: 1, source: 'Podcast', dealValue: null, forecastCategory: null, expectedCloseDate: null, contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-24T10:00:00Z', stageEnteredAt: '2026-02-10T10:00:00Z' },
  { id: 'opp-10', companyId: 'comp-4', primaryContactId: 'cont-6', opportunityType: 'Upsell', stageId: 5, source: 'Beehive', dealValue: 18000, forecastCategory: 'Commit', expectedCloseDate: '2026-03-10', contractStartDate: null, contractEndDate: null, closedAt: null, closedReason: null, closedNotes: null, owner: 'Nick Kringas', createdAt: '2026-01-05T12:00:00Z', updatedAt: '2026-02-25T10:00:00Z', stageEnteredAt: '2026-02-22T10:00:00Z' },
];

// ── Activities ──
export const activities: Activity[] = [
  { id: 'act-1', activityType: 'Email', relatedObjectType: 'Contact', relatedObjectId: 'cont-3', owner: 'Nick Kringas', notes: 'Sent intro email with case studies for litigation firms.', timestamp: '2026-02-22T11:00:00Z' },
  { id: 'act-2', activityType: 'Call', relatedObjectType: 'Contact', relatedObjectId: 'cont-7', owner: 'Nick Kringas', notes: 'Discovery call — discussed enterprise needs, 450+ users. Budget approved for Q1.', timestamp: '2026-02-24T14:00:00Z' },
  { id: 'act-3', activityType: 'Meeting', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-1', owner: 'Nick Kringas', notes: 'Demo of new analytics module. James very impressed. Wants proposal by EOW.', timestamp: '2026-02-20T14:00:00Z' },
  { id: 'act-4', activityType: 'Email', relatedObjectType: 'Contact', relatedObjectId: 'cont-9', owner: 'Nick Kringas', notes: 'Follow-up on referral intro. Scheduled qualification call for next week.', timestamp: '2026-02-25T09:00:00Z' },
  { id: 'act-5', activityType: 'Meeting', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-5', owner: 'Nick Kringas', notes: 'Final negotiation. Verbal commit received. Sending contract today.', timestamp: '2026-02-26T10:00:00Z' },
  { id: 'act-6', activityType: 'Note', relatedObjectType: 'Contact', relatedObjectId: 'cont-5', owner: 'Nick Kringas', notes: 'Robert confirmed budget allocation. Moving forward with annual plan.', timestamp: '2026-02-15T16:00:00Z' },
  { id: 'act-7', activityType: 'Call', relatedObjectType: 'Contact', relatedObjectId: 'cont-11', owner: 'Nick Kringas', notes: 'Deep dive on immigration workflow automation needs. Raj is the champion internally.', timestamp: '2026-02-26T11:00:00Z' },
  { id: 'act-8', activityType: 'Email', relatedObjectType: 'Contact', relatedObjectId: 'cont-1', owner: 'Nick Kringas', notes: 'Sent proposal for analytics upsell. $48k ARR.', timestamp: '2026-02-18T10:00:00Z' },
  { id: 'act-9', activityType: 'Prospecting Touch', relatedObjectType: 'Contact', relatedObjectId: 'cont-13', owner: 'Nick Kringas', notes: 'LinkedIn message about podcast episode on criminal law tech.', timestamp: '2026-02-24T10:00:00Z' },
  { id: 'act-10', activityType: 'Meeting', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-3', owner: 'Nick Kringas', notes: 'Enterprise demo with CTO and VP Legal Ops. Showed integration capabilities.', timestamp: '2026-02-20T10:00:00Z' },
  { id: 'act-11', activityType: 'Call', relatedObjectType: 'Contact', relatedObjectId: 'cont-6', owner: 'Nick Kringas', notes: 'Discussed upsell to premium tier. Amanda excited about new features.', timestamp: '2026-01-28T12:00:00Z' },
  { id: 'act-12', activityType: 'Email', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-6', owner: 'Nick Kringas', notes: 'Sent technical requirements document. Awaiting review from Raj.', timestamp: '2026-02-22T16:00:00Z' },
  { id: 'act-13', activityType: 'Meeting', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-7', owner: 'Nick Kringas', notes: 'Renewal signing ceremony. Victoria very happy with platform.', timestamp: '2026-01-28T16:00:00Z' },
  { id: 'act-14', activityType: 'Note', relatedObjectType: 'Contact', relatedObjectId: 'cont-8', owner: 'Nick Kringas', notes: 'Karen mentioned competitor evaluation. Need to accelerate timeline.', timestamp: '2026-02-20T10:00:00Z' },
  { id: 'act-15', activityType: 'Call', relatedObjectType: 'Contact', relatedObjectId: 'cont-15', owner: 'Nick Kringas', notes: 'Intro call with Diana. She oversees tech decisions for the firm.', timestamp: '2026-02-22T16:00:00Z' },
  { id: 'act-16', activityType: 'Email', relatedObjectType: 'Contact', relatedObjectId: 'cont-12', owner: 'Nick Kringas', notes: 'Sent renewal confirmation and updated contract.', timestamp: '2026-02-12T15:00:00Z' },
  { id: 'act-17', activityType: 'Prospecting Touch', relatedObjectType: 'Contact', relatedObjectId: 'cont-4', owner: 'Nick Kringas', notes: 'Sent personalized video via Loom about litigation features.', timestamp: '2026-02-10T09:00:00Z' },
  { id: 'act-18', activityType: 'Meeting', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-10', owner: 'Nick Kringas', notes: 'Upsell proposal walkthrough. Amanda will confirm by March 10.', timestamp: '2026-02-25T10:00:00Z' },
];

// ── Stage Transitions ──
export const stageTransitions: StageTransition[] = [
  { id: 'st-1', opportunityId: 'opp-1', fromStageId: 3, toStageId: 4, transitionedBy: 'Nick Kringas', transitionedAt: '2026-02-01T10:00:00Z', notes: 'Proposal delivered, demo completed.' },
  { id: 'st-2', opportunityId: 'opp-5', fromStageId: 4, toStageId: 5, transitionedBy: 'Nick Kringas', transitionedAt: '2026-02-20T10:00:00Z', notes: 'Verbal commitment received from Robert.' },
  { id: 'st-3', opportunityId: 'opp-7', fromStageId: 5, toStageId: 6, transitionedBy: 'Nick Kringas', transitionedAt: '2026-01-28T16:00:00Z', notes: 'Contract signed. Renewal complete.' },
  { id: 'st-4', opportunityId: 'opp-8', fromStageId: 4, toStageId: 7, transitionedBy: 'Nick Kringas', transitionedAt: '2025-08-05T10:00:00Z', notes: 'Firm unable to justify budget. Marked lost.' },
  { id: 'st-5', opportunityId: 'opp-3', fromStageId: 3, toStageId: 4, transitionedBy: 'Nick Kringas', transitionedAt: '2026-02-05T11:00:00Z', notes: 'Enterprise demo delivered to CTO team.' },
  { id: 'st-6', opportunityId: 'opp-10', fromStageId: 4, toStageId: 5, transitionedBy: 'Nick Kringas', transitionedAt: '2026-02-22T10:00:00Z', notes: 'Amanda confirmed upgrade. Pending contract.' },
];

// ── Qualification Checks ──
export const qualificationChecks: QualificationCheck[] = [
  { id: 'qc-1', contactId: 'cont-3', opportunityId: 'opp-2', budget: true, authority: true, need: true, timing: false, notes: 'Timing uncertain — evaluating Q2 vs Q3 start.', qualifiedAt: null, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-02-22T11:00:00Z' },
  { id: 'qc-2', contactId: 'cont-7', opportunityId: 'opp-3', budget: true, authority: true, need: true, timing: true, notes: 'Fully qualified. Q1 budget approved.', qualifiedAt: '2026-01-15T14:00:00Z', createdAt: '2025-12-15T10:00:00Z', updatedAt: '2026-01-15T14:00:00Z' },
  { id: 'qc-3', contactId: 'cont-5', opportunityId: 'opp-5', budget: true, authority: true, need: true, timing: true, notes: 'All criteria met. Moving to contract.', qualifiedAt: '2025-12-20T10:00:00Z', createdAt: '2025-11-20T09:00:00Z', updatedAt: '2025-12-20T10:00:00Z' },
  { id: 'qc-4', contactId: 'cont-9', opportunityId: null, budget: false, authority: true, need: true, timing: false, notes: 'Budget and timing TBD. Early stage.', qualifiedAt: null, createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-02-25T09:00:00Z' },
  { id: 'qc-5', contactId: 'cont-11', opportunityId: 'opp-6', budget: true, authority: false, need: true, timing: true, notes: 'Raj is champion but not final authority. Need Diana involved.', qualifiedAt: null, createdAt: '2026-01-25T10:00:00Z', updatedAt: '2026-02-26T11:00:00Z' },
  { id: 'qc-6', contactId: 'cont-13', opportunityId: null, budget: false, authority: false, need: true, timing: false, notes: 'Very early. Interest confirmed, nothing else validated.', qualifiedAt: null, createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-24T10:00:00Z' },
];

// ── Inactivity Flags ──
export const inactivityFlags: InactivityFlag[] = [
  { id: 'flag-1', relatedObjectType: 'Contact', relatedObjectId: 'cont-10', flagType: 'No Activity 7d', flaggedAt: '2025-07-22T10:00:00Z', resolvedAt: null, resolvedBy: null },
  { id: 'flag-2', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-2', flagType: 'Stale Deal', flaggedAt: '2026-02-24T08:00:00Z', resolvedAt: null, resolvedBy: null },
  { id: 'flag-3', relatedObjectType: 'Contact', relatedObjectId: 'cont-4', flagType: 'No Activity 7d', flaggedAt: '2026-02-17T08:00:00Z', resolvedAt: null, resolvedBy: null },
  { id: 'flag-4', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-9', flagType: 'Stale Deal', flaggedAt: '2026-02-24T08:00:00Z', resolvedAt: null, resolvedBy: null },
  { id: 'flag-5', relatedObjectType: 'Contact', relatedObjectId: 'cont-6', flagType: 'No Activity 7d', flaggedAt: '2026-02-04T08:00:00Z', resolvedAt: '2026-02-05T10:00:00Z', resolvedBy: 'Nick Kringas' },
  { id: 'flag-6', relatedObjectType: 'Opportunity', relatedObjectId: 'opp-4', flagType: 'No Activity 7d', flaggedAt: '2026-02-22T08:00:00Z', resolvedAt: null, resolvedBy: null },
];

// ── Helper functions ──
export function getCompanyById(id: string) { return companies.find(c => c.id === id); }
export function getContactById(id: string) { return contacts.find(c => c.id === id); }
export function getOpportunityById(id: string) { return opportunities.find(o => o.id === id); }
export function getStageById(id: number) { return salesStages.find(s => s.id === id); }

export function getContactsByCompany(companyId: string) { return contacts.filter(c => c.companyId === companyId); }
export function getOpportunitiesByCompany(companyId: string) { return opportunities.filter(o => o.companyId === companyId); }
export function getActivitiesByObject(type: string, id: string) { return activities.filter(a => a.relatedObjectType === type && a.relatedObjectId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
export function getQualificationByContact(contactId: string) { return qualificationChecks.find(q => q.contactId === contactId); }
export function getTransitionsByOpportunity(oppId: string) { return stageTransitions.filter(t => t.opportunityId === oppId).sort((a, b) => new Date(b.transitionedAt).getTime() - new Date(a.transitionedAt).getTime()); }
export function getFlagsByObject(type: string, id: string) { return inactivityFlags.filter(f => f.relatedObjectType === type && f.relatedObjectId === id); }

export function getOpenOpportunitiesByCompany(companyId: string) {
  return opportunities.filter(o => o.companyId === companyId && !o.closedAt);
}

export function getCompanyContactActivities(companyId: string): Activity[] {
  const companyContacts = getContactsByCompany(companyId);
  const companyOpps = getOpportunitiesByCompany(companyId);
  const contactIds = new Set(companyContacts.map(c => c.id));
  const oppIds = new Set(companyOpps.map(o => o.id));
  return activities
    .filter(a =>
      (a.relatedObjectType === 'Contact' && contactIds.has(a.relatedObjectId)) ||
      (a.relatedObjectType === 'Opportunity' && oppIds.has(a.relatedObjectId))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function formatCurrency(val: number | null): string {
  if (val === null || val === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getDealAge(createdAt: string, closedAt: string | null): number {
  const end = closedAt ? new Date(closedAt) : new Date();
  return Math.floor((end.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysInStage(stageEnteredAt: string): number {
  return Math.floor((Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24));
}
