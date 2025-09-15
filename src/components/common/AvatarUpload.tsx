import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File) => void;
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onAvatarChange, 
  className = '' 
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onAvatarChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  const displayImage = preview || currentAvatar;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative w-32 h-32 rounded-full border-4 border-dashed cursor-pointer transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
          <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Clear button */}
      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearPreview();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Clique ou arraste uma imagem
      </p>
    </div>
  );
};

export default AvatarUpload;