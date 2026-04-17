import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
    previewUrl: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    placeholderText?: string;
}

export function ImageUpload({ previewUrl, onFileSelect, onClear, placeholderText = "Click or drag to upload" }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClear();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onFileSelect(file);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        } else if (file) {
            toast.error("Please upload an image file.");
        }
    };

    return (
        <div
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative",
                isDragging ? "border-brand-primary bg-brand-primary/10" : "border-gray-300 hover:border-brand-primary"
            )}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                style={{ display: 'none' }}
            />

            {previewUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <>
                    <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-brand-primary" : "text-gray-400")} />
                    <p className="text-sm text-gray-600 font-medium">{placeholderText}</p>
                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                </>
            )}
        </div>
    );
}
