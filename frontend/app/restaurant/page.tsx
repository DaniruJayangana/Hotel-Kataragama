'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface MenuItem {
  _id: string;
  item_name: string;
  category: 'Food' | 'Beverage' | 'Dessert' | 'Extra';
  price: number;
  is_available: boolean;
  image_url?: string; // Added image support
}

interface CartItem extends MenuItem {
  quantity: number;
}

type CategoryFilter = 'All' | 'Food' | 'Beverage' | 'Dessert' | 'Extra';

export default function RestaurantPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('');

  useEffect(() => {
    api.get('/api/restaurant/menu').then((res) => setMenu(res.data as MenuItem[]));
  }, []);

  const filteredMenu = category === 'All' 
    ? menu 
    : menu.filter((i) => i.category === category);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((i) => 
      i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  return (
    // DARK MODE BACKGROUND for high contrast
    <div className="flex gap-6 p-8 bg-slate-900 min-h-screen text-white">
      <div className="flex-1">
        {/* CATEGORY FILTER - High Contrast */}
        <div className="flex gap-3 mb-8">
          {(['All', 'Food', 'Beverage', 'Dessert', 'Extra'] as CategoryFilter[]).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} 
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                category === cat ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-800 hover:bg-slate-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map(item => (
            <div key={item._id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all">
              {/* IMAGE SUPPORT */}
              <div className="h-40 bg-slate-700">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{item.item_name}</h3>
                <p className="text-blue-400 font-semibold mb-3">${item.price.toFixed(2)}</p>
                <button 
                  onClick={() => addToCart(item)} 
                  disabled={!item.is_available}
                  className={`w-full py-2 rounded-lg font-bold ${item.is_available ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 cursor-not-allowed'}`}
                >
                  {item.is_available ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CART PANEL */}
      <div className="w-96 bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit sticky top-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Current Order</h2>
        <input 
            type="number" 
            placeholder="Enter Table Number" 
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)} 
            className="w-full p-3 mb-6 bg-slate-900 border border-slate-700 rounded-lg text-white"
        />
        <ul className="space-y-4 mb-6">
          {cart.map(c => (
            <li key={c._id} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
              <span className="font-medium">{c.item_name} (x{c.quantity})</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(c._id, -1)} className="px-3 py-1 bg-slate-600 rounded-lg font-bold">-</button>
                <button onClick={() => updateQuantity(c._id, 1)} className="px-3 py-1 bg-slate-600 rounded-lg font-bold">+</button>
              </div>
            </li>
          ))}
        </ul>
        <button 
            disabled={loading || cart.length === 0} 
            onClick={() => {/* placeholder for your placeOrder logic */}} 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold disabled:bg-slate-600"
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}