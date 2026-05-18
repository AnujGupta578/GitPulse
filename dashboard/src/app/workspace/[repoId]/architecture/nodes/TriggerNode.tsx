'use client';

/**
 * TriggerNode — SPEC.md §3.3
 * Cyan (#00F2FF) — entry point indicator
 * Represents: HTTP_ROUTE, WEBHOOK, CRON, EVENT_LISTENER
 */

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { NODE_COLORS } from '../lib/nodeColors';

const C = NODE_COLORS.TRIGGER;

const SUBTYPE_LABELS: Record<string, string> = {
    HTTP_ROUTE:     'HTTP Route',
    WEBHOOK:        'Webhook',
    CRON:           'Cron Job',
    EVENT_LISTENER: 'Event',
};

export default function TriggerNode({ data, selected }: NodeProps) {
    const meta = data?.metadata ?? {};
    const subLabel = SUBTYPE_LABELS[data?.subtype] ?? data?.subtype ?? 'Trigger';

    return (
        <div
            id={`node-trigger-${data?.id ?? 'unknown'}`}
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
                    : `0 0 16px ${C.glow}`,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                cursor: 'pointer',
            }}
        >
            {/* Source handle only — triggers have no inbound */}
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
                    <Zap size={12} strokeWidth={2.5} />
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
                {meta.method && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: C.glow,
                        color: C.text,
                        letterSpacing: '0.06em',
                    }}>
                        {meta.method}
                    </span>
                )}
            </div>

            {/* Label */}
            <div style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.35,
            }}>
                {data?.label ?? 'Trigger'}
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

            {/* Bottom accent line */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: '15%', right: '15%',
                height: 2,
                borderRadius: '0 0 2px 2px',
                background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
                opacity: 0.6,
            }} />
        </div>
    );
}
