import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, FileImage, Satellite, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

export default function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [sanctionedMap, setSanctionedMap] = useState(null);
  const [satelliteImage, setSatelliteImage] = useState(null);
  const [sanctionedPreview, setSanctionedPreview] = useState(null);
  const [satellitePreview, setSatellitePreview] = useState(null);

  const handleSanctionedUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSanctionedMap(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSanctionedPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSatelliteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSatelliteImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSatellitePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectName || !sanctionedMap || !satelliteImage) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create project
      const projectResponse = await axios.post(`${API}/project/create`, {
        project_name: projectName,
        location: location || null,
        coordinates: coordinates || null
      });

      const projectId = projectResponse.data.id;

      // Upload sanctioned map
      const sanctionedFormData = new FormData();
      sanctionedFormData.append('file', sanctionedMap);
      await axios.post(`${API}/upload-sanctioned-map/${projectId}`, sanctionedFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Upload satellite image
      const satelliteFormData = new FormData();
      satelliteFormData.append('file', satelliteImage);
      await axios.post(`${API}/upload-satellite-image/${projectId}`, satelliteFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Project created successfully! Starting analysis...');
      
      // Navigate to analysis page
      navigate(`/analysis/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
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
          <Button 
            data-testid="back-home-btn"
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 text-white">Create New Scan Project</h2>
          <p className="text-slate-400">Upload your sanctioned map and satellite image to begin analysis</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Details */}
          <Card className="mb-6 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Project Details</CardTitle>
              <CardDescription className="text-slate-400">Enter basic information about this scan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName" className="text-slate-300">Project Name *</Label>
                <Input
                  data-testid="project-name-input"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Site A - Building 123"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-slate-300">Location</Label>
                <Input
                  data-testid="location-input"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Maharashtra"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="coordinates" className="text-slate-300">GPS Coordinates</Label>
                <Input
                  data-testid="coordinates-input"
                  id="coordinates"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                  placeholder="e.g., 19.0760° N, 72.8777° E"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Sanctioned Map */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-cyan-400" />
                  Sanctioned Map *
                </CardTitle>
                <CardDescription className="text-slate-400">Upload government-approved building map</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
                    <input
                      data-testid="sanctioned-map-input"
                      type="file"
                      id="sanctioned"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleSanctionedUpload}
                      className="hidden"
                    />
                    <label htmlFor="sanctioned" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-slate-400 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG or PDF</p>
                    </label>
                  </div>
                  {sanctionedPreview && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img src={sanctionedPreview} alt="Sanctioned map preview" className="w-full h-48 object-cover" />
                      <p className="text-xs text-slate-400 p-2 bg-slate-800/50">{sanctionedMap.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Satellite Image */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-blue-400" />
                  Satellite Image *
                </CardTitle>
                <CardDescription className="text-slate-400">Upload current satellite/aerial imagery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                    <input
                      data-testid="satellite-image-input"
                      type="file"
                      id="satellite"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleSatelliteUpload}
                      className="hidden"
                    />
                    <label htmlFor="satellite" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-slate-400 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG or JPG</p>
                    </label>
                  </div>
                  {satellitePreview && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img src={satellitePreview} alt="Satellite image preview" className="w-full h-48 object-cover" />
                      <p className="text-xs text-slate-400 p-2 bg-slate-800/50">{satelliteImage.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              data-testid="start-analysis-btn"
              type="submit"
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-12 py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Analysis'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}