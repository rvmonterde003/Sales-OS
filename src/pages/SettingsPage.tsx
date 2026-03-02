import { salesStages } from '../data/mockData';
import { Settings, Info } from 'lucide-react';

export default function SettingsPage() {
  const lossReasons = [
    'Budget constraints', 'Chose competitor', 'No decision / stalled',
    'Timing not right', 'Requirements not met', 'Internal restructuring',
    'Champion left company', 'Other',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Toolbar */}
      <div className="flex items-center px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <span className="text-[13px] font-medium text-gray-900">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-[1100px]">
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
                  <th className="text-center font-medium text-gray-500 px-4 py-2">Terminal</th>
                </tr>
              </thead>
              <tbody>
                {salesStages.map(stage => (
                  <tr key={stage.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-400 font-mono text-[12px]">{stage.stageOrder}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{stage.name}</td>
                    <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.definition}</td>
                    <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.entryCriteria || '—'}</td>
                    <td className="px-4 py-2 text-gray-500 text-[12px]">{stage.exitCriteria || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {stage.requiredFields.map(f => (
                          <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {stage.isTerminal ? (
                        <span className="text-[11px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Yes</span>
                      ) : (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BANT + Loss Reasons */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">BANT Qualification Criteria</h2>
            <div className="space-y-2">
              {[
                { label: 'Budget', desc: 'Has the prospect allocated or identified budget?' },
                { label: 'Authority', desc: 'Is the contact a decision-maker or has access to one?' },
                { label: 'Need', desc: 'Does the prospect have a clear business need?' },
                { label: 'Timing', desc: 'Is there a defined timeline or trigger event?' },
              ].map(item => (
                <div key={item.label} className="flex gap-3 p-2.5 bg-gray-50 rounded-md">
                  <span className="text-[12px] font-semibold text-gray-900 w-16 shrink-0">{item.label}</span>
                  <span className="text-[12px] text-gray-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Standardized Loss Reasons</h2>
            <div className="space-y-1.5">
              {lossReasons.map((reason, i) => (
                <div key={reason} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-[11px] text-gray-400 font-mono w-4">{i + 1}.</span>
                  <span className="text-[12px] text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ICP */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Ideal Customer Profile (ICP)</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Industry', value: 'Law Firms (all practice areas)' },
              { label: 'Firm Size', value: '11-200 attorneys' },
              { label: 'Decision Maker', value: 'Managing Partner, Director of Operations, CTO' },
              { label: 'Geography', value: 'United States (primary)' },
              { label: 'Pain Points', value: 'Manual workflows, poor case tracking, no analytics' },
              { label: 'Budget Range', value: '$18,000 - $120,000 ARR' },
              { label: 'Tech Readiness', value: 'Currently using basic tools' },
              { label: 'Buying Trigger', value: 'Growth, new partner, compliance' },
            ].map(item => (
              <div key={item.label} className="p-2.5 bg-gray-50 rounded-md">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{item.label}</div>
                <div className="text-[12px] text-gray-700">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
