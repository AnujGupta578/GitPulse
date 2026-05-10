"use client";

import React from 'react';
import { Database, Server, Box, Globe, ShieldAlert, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useRepository } from '@/app/context/RepositoryContext';


const mockInfra = [
    {
        id: 'k8s-ingress',
        type: 'KUBERNETES',
        name: 'ingress-nginx',
        environment: 'production',
        dependencies: ['auth-service', 'api-gateway'],
        riskLevel: 'MEDIUM',
        configSnapshot: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: core-ingress'
    },
    {
        id: 'tf-rds',
        type: 'TERRAFORM',
        name: 'aws_db_instance.orders',
        environment: 'production',
        dependencies: [],
        riskLevel: 'HIGH',
        configSnapshot: 'resource "aws_db_instance" "orders" {\n  engine = "postgres"\n  instance_class = "db.t3.micro"\n}'
    },
    {
        id: 'ci-pipeline',
        type: 'CI_CD',
        name: '.github/workflows/deploy.yml',
        environment: 'global',
        dependencies: ['k8s-ingress', 'tf-rds'],
        riskLevel: 'LOW',
        configSnapshot: 'name: Production Deploy\non:\n  push:\n    branches: [ "main" ]'
    }
];


export default function InfrastructurePage() {
    const params = useParams();
    const repoId = params.repoId;
    const { branch } = useRepository();
    const [resources, setResources] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch(`http://localhost:8000/api/repositories/${repoId}/infrastructure?branch=${branch}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setResources(result.data || []);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [repoId, branch]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'DOCKER': return <Box size={24} color="#2496ed" />;
            case 'KUBERNETES': return <Box size={24} color="#326ce5" />;
            case 'TERRAFORM': return <Globe size={24} color="#844FBA" />;
            case 'CICD': return <Zap size={24} color="var(--accent-cyan)" />;
            default: return <Server size={24} />;
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-violet)", marginBottom: "0.5rem" }}>
                    <Database size={24} />
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Infrastructure Topology</span>
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>{repoId}</h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
                    Detected deployment resources from branch: <b>{branch}</b>.
                </p>
            </header>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
                </div>
            ) : resources.length === 0 ? (
                <div className="glass-card" style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(139, 92, 246, 0.05)", border: "1px solid var(--accent-violet)" }}>
                        <Database size={48} color="var(--accent-violet)" />
                    </div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>No Infrastructure Detected</h3>
                    <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
                        We couldn't find any Dockerfiles, Kubernetes manifests, or Terraform configs in this branch.
                    </p>
                    <button
                        onClick={() => window.location.href = `/workspace/${repoId}/sync`}
                        style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}
                    >
                        Index Repository
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
                    {resources.map((resource, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={resource.id}
                            className="glass-card"
                            style={{ 
                                padding: "2rem", display: "flex", flexDirection: "column",
                                border: resource.riskLevel === 'HIGH' ? "1px solid rgba(255, 50, 50, 0.3)" : "1px solid var(--glass-border)",
                                background: resource.riskLevel === 'HIGH' ? "rgba(255, 50, 50, 0.02)" : "rgba(255,255,255,0.02)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                        {getIcon(resource.type)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{resource.name}</h3>
                                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "bold", letterSpacing: "1px" }}>{resource.type}</span>
                                    </div>
                                </div>

                                {resource.riskLevel === 'HIGH' && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--danger)", fontSize: "0.75rem", fontWeight: "bold" }}>
                                        <ShieldAlert size={16} /> HIGH RISK
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                                    {resource.description}
                                </p>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", fontWeight: "bold" }}>Resource Status</div>
                                    <span style={{ 
                                        padding: "0.25rem 0.75rem", borderRadius: "100px", 
                                        background: resource.status === 'ACTIVE' ? "rgba(50, 255, 50, 0.1)" : "rgba(255, 255, 255, 0.05)", 
                                        border: resource.status === 'ACTIVE' ? "1px solid var(--success)" : "1px solid var(--glass-border)", 
                                        fontSize: "0.75rem", color: resource.status === 'ACTIVE' ? "var(--success)" : "var(--text-secondary)", fontWeight: "bold" 
                                    }}>
                                        {resource.status}
                                    </span>
                                </div>

                                {resource.metadata?.path && (
                                    <div style={{ marginBottom: "1.5rem" }}>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", fontWeight: "bold" }}>Definition Path</div>
                                        <code style={{ fontSize: "0.8rem", color: "var(--accent-cyan)" }}>{resource.metadata.path}</code>
                                    </div>
                                )}
                            </div>

                            {resource.configSnapshot && (
                                <div style={{ background: "#0a0e14", padding: "1rem", borderRadius: "8px", border: "1px solid var(--glass-border)", marginTop: "1rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontFamily: "sans-serif", textTransform: "uppercase" }}>Analysis Notes</div>
                                    <pre style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "monospace", overflowX: "auto" }}>
                                        {resource.configSnapshot}
                                    </pre>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
