"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Edge as RFEdge,
  type Node as RFNode,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Network,
  Zap,
  Cpu,
  GitBranch,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  FileCode,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom node components
import TriggerNode from "./nodes/TriggerNode";
import ActionNode from "./nodes/ActionNode";
import DecisionNode from "./nodes/DecisionNode";
import IntegrationNode from "./nodes/IntegrationNode";

import { applyDagreLayout } from "./lib/layoutDagre";
import { NODE_COLORS } from "./lib/nodeColors";

const nodeTypes = {
  TRIGGER: TriggerNode,
  ACTION: ActionNode,
  DECISION: DecisionNode,
  INTEGRATION: IntegrationNode,
};

export default function ArchitecturePage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch } = useRepository();

  const [rawTopology, setRawTopology] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Active filters for node types
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["TRIGGER", "ACTION", "DECISION", "INTEGRATION"])
  );

  // Selected node for details panel
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Focus mode triggered by clicking a TriggerNode
  const [focusTriggerId, setFocusTriggerId] = useState<string | null>(null);

  // Detail panel connected nodes lists
  const [connectedSources, setConnectedSources] = useState<any[]>([]);
  const [connectedTargets, setConnectedTargets] = useState<any[]>([]);

  // Path-to-Test E2E Generation State
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [generatedTestResult, setGeneratedTestResult] = useState<any>(null);
  const [testGenerationError, setTestGenerationError] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<'playwright' | 'cypress'>('playwright');

  // Workflow Exporter State
  const [isExportingWorkflow, setIsExportingWorkflow] = useState(false);
  const [exportedWorkflowResult, setExportedWorkflowResult] = useState<any>(null);
  const [workflowExportError, setWorkflowExportError] = useState<string | null>(null);
  const [selectedExportType, setSelectedExportType] = useState<'asl' | 'temporal'>('asl');

  useEffect(() => {
    setGeneratedTestResult(null);
    setTestGenerationError(null);
    setExportedWorkflowResult(null);
    setWorkflowExportError(null);
  }, [selectedNode]);

  // Fetch topology
  const fetchTopology = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetch(
      `http://localhost:8000/api/repositories/${repoId}/architecture?branch=${branch}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load architecture: HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((result) => {
        if (result.success && result.data) {
          setRawTopology(result.data.topology || null);
          setMetrics(result.data.metrics || null);
        } else {
          setError(result.error || "No architecture data available");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch architecture");
        setIsLoading(false);
      });
  }, [repoId, branch]);

  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);

  // Handle re-triggering repository sync
  const triggerResync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/branches/${branch}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        // Poll status or wait and refresh
        setTimeout(() => {
          fetchTopology();
          setIsSyncing(false);
        }, 3000);
      } else {
        alert("Failed to start sync: " + (data.error || "Unknown error"));
        setIsSyncing(false);
      }
    } catch (e: any) {
      alert("Error starting sync: " + e.message);
      setIsSyncing(false);
    }
  };

  // Build the visual graph (nodes and edges mapped to React Flow schema)
  useEffect(() => {
    if (!rawTopology || rawTopology.schemaVersion !== "2.0-workflow") {
      setNodes([]);
      setEdges([]);
      return;
    }

    const rawNodes = rawTopology.nodes || [];
    const rawEdges = rawTopology.edges || [];

    // Calculate focused node IDs if Focus Flow mode is active
    let reachableNodeIds = new Set<string>();
    if (focusTriggerId) {
      reachableNodeIds.add(focusTriggerId);
      // Simple BFS to find all downstream reachable nodes from the trigger
      const queue = [focusTriggerId];
      const visited = new Set<string>([focusTriggerId]);

      while (queue.length > 0) {
        const current = queue.shift()!;
        rawEdges.forEach((edge: any) => {
          if (edge.source === current && !visited.has(edge.target)) {
            visited.add(edge.target);
            reachableNodeIds.add(edge.target);
            queue.push(edge.target);
          }
        });
      }
    }

    // 1. Map nodes
    const rfNodes: RFNode[] = rawNodes.map((node: any) => {
      const isHidden = !activeFilters.has(node.type);
      const isDimmed = focusTriggerId !== null && !reachableNodeIds.has(node.id);

      return {
        id: node.id,
        type: node.type,
        data: {
          ...node,
          label: node.label,
          subtype: node.subtype,
          metadata: node.metadata,
        },
        position: { x: 0, y: 0 }, // Position will be computed by dagre
        hidden: isHidden,
        style: {
          opacity: isDimmed ? 0.15 : 1,
          transition: "opacity 0.3s ease",
        },
      };
    });

    // 2. Map edges
    const rfEdges: RFEdge[] = rawEdges.map((edge: any) => {
      const isDimmed =
        focusTriggerId !== null &&
        (!reachableNodeIds.has(edge.source) || !reachableNodeIds.has(edge.target));

      // Animated for active database queries or HTTP calls
      const isAnimated = edge.type === "QUERY" || edge.type === "CALL" || edge.type === "RECURSIVE";
      
      // Marker color matching edge semantics
      let edgeColor = "rgba(255, 255, 255, 0.2)";
      if (edge.type === "BRANCH_TRUE") edgeColor = NODE_COLORS.DECISION.border;
      if (edge.type === "BRANCH_FALSE") edgeColor = "rgba(245, 158, 11, 0.4)";
      if (edge.type === "QUERY") edgeColor = NODE_COLORS.INTEGRATION.border;
      if (edge.type === "RECURSIVE") edgeColor = "#ef4444";

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: isAnimated && !isDimmed,
        type: "smoothstep",
        style: {
          stroke: isDimmed ? "rgba(255, 255, 255, 0.05)" : edgeColor,
          strokeWidth: edge.type === "RECURSIVE" ? 2.5 : 1.5,
          opacity: isDimmed ? 0.15 : 1,
          transition: "opacity 0.3s ease, stroke 0.3s ease",
        },
        labelStyle: {
          fill: "rgba(148, 163, 184, 0.7)",
          fontSize: 9,
          fontWeight: 600,
          fontFamily: "sans-serif",
          opacity: isDimmed ? 0.15 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: isDimmed ? "rgba(255, 255, 255, 0.05)" : edgeColor,
        },
      };
    });

    // 3. Layout with Dagre
    const laidOutNodes = applyDagreLayout(rfNodes, rfEdges, "LR");

    setNodes(laidOutNodes);
    setEdges(rfEdges);
  }, [rawTopology, activeFilters, focusTriggerId, setNodes, setEdges]);

  // Compute connected nodes for the detail panel
  useEffect(() => {
    if (!selectedNode || !rawTopology) {
      setConnectedSources([]);
      setConnectedTargets([]);
      return;
    }

    const rawEdges = rawTopology.edges || [];
    const rawNodes = rawTopology.nodes || [];

    const sources = rawEdges
      .filter((e: any) => e.target === selectedNode.id)
      .map((e: any) => {
        const found = rawNodes.find((n: any) => n.id === e.source);
        return found ? { ...found, edgeLabel: e.label } : null;
      })
      .filter(Boolean);

    const targets = rawEdges
      .filter((e: any) => e.source === selectedNode.id)
      .map((e: any) => {
        const found = rawNodes.find((n: any) => n.id === e.target);
        return found ? { ...found, edgeLabel: e.label } : null;
      })
      .filter(Boolean);

    setConnectedSources(sources);
    setConnectedTargets(targets);
  }, [selectedNode, rawTopology]);

  // Handle clicking on a node
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode) => {
      setSelectedNode(node.data);

      // Focus flow mode on TriggerNode click
      if (node.type === "TRIGGER") {
        if (focusTriggerId === node.id) {
          // Double-click or clicking current active trigger resets focus
          setFocusTriggerId(null);
        } else {
          setFocusTriggerId(node.id);
        }
      } else {
        // Reset focus mode if any other node type is clicked
        setFocusTriggerId(null);
      }
    },
    [focusTriggerId]
  );

  // Toggle filter for a node type
  const toggleFilter = (type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Reset focus mode
  const resetFocusMode = () => {
    setFocusTriggerId(null);
  };

  // Generate E2E test via Path-to-Test
  const handleGenerateTest = async () => {
    if (!selectedNode) return;
    setIsGeneratingTest(true);
    setTestGenerationError(null);
    setGeneratedTestResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/generate-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerNodeId: selectedNode.id,
          branch: branch,
          testType: selectedFramework,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedTestResult(data.data);
      } else {
        setTestGenerationError(data.error || "Failed to generate E2E test.");
      }
    } catch (e: any) {
      setTestGenerationError(e.message || "Failed to generate E2E test.");
    } finally {
      setIsGeneratingTest(false);
    }
  };

  // Export Workflow via Exporter Engine
  const handleExportWorkflow = async () => {
    if (!selectedNode) return;
    setIsExportingWorkflow(true);
    setWorkflowExportError(null);
    setExportedWorkflowResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/export-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerNodeId: selectedNode.id,
          branch: branch,
          exportType: selectedExportType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExportedWorkflowResult(data.data);
      } else {
        setWorkflowExportError(data.error || "Failed to export workflow.");
      }
    } catch (e: any) {
      setWorkflowExportError(e.message || "Failed to export workflow.");
    } finally {
      setIsExportingWorkflow(false);
    }
  };

  const hasValidWorkflowTopology =
    rawTopology && rawTopology.schemaVersion === "2.0-workflow";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(10, 14, 20, 0.8)",
          backdropFilter: "blur(20px)",
          zIndex: 10,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#fff",
            }}
          >
            <Network size={22} color="var(--accent-cyan)" />
            Application Workflow Explorer
          </h2>
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginTop: "0.25rem",
            }}
          >
            Semantic E2E Call Graph & Code Executions • <b>{branch}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          {focusTriggerId && (
            <button
              onClick={resetFocusMode}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#ef4444",
                padding: "0.5rem 1rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              <EyeOff size={14} />
              Reset Focus Mode
            </button>
          )}

          <button
            onClick={fetchTopology}
            disabled={isLoading || isSyncing}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              color: "white",
              padding: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Refresh architecture"
          >
            <RefreshCw
              size={16}
              className={isLoading || isSyncing ? "spin" : ""}
            />
          </button>

          <button
            onClick={triggerResync}
            disabled={isSyncing}
            className="glass-card"
            style={{
              padding: "0.5rem 1rem",
              color: "var(--accent-cyan)",
              fontWeight: "bold",
              fontSize: "0.82rem",
              border: "1px solid var(--accent-cyan)",
              background: "rgba(0, 242, 255, 0.03)",
              cursor: "pointer",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <RefreshCw size={14} className={isSyncing ? "spin" : ""} />
            {isSyncing ? "Syncing..." : "Trigger Re-sync"}
          </button>
        </div>
      </header>

      {/* Main Flow Canvas or Guard Screen */}
      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              background: "var(--bg-primary)",
              zIndex: 5,
            }}
          >
            <div
              className="spin"
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid var(--accent-cyan)",
                borderTopColor: "transparent",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Analyzing source code AST workflows...
            </span>
          </div>
        ) : !hasValidWorkflowTopology ? (
          /* Guard screen: No v2 topology found */
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-primary)",
              padding: "2rem",
              zIndex: 4,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{
                maxWidth: "500px",
                textAlign: "center",
                padding: "3rem",
                border: "1px solid var(--glass-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid var(--warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--warning)",
                }}
              >
                <AlertTriangle size={32} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Workflow Analysis Pending
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                    lineHeight: "1.6",
                    marginTop: "0.75rem",
                  }}
                >
                  This repository does not have a semantic workflow snapshot
                  for the active branch. Trigger a manual sync to run the
                  world-class AST parser.
                </p>
              </div>

              <button
                onClick={triggerResync}
                disabled={isSyncing}
                style={{
                  background: "var(--accent-cyan)",
                  color: "var(--bg-primary)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <RefreshCw size={16} className={isSyncing ? "spin" : ""} />
                {isSyncing ? "Syncing Codebase..." : "Generate Workflow Diagram"}
              </button>
            </motion.div>
          </div>
        ) : (
          /* The Interactive Flow Canvas */
          <div style={{ width: "100%", height: "100%" }}>
            {/* Type Filter Toolbar */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  background: "rgba(10, 14, 20, 0.9)",
                  borderColor: "var(--glass-border)",
                  borderRadius: "8px",
                }}
              >
                <Filter size={12} color="var(--text-secondary)" />
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                  }}
                >
                  Filter View
                </span>
              </div>

              {(
                Object.keys(NODE_COLORS) as Array<keyof typeof NODE_COLORS>
              ).map((type) => {
                const conf = NODE_COLORS[type];
                const isActive = activeFilters.has(type);

                return (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 1rem",
                      background: isActive ? conf.bg : "rgba(10, 14, 20, 0.8)",
                      border: `1px solid ${isActive ? conf.border : "var(--glass-border)"}`,
                      borderRadius: "8px",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      transition: "all 0.2s",
                      boxShadow: isActive ? `0 0 10px ${conf.glow}` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: conf.border,
                        boxShadow: `0 0 6px ${conf.border}`,
                      }}
                    />
                    {conf.label}s
                  </button>
                );
              })}
            </div>

            {/* React Flow */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={2.5}
            >
              <Background color="#1e293b" gap={16} size={1} />
              <Controls
                style={{
                  background: "rgba(10, 14, 20, 0.9)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <MiniMap
                nodeColor={(node: any) => {
                  const c = NODE_COLORS[node.type as keyof typeof NODE_COLORS];
                  return c ? c.border : "#334155";
                }}
                maskColor="rgba(10, 14, 20, 0.7)"
                style={{
                  background: "rgba(10, 14, 20, 0.95)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                }}
              />
            </ReactFlow>
          </div>
        )}
      </div>

      {/* Side Detail Panel (Slide-In) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "tween", duration: 0.25 }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "400px",
              background: "rgba(10, 14, 20, 0.95)",
              borderLeft: "1px solid var(--glass-border)",
              backdropFilter: "blur(30px)",
              padding: "2rem",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              gap: "1.75rem",
              overflowY: "auto",
              boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header / Close button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  background:
                    NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.bg,
                  borderRadius: "8px",
                  border: `1.1px solid ${
                    NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.border
                  }`,
                  color:
                    NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.border,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {selectedNode.type} Node
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Primary Details */}
            <div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                  color: "#fff",
                  lineHeight: "1.25",
                  wordBreak: "break-all",
                }}
              >
                {selectedNode.label}
              </h3>
              <div
                style={{
                  fontSize: "0.75rem",
                  color:
                    NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.border,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginTop: "0.35rem",
                }}
              >
                {selectedNode.subtype}
              </div>
            </div>

            {/* Code Reference / File path */}
            {selectedNode.metadata?.file && (
              <div
                className="glass-card"
                style={{
                  padding: "1rem",
                  borderLeft: `3px solid ${
                    NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.border
                  }`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-secondary)",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <FileCode size={12} />
                  AST Source Definition
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#f8fafc",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedNode.metadata.file}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--accent-cyan)",
                    marginTop: "0.25rem",
                    fontWeight: "bold",
                  }}
                >
                  Line: {selectedNode.metadata.line}
                </div>
              </div>
            )}

            {/* Custom metadata per type */}
            {selectedNode.metadata && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {selectedNode.metadata.method && (
                  <div className="glass-card" style={{ padding: "0.85rem 1.2rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>HTTP Verb</div>
                    <div style={{ fontWeight: "700", color: "var(--accent-cyan)", fontSize: "0.9rem", marginTop: "0.25rem" }}>{selectedNode.metadata.method}</div>
                  </div>
                )}
                {selectedNode.metadata.path && (
                  <div className="glass-card" style={{ padding: "0.85rem 1.2rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>Registered Route</div>
                    <div style={{ fontWeight: "600", fontSize: "0.82rem", marginTop: "0.25rem", fontFamily: "monospace", color: "#fff" }}>{selectedNode.metadata.path}</div>
                  </div>
                )}
                {selectedNode.metadata.condition && (
                  <div className="glass-card" style={{ padding: "0.85rem 1.2rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>Branch Guard</div>
                    <div style={{ fontWeight: "600", fontSize: "0.82rem", marginTop: "0.25rem", fontFamily: "monospace", color: "var(--warning)" }}>{selectedNode.metadata.condition}</div>
                  </div>
                )}
                {selectedNode.metadata.operation && (
                  <div className="glass-card" style={{ padding: "0.85rem 1.2rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>Client Command</div>
                    <div style={{ fontWeight: "700", color: NODE_COLORS.INTEGRATION.border, fontSize: "0.85rem", marginTop: "0.25rem" }}>{selectedNode.metadata.operation}</div>
                  </div>
                )}
              </div>
            )}

            {/* Path-to-Test E2E Generator Section */}
            {selectedNode.type === "TRIGGER" && (
              <div
                className="glass-card"
                style={{
                  padding: "1.2rem",
                  border: "1.1px dashed rgba(0, 242, 255, 0.4)",
                  background: "rgba(0, 242, 255, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--accent-cyan)",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <Zap size={14} style={{ fill: "rgba(0, 242, 255, 0.2)" }} />
                  Path-to-Test E2E Engine
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Trace execution downstream to terminal integration & database nodes and auto-generate a runnable Playwright or Cypress E2E test file.
                </p>

                {/* Framework Selection Segment Control */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>
                    Select Test Framework
                  </label>
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(10, 14, 20, 0.8)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "6px",
                      padding: "2px",
                    }}
                  >
                    <button
                      onClick={() => setSelectedFramework("playwright")}
                      style={{
                        flex: 1,
                        padding: "0.35rem 0.75rem",
                        background: selectedFramework === "playwright" ? "rgba(0, 242, 255, 0.15)" : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        color: selectedFramework === "playwright" ? "#fff" : "var(--text-secondary)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Playwright
                    </button>
                    <button
                      onClick={() => setSelectedFramework("cypress")}
                      style={{
                        flex: 1,
                        padding: "0.35rem 0.75rem",
                        background: selectedFramework === "cypress" ? "rgba(0, 242, 255, 0.15)" : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        color: selectedFramework === "cypress" ? "#fff" : "var(--text-secondary)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Cypress
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateTest}
                  disabled={isGeneratingTest}
                  style={{
                    padding: "0.65rem 1rem",
                    background: "linear-gradient(135deg, var(--accent-cyan) 0%, #0099ff 100%)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#05070a",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 0 12px rgba(0, 242, 255, 0.3)",
                    transition: "all 0.2s",
                    opacity: isGeneratingTest ? 0.7 : 1,
                  }}
                >
                  {isGeneratingTest ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Generating E2E Test Spec...
                    </>
                  ) : (
                    <>
                      <FileCode size={14} />
                      {generatedTestResult ? "Regenerate E2E Test" : "Generate E2E Test"}
                    </>
                  )}
                </button>

                {/* Error Banner */}
                {testGenerationError && (
                  <div
                    style={{
                      padding: "0.65rem",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "6px",
                      color: "rgba(239, 68, 68, 0.9)",
                      fontSize: "0.7rem",
                      lineHeight: "1.3",
                    }}
                  >
                    <strong>Error:</strong> {testGenerationError}
                  </div>
                )}

                {/* Success/Result View */}
                {generatedTestResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.25rem" }}>
                    <div
                      style={{
                        padding: "0.65rem",
                        background: "rgba(16, 185, 129, 0.05)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "6px",
                        color: "var(--success)",
                        fontSize: "0.7rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Success!</strong> Test suite generated and saved locally to:
                      <div
                        style={{
                          fontFamily: "monospace",
                          background: "rgba(0,0,0,0.3)",
                          padding: "0.35rem",
                          borderRadius: "4px",
                          marginTop: "0.25rem",
                          fontSize: "0.62rem",
                          wordBreak: "break-all",
                          color: "#fff",
                        }}
                      >
                        /tests/e2e/gitpulse-generated/{generatedTestResult.filename}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>
                          Generated Spec Source
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedTestResult.code);
                            alert("Test code copied to clipboard!");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent-cyan)",
                            fontSize: "0.65rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                            padding: 0,
                          }}
                        >
                          Copy Code
                        </button>
                      </div>
                      <pre
                        style={{
                          background: "rgba(0,0,0,0.45)",
                          padding: "0.85rem",
                          borderRadius: "6px",
                          border: "1px solid var(--glass-border)",
                          maxHeight: "220px",
                          overflow: "auto",
                          fontSize: "0.65rem",
                          fontFamily: "monospace",
                          color: "#cbd5e1",
                          lineHeight: "1.4",
                        }}
                      >
                        {generatedTestResult.code}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Workflow Exporter Section */}
            {selectedNode.type === "TRIGGER" && (
              <div
                className="glass-card"
                style={{
                  padding: "1.2rem",
                  border: "1.1px dashed rgba(139, 92, 246, 0.4)",
                  background: "rgba(139, 92, 246, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem"
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#8B5CF6",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <Cpu size={14} style={{ fill: "rgba(139, 92, 246, 0.2)" }} />
                  Workflow State Machine Exporter
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Export this semantic call graph directly into executable, stateful backend orchestrations. Preserves wait delays, retry rules, and AST error boundaries.
                </p>

                {/* Exporter Target Selection */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>
                    Select Exporter Target
                  </label>
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(10, 14, 20, 0.8)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "6px",
                      padding: "2px",
                    }}
                  >
                    <button
                      onClick={() => setSelectedExportType("asl")}
                      style={{
                        flex: 1,
                        padding: "0.35rem 0.75rem",
                        background: selectedExportType === "asl" ? "rgba(139, 92, 246, 0.15)" : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        color: selectedExportType === "asl" ? "#fff" : "var(--text-secondary)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      AWS Step Functions (ASL)
                    </button>
                    <button
                      onClick={() => setSelectedExportType("temporal")}
                      style={{
                        flex: 1,
                        padding: "0.35rem 0.75rem",
                        background: selectedExportType === "temporal" ? "rgba(139, 92, 246, 0.15)" : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        color: selectedExportType === "temporal" ? "#fff" : "var(--text-secondary)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Temporal Workflow (TS)
                    </button>
                  </div>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportWorkflow}
                  disabled={isExportingWorkflow}
                  style={{
                    padding: "0.65rem 1rem",
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)",
                    transition: "all 0.2s",
                    opacity: isExportingWorkflow ? 0.7 : 1,
                  }}
                >
                  {isExportingWorkflow ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Exporting State Machine...
                    </>
                  ) : (
                    <>
                      <Cpu size={14} />
                      {exportedWorkflowResult ? "Re-Export Logic" : "Export Stateful Logic"}
                    </>
                  )}
                </button>

                {/* Error Banner */}
                {workflowExportError && (
                  <div
                    style={{
                      padding: "0.65rem",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "6px",
                      color: "rgba(239, 68, 68, 0.9)",
                      fontSize: "0.7rem",
                      lineHeight: "1.3",
                    }}
                  >
                    <strong>Error:</strong> {workflowExportError}
                  </div>
                )}

                {/* Success/Result View */}
                {exportedWorkflowResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.25rem" }}>
                    <div
                      style={{
                        padding: "0.65rem",
                        background: "rgba(16, 185, 129, 0.05)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "6px",
                        color: "var(--success)",
                        fontSize: "0.7rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Success!</strong> Workflow state machine saved locally to:
                      <div
                        style={{
                          fontFamily: "monospace",
                          background: "rgba(0,0,0,0.3)",
                          padding: "0.35rem",
                          borderRadius: "4px",
                          marginTop: "0.25rem",
                          fontSize: "0.62rem",
                          wordBreak: "break-all",
                          color: "#fff",
                        }}
                      >
                        /exports/workflow-generated/{exportedWorkflowResult.filename}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>
                          Generated Pipeline Source
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(exportedWorkflowResult.code);
                            alert("Workflow source code copied to clipboard!");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#8B5CF6",
                            fontSize: "0.65rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                            padding: 0,
                          }}
                        >
                          Copy Code
                        </button>
                      </div>
                      <pre
                        style={{
                          background: "rgba(0,0,0,0.45)",
                          padding: "0.85rem",
                          borderRadius: "6px",
                          border: "1px solid var(--glass-border)",
                          maxHeight: "220px",
                          overflow: "auto",
                          fontSize: "0.65rem",
                          fontFamily: "monospace",
                          color: "#cbd5e1",
                          lineHeight: "1.4",
                        }}
                      >
                        {exportedWorkflowResult.code}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Execution flow connections (Sources and Targets) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff" }}>Execution Relations</h4>
              
              {/* Inbound relations */}
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>Inbound Triggers / Callers ({connectedSources.length})</div>
                {connectedSources.length === 0 ? (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>No inbound connections</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {connectedSources.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedNode(s)}
                        style={{
                          padding: "0.4rem 0.6rem",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "white",
                        }}
                      >
                        <span style={{ fontFamily: s.type === "ACTION" ? "monospace" : "inherit" }}>{s.label}</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 4px", borderRadius: "3px" }}>{s.edgeLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outbound relations */}
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>Outbound Callees / Sinks ({connectedTargets.length})</div>
                {connectedTargets.length === 0 ? (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>No outbound connections</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {connectedTargets.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedNode(t)}
                        style={{
                          padding: "0.4rem 0.6rem",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "white",
                        }}
                      >
                        <span style={{ fontFamily: t.type === "ACTION" || t.type === "INTEGRATION" ? "monospace" : "inherit" }}>{t.label}</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 4px", borderRadius: "3px" }}>{t.edgeLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Bar (SPEC.md §3.3 metrics footer) */}
      {hasValidWorkflowTopology && metrics && (
        <footer
          style={{
            padding: "1rem 2rem",
            borderTop: "1px solid var(--glass-border)",
            background: "rgba(10, 14, 20, 0.9)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            fontSize: "0.82rem",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Triggers:</span>
            <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>
              {metrics.triggerCount}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Actions:</span>
            <span style={{ color: "var(--accent-violet)", fontWeight: "bold" }}>
              {metrics.actionCount}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Decisions:</span>
            <span style={{ color: "var(--warning)", fontWeight: "bold" }}>
              {metrics.decisionCount}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Integrations:</span>
            <span style={{ color: "var(--success)", fontWeight: "bold" }}>
              {metrics.integrationCount}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Complexity (M):</span>
            <span
              style={{
                color: metrics.cyclomaticComplexity > 15 ? "var(--danger)" : "#fff",
                fontWeight: "bold",
              }}
              title="Cyclomatic Complexity (E - N + 2P)"
            >
              {metrics.cyclomaticComplexity}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
            <span style={{ color: "var(--text-secondary)" }}>Avg Call Depth:</span>
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              {metrics.avgCallDepth || "0.0"}
            </span>
          </div>
        </footer>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
