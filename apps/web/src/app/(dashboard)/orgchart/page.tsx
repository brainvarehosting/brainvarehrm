'use client';

import { useState } from 'react';
import styles from './orgchart.module.css';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar?: string;
  children?: OrgNode[];
}

const orgData: OrgNode = {
  id: '1', name: 'Rajesh Sharma', title: 'CEO', department: 'Executive',
  children: [
    {
      id: '2', name: 'Sneha Reddy', title: 'VP Engineering', department: 'Engineering',
      children: [
        { id: '5', name: 'Amit Kumar', title: 'Tech Lead', department: 'Engineering',
          children: [
            { id: '9', name: 'Kavya Nair', title: 'Sr. Developer', department: 'Engineering' },
            { id: '10', name: 'Arjun Desai', title: 'Developer', department: 'Engineering' },
          ]
        },
        { id: '6', name: 'Megha Joshi', title: 'QA Lead', department: 'Engineering',
          children: [
            { id: '11', name: 'Ravi Shankar', title: 'QA Engineer', department: 'Engineering' },
          ]
        },
      ]
    },
    {
      id: '3', name: 'Priya Patel', title: 'HR Director', department: 'HR',
      children: [
        { id: '7', name: 'Rohit Mehta', title: 'HR Manager', department: 'HR' },
        { id: '8', name: 'Vidya Menon', title: 'HR Executive', department: 'HR' },
      ]
    },
    {
      id: '4', name: 'Vikram Singh', title: 'Sales Director', department: 'Sales',
      children: [
        { id: '12', name: 'Ananya Iyer', title: 'Sales Manager', department: 'Sales',
          children: [
            { id: '13', name: 'Karan Malhotra', title: 'Sales Executive', department: 'Sales' },
          ]
        },
      ]
    },
  ]
};

const deptColors: Record<string, string> = {
  Executive: '#8b5cf6',
  Engineering: 'var(--color-primary-500)',
  HR: 'var(--color-accent-500)',
  Sales: 'var(--color-warning-500)',
};

function OrgTreeNode({ node, depth = 0, expanded, onToggle }: { node: OrgNode; depth?: number; expanded: Set<string>; onToggle: (id: string) => void }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const color = deptColors[node.department] || 'var(--text-muted)';

  return (
    <div className={styles.treeNodeWrapper}>
      <div className={styles.treeNode} style={{ animationDelay: `${depth * 60}ms` }}>
        {hasChildren && (
          <button className={styles.expandBtn} onClick={() => onToggle(node.id)} data-expanded={isExpanded}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
        <div className={styles.nodeAvatar} style={{ borderColor: color }}>
          {node.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className={styles.nodeInfo}>
          <span className={styles.nodeName}>{node.name}</span>
          <span className={styles.nodeTitle}>{node.title}</span>
        </div>
        <span className={styles.nodeDept} style={{ color, background: `${color}15`, borderColor: `${color}30` }}>{node.department}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className={styles.treeChildren}>
          {node.children!.map(child => (
            <OrgTreeNode key={child.id} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '3', '4']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleNode = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const expandAll = () => {
    const all = new Set<string>();
    const collect = (node: OrgNode) => { all.add(node.id); node.children?.forEach(collect); };
    collect(orgData);
    setExpanded(all);
  };

  const collapseAll = () => setExpanded(new Set(['1']));

  // Count total employees
  const countNodes = (node: OrgNode): number => 1 + (node.children?.reduce((s, c) => s + countNodes(c), 0) || 0);
  const total = countNodes(orgData);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Organization Chart</h1>
          <p className={styles.pageSubtitle}>{total} team members across {Object.keys(deptColors).length} departments</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={expandAll}>Expand All</button>
          <button className={styles.actionBtn} onClick={collapseAll}>Collapse All</button>
        </div>
      </div>

      {/* Department Legend */}
      <div className={styles.legend}>
        {Object.entries(deptColors).map(([dept, color]) => (
          <div key={dept} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span>{dept}</span>
          </div>
        ))}
      </div>

      {/* Tree View */}
      <div className={styles.treeContainer}>
        <OrgTreeNode node={orgData} expanded={expanded} onToggle={toggleNode} />
      </div>
    </div>
  );
}
