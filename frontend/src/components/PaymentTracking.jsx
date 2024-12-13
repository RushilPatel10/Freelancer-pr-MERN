import { useState } from 'react';
import api from '../utils/axios';
import Toast from './Toast';

export default function PaymentTracking({ projectId, payments = [], onUpdate }) {
  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: '',
    description: '',
    status: 'pending'
  });
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post(`/${projectId}/payments`, {
        ...newPayment,
        amount: parseFloat(newPayment.amount)
      });

      if (response.data) {
        onUpdate();
        setNewPayment({
          amount: '',
          date: '',
          description: '',
          status: 'pending'
        });
        showToast('Payment added successfully', 'success');
      }
    } catch (error) {
      console.error('Add payment error:', error);
      showToast(
        error.response?.data?.message || 'Error adding payment. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (isDeleting) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this payment?');
    
    if (confirmDelete) {
      try {
        setIsDeleting(true);
        await api.delete(`/${projectId}/payments/${paymentId}`);
        showToast('Payment deleted successfully', 'success');
        onUpdate();
      } catch (error) {
        console.error('Delete payment error:', error);
        showToast(
          error.response?.data?.message || 'Error deleting payment. Please try again.',
          'error'
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      const response = await api.put(`/${projectId}/payments/${paymentId}`, {
        status: newStatus
      });
      if (response.data) {
        onUpdate();
        showToast('Payment status updated successfully', 'success');
      }
    } catch (error) {
      console.error('Update status error:', error);
      showToast(
        error.response?.data?.message || 'Error updating payment status',
        'error'
      );
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  };

  return (
    <div className="mt-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg text-gray-800">Payment Tracking</h4>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        </div>
      </div>
      
      {/* Payment Form */}
      <form onSubmit={handleAddPayment} className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              placeholder="Amount"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              className="border rounded-lg p-2 pl-7 w-full focus:ring-teal-500 focus:border-teal-500"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <input
            type="date"
            value={newPayment.date}
            onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
            className="border rounded-lg p-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newPayment.description}
            onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
            className="border rounded-lg p-2 focus:ring-teal-500 focus:border-teal-500 md:col-span-2"
            required
            maxLength="100"
          />
          <select
            value={newPayment.status}
            onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
            className="border rounded-lg p-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-200 disabled:opacity-50 flex items-center justify-center"
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            Add Payment
          </button>
        </div>
      </form>

      {/* Payments List */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No payments added yet</p>
            <p className="text-sm text-gray-400">Add your first payment using the form above</p>
          </div>
        ) : (
          payments.map(payment => (
            <div
              key={payment._id}
              className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    ${parseFloat(payment.amount).toFixed(2)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{payment.description}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(payment.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={payment.status}
                  onChange={(e) => handleUpdateStatus(payment._id, e.target.value)}
                  className="border rounded-lg p-1.5 text-sm focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                  disabled={isDeleting}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <button
                  onClick={() => handleDeletePayment(payment._id)}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                  disabled={isDeleting}
                  title="Delete payment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 