import { useEffect } from 'react';

interface PreloadImagesProps {
  images: string[];
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ images }) => {
  useEffect(() => {
    images.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach((link) => {
        if (images.includes((link as HTMLLinkElement).href)) {
          link.remove();
        }
      });
    };
  }, [images]);

  return null;
};

export default PreloadImages;