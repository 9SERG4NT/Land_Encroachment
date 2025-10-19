import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Satellite, ArrowLeft, Plus, MapPin, Calendar, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2332 50%, #0f1923 100%)' }}>
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <Satellite className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">EncroachScan</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              data-testid="new-scan-btn"
              onClick={() => navigate('/upload')} 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Scan
            </Button>
            <Button 
              data-testid="back-home-projects-btn"
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2 text-white">Scan Projects</h2>
          <p className="text-slate-400">View and manage all your encroachment detection projects</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Satellite className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-xl text-slate-400 mb-4">No projects yet</p>
              <Button 
                data-testid="create-first-project-btn"
                onClick={() => navigate('/upload')} 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/analysis/${project.id}`)}
                data-testid={`project-card-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                      {project.project_name}
                    </CardTitle>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      project.analysis_complete 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    }`}>
                      {project.analysis_complete ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </div>
                  </div>
                  {project.location && (
                    <CardDescription className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  {project.coordinates && (
                    <p className="text-xs text-slate-500 mt-2">{project.coordinates}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}