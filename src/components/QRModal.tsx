import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  title: string;
  subtitle?: string;
}

export default function QRModal({ isOpen, onClose, value, title, subtitle }: QRModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-bg-primary border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-sm relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-2 text-center mt-2">
              <div className="p-3 bg-accent-primary/10 rounded-2xl border border-accent-primary/20 mb-2">
                <QrCode className="w-6 h-6 text-accent-primary" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
              {subtitle && <p className="text-xs text-text-secondary uppercase tracking-widest">{subtitle}</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group">
              <QRCodeSVG 
                value={value}
                size={220}
                level="H"
                includeMargin={true}
              />
              <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div className="p-3 bg-bg-secondary/50 border border-white/5 rounded-xl text-center">
                 <p className="text-[10px] font-mono text-text-secondary break-all">{value}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => {
                     const svg = document.querySelector('.bg-white svg') as SVGElement;
                     const svgData = new XMLSerializer().serializeToString(svg);
                     const canvas = document.createElement("canvas");
                     const ctx = canvas.getContext("2d");
                     const img = new Image();
                     img.onload = () => {
                       canvas.width = img.width;
                       canvas.height = img.height;
                       ctx?.drawImage(img, 0, 0);
                       const pngFile = canvas.toDataURL("image/png");
                       const downloadLink = document.createElement("a");
                       downloadLink.download = "tactical-qr.png";
                       downloadLink.href = pngFile;
                       downloadLink.click();
                     };
                     img.src = "data:image/svg+xml;base64," + btoa(svgData);
                   }}
                   className="flex items-center justify-center gap-2 py-3 bg-accent-primary text-bg-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-95"
                 >
                   <Download className="w-4 h-4" />
                   Save
                 </button>
                 <button 
                   onClick={() => {
                     if (navigator.share) {
                       navigator.share({ title, text: subtitle, url: value });
                     } else {
                       navigator.clipboard.writeText(value);
                     }
                   }}
                   className="flex items-center justify-center gap-2 py-3 bg-bg-secondary border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-95"
                 >
                   <Share2 className="w-4 h-4" />
                   Share
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
