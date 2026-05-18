/**
 * Dagre layout utility — SPEC.md §3.3 / SKILL.md Step 3.3
 * =========================================================
 * Applies a left-to-right hierarchical layout to React Flow nodes using dagre.
 * Triggers appear on the left; Integrations on the right.
 */

import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

export const NODE_WIDTH  = 220;
export const NODE_HEIGHT = 72;

/** DecisionNode renders as a diamond — needs extra space */
const DECISION_PAD = 20;

export function applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'LR' | 'TB' = 'LR',
): Node[] {
    if (nodes.length === 0) return nodes;

    const g = new dagre.graphlib.Graph();
    g.setGraph({
        rankdir: direction,
        nodesep: 60,
        ranksep: 120,
        edgesep: 30,
        marginx: 40,
        marginy: 40,
    });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((n) => {
        const isDecision = n.type === 'DECISION';
        g.setNode(n.id, {
            width:  isDecision ? NODE_WIDTH  + DECISION_PAD : NODE_WIDTH,
            height: isDecision ? NODE_HEIGHT + DECISION_PAD : NODE_HEIGHT,
        });
    });

    edges.forEach((e) => g.setEdge(e.source, e.target));

    dagre.layout(g);

    return nodes.map((n) => {
        const { x, y } = g.node(n.id);
        const isDecision = n.type === 'DECISION';
        const w = isDecision ? NODE_WIDTH + DECISION_PAD : NODE_WIDTH;
        const h = isDecision ? NODE_HEIGHT + DECISION_PAD : NODE_HEIGHT;
        return {
            ...n,
            position: {
                x: x - w / 2,
                y: y - h / 2,
            },
        };
    });
}
