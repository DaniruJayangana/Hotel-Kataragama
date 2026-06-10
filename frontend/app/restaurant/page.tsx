'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface MenuItem {
  _id: string;
  item_name: string;
  category: 'Food' | 'Beverage' | 'Dessert' | 'Extra';
  price: number;
  is_available: boolean;
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
    // Explicitly casting the API response
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

  const placeOrder = async () => {
    if (!tableNumber) return alert("Please enter a table number");
    setLoading(true);
    try {
      await api.post('/api/restaurant/order/create', {
        table_number: parseInt(tableNumber),
        items: cart.map((i) => ({ menu_item_id: i._id, quantity: i.quantity }))
      });
      alert("Order placed successfully!");
      setCart([]);
      setTableNumber('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 p-6">
      <div className="flex-1">
        <div className="flex gap-2 mb-6">
          {(['All', 'Food', 'Beverage', 'Dessert', 'Extra'] as CategoryFilter[]).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} 
              className={`px-4 py-2 rounded ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredMenu.map(item => (
            <div key={item._id} className="p-4 bg-white border rounded shadow">
              <h3 className="font-bold">{item.item_name}</h3>
              <p>${item.price}</p>
              <button 
                onClick={() => addToCart(item)} 
                disabled={!item.is_available}
                className={`mt-2 px-4 py-1 rounded w-full ${item.is_available ? 'bg-blue-600 text-white' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {item.is_available ? 'Add' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 p-6 bg-white border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Current Order</h2>
        <input 
            type="number" 
            placeholder="Table Number" 
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)} 
            className="w-full p-2 mb-4 border rounded"
        />
        <ul className="space-y-2">
          {cart.map(c => (
            <li key={c._id} className="flex justify-between items-center">
              <span>{c.item_name} (x{c.quantity})</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(c._id, -1)} className="px-2 bg-gray-200 rounded">-</button>
                <button onClick={() => updateQuantity(c._id, 1)} className="px-2 bg-gray-200 rounded">+</button>
              </div>
            </li>
          ))}
        </ul>
        <button 
            disabled={loading || cart.length === 0} 
            onClick={placeOrder} 
            className="w-full mt-6 bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Submit Order'}
        </button>
      </div>
    </div>
  );
}