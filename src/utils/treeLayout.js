export const DEMO_LAYOUT = {
  life: { x: 650, y: 360 },
  '2023': { x: 1040, y: -180 },
  '2024': { x: 1120, y: 90 },
  '2025': { x: 1120, y: 630 },
  '2026': { x: 1040, y: 360 },
  '2027': { x: 1040, y: 900 },
  family: { x: 220, y: -40 },
  travel: { x: 160, y: 360 },
  'photo-job-1': { x: 220, y: 760 },
  jan: { x: 1060, y: 360 },
  mountains: { x: 320, y: 360 },
  'new-year-dinner': { x: 690, y: 90 }
};

export function edgeHandlesFor(source, target) {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' };
  }

  return dy > 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' };
}

function spreadColumn(count, x, centerY = 360, gap = 260) {
  return Array.from({ length: count }, (_, index) => ({
    x,
    y: centerY + (index - (count - 1) / 2) * gap
  }));
}

function resolveNodeCollisions(nodes, gapX = 270, gapY = 220) {
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  const resolved = [];

  sorted.forEach(node => {
    let position = { ...node.position };
    let moved = true;

    while (moved) {
      moved = false;
      for (const placed of resolved) {
        const tooCloseX = Math.abs(position.x - placed.position.x) < gapX;
        const tooCloseY = Math.abs(position.y - placed.position.y) < gapY;
        if (tooCloseX && tooCloseY) {
          position = { ...position, y: placed.position.y + gapY };
          moved = true;
        }
      }
    }

    resolved.push({ ...node, position });
  });

  return resolved;
}

export function layoutFocusedBoard(nodes, childIds, activeFolderId) {
  if (!activeFolderId) return resolveNodeCollisions(nodes);

  const center = { x: 690, y: 360 };
  const directChildren = childIds.get(activeFolderId) || [];
  const leftChildren = directChildren.filter(id => {
    const node = nodes.find(item => item.id === id);
    return ['Album', 'Event', 'Period'].includes(node?.data?.kind);
  });
  const rightChildren = directChildren.filter(id => {
    const node = nodes.find(item => item.id === id);
    return ['Month', 'Collection', 'Year', 'Place'].includes(node?.data?.kind);
  });
  const otherChildren = directChildren.filter(id => !leftChildren.includes(id) && !rightChildren.includes(id));
  const left = spreadColumn(leftChildren.length, 260);
  const right = spreadColumn(rightChildren.length, 1120);
  const topBottom = spreadColumn(otherChildren.length, 690, 360, 270);
  let leftIndex = 0;
  let rightIndex = 0;
  let otherIndex = 0;

  const laidOut = nodes.map(node => {
    if (node.id === activeFolderId && !node.data?.hasCustomPosition) {
      return { ...node, position: center };
    }

    const childIndex = directChildren.indexOf(node.id);
    if (childIndex >= 0 && !node.data?.hasCustomPosition) {
      const kind = node.data?.kind;
      const position = ['Album', 'Event', 'Period'].includes(kind)
        ? left[leftIndex++ % left.length]
        : ['Month', 'Collection', 'Year'].includes(kind)
          ? right[rightIndex++ % right.length]
          : topBottom[otherIndex++ % topBottom.length];

      return {
        ...node,
        position
      };
    }

    return node;
  });

  return resolveNodeCollisions(laidOut);
}

export function nextBranchPosition(parent, siblingCount) {
  const angles = [-90, 0, 180, 90, -35, 35, 145, -145];
  const angle = (angles[siblingCount % angles.length] * Math.PI) / 180;
  const radius = siblingCount < 4 ? 360 : 470;

  return {
    x: (parent?.position?.x || 650) + Math.cos(angle) * radius,
    y: (parent?.position?.y || 360) + Math.sin(angle) * radius
  };
}

export function resetBoardCamera(rf) {
  requestAnimationFrame(() => {
    rf?.setViewport({ x: 260, y: 82, zoom: 0.76 }, { duration: 420 });
  });
}
