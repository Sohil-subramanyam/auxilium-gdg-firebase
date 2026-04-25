import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role: UserRole, username: string) => void;
  onCancel: () => void;
}

export default function LoginPage({ onLogin, onCancel }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const staffMembers = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5'];
      const admins = ['admin1', 'admin2'];

      if (admins.includes(username) && password === username) {
        onLogin('Admin', username);
      } else if (staffMembers.includes(username) && password === username) {
        onLogin('Staff', username);
      } else if (username === 'admin' && password === 'admin') {
        onLogin('Admin', username);
      } else if (username === 'staff' && password === 'staff') {
        onLogin('Staff', username);
      } else {
        setError('Invalid credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-bg-primary/80 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="cyber-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="cyber-corner corner-tl" />
        <div className="cyber-corner corner-tr" />
        <div className="cyber-corner corner-bl" />
        <div className="cyber-corner corner-br" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center border border-accent-primary/30 mb-4">
            <Shield className="w-8 h-8 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-text-primary uppercase italic">
            SYSTEM<span className="text-accent-primary">_AUTH</span>
          </h2>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.3em] mt-2">Secure Terminal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary/50" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary px-10 py-3 text-sm font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                placeholder="ENTER_ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary/50" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary px-10 py-3 text-sm font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-accent-secondary text-[10px] font-mono font-bold uppercase"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-border-primary text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-accent-primary text-bg-primary px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Authorize'}
              {!isLoading && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-border-primary/30">
          <div className="flex justify-between items-center opacity-40">
            <span className="text-[8px] font-mono text-text-secondary uppercase">Encryption: AES-256</span>
            <span className="text-[8px] font-mono text-text-secondary uppercase">Status: Ready</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
