/** Dismiss only when a primary click starts and ends on the backdrop itself. */
export function backdropClick(node, callback) {
  let pointer = null;
  let releasedOnBackdrop = false;

  function down(e) {
    pointer = e.target === node && e.button === 0 && e.isPrimary !== false ? e.pointerId : null;
    releasedOnBackdrop = false;
  }
  function up(e) {
    releasedOnBackdrop = pointer !== null && e.pointerId === pointer && e.target === node;
  }
  function reset() { pointer = null; releasedOnBackdrop = false; }
  function click(e) {
    // A drag from the editor can retarget its click to this common ancestor.
    const dismiss = releasedOnBackdrop && e.target === node;
    reset();
    if (dismiss) callback(e);
  }

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', reset);
  node.addEventListener('click', click);
  return {
    update(next) { callback = next; },
    destroy() {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', reset);
      node.removeEventListener('click', click);
    },
  };
}
