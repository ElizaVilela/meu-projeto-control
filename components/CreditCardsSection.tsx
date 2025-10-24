
import React, { useState, useEffect, useMemo } from 'react';
import type { CreditCard, Purchase, Installment } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateInstallmentDueDate, formatDate, getCurrentMonthKey, getMonthYear } from '../utils/dateUtils';

interface CreditCardsSectionProps {
    data: CreditCard[];
    onAddCard: (card: Omit<CreditCard, 'id' | 'purchases'>) => void;
    onDeleteCard: (id: string) => void;
    onAddPurchase: (cardId: string, purchase: Omit<Purchase, 'id'>) => void;
    onToggleInstallmentPaid: (cardId: string, purchaseId: string, installmentIndex: number) => void;
}

const CreditCardsSection: React.FC<CreditCardsSectionProps> = (props) => {
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    useEffect(() => {
        if (!activeCardId && props.data.length > 0) {
            setActiveCardId(props.data[0].id);
        }
        if (activeCardId && !props.data.find(c => c.id === activeCardId)) {
            setActiveCardId(props.data.length > 0 ? props.data[0].id : null);
        }
    }, [props.data, activeCardId]);

    const activeCard = useMemo(() => props.data.find(c => c.id === activeCardId), [props.data, activeCardId]);

    return (
        <section className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Configuração de Cartões</h3>
            <AddCardForm onAddCard={props.onAddCard} />

            {props.data.length > 0 && (
                 <div className="flex border-b border-gray-200">
                    {props.data.map(card => (
                         <button 
                            key={card.id}
                            onClick={() => setActiveCardId(card.id)}
                            className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors ${activeCardId === card.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                         >{card.name}</button>
                    ))}
                 </div>
            )}

            <div id="active-card-content">
                {activeCard ? (
                    <ActiveCardContent 
                        card={activeCard} 
                        onDeleteCard={props.onDeleteCard} 
                        onAddPurchase={props.onAddPurchase}
                        onToggleInstallmentPaid={props.onToggleInstallmentPaid}
                    />
                ) : (
                    <div className="p-4 bg-gray-100 text-gray-600 rounded-lg border border-gray-300">
                        <p>Adicione um cartão para começar a gerenciar as compras.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


const AddCardForm: React.FC<{onAddCard: CreditCardsSectionProps['onAddCard']}> = ({ onAddCard }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !dueDate) return;
        onAddCard({ name, dueDate: parseInt(dueDate) });
        setName('');
        setDueDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex flex-col flex-1 min-w-[200px]"><label htmlFor="card-name" className="text-sm font-medium text-gray-600">Nome do Cartão</label><input type="text" id="card-name" value={name} onChange={e => setName(e.target.value)} placeholder="Visa XPTO" className="p-2 border border-gray-300 rounded-lg" required /></div>
            <div className="flex flex-col flex-1 min-w-[150px]"><label htmlFor="card-due-date" className="text-sm font-medium text-gray-600">Dia de Vencimento</label><input type="number" id="card-due-date" value={dueDate} onChange={e => setDueDate(e.target.value)} min="1" max="31" placeholder="1-31" className="p-2 border border-gray-300 rounded-lg" required /></div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition h-[42px] mt-2 sm:mt-0">Adicionar Cartão</button>
        </form>
    );
};

const ActiveCardContent: React.FC<{card: CreditCard, onDeleteCard: CreditCardsSectionProps['onDeleteCard'], onAddPurchase: CreditCardsSectionProps['onAddPurchase'], onToggleInstallmentPaid: CreditCardsSectionProps['onToggleInstallmentPaid']}> = ({ card, onDeleteCard, onAddPurchase, onToggleInstallmentPaid }) => {
    
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [totalValue, setTotalValue] = useState('');
    const [numInstallments, setNumInstallments] = useState('1');

    const handleAddPurchaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valueNum = parseFloat(totalValue);
        const installmentsNum = parseInt(numInstallments);

        if (!purchaseDate || !description || !valueNum || !installmentsNum) return;

        const installmentValue = parseFloat((valueNum / installmentsNum).toFixed(2));
        const lastInstallmentValue = parseFloat((valueNum - (installmentValue * (installmentsNum - 1))).toFixed(2));

        const newInstallments: Installment[] = [];
        for (let i = 1; i <= installmentsNum; i++) {
            newInstallments.push({
                value: i === installmentsNum ? lastInstallmentValue : installmentValue,
                dueDate: calculateInstallmentDueDate(purchaseDate, i, card.dueDate),
                isPaid: false,
            });
        }
        
        onAddPurchase(card.id, { date: purchaseDate, description, value: valueNum, installments: newInstallments });

        setDescription('');
        setTotalValue('');
        setNumInstallments('1');
    };
    
    const currentMonthKey = getCurrentMonthKey();
    const currentMonthBill = useMemo(() => {
        return card.purchases.flatMap(p => 
            p.installments
                .map((inst, index) => ({...inst, purchaseId: p.id, description: p.description, installmentNum: index + 1, totalInstallments: p.installments.length}))
                .filter(inst => getCurrentMonthKey(new Date(inst.dueDate)) === currentMonthKey)
        );
    }, [card.purchases, currentMonthKey]);
    
    const totalBill = currentMonthBill.reduce((sum, inst) => sum + inst.value, 0);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center flex-wrap">
                <div>
                    <h4 className="text-xl font-bold text-blue-700">{card.name}</h4>
                    <span className="text-sm text-gray-600">Vencimento dia {card.dueDate}</span>
                </div>
                <p className="text-lg font-extrabold text-red-600">Fatura de {getMonthYear(currentMonthKey)}: {formatCurrency(totalBill)}</p>
                <button onClick={() => onDeleteCard(card.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 text-sm mt-3 sm:mt-0">Excluir Cartão</button>
            </div>

            <h4 className="text-lg font-semibold text-gray-800">Registrar Nova Compra</h4>
            <form onSubmit={handleAddPurchaseSubmit} className="flex flex-wrap gap-3 items-end p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex flex-col flex-1 min-w-[150px]"><label className="text-sm font-medium">Data Compra</label><input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="p-2 border rounded-lg" required /></div>
                <div className="flex flex-col flex-2 min-w-[200px]"><label className="text-sm font-medium">Descrição</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="p-2 border rounded-lg" required /></div>
                <div className="flex flex-col flex-1 min-w-[100px]"><label className="text-sm font-medium">Valor Total</label><input type="number" value={totalValue} onChange={e => setTotalValue(e.target.value)} step="0.01" className="p-2 border rounded-lg" required /></div>
                <div className="flex flex-col flex-1 min-w-[100px]"><label className="text-sm font-medium">Nº Parcelas</label><input type="number" value={numInstallments} onChange={e => setNumInstallments(e.target.value)} min="1" max="60" className="p-2 border rounded-lg" required /></div>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 h-[42px] mt-2 sm:mt-0">Registrar</button>
            </form>
            
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Parcelas no Mês Atual ({getMonthYear(currentMonthKey)})</h4>
            <div className="overflow-x-auto rounded-lg shadow-md border"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100"><tr><th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Descrição</th><th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Vencimento</th><th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Valor</th><th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Status</th><th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Ações</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentMonthBill.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhuma parcela a pagar neste mês.</td></tr>
                    ) : (
                        currentMonthBill.map((inst, index) => (
                            <tr key={`${inst.purchaseId}-${index}`} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-900">{inst.description} ({inst.installmentNum}/{inst.totalInstallments})</td>
                                <td className="p-3 text-sm text-gray-500">{formatDate(inst.dueDate)}</td>
                                <td className="p-3 text-sm font-semibold text-red-600">{formatCurrency(inst.value)}</td>
                                <td className="p-3 text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${inst.isPaid ? 'bg-green-500' : 'bg-red-500'}`}>{inst.isPaid ? 'Paga' : 'Não Paga'}</span>
                                </td>
                                <td className="p-3 text-sm font-medium">
                                    <button onClick={() => onToggleInstallmentPaid(card.id, inst.purchaseId, inst.installmentNum - 1)} className="text-blue-600 hover:text-blue-800">{inst.isPaid ? 'Desmarcar' : 'Marcar Pago'}</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table></div>
        </div>
    );
};


export default CreditCardsSection;
