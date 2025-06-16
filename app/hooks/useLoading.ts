import { useState, useEffect } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  minLoadingTime?: number;
}

export const useLoading = ({ 
  initialLoading = true, 
  minLoadingTime = 2000 
}: UseLoadingOptions = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime] = useState(Date.now());

  const finishLoading = () => {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      setIsLoading(false);
    }, remainingTime);
  };

  const startLoading = () => {
    setIsLoading(true);
  };

  return {
    isLoading,
    finishLoading,
    startLoading,
    setIsLoading
  };
};