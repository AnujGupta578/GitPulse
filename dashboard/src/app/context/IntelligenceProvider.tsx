"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';

interface IntelligenceState {
  isSyncing: boolean;
  progress: number;
  currentStep: string;
  lastSync: Date | null;
  error: string | null;
}

interface IntelligenceContextType {
  state: IntelligenceState;
  triggerSync: (branch: string) => Promise<void>;
  refreshState: () => Promise<void>;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export function WorkspaceIntelligenceProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const repoId = params.repoId as string;
  const [state, setState] = useState<IntelligenceState>({
    isSyncing: false,
    progress: 0,
    currentStep: 'IDLE',
    lastSync: null,
    error: null,
  });

  const refreshState = async () => {
    if (!repoId || repoId === "_" || repoId === "undefined") return;
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/sync-jobs`);
      const result = await res.json();
      const jobsList = result.success ? (result.data || []) : [];
      const latestJob = jobsList[0];
      
      if (latestJob) {
        setState({
          isSyncing: latestJob.status === 'INDEXING' || latestJob.status === 'ANALYZING' || latestJob.status === 'RUNNING',
          progress: latestJob.progress || 0,
          currentStep: latestJob.currentStep || 'IDLE',
          lastSync: latestJob.completedAt ? new Date(latestJob.completedAt) : null,
          error: latestJob.error || null,
        });
      } else {
        setState(s => ({ ...s, isSyncing: false }));
      }
    } catch (e) {
      console.error("Failed to refresh intelligence state", e);
    }
  };

  const triggerSync = async (branch: string) => {
    if (!repoId || repoId === "_" || repoId === "undefined") return;
    try {
      await fetch(`http://localhost:8000/api/repositories/${repoId}/branches/${branch}/sync`, { method: 'POST' });
      refreshState();
    } catch (e) {
      setState(s => ({ ...s, error: "Failed to trigger sync" }));
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, [repoId]);

  return (
    <IntelligenceContext.Provider value={{ state, triggerSync, refreshState }}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const context = useContext(IntelligenceContext);
  if (context === undefined) {
    throw new Error('useIntelligence must be used within a WorkspaceIntelligenceProvider');
  }
  return context;
}
