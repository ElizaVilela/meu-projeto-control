
import React, { useState } from 'react';
import type { FixedCost } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCurrentMonthKey } from '../utils/dateUtils';

interface FixedCostsSectionProps {
    data: FixedCost[];
    onAdd: (cost: Omit<FixedCost, 'id' | 'paidMonths'>) => void;
    onDelete: (id: string) => void;
    onTogglePaid: (id: string) => void;
}

const FixedCostsSection: React.FC<FixedCostsSectionProps> = ({ data, onAdd, onDelete, onTogglePaid }) => {
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !value || !dueDate) {
            alert('Preencha todos os campos.');
            return;
        }
        onAdd({ description, value: parseFloat(value), dueDate: parseInt(dueDate) });
        setDescription('');
        setValue('');
        setDueDate('');
    };

    const currentMonthKey = getCurrentMonthKey();
    const today = new Date().getDate();

    return (
        <section className="space-y-6">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex flex-col flex-1 min-w-[200px]"><label htmlFor="fixa-descricao" className="text-sm font-medium text-gray-600">Descrição</label><input type="text" id="fixa-descricao" value={description} onChange={e => setDescription(e.target.value)} placeholder="Aluguel, Internet, etc." className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="flex flex-col flex-1 min-w-[150px]"><label htmlFor="fixa-valor" className="text-sm font-medium text-gray-600">Valor (R$)</label><input type="number" id="fixa-valor" value={value} onChange={e => setValue(e.target.value)} step="0.01" placeholder="0.00" className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="flex flex-col flex-1 min-w-[100px]"><label htmlFor="fixa-vencimento" className="text-sm font-medium text-gray-600">Dia do Mês</label><input type="number" id="fixa-vencimento" value={dueDate} onChange={e => setDueDate(e.target.value)} min="1" max="31" className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 h-[42px] mt-2 sm:mt-0">Adicionar Conta Fixa</button>
            </form>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Contas Fixas</h3>
            <div className="overflow-x-auto rounded-lg shadow-md border"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100"><tr><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Descrição</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Valor</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Dia Venc.</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Pago Este Mês</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Ações</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhuma conta fixa registrada.</td></tr>
                    ) : (
                        data.map(f => {
                            const isPaid = f.paidMonths.some(p => p.monthKey === currentMonthKey);
                            const statusColor = isPaid ? 'bg-green-100 text-green-700' : (f.dueDate <= today ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700');
                            const statusText = isPaid ? 'Pago' : (f.dueDate <= today ? 'Vencido' : 'Pendente');
                            return (
                                <tr key={f.id} className={`hover:bg-gray-50 transition duration-100 ${isPaid ? 'opacity-70' : 'font-semibold'}`}>
                                    <td className="p-3 whitespace-nowrap text-sm text-gray-900">{f.description}</td>
                                    <td className="p-3 whitespace-nowrap text-sm text-red-600">{formatCurrency(f.value)}</td>
                                    <td className="p-3 whitespace-nowrap text-sm text-gray-500">{String(f.dueDate).padStart(2, '0')}</td>
                                    <td className="p-3 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{statusText}</span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => onTogglePaid(f.id)} className="text-blue-600 hover:text-blue-800 transition duration-150">{isPaid ? 'Desmarcar' : 'Marcar Pago'}</button>
                                        <button onClick={() => onDelete(f.id)} className="text-red-600 hover:text-red-900 transition duration-150">Excluir</button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table></div>
        </section>
    );
};

export default FixedCostsSection;
