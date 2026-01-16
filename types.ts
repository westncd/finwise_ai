
export type Category = 'Ăn uống' | 'Di chuyển' | 'Mua sắm' | 'Tiện ích' | 'Giải trí' | 'Nhà ở' | 'Đầu tư' | 'Khác';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type?: 'income' | 'expense';
  category: Category;
  description: string;
  source: 'MoMo' | 'Ngân hàng' | 'Tiền mặt' | 'Thẻ tín dụng';
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Đã thanh toán' | 'Chờ thanh toán' | 'Quá hạn';
  isRecurring: boolean;
}

export interface ForecastData {
  month: string;
  projectedExpense: number;
  actualExpense: number;
}
