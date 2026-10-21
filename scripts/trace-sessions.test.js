import test from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'svelte/store';
import { createTraceSessions, traceNoteKey } from '../src/lib/trace-sessions.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('a request finishes with no popup subscribed and is restored when the note reopens', async () => {
  const sessions = createTraceSessions();
  const session = sessions.forNote('note-a');
  const response = deferred();
  const unsubscribe = session.subscribe(() => {});
  const running = session.run('tidy', { title: 'Trip', body: 'pack socks', request: () => response.promise });
  unsubscribe();
  assert.equal(get(sessions.forNote('note-a')).busy, true);
  response.resolve('Pack socks.');
  await running;
  const restored = get(sessions.forNote('note-a'));
  assert.equal(restored.result, 'Pack socks.');
  assert.equal(restored.action, 'tidy');
  assert.equal(restored.busy, false);
  assert.equal(sessions.hasWork('note-a'), true);
});

test('concurrent notes keep their own request, instruction and result', async () => {
  const sessions = createTraceSessions();
  const a = sessions.forNote('a'), b = sessions.forNote('b');
  const first = deferred(), second = deferred();
  a.patch({ instruction: 'Translate to Spanish', asking: true });
  let prompt;
  const one = a.run('custom', { title: 'A', body: 'hello', request: args => { prompt = args.prompt; return first.promise; } });
  const two = b.run('expand', { title: 'B', body: 'buy milk', request: () => second.promise });
  second.resolve('Buy some milk.'); await two;
  assert.equal(get(a).busy, true);
  assert.equal(get(b).result, 'Buy some milk.');
  first.resolve('Hola.'); await one;
  assert.match(prompt, /Translate to Spanish/);
  assert.equal(get(a).instruction, 'Translate to Spanish');
  assert.equal(get(a).result, 'Hola.');
  assert.equal(get(b).result, 'Buy some milk.');
});

test('reopening a busy session does not duplicate the provider request', async () => {
  const session = createTraceSessions().forNote('a');
  const response = deferred();
  let calls = 0;
  const args = { title: '', body: 'draft', request: () => { calls++; return response.promise; } };
  const running = session.run('tidy', args);
  await session.run('tidy', args);
  assert.equal(calls, 1);
  response.resolve('Draft.'); await running;
});

test('provider errors and empty replies survive closing and can be retried', async () => {
  const sessions = createTraceSessions();
  const session = sessions.forNote('a');
  await session.run('tidy', { body: 'text', request: async () => { throw new Error('Provider offline'); } });
  assert.equal(get(sessions.forNote('a')).error, 'Provider offline');
  assert.equal(get(session).busy, false);
  await session.run('tidy', { body: 'text', request: async () => '' });
  assert.equal(get(session).failure, 'empty');
  await session.run('tidy', { body: 'text', request: async () => 'Recovered.' });
  assert.equal(get(session).result, 'Recovered.');
  assert.equal(get(session).failure, '');
});

test('custom drafts survive closing without starting a request', () => {
  const sessions = createTraceSessions();
  sessions.forNote('a').patch({ instruction: 'Make this a table', asking: true });
  assert.equal(get(sessions.forNote('a')).instruction, 'Make this a table');
  assert.equal(get(sessions.forNote('a')).asking, true);
});

test('account reset clears sessions and late responses cannot bring old data back', async () => {
  const sessions = createTraceSessions();
  const old = sessions.forNote('a'), response = deferred();
  const running = old.run('tidy', { body: 'private', request: () => response.promise });
  sessions.clear();
  response.resolve('Old private reply'); await running;
  assert.equal(get(old).result, '');
  assert.equal(get(sessions.forNote('a')).result, '');
  assert.equal(sessions.hasWork('a'), false);
});

test('note session keys distinguish accounts and servers', () => {
  const before = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null };
  try {
    values.set('wl:userId', '1'); values.set('note:serverUrl', 'https://one.example');
    const first = traceNoteKey(7);
    values.set('wl:userId', '2'); assert.notEqual(traceNoteKey(7), first);
    values.set('wl:userId', '1'); values.set('note:serverUrl', 'https://two.example');
    assert.notEqual(traceNoteKey(7), first);
    assert.equal(traceNoteKey(null), null);
  } finally {
    if (before === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = before;
  }
});

test('completion is emitted once after leaving the popup, including errors, without changing the result', async () => {
  const completed = [];
  const sessions = createTraceSessions({ onComplete: event => { completed.push(event); throw new Error('No OS permission'); } });
  const session = sessions.forNote('a');
  const leave = session.view();
  const response = deferred();
  const running = session.run('tidy', { noteId: 7, title: 'Trip', body: 'socks', request: () => response.promise });
  leave(); response.resolve('Pack socks.'); await running;
  assert.equal(completed.length, 1);
  assert.equal(completed[0].noteId, 7);
  assert.equal(completed[0].isViewing(), false);
  assert.equal(completed[0].failure, '');
  assert.equal(get(session).result, 'Pack socks.');
  assert.equal(get(session).failure, '');
  await session.run('tidy', { noteId: 7, body: 'socks', request: async () => { throw new Error('Provider offline'); } });
  assert.equal(completed[1].failure, 'failed');
  assert.equal(completed[0].isCurrent(), false);
});

test('a result still being viewed is identified, and a cleared generation never emits completion', async () => {
  const completed = [];
  const sessions = createTraceSessions({ onComplete: event => completed.push(event) });
  const session = sessions.forNote('a');
  const leave = session.view();
  await session.run('tidy', { body: 'socks', request: async () => 'Pack socks.' });
  assert.equal(completed[0].isViewing(), true);
  leave();
  const response = deferred();
  const running = session.run('tidy', { body: 'socks', request: () => response.promise });
  sessions.clear(); response.resolve('Old reply'); await running;
  assert.equal(completed.length, 1);
});
