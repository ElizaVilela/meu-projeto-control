
import React, { useMemo } from 'react';
import type { AppData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCurrentMonthKey, getMonthYear } from '../utils/dateUtils';

interface DashboardProps {
    data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const summary = useMemo(() => {
        const currentMonthKey = getCurrentMonthKey();
        const currentMonthStr = currentMonthKey.substring(0, 7);

        const totalEntradasMes = data.entradas
            .filter(e => e.date.startsWith(currentMonthStr))
            .reduce((sum, e) => sum + e.value, 0);

        let totalAPagarMes = 0;
        let totalPagoMes = 0;

        data.fixas.forEach(f => {
            totalAPagarMes += f.value;
            if (f.paidMonths.some(p => p.monthKey === currentMonthKey)) {
                totalPagoMes += f.value;
            }
        });

        data.cartoes.forEach(card => {
            card.purchases.forEach(purchase => {
                purchase.installments.forEach(inst => {
                    if (getCurrentMonthKey(new Date(inst.dueDate)) === currentMonthKey) {
                        totalAPagarMes += inst.value;
                        if (inst.isPaid) {
                            totalPagoMes += inst.value;
                        }
                    }
                });
            });
        });

        const saldoMes = totalEntradasMes - totalPagoMes;

        return {
            month: getMonthYear(currentMonthKey),
            totalEntradasMes,
            totalAPagarMes,
            saldoMes,
        };
    }, [data]);

    const saldoClass = summary.saldoMes >= 0 ? 'green' : 'red';
    const saldoTitle = summary.saldoMes >= 0 ? 'Saldo (Entradas - Pagos)' : 'Déficit (Entradas - Pagos)';
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard - {summary.month}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-green-50 rounded-xl shadow-md border-t-4 border-green-500">
                    <h3 className="text-sm font-medium text-green-700 uppercase">Total de Entradas</h3>
                    <p className="text-3xl font-extrabold text-green-600 mt-1">{formatCurrency(summary.totalEntradasMes)}</p>
                </div>
                <div className="p-5 bg-red-50 rounded-xl shadow-md border-t-4 border-red-500">
                    <h3 className="text-sm font-medium text-red-700 uppercase">A Pagar Neste Mês</h3>
                    <p className="text-3xl font-extrabold text-red-600 mt-1">{formatCurrency(summary.totalAPagarMes)}</p>
                </div>
                <div className={`p-5 rounded-xl shadow-md border-t-4 bg-${saldoClass}-50 border-${saldoClass}-500`}>
                    <h3 className={`text-sm font-medium uppercase text-${saldoClass}-700`}>{saldoTitle}</h3>
                    <p className={`text-3xl font-extrabold mt-1 text-${saldoClass}-600`}>{formatCurrency(summary.saldoMes)}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
