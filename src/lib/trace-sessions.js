import { writable } from 'svelte/store';
import { TRACE_ACTIONS, cleanTraceReply } from './trace-prompts.js';
import { settingPrefix, settingScope } from './setting-key.js';

const empty = () => ({ action: null, busy: false, result: '', error: '', failure: '', instruction: '', asking: false });

/** A note id is only unique within its server and account. */
export function traceNoteKey(noteId) {
  return noteId == null ? null : `${settingScope()}:${settingPrefix()}:${noteId}`;
}

/** Requests belong to notes, not to the popup that happens to display them. */
export function createTraceSessions() {
  const sessions = new Map();
  function forNote(key) {
    if (sessions.has(key)) return sessions.get(key);
    let state = empty();
    let generation = 0;
    const store = writable(state);
    function patch(changes) { state = { ...state, ...changes }; store.set(state); }
    const session = {
      subscribe: store.subscribe,
      patch,
      peek: () => state,
      reset() { generation++; state = empty(); store.set(state); },
      async run(kind, { title, body, instruction = state.instruction, request }) {
        if (state.busy || (kind === 'custom' && !instruction.trim())) return;
        const action = TRACE_ACTIONS[kind];
        if (!action) return;
        const current = ++generation;
        patch({ action: kind, asking: false, busy: true, result: '', error: '', failure: '', instruction });
        try {
          const result = cleanTraceReply(await request({ systemPrompt: action.system, prompt: action.prompt(title, body, instruction) }));
          if (current !== generation) return;
          patch({ result, failure: result ? '' : 'empty', busy: false });
        } catch (error) {
          if (current !== generation) return;
          patch({ error: error?.message || '', failure: 'failed', busy: false });
        }
      },
    };
    sessions.set(key, session);
    return session;
  }
  return {
    forNote,
    hasWork(key) { return !!sessions.get(key)?.peek().action; },
    clear() {
      for (const session of sessions.values()) session.reset();
      sessions.clear();
    },
  };
}

export const traceSessions = createTraceSessions();
