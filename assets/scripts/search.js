(() =>
{
  // Lucide icon per component page slug; unmapped components fall back to a puzzle piece
  const componentIcons = {
    'absolute-container': 'move',
    'action-bar': 'panel-top',
    'alert': 'triangle-alert',
    'animated-button': 'sparkles',
    'audio-select': 'audio-lines',
    'avatar-group': 'users',
    'background': 'image',
    'badge': 'tag',
    'bulk-actions': 'list-checks',
    'button': 'mouse-pointer-click',
    'button-group': 'group',
    'button-menu': 'square-menu',
    'channel-tile': 'radio-tower',
    'chart': 'chart-line',
    'chat-message': 'message-square',
    'chat-message-attachment': 'paperclip',
    'checkbox': 'square-check',
    'checkbox-group': 'list-checks',
    'chip': 'tag',
    'collapsible': 'chevrons-up-down',
    'color-picker': 'pipette',
    'color-select': 'palette',
    'cols': 'columns-3',
    'confirm': 'circle-question-mark',
    'content-block': 'text-quote',
    'context-menu': 'menu',
    'copy-button': 'copy',
    'data-select': 'list-filter',
    'data-table': 'table',
    'data-table-filter': 'funnel',
    'data-table-search': 'search',
    'data-table-sort': 'arrow-down-up',
    'date-range': 'calendar-range',
    'datepicker': 'calendar',
    'defined-label': 'tag',
    'dialog': 'app-window',
    'diff': 'diff',
    'diff-row': 'git-compare',
    'dropdown': 'chevron-down',
    'editor': 'square-pen',
    'empty-state': 'inbox',
    'expanding-action': 'expand',
    'file': 'file',
    'filter-container': 'funnel',
    'filter-wrapper': 'funnel',
    'flow-builder': 'workflow',
    'form-actions': 'send',
    'form-group': 'rows-3',
    'header': 'heading',
    'hover-container': 'mouse-pointer',
    'icon': 'shapes',
    'icon-picker': 'grid-3x3',
    'infinite-scroll': 'infinity',
    'inline-edit': 'pencil',
    'input': 'text-cursor-input',
    'input-group': 'text-cursor-input',
    'item': 'list',
    'key': 'key',
    'key-container': 'key-round',
    'key-value': 'brackets',
    'linked-select': 'link',
    'markdown-editor': 'file-pen',
    'menu': 'menu',
    'menu-item': 'list',
    'menu-label': 'tag',
    'nav-item': 'navigation',
    'nav-list': 'list-tree',
    'navbar': 'panel-top',
    'note': 'sticky-note',
    'opt-group': 'list-tree',
    'option': 'list',
    'order-table': 'receipt',
    'page': 'file-text',
    'page-builder': 'layout-template',
    'page-nav': 'book-open',
    'pagination': 'ellipsis',
    'pane': 'panel-left',
    'panel': 'square',
    'popup': 'message-square-more',
    'preview-frame': 'monitor',
    'priority-list': 'list-ordered',
    'progress-bar': 'loader',
    'progress-tile': 'gauge',
    'query-builder': 'database',
    'radio': 'circle-dot',
    'radio-group': 'list-todo',
    'rating': 'star',
    'remarkd-editor': 'file-pen',
    'report-table': 'sheet',
    'reveal': 'eye',
    'schedule-builder': 'calendar-clock',
    'scroll-container': 'scroll',
    'select': 'list-collapse',
    'settings-container': 'settings',
    'sidebar': 'panel-left',
    'simple-chart': 'chart-bar',
    'skeleton': 'loader-circle',
    'slash-item': 'slash',
    'slash-menu': 'slash',
    'slideout': 'panel-right',
    'sp': 'space',
    'split-button': 'split',
    'split-pane': 'columns-2',
    'stat': 'trending-up',
    'status-indicator': 'circle',
    'stepper': 'footprints',
    'style': 'paintbrush',
    'tab': 'panel-top',
    'table': 'table',
    'tabs': 'panel-top',
    'textarea': 'pilcrow',
    'theme-editor': 'swatch-book',
    'thumbnail': 'image',
    'thumbnail-group': 'images',
    'tile': 'layout-grid',
    'tile-group': 'layout-grid',
    'tile-property': 'tag',
    'timer': 'timer',
    'toggle': 'toggle-right',
    'tooltip': 'message-circle',
    'translation-field': 'languages',
    'translation-fields': 'languages',
    'translation-grid': 'languages',
    'translation-group': 'languages',
    'translations': 'languages',
    'vertical-stepper': 'list-ordered',
    'well': 'inbox'
  };

  // Append the search dialog to the body
  const siteSearch = document.createElement('div');
  const scrollbarWidth = Math.abs(window.innerWidth - document.documentElement.clientWidth);

  siteSearch.classList.add('search');
  siteSearch.innerHTML = `
    <div class="search__overlay"></div>
    <dialog id="search-dialog" class="search__dialog">
      <div class="search__content">
        <div class="search__header">
          <div id="search-combobox" class="search__input-wrapper">
            <zn-icon src="search" library="lucide" size="20"></zn-icon>
            <input
              id="search-input"
              class="search__input"
              type="search"
              placeholder="Search"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              enterkeyhint="go"
              spellcheck="false"
              maxlength="100"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="search-listbox"
              aria-haspopup="listbox"
              aria-activedescendant
            >
            <button type="button" class="search__clear-button" aria-label="Clear entry" tabindex="-1" hidden>
              <zn-icon src="x" library="lucide" size="16"></zn-icon>
            </button>
          </div>
        </div>
        <div class="search__body">
          <ul
            id="search-listbox"
            class="search__results"
            role="listbox"
            aria-label="Search results"
          ></ul>
          <div class="search__empty">No matching pages</div>
        </div>
        <footer class="search__footer">
          <small><kbd>↑</kbd> <kbd>↓</kbd> Navigate</small>
          <small><kbd>↲</kbd> Select</small>
          <small><kbd>Esc</kbd> Close</small>
        </footer>
      </div>
    </dialog>
  `;

  const overlay = siteSearch.querySelector('.search__overlay');
  const dialog = siteSearch.querySelector('.search__dialog');
  const input = siteSearch.querySelector('.search__input');
  const clearButton = siteSearch.querySelector('.search__clear-button');
  const results = siteSearch.querySelector('.search__results');
  const version = document.documentElement.getAttribute('data-zinc-version');
  const key = `search_${version}_${document.documentElement.getAttribute('data-build-id')}`;
  const searchDebounce = 50;
  const animationDuration = 150;
  let isShowing = false;
  let searchTimeout;
  let searchIndex;
  let map;

  const loadSearchIndex = new Promise(resolve =>
  {
    const cache = localStorage.getItem(key);
    const wait = 'requestIdleCallback' in window ? requestIdleCallback : requestAnimationFrame;

    // Cleanup other cached search indices
    try
    {
      Object.keys({...localStorage}).forEach(k =>
      {
        if(k.startsWith('search_') && k !== key)
        {
          localStorage.removeItem(k);
        }
      });
    }
    catch
    {
      /* do nothing */
    }

    // Look for a cached index
    try
    {
      if(cache)
      {
        const data = JSON.parse(cache);

        searchIndex = window.lunr.Index.load(data.searchIndex);
        map = data.map;

        return resolve();
      }
    }
    catch
    {
      /* do nothing */
    }

    // Wait until idle to fetch the index
    wait(() =>
    {
      fetch('/assets/search.json')
        .then(res => res.json())
        .then(data =>
        {
          if(!window.lunr)
          {
            console.error('The Lunr search client has not yet been loaded.');
          }

          searchIndex = window.lunr.Index.load(data.searchIndex);
          map = data.map;

          // Cache the search index for this version
          if(version)
          {
            try
            {
              localStorage.setItem(key, JSON.stringify(data));
            }
            catch(err)
            {
              console.warn(`Unable to cache the search index: ${err}`);
            }
          }

          resolve();
        });
    });
  });

  async function show()
  {
    isShowing = true;
    document.body.append(siteSearch);
    document.body.classList.add('search-visible');
    document.body.style.setProperty('--docs-search-scroll-lock-size', `${scrollbarWidth}px`);
    clearButton.hidden = true;
    requestAnimationFrame(() => input.focus());
    updateResults();

    dialog.showModal();

    await Promise.all([
      dialog.animate(
        [
          {opacity: 0, transform: 'scale(.9)', transformOrigin: 'top'},
          {opacity: 1, transform: 'scale(1)', transformOrigin: 'top'}
        ],
        {duration: animationDuration}
      ).finished,
      overlay.animate([{opacity: 0}, {opacity: 1}], {duration: animationDuration}).finished
    ]);

    dialog.addEventListener('mousedown', handleMouseDown);
    dialog.addEventListener('keydown', handleKeyDown);
  }

  async function hide()
  {
    isShowing = false;

    await Promise.all([
      dialog.animate(
        [
          {opacity: 1, transform: 'scale(1)', transformOrigin: 'top'},
          {opacity: 0, transform: 'scale(.9)', transformOrigin: 'top'}
        ],
        {duration: animationDuration}
      ).finished,
      overlay.animate([{opacity: 1}, {opacity: 0}], {duration: animationDuration}).finished
    ]);

    dialog.close();

    input.blur(); // otherwise Safari will scroll to the bottom of the page on close
    input.value = '';
    document.body.classList.remove('search-visible');
    document.body.style.removeProperty('--docs-search-scroll-lock-size');
    siteSearch.remove();
    updateResults();

    dialog.removeEventListener('mousedown', handleMouseDown);
    dialog.removeEventListener('keydown', handleKeyDown);
  }

  function handleInput()
  {
    clearButton.hidden = input.value === '';

    // Debounce search queries
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => updateResults(input.value), searchDebounce);
  }

  function handleClear()
  {
    clearButton.hidden = true;
    input.value = '';
    input.focus();
    updateResults();
  }

  function handleMouseDown(event)
  {
    if(!event.target.closest('.search__content'))
    {
      hide();
    }
  }

  function handleKeyDown(event)
  {
    // Close when pressing escape
    if(event.key === 'Escape')
    {
      event.preventDefault(); // prevent <dialog> from closing immediately so it can animate
      event.stopImmediatePropagation();
      hide();
      return;
    }

    // Handle keyboard selections
    if(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key))
    {
      event.preventDefault();

      const currentEl = results.querySelector('[data-selected="true"]');
      const items = [...results.querySelectorAll('li')];
      const index = items.indexOf(currentEl);
      let nextEl;

      if(items.length === 0)
      {
        return;
      }

      switch(event.key)
      {
        case 'ArrowUp':
          nextEl = items[Math.max(0, index - 1)];
          break;
        case 'ArrowDown':
          nextEl = items[Math.min(items.length - 1, index + 1)];
          break;
        case 'Home':
          nextEl = items[0];
          break;
        case 'End':
          nextEl = items[items.length - 1];
          break;
        case 'Enter':
          currentEl?.querySelector('a')?.click();
          break;
      }

      // Update the selected item
      items.forEach(item =>
      {
        if(item === nextEl)
        {
          input.setAttribute('aria-activedescendant', item.id);
          item.setAttribute('data-selected', 'true');
          nextEl.scrollIntoView({block: 'nearest'});
        }
        else
        {
          item.setAttribute('data-selected', 'false');
        }
      });
    }
  }

  async function updateResults(query = '')
  {
    try
    {
      await loadSearchIndex;

      const hasQuery = query.length > 0;
      const searchTerms = query
        .split(' ')
        .map((term, index, arr) =>
        {
          // Search API: https://lunrjs.com/guides/searching.html
          if(index === arr.length - 1)
          {
            // The last term is not mandatory and 1x fuzzy. We also duplicate it with a wildcard to match partial words
            // as the user types.
            return `${term}~1 ${term}*`;
          }
          else
          {
            // All other terms are mandatory and 1x fuzzy
            return `+${term}~1`;
          }
        })
        .join(' ');
      const matches = hasQuery ? searchIndex.search(searchTerms) : [];
      const hasResults = hasQuery && matches.length > 0;

      siteSearch.classList.toggle('search--has-results', hasQuery && hasResults);
      siteSearch.classList.toggle('search--no-results', hasQuery && !hasResults);

      input.setAttribute('aria-activedescendant', '');
      results.innerHTML = '';

      matches.forEach((match, index) =>
      {
        const page = map[match.ref];
        const li = document.createElement('li');
        const a = document.createElement('a');
        const displayTitle = page.title ?? '';
        const displayDescription = page.description ?? '';
        const displayUrl = page.url.replace(/^\//, '').replace(/\/$/, '');
        let icon = 'file-text';

        a.setAttribute('role', 'option');
        a.setAttribute('id', `search-result-item-${match.ref}`);

        const slug = page.url.match(/\/components\/([^/]+)/)?.[1];
        if(slug)
        {
          icon = componentIcons[slug] ?? 'puzzle';
        }
        else if(page.url.includes('getting-started/'))
        {
          icon = 'lightbulb';
        }

        li.classList.add('search__result');
        li.setAttribute('role', 'option');
        li.setAttribute('id', `search-result-item-${match.ref}`);
        li.setAttribute('data-selected', index === 0 ? 'true' : 'false');

        a.href = page.url;
        a.innerHTML = `
          <div class="search__result-icon" aria-hidden="true">
            <zn-icon src="${icon}" library="lucide" size="20"></zn-icon>
          </div>
          <div class="search__result__details">
            <div class="search__result-title"></div>
            <div class="search__result-description"></div>
            <div class="search__result-url"></div>
          </div>
        `;
        a.querySelector('.search__result-title').textContent = displayTitle;
        a.querySelector('.search__result-description').textContent = displayDescription;
        a.querySelector('.search__result-url').textContent = displayUrl;

        li.appendChild(a);
        results.appendChild(li);
      });
    }
    catch
    {
      // Ignore query errors as the user types
    }
  }

  // Show the search dialog when clicking on data-plugin="search"
  document.addEventListener('click', event =>
  {
    const searchButton = event.target.closest('[data-plugin="search"]');
    if(searchButton)
    {
      show();
    }
  });

  // Show the search dialog when / (or SHFT + ?, or CMD+K) is pressed and focus is not inside a form element
  document.addEventListener('keydown', event =>
  {
    if(
      !isShowing &&
      (event.key === '/' || (event.key === '?' && event.shiftKey) || (event.key === 'k' && (event.metaKey || event.ctrlKey))) &&
      !event.composedPath().some(el => ['input', 'textarea'].includes(el?.tagName?.toLowerCase()))
    )
    {
      event.preventDefault();
      show();
    }
  });

  input.addEventListener('input', handleInput);
  clearButton.addEventListener('click', handleClear);

  // Close when a result is selected
  results.addEventListener('click', event =>
  {
    if(event.target.closest('a'))
    {
      hide();
    }
  });

  // We're using Turbo, so when a user searches for something, visits a result, and presses the back button, the search
  // UI will still be visible but not interactive. This removes the search UI when Turbo renders a page so they don't
  // get trapped.
  window.addEventListener('turbo:render', () =>
  {
    document.body.classList.remove('search-visible');
    document.querySelectorAll('.search__overlay, .search__dialog').forEach(el => el.remove());
  });
})();
