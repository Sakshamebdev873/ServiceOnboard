import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Calendar, LogOut, Map as MapIcon, Grid } from 'lucide-react';
import ServiceMap from '../components/ServiceMap';
import type { ServiceCenter } from '../types/ServiceFormData';


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  useEffect(() => {
    // 1. Check Auth
    const isAuth = localStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      navigate('/admin');
      return;
    }

    // 2. Fetch Data
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/'}`);       
        if (!response.ok) throw new Error('Network response was not ok');
        const data: ServiceCenter[] = await response.json();
        setCenters(data);
      } catch (error) {
        alert("Unable to load service centers");
        console.error("Failed to fetch centers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">
            Admin<span className="text-blue-600">Dashboard</span>
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Service Centers</h2>
            <p className="text-slate-500">Total active locations: {centers.length}</p>
          </div>

          <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-sm w-fit self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid size={16} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapIcon size={16} /> Map
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {viewMode === 'map' ? (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <ServiceMap locations={centers} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <div key={center.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
                
                {/* Image */}
                <div className="h-48 bg-slate-200 w-full relative">
                  {center.imagePaths && center.imagePaths.length > 0 ? (
                    <img src={center.imagePaths[0]} alt={center.centerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{center.centerName}</h3>
                  
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    <span className="truncate">{center.city}, {center.state}</span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-6 flex-1">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {center.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="truncate">{center.email}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {center.categories?.slice(0, 3).map((cat : any, i : any) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
                        {cat}
                      </span>
                    ))}
                    {center.categories && center.categories.length > 3 && (
                       <span className="text-xs text-slate-400 py-1">+{center.categories.length - 3}</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created: {new Date(center.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;