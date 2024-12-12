import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Bar } from 'react-chartjs-2';

export default function Dashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    dueDate: '',
    status: 'active'
  });

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
      setNewProject({ name: '', dueDate: '', status: 'active' });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/projects/import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchProjects();
    } catch (error) {
      console.error('Error importing projects:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/projects/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'projects.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting projects:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Project Form */}
      <form onSubmit={handleCreateProject} className="mb-8">
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          value={newProject.dueDate}
          onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Project
        </button>
      </form>

      {/* Import/Export */}
      <div className="mb-8">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-2"
        />
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded ml-2"
        >
          Export Projects
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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