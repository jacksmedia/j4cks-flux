import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="text-white after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px" 
    style={{position:'fixed', top:0}} >
      <div className="mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Logo/Brand & Mobile menu button */}
           <button
              type="button" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600"
              style={{borderRadius: '5px', borderWidth:'2px', borderStyle:'outset', borderColor:'#000'}}
              aria-label="Toggle menu"
            > 
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>


          {/* links on bar */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            
           
          </div>
        </div>
      </div>

      {/* Menu options */}
      {isMenuOpen && (
        <div className="bg-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/patchers"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Patchers
            </Link>
            <Link
              to="/guides"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Guides
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}