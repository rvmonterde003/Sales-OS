import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getStageById, formatCurrency, formatDate, formatDateTime, timeAgo, getDealAge, getDaysInStage,
} from '../data/mockData';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import StageProgressBar from '../components/StageProgressBar';
import ActivityLogModal from '../components/ActivityLogModal';
import AddContactModal from '../components/AddContactModal';
import { ArrowLeft, Globe, Plus, MessageSquarePlus } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { companies, contacts, opportunities, activities } = useData();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const company = companies.find(c => c.id === id);

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Company not found.</p>
        <Link to="/companies" className="text-violet-600 text-[13px] mt-2 inline-block">
          Back to Companies
        </Link>
      </div>
    );
  }

  const companyContacts = contacts.filter(c => c.companyId === company.id);
  const companyOpps = opportunities.filter(o => o.companyId === company.id);
  const openOpps = companyOpps
    .filter(o => !o.closedAt)
    .sort((a, b) => {
      if (!a.expectedCloseDate) return 1;
      if (!b.expectedCloseDate) return -1;
      return new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
    });

  const contactIds = companyContacts.map(c => c.id);
  const oppIds = companyOpps.map(o => o.id);
  const companyActivities = activities
    .filter(
      a =>
        (a.relatedObjectType === 'Contact' && contactIds.includes(a.relatedObjectId)) ||
        (a.relatedObjectType === 'Opportunity' && oppIds.includes(a.relatedObjectId)),
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Back bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/companies" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> Companies
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{company.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50"
          >
            <Plus className="w-3 h-3" /> Add Contact
          </button>
          <button
            onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" /> Log Activity
          </button>
        </div>
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
                      <Globe className="w-3 h-3" />
                      {company.website}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-[12px] text-gray-400">
              <div>
                Owner: <span className="text-gray-700 font-medium">{company.owner}</span>
              </div>
              <div>Source: {company.source}</div>
            </div>
          </div>
          {company.notes && (
            <p className="mt-3 text-[12px] text-gray-600 bg-gray-50 rounded-md p-2.5 border border-gray-100">
              {company.notes}
            </p>
          )}
        </div>

        {/* Pipeline Status (spec2 section 2) */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Pipeline Status</h2>
          {openOpps.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
              <p className="text-[13px] text-gray-400">No active opportunities</p>
              <p className="text-[11px] text-gray-300 mt-1">Create an opportunity to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openOpps.map(opp => {
                const stage = getStageById(opp.stageId);
                const contact = contacts.find(c => c.id === opp.primaryContactId);
                return (
                  <Link
                    key={opp.id}
                    to={`/opportunities/${opp.id}`}
                    className="block border border-gray-200 rounded-lg p-3 hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-gray-900">
                          {stage?.name}
                        </span>
                        <StatusBadge status={opp.opportunityType} variant="tag" />
                        {opp.forecastCategory && (
                          <StatusBadge status={opp.forecastCategory} variant="tag" />
                        )}
                      </div>
                      <div className="text-right">
                        {opp.dealValue && (
                          <span className="text-[14px] font-bold text-gray-900">
                            {formatCurrency(opp.dealValue)}
                          </span>
                        )}
                      </div>
                    </div>
                    <StageProgressBar currentStageId={opp.stageId} compact />
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                      <span>
                        {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
                      </span>
                      <div className="flex items-center gap-3">
                        {opp.expectedCloseDate && (
                          <span>Close: {formatDate(opp.expectedCloseDate)}</span>
                        )}
                        <span>{getDealAge(opp.createdAt, opp.closedAt)}d old</span>
                        <span className={getDaysInStage(opp.stageEnteredAt) > 14 ? 'text-red-500' : ''}>
                          {getDaysInStage(opp.stageEnteredAt)}d in stage
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 min-h-0">
          {/* Left: Contacts + Opportunities */}
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
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="text-gray-900 hover:text-violet-600 font-medium"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </td>
                      <td className="px-5 py-2 text-gray-500 text-[12px]">{contact.title}</td>
                      <td className="px-5 py-2">
                        <StatusBadge status={contact.contactType} variant="tag" />
                      </td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">{contact.email}</td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">
                        {timeAgo(contact.lastActivityAt)}
                      </td>
                    </tr>
                  ))}
                  {companyContacts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-[12px] text-gray-400">
                        No contacts yet
                      </td>
                    </tr>
                  )}
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
                          <Link
                            to={`/opportunities/${opp.id}`}
                            className="text-gray-900 hover:text-violet-600 font-medium"
                          >
                            {stage?.name}
                          </Link>
                        </td>
                        <td className="px-5 py-2">
                          <StatusBadge status={opp.opportunityType} variant="tag" />
                        </td>
                        <td className="px-5 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(opp.dealValue)}
                        </td>
                        <td className="px-5 py-2">
                          {opp.forecastCategory ? (
                            <StatusBadge status={opp.forecastCategory} variant="tag" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-2 text-gray-500 text-[12px]">
                          {formatDate(opp.expectedCloseDate)}
                        </td>
                        <td className="px-5 py-2 text-right text-gray-400 text-[12px]">
                          {getDealAge(opp.createdAt, opp.closedAt)}d
                        </td>
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

      <ActivityLogModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        defaultRelatedType={companyContacts.length > 0 ? 'Contact' : undefined}
        defaultRelatedId={companyContacts.length > 0 ? companyContacts[0].id : undefined}
      />
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        defaultCompanyId={company.id}
      />
    </div>
  );
}
