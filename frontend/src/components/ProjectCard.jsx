import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectCard({ project, onUpdate }) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/projects/${project._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow">
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="date"
            value={formData.dueDate.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="border p-2 mb-2 w-full"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      ) : (
        <>
          <h3 className="text-lg font-bold">{project.name}</h3>
          <p>Due: {new Date(project.dueDate).toLocaleDateString()}</p>
          <p>Status: {project.status}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
} 