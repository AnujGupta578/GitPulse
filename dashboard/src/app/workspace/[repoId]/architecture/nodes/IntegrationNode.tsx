'use client';

/**
 * IntegrationNode — SPEC.md §3.3
 * Emerald (#10B981) — leaf/sink indicator
 * Represents: DATABASE_WRITE, DATABASE_READ, EXTERNAL_HTTP, THIRD_PARTY_SDK
 */

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Database, Globe, Package } from 'lucide-react';
import { NODE_COLORS } from '../lib/nodeColors';

const C = NODE_COLORS.INTEGRATION;

const SUBTYPE_META: Record<string, { label: string; Icon: React.ElementType; op: string }> = {
    DATABASE_READ:   { label: 'DB Read',     Icon: Database, op: 'read'   },
    DATABASE_WRITE:  { label: 'DB Write',    Icon: Database, op: 'write'  },
    EXTERNAL_HTTP:   { label: 'HTTP Call',   Icon: Globe,    op: 'http'   },
    THIRD_PARTY_SDK: { label: 'SDK',         Icon: Package,  op: 'sdk'    },
};

export default function IntegrationNode({ data, selected }: NodeProps) {
    const meta = data?.metadata ?? {};
    const sm = SUBTYPE_META[data?.subtype] ?? { label: 'Integration', Icon: Database, op: '' };
    const { label: subLabel, Icon } = sm;

    // Distinguish read vs write visual treatment
    const isRead  = data?.subtype === 'DATABASE_READ';
    const isWrite = data?.subtype === 'DATABASE_WRITE';
    const borderStyle = isWrite ? 'dashed' : 'solid';

    const operation = meta.operation ?? '';
    const model     = meta.model ?? '';

    return (
        <div
            id={`node-integration-${data?.id ?? 'unknown'}`}
            style={{
                width: 220,
                background: C.bg,
                border: `1.5px ${borderStyle} ${selected ? '#fff' : C.border}`,
                borderRadius: 12,
                padding: '10px 14px',
                position: 'relative',
                backdropFilter: 'blur(12px)',
                boxShadow: selected
                    ? `0 0 0 2px ${C.border}, 0 0 24px ${C.glow}`
                    : `0 0 12px ${C.glow}`,
                transition: 'box-shadow 0.2s ease',
                cursor: 'pointer',
            }}
        >
            {/* IntegrationNodes are leaf nodes — target handle only */}
            <Handle
                type="target"
                position={Position.Left}
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
                    <Icon size={12} strokeWidth={2.5} />
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
                {operation && (
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
                        {operation}
                    </span>
                )}
            </div>

            {/* Primary label */}
            <div style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: model ? 'monospace' : 'inherit',
                lineHeight: 1.35,
            }}>
                {model ? `${model}.${operation}` : (data?.label ?? 'integration')}
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

            {/* Leaf indicator dot */}
            <div style={{
                position: 'absolute',
                top: 8, right: 10,
                width: 6, height: 6,
                borderRadius: '50%',
                background: C.border,
                boxShadow: `0 0 6px ${C.border}`,
                opacity: 0.8,
            }} />

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
