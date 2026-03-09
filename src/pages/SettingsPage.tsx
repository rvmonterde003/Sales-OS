import { useData } from '../context/DataContext';

export default function SettingsPage() {
  const { salesStages, lossReasons } = useData();

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <span className="text-[13px] font-medium text-gray-900">Definitions</span>
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
      </div>
    </div>
  );
}
