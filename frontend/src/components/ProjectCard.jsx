import { useState } from 'react';
import api from '../utils/axios';
import PaymentTracking from './PaymentTracking';
import Toast from './Toast';

export default function ProjectCard({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${project._id}`, formData);
      onUpdate();
      setIsEditing(false);
      showToast('Project updated successfully', 'success');
    } catch (error) {
      showToast('Error updating project', 'error');
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis action cannot be undone and will delete all associated payments.`
    );
    
    if (confirmDelete) {
      try {
        await api.delete(`/projects/${project._id}`);
        showToast('Project deleted successfully', 'success');
        onUpdate();
      } catch (error) {
        showToast('Error deleting project', 'error');
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            value={formData.dueDate.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
              <p className="text-gray-600">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                project.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-teal-600 hover:text-teal-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
          
          <PaymentTracking
            projectId={project._id}
            payments={project.payments}
            onUpdate={onUpdate}
          />
        </>
      )}
    </div>
  );
} 