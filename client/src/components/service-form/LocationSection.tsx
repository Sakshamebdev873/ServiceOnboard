import { Loader2, Map, MapPin } from "lucide-react";
import type {FormErrors, ServiceCenter } from "../../types/ServiceFormData";

interface Props {
  formData: ServiceCenter;
  errors: FormErrors;
  status: { locating: boolean; fetchingAddress: boolean };
  onGetLocation: () => void;
  onAutoFill: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationSection = ({ formData, errors, status, onGetLocation, onAutoFill, onChange }: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Location & Address</h3>
      
      {/* Lat/Long Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
          <input 
            type="text" 
       onPaste={(e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    onChange({
      target: { name: "latitude", value: pasted }
    } as React.ChangeEvent<HTMLInputElement>);
  }}
            value={formData.latitude} 
            placeholder="Latitude" 
            className="w-full border p-2 rounded bg-gray-50 text-gray-500" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
          <input 
            type="text" 
     onPaste={(e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    onChange({
      target: { name: "longitude", value: pasted }
    } as React.ChangeEvent<HTMLInputElement>);
  }}
            value={formData.longitude} 
            placeholder="Longitude" 
            className="w-full border p-2 rounded bg-gray-50 text-gray-500" 
          />
        </div>
      </div>
      
      {/* Location Error Message */}
      {errors.location && <p className="text-red-500 text-sm font-medium">{errors.location}</p>}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          type="button" 
          onClick={onGetLocation} 
          disabled={status.locating} 
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400 transition"
        >
          {status.locating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}
          {status.locating ? "Fetching..." : "Use My Location"}
        </button>

        {formData.latitude && (
          <button 
            type="button" 
            onClick={onAutoFill} 
            disabled={status.fetchingAddress} 
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            {status.fetchingAddress ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Map className="mr-2 h-4 w-4" />}
            Auto-fill Address
          </button>
        )}
      </div>

      {/* Address Fields with Validation UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input 
            type="text" 
            name="city" 
            value={formData.city} 
            onChange={onChange} 
            className={`w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.city ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input 
            type="text" 
            name="state" 
            value={formData.state} 
            onChange={onChange} 
            className={`w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.state ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input 
            type="text" 
            name="zipCode" 
            value={formData.zipCode} 
            onChange={onChange} 
            maxLength={6}
            className={`w-full border p-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.zipCode ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
        </div>

        {/* Country (Fixed) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input 
            type="text" 
            value="India" 
            readOnly 
            className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" 
          />
        </div>
      </div>
    </div>
  );
};