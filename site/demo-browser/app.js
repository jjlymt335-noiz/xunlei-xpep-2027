(function () {
  'use strict';

  const validViews = new Set(['current', 'lean']);
  const contextCopy = {
    read: ['阅读模式', '只在识别到长文或小说时按需出现'],
    play: ['纯净播放', '只在识别到媒体资源时按需出现'],
    toolbox: ['可编辑工具箱', '离线网页、密码箱、电脑版网页由用户自定义']
  };

  function replaceCaptureState(state) {
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    window.history.replaceState({}, '', url);
  }

  function closeContext() {
    const panel = document.querySelector('[data-testid="context-panel"]');
    panel.hidden = true;
    panel.classList.remove('is-open');
  }

  function setView(view) {
    const next = validViews.has(view) ? view : 'lean';
    closeContext();
    document.body.dataset.activeView = next;
    document.querySelectorAll('[data-view]').forEach((element) => {
      element.hidden = element.dataset.view !== next;
    });
    document.querySelectorAll('[data-action="show-current"], [data-action="show-lean"]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.action === `show-${next}`));
    });
  }

  function openSheet(title, description, items) {
    const panel = document.querySelector('[data-testid="context-panel"]');
    const sheet = document.createElement('div');
    const header = document.createElement('div');
    const heading = document.createElement('strong');
    const detail = document.createElement('span');
    const close = document.createElement('button');
    const grid = document.createElement('div');
    sheet.dataset.testid = 'browser-menu-sheet';
    sheet.setAttribute('data-testid', 'browser-menu-sheet');
    header.className = 'sheet-header';
    grid.className = 'sheet-grid';
    heading.textContent = title;
    detail.textContent = description;
    close.type = 'button';
    close.dataset.action = 'close-panel';
    close.setAttribute('aria-label', '关闭面板');
    close.textContent = '×';
    header.append(heading, detail, close);
    items.forEach((item) => {
      const entry = document.createElement(item.action ? 'button' : 'span');
      const icon = document.createElement('i');
      const label = document.createElement('span');
      entry.className = 'sheet-item';
      icon.textContent = item.icon;
      label.textContent = item.label;
      if (item.action) entry.dataset.action = item.action;
      entry.append(icon, label);
      grid.append(entry);
    });
    sheet.append(header, grid);
    panel.replaceChildren(sheet);
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
  }

  function openContext(mode) {
    const [title, detail] = contextCopy[mode] || contextCopy.toolbox;
    openSheet(title, detail, [{ icon: '✓', label: detail }]);
  }

  function openMenu() {
    if (document.body.dataset.activeView === 'current') {
      openSheet('菜单', '当前公开功能家族', [
        { icon: '☆', label: '书签' }, { icon: '◷', label: '历史' }, { icon: '↓', label: '下载' },
        { icon: '☁', label: '云盘' }, { icon: '▦', label: '工具箱' }, { icon: '⚙', label: '设置' }
      ]);
      return;
    }
    openSheet('菜单', '按任务收纳，不让能力消失', [
      { icon: '★', label: '收藏与文件' }, { icon: '☁', label: '保存到云盘' }, { icon: '▦', label: '工具箱', action: 'open-toolbox' },
      { icon: '⚙', label: '设置' }
    ]);
  }

  function initialise() {
    const state = new URLSearchParams(window.location.search).get('state');
    setView(state === 'current' ? 'current' : 'lean');
    if (state === 'toolbox') openContext('toolbox');
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const { action } = trigger.dataset;
    if (action === 'show-current') { setView('current'); replaceCaptureState('current'); }
    else if (action === 'show-lean') { setView('lean'); replaceCaptureState('lean'); }
    else if (action === 'open-menu') openMenu();
    else if (action === 'close-panel') closeContext();
    else if (action === 'open-read') openContext('read');
    else if (action === 'open-play') openContext('play');
    else if (action === 'open-toolbox') { setView('lean'); openContext('toolbox'); replaceCaptureState('toolbox'); }
  });

  window.setView = setView;
  window.openContext = openContext;
  initialise();
}());
