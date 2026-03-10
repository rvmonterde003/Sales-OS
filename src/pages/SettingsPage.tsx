import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Building2, UserCheck, ClipboardCheck, Briefcase, ArrowRight,
  Trophy, XCircle, MessageSquarePlus, BookOpen, ListChecks,
} from 'lucide-react';

type Tab = 'guide' | 'definitions';

export default function SettingsPage() {
  const { salesStages, lossReasons } = useData();
  const [tab, setTab] = useState<Tab>('guide');

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <button onClick={() => setTab('guide')}
          className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
            tab === 'guide' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-50'
          }`}>
          <BookOpen className="w-3.5 h-3.5" /> How To Use
        </button>
        <button onClick={() => setTab('definitions')}
          className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
            tab === 'definitions' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-50'
          }`}>
          <ListChecks className="w-3.5 h-3.5" /> Definitions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-[900px]">
        {tab === 'guide' ? <GuideTab /> : <DefinitionsTab salesStages={salesStages} lossReasons={lossReasons} />}
      </div>
    </div>
  );
}

function GuideTab() {
  const steps = [
    {
      icon: Building2,
      color: 'bg-purple-100 text-purple-700',
      title: '1. Create a Company',
      description: 'Go to Companies and click "New Law Firm". Fill in the firm name, industry, size, source, and website. The company starts as a Prospect with MQL lead status.',
    },
    {
      icon: MessageSquarePlus,
      color: 'bg-blue-100 text-blue-700',
      title: '2. Log Activities',
      description: 'Log calls, emails, meetings, and notes from any company, contact, or deal page. Activities are tracked against the company and optionally linked to a specific opportunity or contact. Attach files or links as needed.',
    },
    {
      icon: UserCheck,
      color: 'bg-green-100 text-green-700',
      title: '3. Add Contacts',
      description: 'Inside a company, click "Add Contact" to add people at the firm. Specify their name, title, role (Decision Maker, Operations, etc.), email, phone, and LinkedIn.',
    },
    {
      icon: ArrowRight,
      color: 'bg-indigo-100 text-indigo-700',
      title: '4. Move to SQL',
      description: 'When a lead shows interest, click "Move to SQL" on the company page. This unlocks the qualification form where you document the prospect\'s pain, timeline, budget, and decision maker.',
    },
    {
      icon: ClipboardCheck,
      color: 'bg-emerald-100 text-emerald-700',
      title: '5. Qualify the Company',
      description: 'Fill in all 4 qualification fields (Pain & Value, Timeline, Budget/Pricing Fit, Person in Position). Once all are filled, click "Save Qualification" to auto-qualify the company. You can also save partial progress as a draft. If the lead is not a fit, click "Unqualify" with a reason.',
    },
    {
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-700',
      title: '6. Create an Opportunity',
      description: 'Once qualified, click "Create Opportunity" on the company page. Set the service description, deal value, type (New Business / Upsell / Renewal), source, expected close date, and primary contact. The deal starts at the Discovery stage.',
    },
    {
      icon: ArrowRight,
      color: 'bg-violet-100 text-violet-700',
      title: '7. Advance Through the Pipeline',
      description: 'Deals move through: Discovery → Demonstration/Audit → Evaluation → Proposal → Negotiation → Contract → Verbal. To advance, log an activity first then click "Advance Stage". You can also drag cards in the Deals kanban board (one stage at a time). During Negotiation, you can edit the deal value which gets logged automatically.',
    },
    {
      icon: ArrowRight,
      color: 'bg-amber-100 text-amber-700',
      title: '8. Push Back a Stage',
      description: 'If a deal needs to go back, click "Push Back" and select a reason. This moves the deal one stage back and auto-logs the pushback with the reason.',
    },
    {
      icon: Trophy,
      color: 'bg-emerald-100 text-emerald-700',
      title: '9. Mark as Won',
      description: 'When the deal reaches Verbal stage, click "Mark Won" to close it. The company status changes to Customer, contract dates are set, and the deal appears in the Revenue Timeline.',
    },
    {
      icon: XCircle,
      color: 'bg-red-100 text-red-700',
      title: '10. Mark as Lost',
      description: 'If a deal falls through at any stage, click "Mark Lost" and select a standardized loss reason with optional notes. Lost deals can be reopened later if the situation changes.',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[16px] font-bold text-gray-900 mb-1">Getting Started with Sales OS</h1>
        <p className="text-[13px] text-gray-500">Follow these steps to manage your sales pipeline from first touch to closed deal.</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
            <div className={`w-9 h-9 rounded-lg ${step.color} flex items-center justify-center shrink-0`}>
              <step.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900 mb-0.5">{step.title}</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h3 className="text-[13px] font-semibold text-violet-900 mb-2">Tips</h3>
        <ul className="space-y-1.5 text-[12px] text-violet-800">
          <li>- Use the <strong>Deals</strong> tab for a kanban view of your entire pipeline. The Leads column shows MQL/SQL companies that need qualifying first.</li>
          <li>- <strong>Risk Flags</strong> alert you to stale deals and inactive companies. Resolve them by logging activity.</li>
          <li>- <strong>Revenue Timeline</strong> shows won deals over time and team performance breakdown.</li>
          <li>- <strong>View Settings</strong> on Companies, Contacts, and Deals let you sort by name, date, or value.</li>
          <li>- Admins can manage team members, change roles, and send invitations from the <strong>Profile</strong> page.</li>
        </ul>
      </div>
    </div>
  );
}

function DefinitionsTab({ salesStages, lossReasons }: { salesStages: any[]; lossReasons: any[] }) {
  return (
    <div>
      {/* Stage Definitions */}
      <div className="mb-6">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Sales Stage Definitions</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="attio-table w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-200">
                <th className="text-left font-medium text-gray-500 px-4 py-2 w-6">#</th>
                <th className="text-left font-medium text-gray-500 px-4 py-2">Stage</th>
                <th className="text-left font-medium text-gray-500 px-4 py-2">Definition</th>
                <th className="text-left font-medium text-gray-500 px-4 py-2">Entry criteria</th>
                <th className="text-left font-medium text-gray-500 px-4 py-2">Exit criteria</th>
                <th className="text-left font-medium text-gray-500 px-4 py-2">Required fields</th>
              </tr>
            </thead>
            <tbody>
              {salesStages.map(stage => (
                <tr key={stage.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-400 font-mono text-[12px]">{stage.stage_order}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{stage.name}</td>
                  <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.definition || '--'}</td>
                  <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.entry_criteria || '--'}</td>
                  <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.exit_criteria || '--'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(stage.required_fields || []).map((f: string) => (
                        <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {salesStages.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-gray-400">No stages configured. Run the schema SQL to seed default stages.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BANT + Loss Reasons */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Qualification Criteria</h2>
          <div className="space-y-2">
            {[
              { label: 'Pain & Value', desc: 'Has the prospect articulated their pain and can they see the value of the solution?' },
              { label: 'Timeline', desc: 'Is there a defined timeline, trigger event, or urgency?' },
              { label: 'Budget/Pricing', desc: 'Is there budget availability and does pricing fit their expectations?' },
              { label: 'Person', desc: 'Is there a person in position with authority to make the decision?' },
            ].map(item => (
              <div key={item.label} className="flex gap-3 p-2.5 bg-gray-50 rounded-md">
                <span className="text-[12px] font-semibold text-gray-900 w-24 shrink-0">{item.label}</span>
                <span className="text-[12px] text-gray-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Standardized Loss Reasons</h2>
          <div className="space-y-1.5">
            {lossReasons.map((reason, i) => (
              <div key={reason.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <span className="text-[11px] text-gray-400 font-mono w-4">{i + 1}.</span>
                <span className="text-[12px] text-gray-700">{reason.reason}</span>
              </div>
            ))}
            {lossReasons.length === 0 && (
              <p className="text-[12px] text-gray-400 text-center py-4">No loss reasons configured. Run the schema SQL to seed defaults.</p>
            )}
          </div>
        </div>
      </div>

      {/* Role System */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Role System</h2>
        <div className="space-y-2">
          {[
            { role: 'Exec', desc: 'Super admin. Only one. Cannot be demoted or deleted. Full access to everything including user management.' },
            { role: 'Admin', desc: 'Can manage reps (change role, remove). Cannot change other admins or exec. Full data visibility.' },
            { role: 'Rep', desc: 'Can only see and edit their own data (companies they own).' },
          ].map(item => (
            <div key={item.role} className="flex gap-3 p-2.5 bg-gray-50 rounded-md">
              <span className="text-[12px] font-semibold text-gray-900 w-14 shrink-0">{item.role}</span>
              <span className="text-[12px] text-gray-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
