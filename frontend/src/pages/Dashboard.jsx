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
      const response = await api.get('/');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast('Error fetching projects', 'error');
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
      await api.post('/', newProject);
      fetchProjects();
      setNewProject({ name: '', dueDate: '', status: 'active' });
      showToast('Project created successfully', 'success');
    } catch (error) {
      showToast('Error creating project', 'error');
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <EarningsOverview payments={allPayments} />
      
      {/* Project Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Project</h2>
        <form onSubmit={handleCreateProject} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="border-gray-300 rounded-lg flex-1 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <input
            type="date"
            value={newProject.dueDate}
            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
            className="border-gray-300 rounded-lg w-48 focus:ring-teal-500 focus:border-teal-500"
            required
          />
          <select
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
            className="border-gray-300 rounded-lg w-36 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-2 rounded-lg hover:from-teal-700 hover:to-teal-800 transition duration-200 shadow-md"
          >
            Add Project
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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