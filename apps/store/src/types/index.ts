export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: string;
  image: string;
  indications?: string;
  requiresPrescription?: boolean;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cpf?: string;
  birthDate?: string;
  created_at?: string;
  tags?: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  user: User;
  address: string;
  paymentMethod: 'pix' | 'credit_card' | 'cash';
  deliveryMethod: 'delivery' | 'pickup';
  status: 'pending' | 'confirmed';
  createdAt: Date;
}

export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export interface DailyOffer {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  productId?: string;
  active: boolean;
}

export interface CashbackWallet {
  saldoAtual: number;
  ultimoCredito?: string;
  ultimoDebito?: string;
  updatedAt: string;
}

export interface CashbackTransaction {
  id: string;
  tipo: 'credito' | 'debito' | 'expirado';
  valor: number;
  dataExpiracao?: string;
  createdAt: string;
}