import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { ServiceFormData, FormErrors } from "../types/ServiceFormData";
import { getCurrentPosition, reverseGeocode } from "../services/location";
import { submitServiceForm } from "../services/api";

const INITIAL_STATE: ServiceFormData = {
  centerName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  latitude: "",
  longitude: "",
  categories: [],
  imagePaths: [], 
};

// Define constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_TOTAL_IMAGES = 5;

export const useServiceForm = () => {
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState({
    locating: false,
    fetchingAddress: false,
    submitting: false,
  });

  const updateField = (name: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateField(e.target.name as keyof ServiceFormData, e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    const newCats = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category];
    updateField("categories", newCats);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Safety Check: Limit file size and count
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        alert("Some images are too large. Maximum size per image is 5MB.");
        return;
      }

      if (formData.imagePaths.length + files.length > MAX_TOTAL_IMAGES) {
        alert(`You can only upload a maximum of ${MAX_TOTAL_IMAGES} images.`);
        return;
      }

      setFormData(prev => ({ ...prev, imagePaths: [...prev.imagePaths, ...files] }));
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
      setErrors(prev => ({ ...prev, imagePaths: undefined }));
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(previews[index]);
    setFormData(prev => ({ ...prev, imagePaths: prev.imagePaths.filter((_, i) => i !== index) }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = async () => {
    setStatus(prev => ({ ...prev, locating: true }));
    setErrors(prev => ({ ...prev, location: undefined }));
    try {
      const pos = await getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, location: "Unable to retrieve location" }));
    } finally {
      setStatus(prev => ({ ...prev, locating: false }));
    }
  };

  const handleAutoFillAddress = async () => {
    if (!formData.latitude) return alert("Fetch coordinates first");
    setStatus(prev => ({ ...prev, fetchingAddress: true }));
    try {
      const address = await reverseGeocode(formData.latitude, formData.longitude);
      setFormData(prev => ({ ...prev, ...address }));
      setErrors(prev => ({ ...prev, city: undefined, state: undefined, zipCode: undefined }));
    } catch (error) {
      alert("Could not fetch address details");
    } finally {
      setStatus(prev => ({ ...prev, fetchingAddress: false }));
    }
  };
  
  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.centerName.trim()) newErrors.centerName = "Required";
    if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Invalid Phone";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid Email";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.state) newErrors.state = "Required";
    if (!/^\d{6}$/.test(formData.zipCode)) newErrors.zipCode = "Invalid Zip";
    if (!formData.latitude) newErrors.location = "Required";
    if (formData.categories.length === 0) newErrors.categories = "Select one";
    if (formData.imagePaths.length === 0) newErrors.imagePaths = "Upload one";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Safety 1: Don't submit if already submitting (Double-click prevention)
    if (status.submitting) return;

    if (!validate()) return alert("Please fix all errors before submitting.");

    setStatus(prev => ({ ...prev, submitting: true }));
    try {
      await submitServiceForm(formData);
      
      // Cleanup: Revoke all object URLs to avoid memory leaks
      previews.forEach(url => URL.revokeObjectURL(url));
      
      alert("Form submitted successfully!");
      setFormData(INITIAL_STATE);
      setPreviews([]);
    } catch (error: any) {
      console.error("Submission Error:", error);
      
      // Safety 2: Handle the "Unexpected Token" error clearly
      if (error.message.includes("Unexpected token") || error.message.includes("JSON")) {
        alert("The server is temporarily busy or your images were too large to process. Please try smaller files.");
      } else {
        alert(error.message || "An unknown error occurred.");
      }
    } finally {
      setStatus(prev => ({ ...prev, submitting: false }));
    }
  };

  return {
    formData, errors, previews, status,
    handleChange, handleCategoryChange, handleImageChange, removeImage,
    handleGetLocation, handleAutoFillAddress, handleSubmit
  };
};