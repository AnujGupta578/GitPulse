import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Database, Globe, Package } from 'lucide-react';
import { NODE_COLORS, STATE_STYLES, type NodeStateKey } from '../lib/nodeColors';

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

    const stateKey = data?.state as NodeStateKey | undefined;
    const isChanged = stateKey && STATE_STYLES[stateKey];
    
    const borderCol = isChanged ? STATE_STYLES[stateKey].border : (selected ? '#fff' : C.border);
    const boxShad = selected
        ? `0 0 0 2px ${isChanged ? STATE_STYLES[stateKey].border : C.border}, 0 0 24px ${isChanged ? STATE_STYLES[stateKey].glow : C.glow}`
        : `0 0 12px ${isChanged ? STATE_STYLES[stateKey].glow : C.glow}`;
    const opacityVal = stateKey === 'deleted' ? 0.65 : 1.0;

    return (
        <div
            id={`node-integration-${data?.id ?? 'unknown'}`}
            style={{
                width: 220,
                background: isChanged ? STATE_STYLES[stateKey].bg : C.bg,
                border: `1.5px ${borderStyle} ${borderCol}`,
                borderRadius: 12,
                padding: '10px 14px',
                position: 'relative',
                backdropFilter: 'blur(12px)',
                boxShadow: boxShad,
                opacity: opacityVal,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
                cursor: 'pointer',
            }}
        >
            {/* IntegrationNodes are leaf nodes — target handle only */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: isChanged ? STATE_STYLES[stateKey].border : C.border, width: 10, height: 10, border: 'none' }}
            />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{
                    background: C.bg,
                    border: `1px solid ${isChanged ? STATE_STYLES[stateKey].border : C.border}`,
                    borderRadius: 6,
                    padding: '3px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    color: isChanged ? STATE_STYLES[stateKey].border : C.text,
                }}>
                    <Icon size={12} strokeWidth={2.5} />
                </span>
                <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isChanged ? STATE_STYLES[stateKey].border : C.text,
                }}>
                    {subLabel}
                </span>
                {isChanged && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 3,
                        background: STATE_STYLES[stateKey].badgeBg,
                        color: STATE_STYLES[stateKey].badgeText,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                    }}>
                        {STATE_STYLES[stateKey].label}
                    </span>
                )}
                {operation && !isChanged && (
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
                background: isChanged ? STATE_STYLES[stateKey].border : C.border,
                boxShadow: `0 0 6px ${isChanged ? STATE_STYLES[stateKey].border : C.border}`,
                opacity: 0.8,
            }} />

            <div style={{
                position: 'absolute',
                bottom: 0, left: '15%', right: '15%',
                height: 2,
                borderRadius: '0 0 2px 2px',
                background: `linear-gradient(90deg, transparent, ${isChanged ? STATE_STYLES[stateKey].border : C.border}, transparent)`,
                opacity: 0.5,
            }} />
        </div>
    );
}
