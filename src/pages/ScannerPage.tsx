import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { QrCode, X, Camera, AlertCircle } from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Handle the decoded text
        // If it's a URL in our origin, navigate to it
        if (decodedText.startsWith(window.location.origin)) {
          const path = decodedText.replace(window.location.origin, '');
          scanner.clear().then(() => {
            navigate(path);
          });
        } else {
          // It's an external link or data
          alert(`Scanned: ${decodedText}`);
        }
      },
      (errorMessage) => {
        // parse error, ignore for now
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner:", err));
    };
  }, [navigate]);

  return (
    <div className="min-h-full bg-bg-primary p-4 flex flex-col items-center justify-center gap-6">
      <div className="w-full max-w-md bg-bg-secondary rounded-[32px] border border-border-primary overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border-primary flex items-center justify-between bg-bg-panel/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
              <QrCode className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-text-primary">QR_SCANNER</h1>
              <p className="text-[8px] font-mono text-text-secondary uppercase">Link_Verification_Active</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-bg-primary border border-border-primary rounded-xl text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div id="reader" className="rounded-2xl overflow-hidden border border-border-primary shadow-inner"></div>
          
          <div className="mt-6 space-y-4">
             <div className="flex items-start gap-3 p-4 bg-bg-primary rounded-2xl border border-border-primary">
                <Camera className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-secondary leading-relaxed uppercase font-mono">
                   Scan building QR codes to instant access tactical maps, guest HUDs, or staff directives.
                </p>
             </div>
             
             {error && (
               <div className="flex items-center gap-3 p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-status-danger">
                 <AlertCircle className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase">{error}</span>
               </div>
             )}
          </div>
        </div>

        <div className="p-4 bg-bg-panel/30 text-center border-t border-border-primary">
           <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-text-secondary opacity-50">Secure_Optical_Link_v2.1</span>
        </div>
      </div>
      
      <p className="text-[10px] text-text-secondary font-mono uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Camera_Access_Requested
      </p>
    </div>
  );
}
