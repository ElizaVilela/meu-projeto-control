
import React, { useState } from 'react';
import type { Income } from '../types';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';

interface IncomeSectionProps {
    data: Income[];
    onAdd: (income: Omit<Income, 'id'>) => void;
    onDelete: (id: string) => void;
}

const IncomeSection: React.FC<IncomeSectionProps> = ({ data, onAdd, onDelete }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !description || !value) {
            alert('Preencha todos os campos.');
            return;
        }
        onAdd({ date, description, value: parseFloat(value) });
        setDescription('');
        setValue('');
    };
    
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <section className="space-y-6">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex flex-col flex-1 min-w-[150px]"><label htmlFor="entrada-data" className="text-sm font-medium text-gray-600">Data</label><input type="date" id="entrada-data" value={date} onChange={e => setDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="flex flex-col flex-2 min-w-[200px]"><label htmlFor="entrada-descricao" className="text-sm font-medium text-gray-600">Descrição</label><input type="text" id="entrada-descricao" value={description} onChange={e => setDescription(e.target.value)} placeholder="Salário, Bônus, etc." className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="flex flex-col flex-1 min-w-[150px]"><label htmlFor="entrada-valor" className="text-sm font-medium text-gray-600">Valor (R$)</label><input type="number" id="entrada-valor" value={value} onChange={e => setValue(e.target.value)} step="0.01" placeholder="0.00" className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required /></div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 h-[42px] mt-2 sm:mt-0">Adicionar Entrada</button>
            </form>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Entradas Registradas</h3>
            <div className="overflow-x-auto rounded-lg shadow-md border"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100"><tr><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Data</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Descrição</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Valor</th><th className="p-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Ações</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhuma entrada registrada.</td></tr>
                    ) : (
                        sortedData.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50 transition duration-100">
                                <td className="p-3 whitespace-nowrap text-sm text-gray-500">{formatDate(e.date)}</td>
                                <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">{e.description}</td>
                                <td className="p-3 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(e.value)}</td>
                                <td className="p-3 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => onDelete(e.id)} className="text-red-600 hover:text-red-900 transition duration-150">Excluir</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table></div>
        </section>
    );
};

export default IncomeSection;
