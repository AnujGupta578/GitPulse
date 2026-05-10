"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Repository {
  id: string;
  name: string;
  owner: string;
  provider: string;
  isPrivate: boolean;
  language: string | null;
  description: string | null;
  defaultBranch: string;
  connectionStatus: string;
  lastSyncedAt: string | null;
  url: string;
  branches: { name: string }[];
  syncJobs: { status: string; startedAt: string }[];
}

interface Stats { total: number; connected: number; syncing: number; }

// ── Icon helpers ──────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C#": "#178600",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#FA7343",
};

function langColor(lang: string | null) {
  return lang ? (LANG_COLORS[lang] ?? "#6b7280") : "#6b7280";
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function statusColor(s: string) {
  return s === "CONNECTED" ? "var(--success)" : s === "FAILED" ? "#ef4444" : "var(--accent-cyan)";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function RepoSkeleton() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)",
      borderRadius: "12px", padding: "1.5rem",
      animation: "pulse 1.5s ease-in-out infinite"
    }}>
      {[80, 50, 120, 60].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? "18px" : "12px", width: `${w}%`,
          background: "rgba(255,255,255,0.06)", borderRadius: "4px",
          marginBottom: i < 3 ? "12px" : 0
        }} />
      ))}
    </div>
  );
}

// ── Repo Card ─────────────────────────────────────────────────────────────────
function RepoCard({ repo, onSelect }: { repo: Repository; onSelect: (r: Repository) => void }) {
  const isConnected = repo.connectionStatus === "CONNECTED";
  const lastJob = repo.syncJobs[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,242,255,0.08)" }}
      style={{
        background: isConnected ? "rgba(0,242,255,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isConnected ? "rgba(0,242,255,0.3)" : "var(--glass-border)"}`,
        borderRadius: "12px", padding: "1.5rem", cursor: "pointer",
        transition: "border-color 0.2s", position: "relative", overflow: "hidden"
      }}
      onClick={() => onSelect(repo)}
    >
      {/* Provider badge */}
      <div style={{
        position: "absolute", top: "1rem", right: "1rem",
        display: "flex", alignItems: "center", gap: "0.4rem",
        fontSize: "0.7rem", color: "var(--text-secondary)"
      }}>
        <GithubIcon />
        {repo.isPrivate ? "Private" : "Public"}
      </div>

      {/* Name + owner */}
      <div style={{ marginBottom: "0.75rem", paddingRight: "5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
          {repo.owner}/{repo.name}
        </div>
        {repo.description && (
          <div style={{
            fontSize: "0.8rem", color: "var(--text-secondary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {repo.description}
          </div>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        {repo.language && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: langColor(repo.language), display: "inline-block" }} />
            {repo.language}
          </span>
        )}
        <span>⎇ {repo.defaultBranch}</span>
        <span>{repo.branches.length} branch{repo.branches.length !== 1 ? "es" : ""}</span>
        <span>{timeAgo(repo.lastSyncedAt)}</span>
      </div>

      {/* Status + action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em",
          color: statusColor(repo.connectionStatus),
          padding: "0.2rem 0.6rem", borderRadius: "20px",
          background: `${statusColor(repo.connectionStatus)}18`
        }}>
          {repo.connectionStatus}
          {lastJob?.status === "RUNNING" && " · Syncing…"}
        </span>

        <button
          onClick={e => { e.stopPropagation(); onSelect(repo); }}
          style={{
            padding: "0.35rem 0.9rem", borderRadius: "6px", fontSize: "0.78rem",
            fontWeight: 600, border: "none", cursor: "pointer",
            background: isConnected ? "rgba(0,242,255,0.15)" : "var(--accent-cyan)",
            color: isConnected ? "var(--accent-cyan)" : "var(--bg-primary)"
          }}
        >
          {isConnected ? "Manage" : "Select"}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("");
  const [language, setLanguage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Detect ?syncing=true from OAuth redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("syncing") === "true") {
        setSyncing(true);
        // Poll until repos appear
        const interval = setInterval(() => {
          fetchRepos(1).then(total => {
            if (total > 0) { setSyncing(false); clearInterval(interval); }
          });
        }, 2000);
        setTimeout(() => { clearInterval(interval); setSyncing(false); }, 30000);
      }
    }
  }, []);

  const fetchRepos = useCallback(async (p: number) => {
    try {
      const qs = new URLSearchParams({
        page: String(p), limit: "30",
        ...(search && { search }),
        ...(visibility && { visibility }),
        ...(language && { language })
      });
      const res = await fetch(`${API}/api/repositories?${qs}`);
      if (!res.ok) throw new Error("Failed to fetch repositories");
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch");
      
      setRepos(result.data || []);
      if (result.meta?.pagination) {
        setTotalPages(result.meta.pagination.pages || 1);
        return result.meta.pagination.total as number;
      }
      return 0;
    } catch {
      setError("Could not reach backend. Is it running?");
      return 0;
    } finally {
      setLoading(false);
    }
  }, [search, visibility, language]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/repositories/stats`);
      const result = await res.json();
      if (result.success) setStats(result.data);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRepos(page);
    fetchStats();
  }, [fetchRepos, fetchStats, page]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchRepos(1); }, 400);
    return () => clearTimeout(t);
  }, [search, visibility, language]);

  const handleSync = async () => {
    setSyncing(true);
    await fetch(`${API}/api/repositories/sync`, { method: "POST" });
    setTimeout(() => { setSyncing(false); fetchRepos(1); fetchStats(); }, 3000);
  };

  const handleSelect = (repo: Repository) => {
    // Navigate to the repository workspace
    window.location.href = `/workspace/${repo.id}`;
  };

  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Repositories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {stats ? `${stats.total} repos · ${stats.connected} connected · ${stats.syncing} syncing` : "Loading stats…"}
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none",
            background: syncing ? "rgba(0,242,255,0.15)" : "var(--accent-cyan)",
            color: syncing ? "var(--accent-cyan)" : "var(--bg-primary)",
            fontWeight: 700, cursor: syncing ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem"
          }}
        >
          {syncing ? (
            <>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>↻</span>
              Syncing…
            </>
          ) : "↻ Sync Repos"}
        </button>
      </div>

      {/* Syncing banner */}
      <AnimatePresence>
        {syncing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "rgba(0,242,255,0.08)", border: "1px solid rgba(0,242,255,0.3)",
              borderRadius: "10px", padding: "1rem 1.5rem", marginBottom: "1.5rem",
              display: "flex", alignItems: "center", gap: "1rem"
            }}
          >
            <span style={{ fontSize: "1.2rem", animation: "spin 1s linear infinite", display: "inline-block" }}>↻</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>Discovering repositories from GitHub…</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>This may take a few seconds. The list will update automatically.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search repositories…"
          style={{
            flex: 1, minWidth: "200px", padding: "0.65rem 1rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
            borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.9rem",
            outline: "none"
          }}
        />
        <select
          value={visibility}
          onChange={e => setVisibility(e.target.value)}
          style={{
            padding: "0.65rem 1rem", background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--glass-border)", borderRadius: "8px",
            color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer"
          }}
        >
          <option value="">All visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        {languages.length > 0 && (
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              padding: "0.65rem 1rem", background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)", borderRadius: "8px",
              color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer"
            }}
          >
            <option value="">All languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem",
          color: "#ef4444", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span>{error}</span>
          <button onClick={() => fetchRepos(page)} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "0.35rem 0.9rem", borderRadius: "6px", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {Array.from({ length: 9 }).map((_, i) => <RepoSkeleton key={i} />)}
        </div>
      ) : repos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>No repositories found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {search ? "Try a different search term." : "Connect a GitHub account to discover repositories."}
          </p>
          {!search && (
            <a href="/connections" style={{ padding: "0.75rem 1.5rem", background: "var(--accent-cyan)", color: "var(--bg-primary)", borderRadius: "8px", fontWeight: 700, textDecoration: "none" }}>
              Connect GitHub
            </a>
          )}
        </div>
      ) : (
        <>
          <motion.div
            layout
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}
          >
            <AnimatePresence>
              {repos.map(repo => (
                <RepoCard key={repo.id} repo={repo} onSelect={handleSelect} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
              >← Prev</button>
              <span style={{ padding: "0.5rem 1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
              >Next →</button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
