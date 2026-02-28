import React from 'react';
import { Button } from './Button';

interface Lead {
  id: number;
  date: string;
  result: string;
  phone: string;
}

const MOCK_LEADS: Lead[] = [
  { id: 1, date: '2023-10-25 14:30', result: 'Graphic Design', phone: '+998 90 123 45 67' },
  { id: 2, date: '2023-10-25 15:15', result: 'Foundation', phone: '+998 99 987 65 43' },
  { id: 3, date: '2023-10-26 09:00', result: 'SMM', phone: '+998 33 111 22 33' },
];

export const AdminView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const downloadCSV = () => {
    const headers = "ID,Date,Result,Phone\n";
    const rows = MOCK_LEADS.map(l => `${l.id},${l.date},${l.result},${l.phone}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <Button variant="ghost" onClick={onLogout}>Chiqish</Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-600">Oxirgi test natijalari (Leads)</h2>
          <Button variant="outline" onClick={downloadCSV}>
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Natija</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{lead.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{lead.result}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};