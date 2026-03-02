import { useParams, Link } from 'react-router-dom';
import {
  getContactById, getCompanyById, getActivitiesByObject,
  getQualificationByContact, opportunities,
  formatDateTime, timeAgo, formatCurrency, formatDate, getStageById,
} from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Mail, Phone, Building2, CheckCircle2, Circle } from 'lucide-react';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const contact = getContactById(id!);

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Contact not found.</p>
        <Link to="/contacts" className="text-violet-600 text-[13px] mt-2 inline-block">Back to People</Link>
      </div>
    );
  }

  const company = getCompanyById(contact.companyId);
  const contactActivities = getActivitiesByObject('Contact', contact.id);
  const qualification = getQualificationByContact(contact.id);
  const linkedOpps = opportunities.filter(o => o.primaryContactId === contact.id);

  const bantItems = qualification ? [
    { label: 'Budget', checked: qualification.budget },
    { label: 'Authority', checked: qualification.authority },
    { label: 'Need', checked: qualification.need },
    { label: 'Timing', checked: qualification.timing },
  ] : null;
  const bantScore = bantItems ? bantItems.filter(b => b.checked).length : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Back bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center gap-3">
        <Link to="/contacts" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-3 h-3" /> People
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-900 font-medium">{contact.firstName} {contact.lastName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[14px]">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[18px] font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
                  <StatusBadge status={contact.contactType} />
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">{contact.title}</div>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                  <Link to={`/companies/${contact.companyId}`} className="flex items-center gap-1 text-violet-600 hover:underline">
                    <Building2 className="w-3 h-3" /> {company?.name}
                  </Link>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-[12px] text-gray-400">
              <div>Source: {contact.source}</div>
              <div>Last active: {timeAgo(contact.lastActivityAt)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {/* Left: BANT + Opportunities */}
          <div className="col-span-2">
            {/* BANT */}
            {bantItems && (
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-semibold text-gray-900">BANT Qualification</h2>
                  {qualification?.qualifiedAt && (
                    <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Qualified {formatDate(qualification.qualifiedAt)}
                    </span>
                  )}
                </div>
                {/* Progress */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(bantScore / 4) * 100}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {bantItems.map(item => (
                    <div key={item.label} className={`flex items-center gap-2 p-2.5 rounded-md border ${item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                      {item.checked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-gray-300" />}
                      <span className={`text-[12px] font-medium ${item.checked ? 'text-emerald-700' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {qualification?.notes && (
                  <p className="mt-2 text-[12px] text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100">{qualification.notes}</p>
                )}
              </div>
            )}

            {/* Opportunities */}
            {linkedOpps.length > 0 && (
              <div>
                <div className="px-5 py-3 flex items-center gap-2">
                  <h2 className="text-[13px] font-semibold text-gray-900">Linked Opportunities</h2>
                  <span className="text-[11px] text-gray-400">{linkedOpps.length}</span>
                </div>
                <table className="attio-table w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/40">
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Stage</th>
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                      <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Close date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedOpps.map(opp => {
                      const stage = getStageById(opp.stageId);
                      return (
                        <tr key={opp.id} className="border-b border-gray-50">
                          <td className="px-5 py-2">
                            <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium">{stage?.name}</Link>
                          </td>
                          <td className="px-5 py-2"><StatusBadge status={opp.opportunityType} variant="tag" /></td>
                          <td className="px-5 py-2 text-right font-medium">{formatCurrency(opp.dealValue)}</td>
                          <td className="px-5 py-2 text-gray-500 text-[12px]">{formatDate(opp.expectedCloseDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Timeline */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {contactActivities.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">No activities</p>
              ) : (
                contactActivities.map(act => (
                  <div key={act.id} className="flex gap-2.5">
                    <StatusBadge status={act.activityType} variant="tag" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-700 leading-relaxed">{act.notes}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                        <span>{act.owner}</span><span>&middot;</span><span>{formatDateTime(act.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
