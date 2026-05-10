"use client";

import React from 'react';
import { Bot, Cpu, Zap, Activity, HardDrive, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const agents = [
    { id: 'agent-repo', name: 'Repository Observer', status: 'IDLE', memoryPool: '12 MB', queuedTasks: 0, uptime: '14h 22m' },
    { id: 'agent-arch', name: 'Architecture Synthesizer', status: 'RUNNING', memoryPool: '450 MB', queuedTasks: 3, uptime: '14h 22m' },
    { id: 'agent-commit', name: 'Commit Intelligence', status: 'IDLE', memoryPool: '84 MB', queuedTasks: 0, uptime: '14h 22m' },
    { id: 'agent-infra', name: 'Infrastructure Scanner', status: 'RUNNING', memoryPool: '210 MB', queuedTasks: 1, uptime: '14h 22m' },
    { id: 'agent-risk', name: 'Risk Validator', status: 'IDLE', memoryPool: '64 MB', queuedTasks: 0, uptime: '14h 22m' }
];

export default function AgentsPage() {
    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Bot size={32} color="var(--accent-cyan)" />
                    AI Agent Swarm
                </h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Live telemetry from the autonomous orchestration council processing the knowledge graph.
                </p>
            </header>

            {/* Swarm Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ padding: "1rem", background: "rgba(0, 242, 255, 0.1)", borderRadius: "12px" }}>
                        <Activity color="var(--accent-cyan)" />
                    </div>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>5</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Active Agents</div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ padding: "1rem", background: "rgba(132, 79, 186, 0.1)", borderRadius: "12px" }}>
                        <Cpu color="var(--accent-violet)" />
                    </div>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>4</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Queued Workflows</div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ padding: "1rem", background: "rgba(50, 255, 50, 0.1)", borderRadius: "12px" }}>
                        <Zap color="var(--success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>99.9%</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Temporal Uptime</div>
                    </div>
                </div>
            </div>

            {/* Agent List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {agents.map((agent, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={agent.id} 
                        className="glass-card" 
                        style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "30%" }}>
                            <div style={{ position: "relative" }}>
                                <Bot size={28} color={agent.status === 'RUNNING' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                                {agent.status === 'RUNNING' && (
                                    <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", boxShadow: "0 0 10px var(--accent-cyan)" }} />
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: 0 }}>{agent.name}</h3>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "monospace", marginTop: "0.25rem" }}>{agent.id}</div>
                            </div>
                        </div>

                        <div style={{ width: "20%" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", textTransform: "uppercase" }}>State</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: agent.status === 'RUNNING' ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontWeight: "bold" }}>
                                {agent.status === 'RUNNING' ? <Activity size={16} className="pulse-animation" /> : <CheckCircle2 size={16} />}
                                {agent.status}
                            </div>
                        </div>

                        <div style={{ width: "20%" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", textTransform: "uppercase" }}>Memory Pool</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}>
                                <HardDrive size={16} color="var(--accent-violet)" />
                                {agent.memoryPool}
                            </div>
                        </div>

                        <div style={{ width: "15%" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", textTransform: "uppercase" }}>Task Queue</div>
                            <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: agent.queuedTasks > 0 ? "white" : "var(--text-secondary)" }}>
                                {agent.queuedTasks}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}