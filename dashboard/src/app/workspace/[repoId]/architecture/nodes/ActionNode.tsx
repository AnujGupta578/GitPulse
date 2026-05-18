'use client';

/**
 * ActionNode — SPEC.md §3.3
 * Violet (#8B5CF6) — business logic indicator
 * Represents: SERVICE_METHOD, BUSINESS_LOGIC, UTILITY_FUNCTION
 */

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Cpu } from 'lucide-react';
import { NODE_COLORS } from '../lib/nodeColors';

const C = NODE_COLORS.ACTION;

const SUBTYPE_LABELS: Record<string, string> = {
    SERVICE_METHOD:   'Service',
    BUSINESS_LOGIC:   'Logic',
    UTILITY_FUNCTION: 'Utility',
};

export default function ActionNode({ data, selected }: NodeProps) {
    const meta = data?.metadata ?? {};
    const subLabel = SUBTYPE_LABELS[data?.subtype] ?? data?.subtype ?? 'Action';

    return (
        <div
            id={`node-action-${data?.id ?? 'unknown'}`}
            style={{
                width: 220,
                background: C.bg,
                border: `1.5px solid ${selected ? '#fff' : C.border}`,
                borderRadius: 12,
                padding: '10px 14px',
                position: 'relative',
                backdropFilter: 'blur(12px)',
                boxShadow: selected
                    ? `0 0 0 2px ${C.border}, 0 0 24px ${C.glow}`
                    : `0 0 12px ${C.glow}`,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                cursor: 'pointer',
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: C.border, width: 10, height: 10, border: 'none' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: C.border, width: 10, height: 10, border: 'none' }}
            />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: '3px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    color: C.text,
                }}>
                    <Cpu size={12} strokeWidth={2.5} />
                </span>
                <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: C.text,
                }}>
                    {subLabel}
                </span>
            </div>

            {/* Function name */}
            <div style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'monospace',
                lineHeight: 1.35,
            }}>
                {data?.label ?? 'action'}()
            </div>

            {/* File path */}
            {meta.file && (
                <div style={{
                    marginTop: 4,
                    fontSize: '0.6rem',
                    color: 'rgba(148,163,184,0.8)',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {meta.file}:{meta.line}
                </div>
            )}

            <div style={{
                position: 'absolute',
                bottom: 0, left: '15%', right: '15%',
                height: 2,
                borderRadius: '0 0 2px 2px',
                background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
                opacity: 0.5,
            }} />
        </div>
    );
}
