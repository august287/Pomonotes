"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Custom404() {
  const router = useRouter();

  // For GitHub Pages compatibility
  useEffect(() => {
    // Check if we're on a path that might need redirection
    const path = window.location.pathname;
    const shouldRedirect = path.endsWith('/Pomonotes') || 
                          path === '/Pomonotes/' || 
                          !path.includes('/Pomonotes/');
    
    if (shouldRedirect) {
      router.push('/Pomonotes/');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
      <div className="mb-8">
        <img 
          src="/Pomonotes/images/gifs/skateboard.gif" 
          alt="Pompompurin Skateboarding" 
          className="max-w-xs rounded-lg shadow-lg"
        />
      </div>
      <Link href="/Pomonotes/">
        <Button className="pompompurin-button">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
