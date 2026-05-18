"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

interface Branch {
  id: string;
  name: string;
  sha: string;
  isDefault: boolean;
  syncStatus: string;
}

interface RepositoryContextType {
  repoId: string | null;
  branch: string;
  setBranch: (branch: string) => void;
  compareBranch: string | null;
  setCompareBranch: (branch: string | null) => void;
  branches: Branch[];
  isLoading: boolean;
  refresh: () => void;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const repoIdRaw = params.repoId as string;
  const repoId = repoIdRaw === "_" || repoIdRaw === "undefined" ? null : repoIdRaw || null;
  
  const [branch, setBranchState] = useState(searchParams.get("branch") || "main");
  const [compareBranch, setCompareBranchState] = useState<string | null>(searchParams.get("compare") || null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = () => setRefreshTick(t => t + 1);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!repoId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/branches`);
        const result = await res.json();
        if (result.success) {
          setBranches(result.data);
          // If current branch not in list, fallback to default
          if (!searchParams.get("branch")) {
            const defaultBranch = result.data.find((b: Branch) => b.isDefault)?.name;
            if (defaultBranch && defaultBranch !== branch) {
              setBranch(defaultBranch);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, [repoId, refreshTick]);

  // Sync state with URL
  useEffect(() => {
    const urlBranch = searchParams.get("branch");
    const urlCompare = searchParams.get("compare");
    
    if (urlBranch && urlBranch !== branch) setBranchState(urlBranch);
    if (urlCompare !== compareBranch) setCompareBranchState(urlCompare);
  }, [searchParams]);

  const setBranch = (newBranch: string) => {
    setBranchState(newBranch);
    updateUrl(newBranch, compareBranch);
  };

  const setCompareBranch = (newCompare: string | null) => {
    setCompareBranchState(newCompare);
    updateUrl(branch, newCompare);
  };

  const updateUrl = (b: string, c: string | null) => {
    const params = new URLSearchParams(window.location.search);
    params.set("branch", b);
    if (c) params.set("compare", c);
    else params.delete("compare");
    
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  return (
    <RepositoryContext.Provider value={{ 
      repoId, 
      branch, 
      setBranch, 
      compareBranch, 
      setCompareBranch, 
      branches, 
      isLoading,
      refresh
    }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return context;
}
