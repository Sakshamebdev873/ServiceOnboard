import React from 'react';
import { X, MapPin, Phone, Mail, Tag } from 'lucide-react';
import type { ServiceCenterResponse } from '../types/ServiceFormData'; // Adjust path if needed

interface ModalProps {
  center: ServiceCenterResponse | null;
  onClose: () => void;
}

const ServiceCenterModal: React.FC<ModalProps> = ({ center, onClose }) => {
  if (!center) return null;

  return (
   <div 
  className="fixed inset-0 bg-transparent bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4" // <-- ADDED backdrop-blur-sm
  onClick={onClose}
>
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{center.centerName}</h2>
        <div className="flex items-center text-slate-500 text-sm mb-6">
          <MapPin size={16} className="mr-2 text-blue-500" />
          {`${center.city}, ${center.state} - ${center.zipCode}`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div className="flex items-center">
            <Phone size={16} className="mr-3 text-slate-400" />
            <span className="text-slate-700">{center.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail size={16} className="mr-3 text-slate-400" />
            <span className="text-slate-700 truncate">{center.email}</span>
          </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center"><Tag size={14} className="mr-2"/> Categories</h3>
            <div className="flex flex-wrap gap-2">
                {center.categories.map((cat, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full border border-slate-200">
                        {cat}
                    </span>
                ))}
            </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-2">Images</h3>
          {center.imagePaths && center.imagePaths.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* --- UPDATED IMAGE GALLERY --- */}
              {center.imagePaths.map((path, index) => (
                <a
                  key={index}
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border border-slate-200 group"
                >
                  <img 
                    src={path} 
                    alt={`${center.centerName} - Image ${index + 1}`} 
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No images available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCenterModal;