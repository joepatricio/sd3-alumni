import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackText?: string;
}

export function LazyImage({ src, alt, className, fallbackText = "Image unavailable", ...props }: LazyImageProps) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    if (error || !src) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">{fallbackText}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            {...props}
        />
    );
}
