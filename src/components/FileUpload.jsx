import { useState } from "react";
import axios from "axios";

const BASE_URL = "https://chat-api-vecx.onrender.com/api";

export default function FileUpload({ onFileUploaded, userId }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Check file size (50KB limit as per API docs)
    if (selectedFile && selectedFile.size > 50 * 1024) {
      setError("File size exceeds 50KB limit");
      setFile(null);
      e.target.value = null; // Reset the input
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", userId);
    
    try {
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      
      // Call the callback with the uploaded file data
      onFileUploaded(response.data);
      
      // Reset the component state
      setFile(null);
      setUploadProgress(0);
      
      // Reset the file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = null;
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error.response?.data?.message || 
        "Failed to upload file. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full ${
          isUploading ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </label>
      
      {file && !isUploading && (
        <div className="ml-2 flex items-center">
          <span className="text-sm text-gray-600 truncate max-w-[100px]">
            {file.name}
          </span>
          <button
            onClick={uploadFile}
            className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            Upload
          </button>
          <button
            onClick={() => {
              setFile(null);
              const fileInput = document.getElementById("file-upload");
              if (fileInput) fileInput.value = null;
            }}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}
      
      {isUploading && (
        <div className="ml-2 flex items-center">
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="ml-2 text-xs text-gray-600">{uploadProgress}%</span>
        </div>
      )}
      
      {error && (
        <div className="ml-2 text-xs text-red-500">{error}</div>
      )}
    </div>
  );
}