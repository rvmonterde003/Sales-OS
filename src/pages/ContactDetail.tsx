import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Mail, Phone, Building2, Linkedin } from 'lucide-react';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const contactId = Number(id);
  const { contacts, companies, opportunities, salesStages } = useData();

  const contact = contacts.find(c => c.id === contactId);
  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Contact not found.</p>
        <Link to="/contacts" className="text-violet-600 text-[13px] mt-2 inline-block">Back to People</Link>
      </div>
    );
  }

  const company = companies.find(c => c.id === contact.company_id);
  const linkedOpps = opportunities.filter(o => o.primary_contact_id === contact.id);

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center gap-3">
        <Link to="/contacts" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-3 h-3" /> People
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-900 font-medium">{contact.first_name} {contact.last_name}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[14px]">
                {contact.first_name[0]}{contact.last_name[0]}
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-gray-900">
                  {contact.first_name} {contact.last_name}
                </h1>
                <div className="text-[12px] text-gray-500 mt-0.5">{contact.title || 'No title'}</div>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                  {company && (
                    <Link to={`/companies/${contact.company_id}`} className="flex items-center gap-1 text-violet-600 hover:underline">
                      <Building2 className="w-3 h-3" /> {company.name}
                    </Link>
                  )}
                  {contact.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                  )}
                  {contact.linkedin_url && (
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
            {contact.role && (
              <div className="text-right">
                <StatusBadge status={contact.role} variant="tag" />
              </div>
            )}
          </div>
        </div>

        {/* Linked Opportunities */}
        {linkedOpps.length > 0 && (
          <div className="px-6 py-4">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Linked Opportunities</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Company</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Stage</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedOpps.map(opp => {
                    const oppCompany = companies.find(c => c.id === opp.company_id);
                    const stage = salesStages.find(s => s.id === opp.stage_id);
                    return (
                      <tr key={opp.id} className="border-b border-gray-50">
                        <td className="px-5 py-2">
                          <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium">{oppCompany?.name}</Link>
                        </td>
                        <td className="px-5 py-2"><StatusBadge status={stage?.name || ''} variant="tag" /></td>
                        <td className="px-5 py-2"><StatusBadge status={opp.opportunity_type} variant="tag" /></td>
                        <td className="px-5 py-2 text-right font-medium">
                          {opp.deal_value ? `$${opp.deal_value.toLocaleString()}` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {linkedOpps.length === 0 && (
          <div className="px-6 py-8 text-center text-[13px] text-gray-400">
            This contact is reference data for their company.
            <Link to={`/companies/${contact.company_id}`} className="text-violet-600 hover:underline ml-1">View company</Link>
          </div>
        )}
      </div>
    </div>
  );
}
