'use client';

import { useEffect } from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  // Handle browser extension attributes on client side
  useEffect(() => {
    // Function to clean Grammarly and other browser extension attributes
    const cleanBodyAttributes = () => {
      // Get all body attributes
      const bodyAttributes = document.body.attributes;
      const attributesToRemove = [];
      
      // Find attributes added by browser extensions
      for (let i = 0; i < bodyAttributes.length; i++) {
        const attr = bodyAttributes[i];
        // Match Grammarly attributes
        if (attr.name.startsWith('data-gr-') || 
            attr.name.includes('-gr-') ||
            // Match other common extension attributes
            attr.name.startsWith('data-ext-') ||
            attr.name.includes('extension')) {
          attributesToRemove.push(attr.name);
        }
      }
      
      // Remove identified attributes
      attributesToRemove.forEach(attrName => {
        document.body.removeAttribute(attrName);
      });
    };

    // Run immediately
    cleanBodyAttributes();
    
    // Also set up a MutationObserver to handle attributes that might be added after initial load
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          cleanBodyAttributes();
        }
      });
    });
    
    // Start observing the body for attribute changes
    observer.observe(document.body, { attributes: true });
    
    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);
  
  return <>{children}</>;
} 