import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Satellite, Shield, MapPin, BarChart3, Upload, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

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
            data-testid="view-projects-btn"
            onClick={() => navigate('/projects')} 
            variant="outline" 
            className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
          >
            View Projects
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">AI-Powered Encroachment Detection</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Detecting Housing
            </span>
            <br />
            <span className="text-white">Encroachments with AI</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Compare sanctioned building maps with satellite imagery to identify unauthorized constructions and boundary violations automatically.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              data-testid="start-new-scan-btn"
              onClick={() => navigate('/upload')} 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-8 py-6 text-lg group"
            >
              Start New Scan
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              data-testid="how-it-works-btn"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} 
              size="lg"
              variant="outline"
              className="border-slate-700 hover:bg-slate-800/50 text-slate-300 px-8 py-6 text-lg"
            >
              How It Works
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Easy Upload</h3>
            <p className="text-slate-400">Upload sanctioned maps and satellite images in multiple formats (PNG, JPG, PDF)</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Satellite className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">AI Analysis</h3>
            <p className="text-slate-400">Advanced computer vision algorithms detect building outlines and compare boundaries</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Detailed Reports</h3>
            <p className="text-slate-400">Get visual overlays and statistical analysis of encroached areas with deviation percentages</p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                1
              </div>
              <h4 className="font-semibold mb-2 text-white">Create Project</h4>
              <p className="text-sm text-slate-400">Start a new scan project with location details</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                2
              </div>
              <h4 className="font-semibold mb-2 text-white">Upload Images</h4>
              <p className="text-sm text-slate-400">Upload sanctioned map and satellite imagery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                3
              </div>
              <h4 className="font-semibold mb-2 text-white">AI Analysis</h4>
              <p className="text-sm text-slate-400">System compares and detects discrepancies</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                4
              </div>
              <h4 className="font-semibold mb-2 text-white">Get Results</h4>
              <p className="text-sm text-slate-400">View visual overlays and detailed reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400">
          <p>EncroachScan - AI-Based Encroachment Detection System</p>
          <p className="text-sm mt-2">Detecting housing encroachments by comparing sanctioned maps with satellite imagery</p>
        </div>
      </footer>
    </div>
  );
}