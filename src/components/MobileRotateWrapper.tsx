import React, { useEffect } from 'react';

interface MobileRotateWrapperProps {
  isMobile: boolean;
}

export const MobileRotateWrapper: React.FC<MobileRotateWrapperProps> = ({ isMobile }) => {
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('video-page-mobile');
    } else {
      document.body.classList.remove('video-page-mobile');
    }

    return () => {
      document.body.classList.remove('video-page-mobile');
    };
  }, [isMobile]);

  return null;
};