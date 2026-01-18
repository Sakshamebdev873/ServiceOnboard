import { Loader2 } from "lucide-react";
import { useServiceForm } from "../hooks/useServiceForm";
import { BasicDetails } from "./service-form/BasicDetails";
import { LocationSection } from "./service-form/LocationSection";
import { CategorySelector } from "./service-form/CategorySelector";
import { ImageUploader } from "./service-form/ImageUploader";

const Form = () => {
  const {
    formData, errors, previews, status,
    handleChange, handleCategoryChange, handleImageChange, removeImage,
    handleGetLocation, handleAutoFillAddress, handleSubmit
  } = useServiceForm();

  return (
    <div className="min-h-screen rounded-2xl bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-4 lg:p-8">
        <h2 className="text-2xl font-bold mb-6">Service Onboarding</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicDetails 
            formData={formData} 
            errors={errors} 
            onChange={handleChange} 
          />
          
          <hr />
          
          <LocationSection 
            formData={formData} 
            errors={errors} 
            status={status}
            onGetLocation={handleGetLocation}
            onAutoFill={handleAutoFillAddress}
            onChange={handleChange}
          />

          <hr />

          <CategorySelector 
            selected={formData.categories} 
            error={errors.categories} 
            onChange={handleCategoryChange} 
          />

          <hr />

          <ImageUploader 
            previews={previews} 
            error={errors.images} 
            onChange={handleImageChange} 
            onRemove={removeImage} 
          />

          <button
            type="submit"
            disabled={status.submitting}
            className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {status.submitting ? (
              <><Loader2 className="animate-spin mr-2" /> Submitting...</>
            ) : "Submit Form"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;