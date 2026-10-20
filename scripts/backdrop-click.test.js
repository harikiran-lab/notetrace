import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { backdropClick } from '../src/lib/backdrop-click.js';

function setup() {
  const node = new EventTarget();
  const panel = new EventTarget();
  let calls = 0;
  const action = backdropClick(node, () => calls++);
  const fire = (type, target = node, props = {}) => {
    const e = new Event(type);
    Object.defineProperty(e, 'target', { value: target });
    Object.assign(e, { button: 0, pointerId: 1, isPrimary: true }, props);
    node.dispatchEvent(e);
  };
  return { node, panel, action, fire, calls: () => calls };
}

test('an intentional backdrop click dismisses once', () => {
  const s = setup();
  s.fire('pointerdown');
  s.fire('pointerup');
  s.fire('click');
  s.fire('click');
  assert.equal(s.calls(), 1);
});

test('selecting text from inside the editor and releasing outside keeps it open', () => {
  const s = setup();
  s.fire('pointerdown', s.panel);
  s.fire('pointerup');
  // Browsers target the click at the nearest common ancestor of down/up.
  s.fire('click');
  assert.equal(s.calls(), 0);
  // A later deliberate outside click still works.
  s.fire('pointerdown'); s.fire('pointerup'); s.fire('click');
  assert.equal(s.calls(), 1);
});

test('dragging from the backdrop into the panel does not dismiss', () => {
  const s = setup();
  s.fire('pointerdown'); s.fire('pointerup', s.panel); s.fire('click');
  assert.equal(s.calls(), 0);
});

test('clicks inside the panel do not dismiss', () => {
  const s = setup();
  s.fire('pointerdown', s.panel); s.fire('pointerup', s.panel); s.fire('click', s.panel);
  assert.equal(s.calls(), 0);
});

test('cancelled gestures, secondary buttons and unmatched pointers do not dismiss', () => {
  const s = setup();
  s.fire('pointerdown'); s.fire('pointercancel'); s.fire('pointerup'); s.fire('click');
  s.fire('pointerdown', s.node, { button: 2 }); s.fire('pointerup'); s.fire('click');
  s.fire('pointerdown', s.node, { isPrimary: false }); s.fire('pointerup'); s.fire('click');
  s.fire('pointerdown'); s.fire('pointerup', s.node, { pointerId: 2 }); s.fire('click');
  assert.equal(s.calls(), 0);
});

test('the action uses its latest callback and removes listeners when destroyed', () => {
  const s = setup();
  let updated = 0;
  s.action.update(() => updated++);
  s.fire('pointerdown'); s.fire('pointerup'); s.fire('click');
  assert.equal(updated, 1);
  assert.equal(s.calls(), 0);
  s.action.destroy();
  s.fire('pointerdown'); s.fire('pointerup'); s.fire('click');
  assert.equal(updated, 1);
});

test('the note editor guards backdrop gestures and leaves the inline pane open', () => {
  const editor = readFileSync(new URL('../src/components/notes/NoteEditor.svelte', import.meta.url), 'utf8');
  assert.match(editor, /use:backdropClick=\{\(\) => \{ if \(!inline\) close\(\); \}\}/);
  assert.doesNotMatch(editor, /class="editor-backdrop"[^\n]*on:click/);
});
