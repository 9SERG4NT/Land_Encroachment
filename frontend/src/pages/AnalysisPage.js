import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Satellite, ArrowLeft, Loader2, AlertTriangle, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

export default function AnalysisPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [project, setProject] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchProject();
    startAnalysis();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/analyze/${projectId}`);
      setResults(response.data);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (deviation) => {
    if (deviation > 15) return 'text-red-400';
    if (deviation > 5) return 'text-orange-400';
    return 'text-green-400';
  };

  const getSeverityBg = (deviation) => {
    if (deviation > 15) return 'bg-red-500/10 border-red-500/30';
    if (deviation > 5) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-green-500/10 border-green-500/30';
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
          <Button 
            data-testid="back-projects-btn"
            onClick={() => navigate('/projects')} 
            variant="ghost" 
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Project Info */}
        {project && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">{project.project_name}</h2>
            <div className="flex items-center gap-6 text-slate-400">
              {project.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <Card className="mb-8 bg-slate-900/50 border-slate-700/50">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-cyan-400" />
                <p className="text-xl text-white font-medium mb-2">Analyzing Images...</p>
                <p className="text-slate-400">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className={`${getSeverityBg(results.deviation_percentage)} backdrop-blur-sm`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {results.deviation_percentage > 15 ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    Deviation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-4xl font-bold ${getSeverityColor(results.deviation_percentage)}`}>
                    {results.deviation_percentage}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Encroached Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-orange-400">{results.encroached_areas}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-lg font-medium ${results.deviation_percentage > 15 ? 'text-red-400' : results.deviation_percentage > 5 ? 'text-orange-400' : 'text-green-400'}`}>
                    {results.deviation_percentage > 15 ? 'CRITICAL' : results.deviation_percentage > 5 ? 'WARNING' : 'CLEAR'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{results.summary}</p>
              </CardContent>
            </Card>

            {/* Visual Comparison */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Visual Analysis</CardTitle>
                <CardDescription className="text-slate-400">Compare sanctioned map with satellite imagery</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                    <TabsTrigger data-testid="comparison-tab" value="comparison" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Side-by-Side Comparison</TabsTrigger>
                    <TabsTrigger data-testid="overlay-tab" value="overlay" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Overlay View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comparison" className="mt-6">
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src={`data:image/png;base64,${results.comparison_image}`} 
                        alt="Comparison" 
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-3">Left: Sanctioned Map | Center: Satellite Image | Right: Encroachment Overlay (Red areas indicate encroachment)</p>
                  </TabsContent>
                  <TabsContent value="overlay" className="mt-6">
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src={`data:image/png;base64,${results.overlay_image}`} 
                        alt="Overlay" 
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-3">Green outlines: Sanctioned boundaries | Red areas: Detected encroachments</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}