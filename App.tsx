
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, Income, FixedCost, CreditCard, Purchase } from './types';
import { initialDataState } from './constants';
import { getCurrentMonthKey } from './utils/dateUtils';
import Dashboard from './components/Dashboard';
import IncomeSection from './components/IncomeSection';
import FixedCostsSection from './components/FixedCostsSection';
import CreditCardsSection from './components/CreditCardsSection';
import ReportSection from './components/ReportSection';
import Notification from './components/Notification';

const LOCAL_STORAGE_KEY = 'financeiroPessoalReactData';

const App: React.FC = () => {
    const [data, setData] = useState<AppData>(initialDataState);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showReport, setShowReport] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 5000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), duration);
    }, []);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setData(parsedData);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            showNotification("Falha ao carregar dados locais.", "error");
        }
    }, [showNotification]);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            showNotification("Falha ao salvar dados. O armazenamento pode estar cheio.", "error");
        }
    }, [data, showNotification]);

    const processMonthTurnover = useCallback(() => {
        const currentMonthKey = getCurrentMonthKey();
        const lastProcessedMonth = data.lastProcessedMonth;

        const needsTurnover = lastProcessedMonth === null || currentMonthKey > lastProcessedMonth;

        if (!needsTurnover) {
            return;
        }

        let updatedData = { ...data };
        let fixedCount = 0;
        let cardCount = 0;

        if (lastProcessedMonth) {
            // Mark overdue fixed expenses as paid
            updatedData.fixas = updatedData.fixas.map(f => {
                const isPaidLastMonth = f.paidMonths.some(p => p.monthKey === lastProcessedMonth);
                if (!isPaidLastMonth) {
                    fixedCount++;
                    return { ...f, paidMonths: [...f.paidMonths, { monthKey: lastProcessedMonth }] };
                }
                return f;
            });

            // Mark overdue card installments as paid
            updatedData.cartoes = updatedData.cartoes.map(card => ({
                ...card,
                purchases: card.purchases.map(p => ({
                    ...p,
                    installments: p.installments.map(inst => {
                        if (!inst.isPaid && getCurrentMonthKey(new Date(inst.dueDate)) < currentMonthKey) {
                            cardCount++;
                            return { ...inst, isPaid: true };
                        }
                        return inst;
                    })
                }))
            }));
        }
        
        // This is the corrected logic: update to the CURRENT month key
        updatedData.lastProcessedMonth = currentMonthKey;

        setData(updatedData);

        if (fixedCount > 0 || cardCount > 0) {
            showNotification(`Virada de mês: ${fixedCount + cardCount} itens atrasados foram marcados como pagos.`, 'success');
        }
    }, [data, showNotification]);

    useEffect(() => {
        processMonthTurnover();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on initial mount


    const handleAddIncome = (income: Omit<Income, 'id'>) => {
        setData(prev => ({ ...prev, entradas: [...prev.entradas, { ...income, id: crypto.randomUUID() }] }));
        showNotification("Entrada adicionada com sucesso!");
    };

    const handleDeleteIncome = (id: string) => {
        setData(prev => ({ ...prev, entradas: prev.entradas.filter(e => e.id !== id) }));
        showNotification("Entrada removida.", "warning");
    };

    const handleAddFixedCost = (cost: Omit<FixedCost, 'id' | 'paidMonths'>) => {
        setData(prev => ({ ...prev, fixas: [...prev.fixas, { ...cost, id: crypto.randomUUID(), paidMonths: [] }] }));
        showNotification("Conta fixa adicionada com sucesso!");
    };
    
    const handleDeleteFixedCost = (id: string) => {
        setData(prev => ({...prev, fixas: prev.fixas.filter(f => f.id !== id)}));
        showNotification("Conta fixa removida.", "warning");
    };
    
    const toggleFixedCostPaid = (id: string) => {
        const currentMonthKey = getCurrentMonthKey();
        setData(prev => ({
            ...prev,
            fixas: prev.fixas.map(f => {
                if (f.id === id) {
                    const isPaid = f.paidMonths.some(p => p.monthKey === currentMonthKey);
                    if (isPaid) {
                        showNotification(`'${f.description}' marcada como NÃO paga.`, "warning");
                        return { ...f, paidMonths: f.paidMonths.filter(p => p.monthKey !== currentMonthKey) };
                    } else {
                        showNotification(`'${f.description}' marcada como PAGA.`, "success");
                        return { ...f, paidMonths: [...f.paidMonths, { monthKey: currentMonthKey }] };
                    }
                }
                return f;
            })
        }));
    };

    const handleAddCard = (card: Omit<CreditCard, 'id' | 'purchases'>) => {
        setData(prev => ({...prev, cartoes: [...prev.cartoes, { ...card, id: crypto.randomUUID(), purchases: [] }]}));
        showNotification("Cartão adicionado com sucesso!");
    };

    const handleDeleteCard = (id: string) => {
        setData(prev => ({...prev, cartoes: prev.cartoes.filter(c => c.id !== id)}));
        showNotification("Cartão removido.", "warning");
    };
    
    const handleAddPurchase = (cardId: string, purchase: Omit<Purchase, 'id'>) => {
        setData(prev => ({
            ...prev,
            cartoes: prev.cartoes.map(c => 
                c.id === cardId 
                    ? { ...c, purchases: [...c.purchases, { ...purchase, id: crypto.randomUUID() }] } 
                    : c
            )
        }));
        showNotification("Compra registrada com sucesso!");
    };

    const toggleInstallmentPaid = (cardId: string, purchaseId: string, installmentIndex: number) => {
        setData(prev => ({
            ...prev,
            cartoes: prev.cartoes.map(c => {
                if (c.id === cardId) {
                    return {
                        ...c,
                        purchases: c.purchases.map(p => {
                            if (p.id === purchaseId) {
                                return {
                                    ...p,
                                    installments: p.installments.map((inst, index) => {
                                        if (index === installmentIndex) {
                                            const newStatus = !inst.isPaid;
                                            showNotification(`Parcela ${index + 1} de '${p.description}' marcada como ${newStatus ? 'PAGA' : 'NÃO PAGA'}.`, newStatus ? 'success' : 'warning');
                                            return { ...inst, isPaid: newStatus };
                                        }
                                        return inst;
                                    })
                                };
                            }
                            return p;
                        })
                    };
                }
                return c;
            })
        }));
    };

    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `financeiro_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification("Backup exportado com sucesso!");
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not text");
                const importedData = JSON.parse(text);
                
                if (!importedData.entradas || !importedData.fixas || !importedData.cartoes) {
                   throw new Error("Invalid JSON structure");
                }
                setData(importedData);
                showNotification("Dados importados com sucesso!");
            } catch (error) {
                console.error(error);
                showNotification("Erro ao importar arquivo. Verifique se é um JSON válido.", "error");
            } finally {
               event.target.value = ''; // Reset input
            }
        };
        reader.readAsText(file);
    };

    const tabs = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'entradas', label: 'Entradas' },
        { id: 'fixas', label: 'Saídas Fixas' },
        { id: 'cartoes', label: 'Cartões de Crédito' },
    ], []);

    return (
        <div className="max-w-7xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-2xl my-4 sm:my-8 min-h-screen">
            <input type="file" id="file-import-input" accept=".json" className="hidden" onChange={importData} />

            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 border-b-4 border-blue-500 pb-3 mb-6">
                Gerenciador Financeiro
            </h1>

            <section id="dashboard-section" className="mb-8">
                <Dashboard data={data} />
                 <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setShowReport(prev => !prev)} className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-150 font-semibold text-sm">
                        {showReport ? 'Ocultar Relatório' : 'Ver Relatório Completo'}
                    </button>
                    <button onClick={exportData} className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-150 font-semibold text-sm">
                        Exportar Dados (Backup)
                    </button>
                    <button onClick={() => document.getElementById('file-import-input')?.click()} className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition duration-150 font-semibold text-sm">
                        Importar Dados (Restaurar)
                    </button>
                </div>
            </section>

            {showReport && <ReportSection data={data} />}

            <div className="border-b border-gray-200 mt-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="pt-6">
                {activeTab === 'entradas' && <IncomeSection data={data.entradas} onAdd={handleAddIncome} onDelete={handleDeleteIncome} />}
                {activeTab === 'fixas' && <FixedCostsSection data={data.fixas} onAdd={handleAddFixedCost} onDelete={handleDeleteFixedCost} onTogglePaid={toggleFixedCostPaid} />}
                {activeTab === 'cartoes' && <CreditCardsSection data={data.cartoes} onAddCard={handleAddCard} onDeleteCard={handleDeleteCard} onAddPurchase={handleAddPurchase} onToggleInstallmentPaid={toggleInstallmentPaid} />}
            </div>
        </div>
    );
};

export default App;
