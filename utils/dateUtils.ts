
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const getCurrentMonthKey = (dateObj: Date = new Date()): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
};

export const getMonthYear = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    return `${month}/${year}`;
};

export const calculateInstallmentDueDate = (purchaseDate: string, installmentIndex: number, cardDueDateDay: number): string => {
    const date = new Date(purchaseDate + 'T00:00:00');
    date.setMonth(date.getMonth() + installmentIndex);
    date.setDate(cardDueDateDay);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
