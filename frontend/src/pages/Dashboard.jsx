import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from '../components/ProjectCard';
import EarningsOverview from '../components/EarningsOverview';
import api from '../utils/axios';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    dueDate: '',
    status: 'active'
  });
  const [toast, setToast] = useState(null);

  // Get all payments from all projects
  const allPayments = projects.reduce((acc, project) => {
    return [...acc, ...project.payments];
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      fetchProjects();
      setNewProject({ name: '', dueDate: '', status: 'active' });
      showToast('Project created successfully', 'success');
    } catch (error) {
      showToast('Error creating project', 'error');
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <EarningsOverview payments={allPayments} />
      
      {/* Project Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Add New Project</h2>
        <form onSubmit={handleCreateProject} className="flex space-x-4">
          <input
            type="text"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="border p-2 rounded flex-1"
            required
          />
          <input
            type="date"
            value={newProject.dueDate}
            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
            className="border p-2 rounded w-48"
            required
          />
          <select
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
            className="border p-2 rounded w-36"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
          >
            Add Project
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onUpdate={fetchProjects}
          />
        ))}
      </div>
    </div>
  );
} 