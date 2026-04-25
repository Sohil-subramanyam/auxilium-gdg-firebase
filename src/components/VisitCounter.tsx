import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getVisitorCount, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function VisitCounter() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    getVisitorCount().then(c => {
      setCount(c);
      setLoading(false);
    });

    // Real-time listener for the global stats document
    const statsRef = doc(db, 'stats', 'global');
    const unsubscribe = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setCount(docSnap.data().visitCount || 0);
      }
    }, (error) => {
      console.error("Error listening to visitor stats:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Users className="w-3 h-3 text-accent-primary" />
        <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">Visitor_Count</span>
      </div>
      <div className="text-lg font-mono font-bold text-accent-primary flex items-baseline gap-2">
        {loading ? (
          <span className="animate-pulse opacity-50">--</span>
        ) : (
          count.toLocaleString()
        )}
        <span className="text-[10px] text-text-secondary">UNITS</span>
      </div>
    </div>
  );
}
