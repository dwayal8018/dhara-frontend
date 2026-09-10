import { computed, Injectable, signal } from '@angular/core';
import { CartItem, SaleProduct } from '../../features/sales/sales/sales.data';

@Injectable({ providedIn: 'root' })
export class CartService {

  readonly cart = signal<CartItem[]>([]);

  readonly cartCount = computed(() =>
    this.cart().reduce((n, c) => n + c.qty, 0)
  );

  readonly subtotal = computed(() =>
    this.cart().reduce((sum, c) => {
      const lineTotal = c.qty * c.price;
      return sum + (lineTotal - lineTotal * (c.discount / 100));
    }, 0)
  );

  addToCart(p: SaleProduct): void {
    const existing = this.cart().find(c => c.product.id === p.id);
    if (existing) {
      this.cart.update(items =>
        items.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c)
      );
    } else {
      this.cart.update(items => [...items, {
        product: p, qty: 1, price: p.sellingPrice, discount: 0
      }]);
    }
  }

  removeFromCart(id: number): void {
    this.cart.update(items => items.filter(c => c.product.id !== id));
  }

  updateQty(id: number, qty: number): void {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(items =>
      items.map(c => c.product.id === id ? { ...c, qty } : c)
    );
  }

  updatePrice(id: number, price: number): void {
    this.cart.update(items =>
      items.map(c => c.product.id === id ? { ...c, price: Math.max(0, price) } : c)
    );
  }

  updateLineDiscount(id: number, discount: number): void {
    this.cart.update(items =>
      items.map(c => c.product.id === id
        ? { ...c, discount: Math.min(100, Math.max(0, discount)) }
        : c)
    );
  }

  clearCart(): void {
    this.cart.set([]);
  }
}
