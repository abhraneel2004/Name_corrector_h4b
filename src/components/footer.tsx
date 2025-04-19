'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="rounded-md">
              <img src="./sq_logo.png" alt="Logo" className="h-40 w-40" />
            </div>
          </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Name Validation</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Batch Processing</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">AI Analysis</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Data Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Examples</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Icons.mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href="mailto:support@indiannamecorrector.com" className="text-muted-foreground hover:text-primary transition-colors">
                  support@indiannamecorrector.com
                </a>
              </li>
              <li className="flex items-center">
                <Icons.home className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">New Delhi, India</span>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Indian Name Corrector. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 