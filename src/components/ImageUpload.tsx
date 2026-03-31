import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';

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
  
  const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-500 group-hover:text-green-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-green-400 mb-1">{label}</label>
      <div
        className="group mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-green-500 border-dashed rounded-md cursor-pointer hover:border-green-400 transition-colors bg-gray-800 hover:bg-gray-700"
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
          <img src={preview} alt="Preview" className="max-h-40 rounded-md object-contain" />
        ) : (
          <div className="space-y-1 text-center py-4">
            <UploadIcon />
            <div className="flex text-sm text-gray-400 group-hover:text-gray-300">
              <p className="pl-1">Drag & drop or click to upload</p>
            </div>
            <p className="text-xs text-gray-500 group-hover:text-gray-400">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      
      {isCropping && uncroppedImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col p-6 border-2 border-green-500">
            <h2 className="text-xl font-bold text-green-300 mb-4">Crop Your Image</h2>
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
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={handleCancelCrop} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">Cancel</button>
              <button onClick={handleApplyCrop} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-black font-semibold rounded-md transition-colors">Apply Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
