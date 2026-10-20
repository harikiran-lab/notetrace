import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';
import { push } from 'svelte-spa-router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './platform.js';
import { requestPermission } from './notifications.js';
import { notifLocalEnabled, notifTraceResults } from '../stores/settings.js';
import { showToast, dismissToast } from '../stores/toast.js';
import { traceNoteKey } from './trace-sessions.js';
import { createTraceNotifier, shouldNotifyTrace } from './trace-notification-core.js';

const enabled = () => get(notifLocalEnabled) !== false && get(notifTraceResults) !== false;
const owner = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const reviewToasts = new Set();
let permissionAsked = false;
const notifier = createTraceNotifier({
  native: isNative,
  plugin: LocalNotifications,
  owner,
  enabled,
  isCurrent: data => data.owner === owner && data.noteId != null && traceNoteKey(data.noteId) === data.key,
  open: noteId => push(`/?note=${encodeURIComponent(noteId)}&trace=1`),
  copy: event => {
    const t = get(_);
    return { channel: t('trace_notifications.channel'),
      title: t(event.failure ? 'trace_notifications.failed' : 'trace_notifications.ready'),
      body: t('trace_notifications.review', { values: { title: event.title.trim() || t('notes.untitled') } }),
      review: t('trace_notifications.action') };
  },
  fallback: (text, review) => {
    const id = showToast(`${text.title} — ${text.body}`, 12000, 'info', {
      label: text.review, run: () => { dismissToast(id); reviewToasts.delete(id); review(); },
    });
    reviewToasts.add(id);
    setTimeout(() => reviewToasts.delete(id), 12000);
  },
  web: {
    permission: () => typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
    registration: () => navigator.serviceWorker?.getRegistration?.(),
    clientId: registration => new Promise(resolve => {
      const channel = new MessageChannel();
      const timeout = setTimeout(() => { channel.port1.close(); resolve(null); }, 1000);
      channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); resolve(event.data); };
      registration.active?.postMessage({ type: 'trace-client-id' }, [channel.port2]);
    }),
    create: (title, options) => new Notification(title, options),
    focus: () => window.focus(),
  },
});

// Called from the user's Ask Trace click, never when a background request ends.
export function requestTracePermission() {
  if (enabled() && !permissionAsked) {
    permissionAsked = true;
    requestPermission().catch(() => {});
  }
}

export function notifyTraceCompletion(event) {
  if (!shouldNotifyTrace({ viewing: event.isViewing(), visibility: document.visibilityState, focused: document.hasFocus() })) return;
  return notifier.show(event);
}

export function startTraceNotifications() {
  notifier.start().catch(() => {});
  if (!isNative) navigator.serviceWorker?.addEventListener('message', event => {
    if (event.data?.type === 'trace-result') notifier.activate(event.data);
  });
}

export async function clearTraceNotifications() {
  for (const id of reviewToasts) dismissToast(id);
  reviewToasts.clear();
  await notifier.clear();
}
