"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

interface RepositoryContextType {
  repoId: string | null;
  branch: string;
  setBranch: (branch: string) => void;
  isLoading: boolean;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const repoIdRaw = params.repoId as string;
  const repoId = repoIdRaw === "_" || repoIdRaw === "undefined" ? null : repoIdRaw || null;
  const [branch, setBranchState] = useState(searchParams.get("branch") || "main");
  const [isLoading, setIsLoading] = useState(false);

  // Sync branch state with URL
  useEffect(() => {
    const urlBranch = searchParams.get("branch");
    if (urlBranch && urlBranch !== branch) {
      setBranchState(urlBranch);
    }
  }, [searchParams]);

  const setBranch = (newBranch: string) => {
    setBranchState(newBranch);
    // Update URL without full reload
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?branch=${newBranch}`);
  };

  return (
    <RepositoryContext.Provider value={{ repoId, branch, setBranch, isLoading }}>
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
