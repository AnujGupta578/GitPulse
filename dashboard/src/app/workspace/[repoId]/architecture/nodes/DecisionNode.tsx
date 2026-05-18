'use client';

/**
 * DecisionNode — SPEC.md §3.3
 * Amber (#F59E0B) — diamond/gateway shape indicator
 * Represents: IF_ELSE, SWITCH_CASE, TERNARY_GATEWAY
 *
 * Rendered as a rotated square (diamond) per SKILL.md Step 3.2:
 *   - Outer container: transform: rotate(45deg)
 *   - Inner content:   transform: rotate(-45deg)  ← keeps text upright
 */

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { NODE_COLORS } from '../lib/nodeColors';

const C = NODE_COLORS.DECISION;

const SUBTYPE_LABELS: Record<string, string> = {
    IF_ELSE:         'if / else',
    SWITCH_CASE:     'switch',
    TERNARY_GATEWAY: 'ternary',
};

/** Diamond size — outer rotated square side length */
const DIAMOND = 110;

export default function DecisionNode({ data, selected }: NodeProps) {
    const meta = data?.metadata ?? {};
    const subLabel = SUBTYPE_LABELS[data?.subtype] ?? data?.subtype ?? 'Decision';
    const condition = meta.condition ?? data?.label ?? 'condition';

    return (
        /**
         * Outer positioning wrapper — gives React Flow a stable bounding rect.
         * Width/height match what layoutDagre.ts reports (NODE_WIDTH + pad).
         */
        <div
            id={`node-decision-${data?.id ?? 'unknown'}`}
            style={{
                width: DIAMOND * 1.8,
                height: DIAMOND * 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            {/* React Flow handles sit on the wrapper, not the rotated diamond */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: C.border, width: 10, height: 10, border: 'none', left: 2 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                style={{ background: C.border, width: 10, height: 10, border: 'none', right: 2, top: '35%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                style={{ background: 'rgba(245,158,11,0.45)', width: 10, height: 10, border: `1.5px solid ${C.border}`, right: 2, top: '65%' }}
            />

            {/* Rotated diamond shell */}
            <div
                style={{
                    width: DIAMOND,
                    height: DIAMOND,
                    transform: 'rotate(45deg)',
                    background: C.bg,
                    border: `1.5px solid ${selected ? '#fff' : C.border}`,
                    borderRadius: 10,
                    boxShadow: selected
                        ? `0 0 0 2px ${C.border}, 0 0 24px ${C.glow}`
                        : `0 0 16px ${C.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'box-shadow 0.2s ease',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Counter-rotate inner content so text is upright */}
                <div
                    style={{
                        transform: 'rotate(-45deg)',
                        textAlign: 'center',
                        padding: '0 8px',
                        width: DIAMOND,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                        <GitBranch size={13} strokeWidth={2.5} color={C.text} />
                    </div>
                    <div style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: C.text,
                        marginBottom: 3,
                    }}>
                        {subLabel}
                    </div>
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 80,
                        margin: '0 auto',
                    }}>
                        {condition.length > 30 ? condition.slice(0, 30) + '…' : condition}
                    </div>
                </div>
            </div>

            {/* on:true / on:false branch labels */}
            <span style={{
                position: 'absolute',
                right: -4,
                top: '25%',
                fontSize: '0.55rem',
                fontWeight: 700,
                color: C.text,
                letterSpacing: '0.06em',
            }}>T</span>
            <span style={{
                position: 'absolute',
                right: -4,
                top: '60%',
                fontSize: '0.55rem',
                fontWeight: 700,
                color: 'rgba(245,158,11,0.6)',
                letterSpacing: '0.06em',
            }}>F</span>
        </div>
    );
}
