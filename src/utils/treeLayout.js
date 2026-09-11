export const DEMO_LAYOUT = {
  life: { x: 650, y: 360 },
  '2023': { x: 1030, y: 20 },
  '2024': { x: 1090, y: 190 },
  '2025': { x: 1090, y: 530 },
  '2026': { x: 1030, y: 360 },
  '2027': { x: 1030, y: 700 },
  family: { x: 230, y: 130 },
  travel: { x: 180, y: 360 },
  'photo-job-1': { x: 230, y: 590 },
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

export function layoutFocusedBoard(nodes, childIds, activeFolderId) {
  if (!activeFolderId) return nodes;

  const center = { x: 690, y: 360 };
  const directChildren = childIds.get(activeFolderId) || [];
  const left = [
    { x: 320, y: 250 },
    { x: 280, y: 460 },
    { x: 230, y: 90 },
    { x: 230, y: 650 }
  ];
  const right = [
    { x: 1060, y: 250 },
    { x: 1100, y: 460 },
    { x: 1120, y: 90 },
    { x: 1120, y: 650 }
  ];
  const topBottom = [
    { x: 690, y: 90 },
    { x: 690, y: 640 }
  ];
  let leftIndex = 0;
  let rightIndex = 0;
  let otherIndex = 0;

  return nodes.map(node => {
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
