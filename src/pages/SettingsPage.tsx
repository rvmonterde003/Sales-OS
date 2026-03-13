import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  UserPlus, UserCheck, ClipboardCheck, Briefcase, ArrowRight,
  Trophy, XCircle, MessageSquarePlus, BookOpen, ListChecks, Building2,
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
      icon: UserPlus,
      color: 'bg-cyan-100 text-cyan-700',
      title: '1. Create a Lead',
      description: 'Go to the Leads tab and click "New Lead". Enter the contact\'s first name, last name, and optionally their email, phone, LinkedIn, and lead source. The lead starts at MWL stage — no firm name is needed yet.',
    },
    {
      icon: MessageSquarePlus,
      color: 'bg-blue-100 text-blue-700',
      title: '2. Log Activities',
      description: 'Log calls, emails, meetings, and notes from any lead, law firm, or deal page. Activities are tracked against the company and optionally linked to a specific opportunity or contact. Attach files or links as needed.',
    },
    {
      icon: ArrowRight,
      color: 'bg-indigo-100 text-indigo-700',
      title: '3. Move to SWL',
      description: 'When a lead shows interest, open the lead detail and click "Move to SWL". This unlocks the firm information form (Firm Name, Industry, Firm Size, Website) and the BANT qualification fields.',
    },
    {
      icon: Building2,
      color: 'bg-purple-100 text-purple-700',
      title: '4. Add Firm Information',
      description: 'At SWL stage, fill in the Firm Name and details (Industry, Firm Size, Website). Click "Save Firm Info" to update. This is where the contact gets associated with an actual law firm.',
    },
    {
      icon: ClipboardCheck,
      color: 'bg-emerald-100 text-emerald-700',
      title: '5. Qualify the Lead',
      description: 'Fill in all 4 BANT qualification fields (Pain & Value, Timeline, Budget/Pricing Fit, Person in Position). Once all are filled, click "Save Qualification" to auto-qualify. You can save partial progress as a draft. If the lead is not a fit, click "Unqualify" with a reason.',
    },
    {
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-700',
      title: '6. Create an Opportunity',
      description: 'Once qualified, the "Create Opportunity" modal opens automatically. Set the service description, deal value, type (New/Upsell/Renewal/Pilot), source, expected close date, and primary contact. Once saved, the lead moves to the Law Firms tab and enters the pipeline at Discovery.',
    },
    {
      icon: UserCheck,
      color: 'bg-green-100 text-green-700',
      title: '7. Add More Contacts',
      description: 'Inside a law firm\'s detail page, click "Add Contact" to add more people at the firm. Specify their name, title, role (Decision Maker, Champion, etc.), email, phone, and LinkedIn.',
    },
    {
      icon: ArrowRight,
      color: 'bg-violet-100 text-violet-700',
      title: '8. Advance Through the Pipeline',
      description: 'Deals move through: Discovery → Demonstration/Audit → Evaluation → Proposal → Negotiation → Contract → Verbal. To advance, log an activity first, then drag the card one stage forward in the Deals kanban (an activity log is required). During Negotiation, you can edit the deal value.',
    },
    {
      icon: ArrowRight,
      color: 'bg-amber-100 text-amber-700',
      title: '9. Push Back a Stage',
      description: 'If a deal needs to go back, click "Push Back" and select a reason. This moves the deal one stage back and auto-logs the pushback with the reason.',
    },
    {
      icon: Trophy,
      color: 'bg-emerald-100 text-emerald-700',
      title: '10. Mark as Won',
      description: 'When the deal reaches Verbal stage, click "Mark Won" to close it. The company status changes to Customer, contract dates are set, and the deal appears in the Revenue Timeline.',
    },
    {
      icon: XCircle,
      color: 'bg-red-100 text-red-700',
      title: '11. Mark as Lost',
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
          <li>- New leads start as contacts in the <strong>Leads</strong> tab. Firm name and details are added during SWL qualification.</li>
          <li>- Once a lead is qualified and has an opportunity, it automatically moves to the <strong>Law Firms</strong> tab.</li>
          <li>- Use the <strong>Deals</strong> tab for a kanban view of your pipeline. Drag cards one stage at a time (activity log required).</li>
          <li>- <strong>Risk Flags</strong> alert you to stale deals and inactive companies. Resolve them by logging activity.</li>
          <li>- <strong>Revenue Timeline</strong> shows won deals over time and team performance breakdown.</li>
          <li>- <strong>View Settings</strong> on Law Firms, Contacts, and Deals let you sort by name, date, or value.</li>
          <li>- Add more contacts to a firm from the law firm detail page using "Add Contact".</li>
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
