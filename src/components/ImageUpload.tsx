import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import Button from '@/components/common/Button';
import { useTheme } from '@/context/ThemeContext';

interface ImageUploadProps {
  onImageUpload: (base64Image: string) => void;
  label?: string;
}

// Function to generate cropped image from the full-resolution source
function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // The crop object from react-image-crop is in pixels relative to the displayed image size.
  // We scale it to the original image dimensions to perform a lossless crop.
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return Promise.reject(new Error('Failed to get 2D context'));
  }

  // Draw the cropped portion of the original image onto the canvas
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve) => {
    // Return a high-quality PNG as a base64 string
    resolve(canvas.toDataURL('image/png', 1.0));
  });
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, label = "Upload Inspiration Image" }) => {
  const { uiMode } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for cropping modal
  const [uncroppedImageSrc, setUncroppedImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, GIF, etc.).');
        setPreview(null);
        onImageUpload(''); 
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Please upload an image under 5MB.');
        setPreview(null);
        onImageUpload('');
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUncroppedImageSrc(base64String);
        setIsCropping(true); // Open the cropping modal
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
        setUncroppedImageSrc(null);
        onImageUpload('');
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    // Center the initial crop selection
    const initialCrop: Crop = {
      unit: 'px', // react-image-crop works with pixels
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.8,
    };
    setCrop(initialCrop);
  };
  
  const handleApplyCrop = async () => {
    if (imageRef.current && crop && crop.width && crop.height) {
      try {
        const croppedImageUrl = await getCroppedImg(imageRef.current, crop);
        setPreview(croppedImageUrl);
        onImageUpload(croppedImageUrl);
        setIsCropping(false);
        setUncroppedImageSrc(null);
      } catch (e) {
        console.error(e);
        setError('Could not crop the image.');
        setIsCropping(false);
        setUncroppedImageSrc(null);
      }
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setUncroppedImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input to allow re-uploading the same file
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10 text-green-500 group-hover:text-green-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );

  return (
    <div className="w-full">
      <label className={`block text-xs font-black uppercase tracking-widest mb-1 ${uiMode === 'architect' ? 'text-gray-500' : 'text-green-400'}`}>{label}</label>
      <div
        className={`group mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-all shadow-inner
          ${uiMode === 'architect' 
            ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/20' 
            : 'border-green-500 bg-slate-100 dark:bg-gray-800 hover:border-green-400 hover:bg-slate-200 dark:hover:bg-gray-700'}`}
        onClick={handleUploadClick}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
             if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                fileInputRef.current.dispatchEvent(event);
            }
          }
        }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          id="file-upload"
          aria-label="Upload inspiration image"
        />
        {preview ? (
          <img src={preview} alt="Preview" className={`max-h-40 rounded-lg object-contain ${uiMode === 'architect' ? 'shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all' : 'shadow-2xl'}`} />
        ) : (
          <div className="flex flex-row items-center gap-6 py-6 px-4">
            <UploadIcon className={`w-12 h-12 flex-shrink-0 transition-colors ${uiMode === 'architect' ? 'text-emerald-500 group-hover:text-emerald-400' : 'text-green-600 dark:text-green-500 group-hover:text-green-500 dark:group-hover:text-green-400'}`} />
            <div className="flex flex-col items-start text-left">
              <p className={`text-sm font-black uppercase tracking-widest transition-colors ${uiMode === 'architect' ? 'text-gray-400 group-hover:text-white' : 'text-gray-800 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>Drag & drop or click</p>
              <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${uiMode === 'architect' ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      
      {isCropping && uncroppedImageSrc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className={`${uiMode === 'architect' ? 'glass-card border-white/10 p-8 max-w-4xl h-[90vh]' : 'bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] border-2 border-green-500'} flex flex-col`}>
            <h2 className={`text-xl font-black uppercase tracking-tight mb-4 ${uiMode === 'architect' ? 'text-white' : 'text-green-300'}`}>Crop Your Image</h2>
            <div className="flex-grow min-h-0 flex justify-center items-center">
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    className="max-h-full max-w-full"
                >
                    <img
                        src={uncroppedImageSrc}
                        onLoad={onImageLoad}
                        alt="Image to crop"
                        style={{ maxHeight: 'calc(90vh - 12rem)', objectFit: 'contain' }}
                    />
                </ReactCrop>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={handleCancelCrop} variant="ghost" className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white border-white/10 hover:bg-white/5 shadow-none">Cancel</Button>
              <Button onClick={handleApplyCrop} variant="primary" backgroundColor="#10b981" className="px-10 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20">Apply Crop</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
