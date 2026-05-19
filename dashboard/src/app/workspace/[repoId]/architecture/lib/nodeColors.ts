/**
 * Node colour tokens — SPEC.md §3.3
 * ====================================
 * Single source of truth for the 4 node type colour palettes.
 * Import in node components and in the filter toolbar.
 */

export const NODE_COLORS = {
    TRIGGER: {
        border:  '#00F2FF',
        bg:      'rgba(0, 242, 255, 0.08)',
        glow:    'rgba(0, 242, 255, 0.25)',
        text:    '#00F2FF',
        icon:    'Zap',
        label:   'Trigger',
    },
    ACTION: {
        border:  '#8B5CF6',
        bg:      'rgba(139, 92, 246, 0.08)',
        glow:    'rgba(139, 92, 246, 0.25)',
        text:    '#8B5CF6',
        icon:    'Cpu',
        label:   'Action',
    },
    DECISION: {
        border:  '#F59E0B',
        bg:      'rgba(245, 158, 11, 0.08)',
        glow:    'rgba(245, 158, 11, 0.25)',
        text:    '#F59E0B',
        icon:    'GitBranch',
        label:   'Decision',
    },
    INTEGRATION: {
        border:  '#10B981',
        bg:      'rgba(16, 185, 129, 0.08)',
        glow:    'rgba(16, 185, 129, 0.25)',
        text:    '#10B981',
        icon:    'Database',
        label:   'Integration',
    },
} as const;

export const STATE_STYLES = {
    added: {
        border: '#10B981',       // Emerald green
        glow: 'rgba(16, 185, 129, 0.45)',
        bg: 'rgba(16, 185, 129, 0.08)',
        label: 'Added',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeText: '#34D399',
    },
    modified: {
        border: '#F59E0B',      // Glowing amber
        glow: 'rgba(245, 158, 11, 0.55)',
        bg: 'rgba(245, 158, 11, 0.08)',
        label: 'Modified',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeText: '#FBBF24',
    },
    deleted: {
        border: '#EF4444',      // Red
        glow: 'rgba(239, 68, 68, 0.45)',
        bg: 'rgba(239, 68, 68, 0.04)',
        label: 'Deleted',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeText: '#F87171',
    },
} as const;

export type NodeColorKey = keyof typeof NODE_COLORS;
export type NodeStateKey = keyof typeof STATE_STYLES;

