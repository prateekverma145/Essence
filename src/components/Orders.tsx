import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Sample order data
const sampleOrders = [
  {
    id: '1234',
    date: '2023-03-15',
    status: 'Delivered',
    total: 548.00,
    items: [
      { id: '1', name: 'Midnight Rose', brand: 'Lumière', price: 299, quantity: 1, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000' },
      { id: '2', name: 'Ocean Breeze', brand: 'Aqua', price: 249, quantity: 1, image: 'https://images.unsplash.com/photo-1595425964072-458589267fe1?auto=format&fit=crop&q=80&w=1000' }
    ]
  },
  {
    id: '1122',
    date: '2023-02-10',
    status: 'Delivered',
    total: 399.00,
    items: [
      { id: '3', name: 'Velvet Oud', brand: 'Mystique', price: 399, quantity: 1, image: 'https://images.unsplash.com/photo-1557053506-91e1290aa02d?auto=format&fit=crop&q=80&w=1000' }
    ]
  }
];

const Orders = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-8">Your Orders</h1>
      
      {sampleOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
          <Link to="/" className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sampleOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Placed</p>
                  <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                </div>
                <div className="sm:text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link to={`/product/${item.id}`} className="text-lg font-medium hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-gray-500">{item.brand}</p>
                      <div className="mt-2 flex justify-between">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 flex justify-end space-x-4">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
                  Track Package
                </button>
                <button className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
                  Buy Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 