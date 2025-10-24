
import React from 'react';
import type { AppData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';

interface ReportSectionProps {
    data: AppData;
}

const ReportCard: React.FC<{ title: string; value: number; colors: string }> = ({ title, value, colors }) => (
    <div className={`p-4 rounded-lg shadow-sm border-l-4 ${colors}`}>
        <p className="text-sm font-medium uppercase">{title}</p>
        <p className="text-2xl font-extrabold mt-1">{formatCurrency(value)}</p>
    </div>
);

const ReportSection: React.FC<ReportSectionProps> = ({ data }) => {
    const totalEntradas = data.entradas.reduce((sum, entry) => sum + entry.value, 0);
    
    const totalFixas = data.fixas.reduce((sum, fixed) => {
        // Here we consider the total potential cost, not just paid months
        // This logic can be debated, but for a full report, total potential outflow seems appropriate.
        // Let's sum based on how many times it was paid instead, for a more accurate report of what happened.
        return sum + (fixed.value * fixed.paidMonths.length);
    }, 0);

    const totalCartoesPago = data.cartoes.reduce((cardSum, card) => 
        cardSum + card.purchases.reduce((purchaseSum, purchase) =>
            purchaseSum + purchase.installments.filter(i => i.isPaid).reduce((instSum, inst) => instSum + inst.value, 0)
        , 0)
    , 0);

    const totalSaidasPagas = totalFixas + totalCartoesPago;
    const saldoTotal = totalEntradas - totalSaidasPagas;

    return (
        <section className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Resumo Financeiro Total (Baseado no que foi Pago)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <ReportCard title="Total Entradas" value={totalEntradas} colors="bg-green-100 text-green-700 border-green-500" />
                <ReportCard title="Total Saídas Pagas" value={totalSaidasPagas} colors="bg-red-100 text-red-700 border-red-500" />
                <ReportCard title="Saldo Geral (Entradas - Saídas Pagas)" value={saldoTotal} colors={saldoTotal >= 0 ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-yellow-100 text-yellow-700 border-yellow-500'} />
            </div>

            <h3 className="text-xl font-bold text-gray-700 mt-8 mb-4 border-t pt-4">Detalhamento Completo</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-lg font-semibold text-green-700 mt-4 mb-2">Entradas ({data.entradas.length})</h4>
                    <div className="bg-white p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                        {data.entradas.length > 0 ? (
                            <ul className="space-y-2 text-gray-700">
                                {[...data.entradas].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                                    <li key={e.id} className="border-b border-green-200/50 pb-1 flex justify-between">
                                        <span>{formatDate(e.date)} - {e.description}</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(e.value)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 italic">Nenhuma entrada.</p>}
                    </div>
                </div>
                 <div>
                    <h4 className="text-lg font-semibold text-red-700 mt-4 mb-2">Contas Fixas ({data.fixas.length})</h4>
                    <div className="bg-white p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                        {data.fixas.length > 0 ? (
                            <ul className="space-y-2 text-gray-700">
                                {data.fixas.map(f => (
                                    <li key={f.id} className="border-b border-red-200/50 pb-1">
                                        {f.description} (Dia {f.dueDate}): <span className="font-semibold text-red-600">{formatCurrency(f.value)}</span>
                                        <span className="text-xs text-gray-500 block"> - Paga {f.paidMonths.length} vezes</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 italic">Nenhuma conta fixa.</p>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportSection;
