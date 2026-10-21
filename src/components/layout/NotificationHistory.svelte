<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { notificationHistory } from '../../lib/notification-history.js';
  import { traceSessions, traceNoteKey } from '../../lib/trace-sessions.js';
  import { closeOnBack } from '../../lib/back-stack.js';
  import { portal } from '../../lib/portal.js';
  import NotificationPermission from '../ui/NotificationPermission.svelte';

  let open = false;
  let trigger;
  $: unread = $notificationHistory.filter(e => !e.read).length;
  onMount(() => {
    notificationHistory.load();
    // Other tabs can add/read history for the same account.
    const storage = e => { if (!e.key || e.key.endsWith('notificationHistory')) notificationHistory.load(true); };
    window.addEventListener('storage', storage);
    return () => window.removeEventListener('storage', storage);
  });
  function close() { open = false; trigger?.focus(); }
  function mountDialog(node) { node.showModal(); }
  function outside(event) {
    if (event.target !== event.currentTarget) return;
    const r = event.currentTarget.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  }
  function review(entry) {
    notificationHistory.markRead(entry.id);
    close();
    if (entry.kind === 'update') { push('/settings/updates'); return; }
    if (entry.noteId === 'tasks') { push('/tasks'); return; }
    if (entry.noteId == null) return;
    const trace = entry.kind === 'trace-result' && traceSessions.hasWork(traceNoteKey(entry.noteId));
    push(`/?note=${encodeURIComponent(entry.noteId)}${trace ? '&trace=1' : ''}`);
  }
</script>

<button class="btn-icon notification-bell" bind:this={trigger} on:click={() => open = true}
  title={$_('notification_history.title')} aria-label={$_('notification_history.title')} aria-haspopup="dialog" aria-expanded={open}>
  <span class="material-symbols-rounded" aria-hidden="true">notifications</span>
  {#if unread}<span class="unread" aria-label={$_('notification_history.unread', { values: { count: unread } })}>{unread > 9 ? '9+' : unread}</span>{/if}
</button>

{#if open}
  <dialog use:portal use:mountDialog use:closeOnBack={close} on:close={close} on:click={outside} aria-label={$_('notification_history.title')}>
    <div class="history-heading">
      <h2>{$_('notification_history.title')}</h2>
      <button class="btn-icon" on:click={close} aria-label={$_('common.close')}><span class="material-symbols-rounded">close</span></button>
    </div>
    {#if $notificationHistory.length}
      <div class="history-actions">
        <button on:click={() => notificationHistory.markRead()}>{$_('notification_history.mark_read')}</button>
        <button on:click={() => notificationHistory.clear()}>{$_('notification_history.clear')}</button>
      </div>
    {/if}
    <ul class="history-list">
      {#each $notificationHistory as entry (entry.id)}
        <li>
          <button class="history-entry" class:unseen={!entry.read} on:click={() => review(entry)}>
            <span class="material-symbols-rounded entry-icon" aria-hidden="true">{entry.kind === 'trace-result' ? 'auto_awesome' : entry.kind === 'update' ? 'system_update' : 'notifications'}</span>
            <span class="entry-copy"><strong>{entry.title}</strong><span>{entry.body}</span><time datetime={new Date(entry.time).toISOString()}>{new Date(entry.time).toLocaleString()}</time></span>
            {#if !entry.read}<span class="unread-dot" aria-hidden="true"></span>{/if}
          </button>
        </li>
      {:else}
        <li class="history-empty"><span class="material-symbols-rounded" aria-hidden="true">notifications_none</span><p>{$_('notification_history.empty')}</p></li>
      {/each}
    </ul>
    <footer>
      <NotificationPermission />
      <p>{$_('notification_history.device_only')}</p>
    </footer>
  </dialog>
{/if}

<style>
  .notification-bell { position: relative; flex-shrink: 0; border-radius: 12px; }
  .unread { position: absolute; top: 0; right: 0; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 12px; background: var(--accent); color: var(--bg); font: 700 10px/16px var(--font-sans, sans-serif); }
  dialog { position: fixed; inset: auto; top: calc(var(--safe-top, 0px) + 12px); right: 12px; margin: 0; width: min(400px, calc(100vw - 24px)); max-height: calc(100dvh - var(--safe-top, 0px) - 24px); padding: 0; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface-1); color: var(--text-1); box-shadow: 0 16px 64px #0006; overflow: hidden; }
  dialog[open] { display: flex; flex-direction: column; }
  dialog::backdrop { background: #0005; }
  .history-heading { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); }
  h2 { margin: 0; font-size: 18px; }
  .history-actions { display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; }
  .history-actions button { color: var(--accent); font-size: 12px; min-height: 32px; }
  .history-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; min-height: 0; overscroll-behavior: contain; }
  .history-entry { display: flex; gap: 12px; width: 100%; padding: 16px; text-align: start; color: var(--text-1); border-bottom: 1px solid var(--border); }
  .history-entry:hover, .history-entry.unseen { background: var(--surface-2); }
  .entry-icon { color: var(--accent); flex-shrink: 0; }
  .entry-copy { display: flex; flex-direction: column; gap: 5px; min-width: 0; overflow-wrap: anywhere; font-size: 13px; }
  .entry-copy > span { color: var(--text-2); line-height: 1.5; }
  time { color: var(--text-3); font-size: 11px; }
  .unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-left: auto; }
  .history-empty { padding: 36px 20px; text-align: center; color: var(--text-3); font-size: 14px; }
  .history-empty > span { font-size: 32px; }
  footer { border-top: 1px solid var(--border); padding: 16px; flex-shrink: 0; }
  footer p { margin: 12px 0 0; font-size: 12px; line-height: 1.5; color: var(--text-3); }
</style>
