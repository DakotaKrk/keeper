export const DEMO_LAYOUT = {
  life: { x: 650, y: 360 },
  family: { x: 640, y: 70 },
  '2026': { x: 1080, y: 300 },
  travel: { x: 230, y: 300 },
  summer: { x: 640, y: 650 },
  jan: { x: 640, y: 560 },
  mountains: { x: 1030, y: 330 }
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
  const childPositions = [
    { x: 320, y: 360 },
    { x: 1060, y: 360 },
    { x: 690, y: 90 },
    { x: 690, y: 640 },
    { x: 260, y: 120 },
    { x: 1080, y: 610 },
    { x: 1080, y: 120 },
    { x: 260, y: 610 },
    { x: 160, y: 360 },
    { x: 1180, y: 360 }
  ];
  const directChildren = childIds.get(activeFolderId) || [];

  return nodes.map(node => {
    if (node.id === activeFolderId && !node.data?.hasCustomPosition) {
      return { ...node, position: center };
    }

    const childIndex = directChildren.indexOf(node.id);
    if (childIndex >= 0 && !node.data?.hasCustomPosition) {
      return {
        ...node,
        position: childPositions[childIndex % childPositions.length]
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
