import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  companies as initCompanies,
  contacts as initContacts,
  opportunities as initOpportunities,
  activities as initActivities,
  stageTransitions as initTransitions,
  qualificationChecks as initQualChecks,
  inactivityFlags as initFlags,
  salesStages,
  type Company,
  type Contact,
  type Opportunity,
  type Activity,
  type StageTransition,
  type QualificationCheck,
  type InactivityFlag,
} from '../data/mockData';

interface DataContextType {
  companies: Company[];
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
  stageTransitions: StageTransition[];
  qualificationChecks: QualificationCheck[];
  inactivityFlags: InactivityFlag[];
  addCompany: (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addContact: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addActivity: (a: Omit<Activity, 'id'>) => void;
  advanceStage: (oppId: string, notes: string) => boolean;
  moveToStage: (oppId: string, targetStageId: number, notes: string) => boolean;
  closeOpportunity: (oppId: string, won: boolean, reason?: string, notes?: string) => void;
  resolveFlag: (flagId: string) => void;
  toggleQualification: (contactId: string, field: 'budget' | 'authority' | 'need' | 'timing') => void;
  updateOpportunity: (oppId: string, fields: Partial<Opportunity>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

let nextId = 100;
function genId(prefix: string) {
  return `${prefix}-${nextId++}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([...initCompanies]);
  const [contacts, setContacts] = useState<Contact[]>([...initContacts]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([...initOpportunities]);
  const [activities, setActivities] = useState<Activity[]>([...initActivities]);
  const [stageTransitions, setTransitions] = useState<StageTransition[]>([...initTransitions]);
  const [qualificationChecks, setQualChecks] = useState<QualificationCheck[]>([...initQualChecks]);
  const [inactivityFlags, setFlags] = useState<InactivityFlag[]>([...initFlags]);

  const now = () => new Date().toISOString();

  const addCompany = useCallback((c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    setCompanies(prev => [...prev, { ...c, id: genId('comp'), createdAt: ts, updatedAt: ts }]);
  }, []);

  const addContact = useCallback((c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = now();
    setContacts(prev => [...prev, { ...c, id: genId('cont'), createdAt: ts, updatedAt: ts }]);
  }, []);

  const addActivity = useCallback((a: Omit<Activity, 'id'>) => {
    setActivities(prev => [...prev, { ...a, id: genId('act') }]);
    if (a.relatedObjectType === 'Contact') {
      setContacts(prev =>
        prev.map(c =>
          c.id === a.relatedObjectId
            ? { ...c, lastActivityAt: a.timestamp, updatedAt: now() }
            : c,
        ),
      );
    }
  }, []);

  const advanceStage = useCallback(
    (oppId: string, notes: string): boolean => {
      let advanced = false;
      setOpportunities(prev =>
        prev.map(opp => {
          if (opp.id !== oppId) return opp;
          const cur = salesStages.find(s => s.id === opp.stageId);
          if (!cur || cur.isTerminal) return opp;
          const next = salesStages.find(
            s => s.stageOrder === cur.stageOrder + 1 && !s.isTerminal,
          );
          if (!next) return opp;
          const ts = now();
          setTransitions(p => [
            ...p,
            {
              id: genId('st'),
              opportunityId: oppId,
              fromStageId: opp.stageId,
              toStageId: next.id,
              transitionedBy: 'Nick Kringas',
              transitionedAt: ts,
              notes,
            },
          ]);
          advanced = true;
          return { ...opp, stageId: next.id, stageEnteredAt: ts, updatedAt: ts };
        }),
      );
      return advanced;
    },
    [],
  );

  const moveToStage = useCallback(
    (oppId: string, targetStageId: number, notes: string): boolean => {
      const target = salesStages.find(s => s.id === targetStageId);
      if (!target || target.isTerminal) return false;
      let moved = false;
      setOpportunities(prev =>
        prev.map(opp => {
          if (opp.id !== oppId) return opp;
          if (opp.stageId === targetStageId) return opp;
          const ts = now();
          setTransitions(p => [
            ...p,
            {
              id: genId('st'),
              opportunityId: oppId,
              fromStageId: opp.stageId,
              toStageId: targetStageId,
              transitionedBy: 'Nick Kringas',
              transitionedAt: ts,
              notes,
            },
          ]);
          moved = true;
          return { ...opp, stageId: targetStageId, stageEnteredAt: ts, updatedAt: ts };
        }),
      );
      return moved;
    },
    [],
  );

  const closeOpportunity = useCallback(
    (oppId: string, won: boolean, reason?: string, notes?: string) => {
      const target = salesStages.find(
        s => s.name === (won ? 'Closed Won' : 'Closed Lost'),
      );
      if (!target) return;
      setOpportunities(prev =>
        prev.map(opp => {
          if (opp.id !== oppId) return opp;
          const ts = now();
          setTransitions(p => [
            ...p,
            {
              id: genId('st'),
              opportunityId: oppId,
              fromStageId: opp.stageId,
              toStageId: target.id,
              transitionedBy: 'Nick Kringas',
              transitionedAt: ts,
              notes:
                notes || (won ? 'Deal closed won.' : `Deal closed lost: ${reason}`),
            },
          ]);
          return {
            ...opp,
            stageId: target.id,
            stageEnteredAt: ts,
            updatedAt: ts,
            closedAt: ts,
            closedReason: won ? null : reason || null,
            closedNotes: notes || null,
            contractStartDate: won ? ts.split('T')[0] : null,
            contractEndDate: won
              ? new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
              : null,
          };
        }),
      );
    },
    [],
  );

  const resolveFlag = useCallback((flagId: string) => {
    setFlags(prev =>
      prev.map(f =>
        f.id === flagId
          ? { ...f, resolvedAt: now(), resolvedBy: 'Nick Kringas' }
          : f,
      ),
    );
  }, []);

  const toggleQualification = useCallback(
    (contactId: string, field: 'budget' | 'authority' | 'need' | 'timing') => {
      setQualChecks(prev => {
        const existing = prev.find(q => q.contactId === contactId);
        if (existing) {
          return prev.map(q =>
            q.contactId === contactId
              ? { ...q, [field]: !q[field], checkedAt: now() }
              : q,
          );
        }
        return [
          ...prev,
          {
            id: genId('qc'),
            contactId,
            budget: field === 'budget',
            authority: field === 'authority',
            need: field === 'need',
            timing: field === 'timing',
            checkedAt: now(),
          },
        ];
      });
    },
    [],
  );

  const updateOpportunity = useCallback(
    (oppId: string, fields: Partial<Opportunity>) => {
      setOpportunities(prev =>
        prev.map(o => (o.id === oppId ? { ...o, ...fields, updatedAt: now() } : o)),
      );
    },
    [],
  );

  return (
    <DataContext.Provider
      value={{
        companies,
        contacts,
        opportunities,
        activities,
        stageTransitions,
        qualificationChecks,
        inactivityFlags,
        addCompany,
        addContact,
        addActivity,
        advanceStage,
        moveToStage,
        closeOpportunity,
        resolveFlag,
        toggleQualification,
        updateOpportunity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
