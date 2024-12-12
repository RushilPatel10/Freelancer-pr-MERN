import { useState } from 'react';
import api from '../utils/axios';

export default function PaymentTracking({ projectId, payments, onUpdate }) {
  const [newPayment, setNewPayment] = useState({
    amount: '',
    status: 'unpaid'
  });

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/payments/${projectId}`, newPayment);
      setNewPayment({ amount: '', status: 'unpaid' });
      onUpdate();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      await api.put(`/payments/${projectId}/${paymentId}`, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Payments</h3>
      
      {/* Add Payment Form */}
      <form onSubmit={handleAddPayment} className="mb-4 flex space-x-2">
        <input
          type="number"
          placeholder="Amount"
          value={newPayment.amount}
          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
          className="border rounded p-2 w-32"
        />
        <button
          type="submit"
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Add Payment
        </button>
      </form>

      {/* Payments List */}
      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded"
          >
            <div>
              <span className="font-semibold">${payment.amount}</span>
              <span className="text-sm text-gray-600 ml-2">
                {new Date(payment.date).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => handleUpdateStatus(
                payment._id,
                payment.status === 'paid' ? 'unpaid' : 'paid'
              )}
              className={`px-3 py-1 rounded ${
                payment.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {payment.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 