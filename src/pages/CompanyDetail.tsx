import { useParams, Link } from 'react-router-dom';
import {
  getCompanyById, getContactsByCompany, getOpportunitiesByCompany,
  getCompanyContactActivities, getStageById, formatCurrency, formatDate,
  formatDateTime, timeAgo, getDealAge,
} from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const company = getCompanyById(id!);

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Company not found.</p>
        <Link to="/companies" className="text-violet-600 text-[13px] mt-2 inline-block">Back to Companies</Link>
      </div>
    );
  }

  const companyContacts = getContactsByCompany(company.id);
  const companyOpps = getOpportunitiesByCompany(company.id);
  const companyActivities = getCompanyContactActivities(company.id);

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Back bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center gap-3">
        <Link to="/companies" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-3 h-3" /> Companies
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-900 font-medium">{company.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[14px]">
                  {company.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] font-bold text-gray-900">{company.name}</h1>
                    <StatusBadge status={company.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-500">
                    <StatusBadge status={company.industry} variant="tag" />
                    <StatusBadge status={company.firmSize} variant="tag" />
                    <span className="flex items-center gap-1 text-violet-600">
                      <Globe className="w-3 h-3" />{company.website}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-[12px] text-gray-400">
              <div>Owner: <span className="text-gray-700 font-medium">{company.owner}</span></div>
              <div>Source: {company.source}</div>
            </div>
          </div>
          {company.notes && (
            <p className="mt-3 text-[12px] text-gray-600 bg-gray-50 rounded-md p-2.5 border border-gray-100">{company.notes}</p>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 min-h-0">
          {/* Left: Contacts */}
          <div className="col-span-2">
            {/* Contacts */}
            <div className="border-b border-gray-100">
              <div className="px-5 py-3 flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-gray-900">Contacts</h2>
                <span className="text-[11px] text-gray-400">{companyContacts.length}</span>
              </div>
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Name</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Title</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Email</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Last activity</th>
                  </tr>
                </thead>
                <tbody>
                  {companyContacts.map(contact => (
                    <tr key={contact.id} className="border-b border-gray-50">
                      <td className="px-5 py-2">
                        <Link to={`/contacts/${contact.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </td>
                      <td className="px-5 py-2 text-gray-500 text-[12px]">{contact.title}</td>
                      <td className="px-5 py-2"><StatusBadge status={contact.contactType} variant="tag" /></td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">{contact.email}</td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">{timeAgo(contact.lastActivityAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Opportunities */}
            <div>
              <div className="px-5 py-3 flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-gray-900">Opportunities</h2>
                <span className="text-[11px] text-gray-400">{companyOpps.length}</span>
              </div>
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Stage</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Forecast</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Close date</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {companyOpps.map(opp => {
                    const stage = getStageById(opp.stageId);
                    return (
                      <tr key={opp.id} className="border-b border-gray-50">
                        <td className="px-5 py-2">
                          <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                            {stage?.name}
                          </Link>
                        </td>
                        <td className="px-5 py-2"><StatusBadge status={opp.opportunityType} variant="tag" /></td>
                        <td className="px-5 py-2 text-right font-medium text-gray-900">{formatCurrency(opp.dealValue)}</td>
                        <td className="px-5 py-2">{opp.forecastCategory ? <StatusBadge status={opp.forecastCategory} variant="tag" /> : <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-2 text-gray-500 text-[12px]">{formatDate(opp.expectedCloseDate)}</td>
                        <td className="px-5 py-2 text-right text-gray-400 text-[12px]">{getDealAge(opp.createdAt, opp.closedAt)}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Activity Timeline */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {companyActivities.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">No activities</p>
              ) : (
                companyActivities.map(act => (
                  <div key={act.id} className="flex gap-2.5">
                    <StatusBadge status={act.activityType} variant="tag" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-700 leading-relaxed">{act.notes}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                        <span>{act.owner}</span>
                        <span>&middot;</span>
                        <span>{formatDateTime(act.timestamp)}</span>
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
