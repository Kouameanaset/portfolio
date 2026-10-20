(() => {
  const history = [];
  const suggestions = ['Quels sont tes projets principaux ?', 'Quelles technologies maîtrises-tu ?', 'Cherches-tu un stage ?'];

  const root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML = `
    <button class="chat-toggle" aria-expanded="false" aria-controls="chat-panel">Pose-moi une question <span aria-hidden="true">✳</span></button>
    <section class="chat-panel" id="chat-panel" aria-label="Assistant du portfolio" hidden>
      <header class="chat-head"><strong>Assistant du portfolio</strong><button class="chat-close" aria-label="Fermer l'assistant">×</button></header>
      <div class="chat-log" role="log" aria-live="polite"></div>
      <div class="chat-suggestions"></div>
      <form class="chat-form"><label class="visually-hidden" for="chat-input">Votre question</label><input id="chat-input" maxlength="500" autocomplete="off" placeholder="Écris ta question…"><button class="btn-primary" type="submit">Envoyer</button></form>
      <p class="chat-note">Propulsé par l'API Gemini. Les réponses se limitent au parcours de Chris.</p>
    </section>`;
  document.body.append(root);

  const toggle = root.querySelector('.chat-toggle');
  const panel = root.querySelector('.chat-panel');
  const log = root.querySelector('.chat-log');
  const form = root.querySelector('.chat-form');
  const input = root.querySelector('#chat-input');
  const chips = root.querySelector('.chat-suggestions');

  const add = (role, text) => {
    const bubble = document.createElement('p');
    bubble.className = `chat-msg chat-${role}`;
    bubble.textContent = text;
    log.append(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  };

  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!log.children.length) add('bot', "Bonjour ! Je réponds aux questions sur le parcours, les compétences et les projets de Chris.");
      input.focus();
    } else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('.chat-close').addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  async function send(text) {
    chips.hidden = true;
    add('user', text);
    history.push({ role: 'user', content: text });
    const pending = add('bot', '…');
    form.querySelector('button').disabled = true;
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur.');
      pending.textContent = data.reply;
      history.push({ role: 'assistant', content: data.reply });
    } catch (error) {
      pending.textContent = error.message || "L'assistant est indisponible. Écris-moi via la page Contact.";
      history.pop();
    } finally {
      form.querySelector('button').disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  }

  suggestions.forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = text;
    chip.addEventListener('click', () => send(text));
    chips.append(chip);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    send(text);
  });
})();
