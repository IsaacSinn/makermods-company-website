(() => {
  'use strict';

  const root = document.querySelector('[data-open-booth]');
  if (!root) return;

  const catalogSrc = root.dataset.catalogSrc || 'assets/open-booth/catalog.json';
  const grid = document.querySelector('[data-ob-grid]');
  const filters = document.querySelector('[data-ob-filters]');
  const search = document.querySelector('[data-ob-search]');
  const resultCount = document.querySelector('[data-ob-result-count]');
  const empty = document.querySelector('[data-ob-empty]');
  const modal = document.querySelector('[data-open-booth-modal]');
  const modalContent = document.querySelector('[data-ob-modal-content]');
  const closeButtons = document.querySelectorAll('[data-ob-close]');

  const state = {
    datasets: [],
    filtered: [],
    activeTag: 'all',
    query: '',
  };

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatTag = (tag) => String(tag || 'untagged')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds)) return 'Unknown';
    const rounded = Math.round(seconds);
    if (rounded < 60) return `${rounded} sec`;
    const minutes = Math.floor(rounded / 60);
    const remaining = rounded % 60;
    return `${minutes}:${String(remaining).padStart(2, '0')}`;
  };

  const formatHours = (seconds) => {
    if (!Number.isFinite(seconds)) return '0';
    return (seconds / 3600).toFixed(1);
  };

  function searchableText(dataset) {
    return [
      dataset.repo,
      dataset.dataset_name,
      dataset.task_label,
      dataset.sort_tag,
    ].join(' ').toLowerCase();
  }

  function updateStats(catalog) {
    const totalMp4s = state.datasets.reduce((sum, dataset) => sum + Number(dataset.mp4_count || 0), 0);
    const totalSeconds = state.datasets.reduce((sum, dataset) => sum + Number(dataset.duration_seconds || 0), 0);
    const tags = new Set(state.datasets.map((dataset) => dataset.sort_tag).filter(Boolean));
    const stats = {
      datasets: catalog.dataset_count || state.datasets.length,
      videos: totalMp4s,
      hours: formatHours(totalSeconds),
      tags: tags.size,
    };

    for (const [key, value] of Object.entries(stats)) {
      document.querySelectorAll(`[data-ob-stat="${key}"]`).forEach((element) => {
        element.textContent = value;
      });
    }
  }

  function renderFilters() {
    if (!filters) return;
    const tagCounts = new Map();
    for (const dataset of state.datasets) {
      const tag = dataset.sort_tag || 'untagged';
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const chips = [['all', state.datasets.length], ...sortedTags];
    filters.innerHTML = chips.map(([tag, count]) => `
      <button class="ob-chip" type="button" data-ob-tag="${escapeHtml(tag)}" aria-pressed="${tag === state.activeTag ? 'true' : 'false'}">
        ${tag === 'all' ? 'All' : escapeHtml(formatTag(tag))} · ${count}
      </button>
    `).join('');

    filters.querySelectorAll('[data-ob-tag]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeTag = button.dataset.obTag || 'all';
        applyFilters();
      });
    });
  }

  function datasetCard(dataset, index) {
    return `
      <button class="ob-card" type="button" data-ob-index="${index}" aria-label="Open ${escapeHtml(dataset.task_label)} skill details">
        <span class="ob-thumb">
          <img src="${escapeHtml(dataset.thumbnail_path)}" alt="${escapeHtml(dataset.task_label)} thumbnail" loading="lazy">
          <span class="tag">${escapeHtml(formatTag(dataset.sort_tag))}</span>
        </span>
        <span class="ob-card-body">
          <span>
            <h3>${escapeHtml(dataset.task_label)}</h3>
            <span class="ob-repo">${escapeHtml(dataset.repo)}</span>
          </span>
          <span class="ob-card-meta">
            <span>${Number(dataset.mp4_count || 0)} MP4s</span>
            <span>${escapeHtml(formatDuration(Number(dataset.duration_seconds)))}</span>
          </span>
        </span>
      </button>
    `;
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = state.filtered.map((dataset) => datasetCard(dataset, state.datasets.indexOf(dataset))).join('');
    grid.querySelectorAll('[data-ob-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const dataset = state.datasets[Number(button.dataset.obIndex)];
        if (dataset) openModal(dataset);
      });
    });

    if (resultCount) {
      const label = state.filtered.length === 1 ? 'skill' : 'skills';
      resultCount.textContent = `${state.filtered.length} ${label} shown`;
    }
    if (empty) {
      empty.dataset.visible = state.filtered.length ? 'false' : 'true';
    }
  }

  function applyFilters() {
    const query = state.query.trim().toLowerCase();
    const queryTerms = query.split(/\s+/).filter(Boolean);
    state.filtered = state.datasets.filter((dataset) => {
      const tagMatch = state.activeTag === 'all' || dataset.sort_tag === state.activeTag;
      const text = searchableText(dataset);
      const queryMatch = !queryTerms.length || queryTerms.every((term) => text.includes(term));
      return tagMatch && queryMatch;
    });
    renderFilters();
    renderGrid();
  }

  function openModal(dataset) {
    if (!modal || !modalContent) return;
    const tags = Array.isArray(dataset.hf_tags) ? dataset.hf_tags.slice(0, 12) : [];
    modalContent.innerHTML = `
      <div class="ob-contact-sheet">
        <img src="${escapeHtml(dataset.contact_sheet_path)}" alt="${escapeHtml(dataset.task_label)} contact sheet">
      </div>
      <div class="ob-detail">
        <div>
          <div class="eyebrow">[ ${escapeHtml(formatTag(dataset.sort_tag))} ]</div>
          <h2>${escapeHtml(dataset.task_label)}</h2>
          <div class="repo">${escapeHtml(dataset.repo)}</div>
        </div>
        <div class="ob-detail-meta">
          <div><span class="k">skill source</span><span class="v">${escapeHtml(dataset.dataset_name)}</span></div>
          <div><span class="k">author</span><span class="v">${escapeHtml(dataset.author)}</span></div>
          <div><span class="k">mp4 files</span><span class="v">${Number(dataset.mp4_count || 0)}</span></div>
          <div><span class="k">duration</span><span class="v">${escapeHtml(formatDuration(Number(dataset.duration_seconds)))}</span></div>
        </div>
        <div>
          <div class="eyebrow">[ HUGGING FACE TAGS ]</div>
          <div class="ob-hf-tags">
            ${tags.length ? tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('') : '<span>No tags listed</span>'}
          </div>
        </div>
        <div class="ob-detail-actions">
          <a class="btn btn-stencil" href="${escapeHtml(dataset.huggingface_url)}" target="_blank" rel="noopener">[ OPEN SKILL DATA -> ]</a>
          <a class="btn btn-secondary" href="${escapeHtml(dataset.representative_video_url)}" target="_blank" rel="noopener">Representative video</a>
        </div>
      </div>
    `;
    modal.dataset.open = 'true';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ob-lock');
    modal.querySelector('[data-ob-close]')?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.dataset.open = 'false';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ob-lock');
  }

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.dataset.open === 'true') {
      closeModal();
    }
  });

  search?.addEventListener('input', () => {
    state.query = search.value;
    applyFilters();
  });

  fetch(catalogSrc)
    .then((response) => {
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      return response.json();
    })
    .then((catalog) => {
      state.datasets = Array.isArray(catalog.datasets) ? catalog.datasets : [];
      state.filtered = [...state.datasets];
      updateStats(catalog);
      renderFilters();
      renderGrid();
    })
    .catch((error) => {
      console.error(error);
      if (empty) {
        empty.dataset.visible = 'true';
        empty.textContent = 'Skill catalog could not be loaded. Check the local static server and asset paths.';
      }
    });
})();
