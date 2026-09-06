'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const nav = $('#nav');
  const menu = $('#menuToggle');
  const theme = $('#themeToggle');
  const systemTheme = matchMedia('(prefers-color-scheme: light)');
  let savedTheme;
  try { savedTheme = localStorage.getItem('jg-theme'); } catch { /* Private storage is optional. */ }
  function applyTheme(value) {
    document.documentElement.dataset.theme = value;
    theme.setAttribute('aria-label', `Ativar tema ${value === 'dark' ? 'claro' : 'escuro'}`);
    theme.firstElementChild.textContent = value === 'dark' ? '☼' : '☾';
  }
  applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark');
  theme.addEventListener('click', () => {
    const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(value);
    try { localStorage.setItem('jg-theme', value); } catch { /* Theme still works for this visit. */ }
  });
  function closeMenu(restoreFocus = false) {
    nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu'); document.body.classList.remove('menu-open');
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    if (nav.classList.contains('open')) return closeMenu();
    nav.classList.add('open'); menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Fechar menu'); document.body.classList.add('menu-open');
    $('a', nav).focus();
  });
  $$('a', nav).forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const section = $(link.getAttribute('href'));
    section.tabIndex = -1; section.focus({ preventScroll: true });
  }));
  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !event.target.closest('.header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (!nav.classList.contains('open')) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const stops = [...$$('a', nav), theme, menu];
      const index = stops.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) { event.preventDefault(); menu.focus(); }
      else if (!event.shiftKey && index === stops.length - 1) { event.preventDefault(); stops[0].focus(); }
    }
  });
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    reveals.forEach(element => { element.classList.add('pending'); observer.observe(element); });
    motion.addEventListener('change', () => { if (motion.matches) reveals.forEach(el => el.classList.remove('pending')); });
  }
  const sections = $$('main section[id]');
  const navLinks = $$('a', nav);
  const backTop = $('#backTop');
  let frame = null;
  function updateScroll() {
    const total = document.documentElement.scrollHeight - innerHeight;
    $('#pageProgress').style.width = `${total > 0 ? Math.min(100, scrollY / total * 100) : 0}%`;
    backTop.hidden = scrollY < 600;
    let active = 'inicio';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 180) active = section.id; });
    navLinks.forEach(link => {
      const selected = link.hash === `#${active}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    frame = null;
  }
  function requestUpdate() { if (frame === null) frame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => { if (innerWidth > 820) closeMenu(); requestUpdate(); });
  backTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
    $('.logo').focus({ preventScroll: true });
  });
  const cards = $$('.project');
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
    let count = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { count++; card.classList.remove('pending'); }
    });
    $('#projectCount').textContent = `${count} projeto${count === 1 ? '' : 's'}`;
    requestUpdate();
  }));
  const highlights = [
    ['Apresentação de uma chácara em Extrema, Minas Gerais.', 'Galeria e organização das informações para visitantes.', 'Interface responsiva e caminhos de contato.'],
    ['Aplicação mobile desenvolvida como projeto de TCC.', 'Autenticação de usuários com Firebase.', 'Integração e gerenciamento de dados em React Native.'],
    ['Prática de lógica de programação e desenvolvimento em Java.', 'Modelagem e consultas em banco de dados MySQL.', 'Desenvolvimento web, versionamento e metodologias ágeis.']
  ];
  const dialog = $('#projectDialog');
  let opener;
  $$('[data-open-project]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const index = Number(button.dataset.openProject);
    const card = cards[index];
    const title = $('h3', card).textContent.trim();
    button.setAttribute('aria-haspopup', 'dialog');
    $('#dialogTitle').textContent = title;
    $('#dialogCategory').textContent = $('.project-meta p', card).textContent;
    $('#dialogDescription').textContent = $('.project-content > p', card).textContent.trim().replace(/\s+/g, ' ');
    $('#dialogTags').replaceChildren(...$$('.project-tech span', card).map(tag => tag.cloneNode(true)));
    $('#dialogHighlights').replaceChildren(...highlights[index].map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    $('#dialogContact').href = `mailto:jonassgsantos11@gmail.com?subject=${encodeURIComponent(`Vamos conversar sobre ${title}`)}`;
    dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('dialog-open');
  }));
  $$('[data-open-project]').forEach((button, index) => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', `Explorar projeto: ${$('h3', cards[index]).textContent.trim()}`);
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); opener?.focus({ preventScroll: true }); });
  let toastTimer;
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000); }
  $('#copyEmail').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('jonassgsantos11@gmail.com'); toast('E-mail copiado!');
    } catch {
      const link = $('.contact-links a[href^="mailto:"] strong');
      const range = document.createRange(); range.selectNodeContents(link);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      toast('E-mail selecionado. Use a opção Copiar do seu dispositivo.');
    }
  });
  $$('.skill-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || motion.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--rx', `${(0.5 - (event.clientY - rect.top) / rect.height) * 5}deg`);
      card.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });
  $('#year').textContent = new Date().getFullYear();
  updateScroll();
})();
