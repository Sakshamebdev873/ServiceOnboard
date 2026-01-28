import { Loader2 } from "lucide-react";
import { useServiceForm } from "../hooks/useServiceForm";
import { BasicDetails } from "./service-form/BasicDetails";
import { LocationSection } from "./service-form/LocationSection";
import { CategorySelector } from "./service-form/CategorySelector";
import { ImageUploader } from "./service-form/ImageUploader";

const ServiceOnboardForm = () => { // Renamed component for clarity if used as a page
  const {
    formData, errors, previews, status,
    handleChange, handleCategoryChange, handleImageChange, removeImage,
    handleGetLocation, handleAutoFillAddress, handleSubmit
  } = useServiceForm();

  return (
    // 1. Minimized vertical padding (py-0) and set white background for the whole screen
    <div className="min-h-screen bg-white">
      {/* 2. Minimized horizontal padding (px-2) on mobile, centered max-width container */}
      <div className="max-w-3xl mx-auto px-2 sm:px-4"> 
        
        {/* 3. Main white container, removed shadow/border for minimalist feel, kept necessary padding */}
        <div className="bg-white pl-2 py-4 lg:p-6"> 
          
          <h2 className="text-2xl font-bold mb-6 text-gray-900 pt-4">Service Onboarding</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6"> {/* 4. Reduced overall vertical spacing */}
            
            {/* Components are assumed to manage their internal padding */}
            <BasicDetails 
              formData={formData} 
              errors={errors} 
              onChange={handleChange} 
            />
            
            <hr className="border-gray-100" />
            
            <LocationSection 
              formData={formData} 
              errors={errors} 
              status={status}
              onGetLocation={handleGetLocation}
              onAutoFill={handleAutoFillAddress}
              onChange={handleChange}
            />

            <hr className="border-gray-100" />

            <CategorySelector 
              selected={formData.categories} 
              error={errors.categories} 
              onChange={handleCategoryChange} 
            />

            <hr className="border-gray-100" />

            <ImageUploader 
              previews={previews} 
              error={errors.imagePaths} // Assuming you updated the hook to use imagePaths
              onChange={handleImageChange} 
              onRemove={removeImage} 
            />

            <div className="pt-4"> {/* Added padding top before the submit button */}
              <button
                type="submit"
                disabled={status.submitting}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 transition"
              >
                {status.submitting ? (
                  <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Submitting...</>
                ) : "Submit Service Center"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceOnboardForm;