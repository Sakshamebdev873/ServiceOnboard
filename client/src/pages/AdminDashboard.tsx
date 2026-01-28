import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Calendar, LogOut, Map as MapIcon, Grid, ChevronRight } from 'lucide-react';

import ServiceMap from '../components/ServiceMap';
import Pagination from '../components/Pagination';
import ServiceCenterModal from '../components/ServiceCenterModal';
import type { ServiceCenterResponse } from '../types/ServiceFormData'; // Adjust path if needed

const ITEMS_PER_PAGE = 8; // We can show more items per page in a list view

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<ServiceCenterResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenterResponse | null>(null);

  useEffect(() => {
    // ... (fetch data logic remains the same)
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://serviceonboard.onrender.com/api/service-center'}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data: ServiceCenterResponse[] = await response.json();
        setCenters(data);
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);
  
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCenters = centers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleOpenModal = (center: ServiceCenterResponse) => setSelectedCenter(center);
  const handleCloseModal = () => setSelectedCenter(null);
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin');
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-2 md:px-8">
        {/* ... (Navbar remains the same) ... */}
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

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            {/* ... (Header and view toggles remain the same) ... */}
            <div className='pl-2'>
            <h2 className="text-2xl font-bold text-slate-800">Service Centers</h2>
            <p className="text-slate-500">Total active locations: {centers.length}</p>
          </div>
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-sm w-fit self-start sm:self-auto">
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

        {viewMode === 'map' ? (
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <ServiceMap locations={centers} />
          </div>
        ) : (
          <>
            {/* --- NEW LIST VIEW CONTAINER --- */}
            <div className="space-y-3">
              {currentCenters.map((center) => (
                <button 
                  key={center.id} 
                  onClick={() => handleOpenModal(center)}
                  className="w-full text-left bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4 hover:shadow-md hover:border-blue-500 transition-all duration-200"
                >
                  {/* --- Left Section: Primary Info --- */}
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{center.centerName}</p>
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">{center.city}, {center.state}</span>
                    </div>
                  </div>

                  {/* --- Middle Section: Secondary Info (Responsive) --- */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 flex-shrink-0">
                    <Phone size={14} />
                    <span>{center.phone}</span>
                  </div>

                  <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600 min-w-0 flex-shrink-0">
                    <Mail size={14} />
                    <span className="truncate">{center.email}</span>
                  </div>
                  
                  {/* --- Right Section: Date & Action --- */}
                  <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 flex-shrink-0">
                    <Calendar size={14} />
                    <span>{new Date(center.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalItems={centers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
      
      <ServiceCenterModal center={selectedCenter} onClose={handleCloseModal} />
    </div>
  );
};

export default AdminDashboard;