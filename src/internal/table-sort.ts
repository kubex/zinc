import {html, type TemplateResult} from 'lit';

export type SortState = 'ascending' | 'descending' | 'none';

export function renderSortIcon(state: SortState): TemplateResult {
  if (state === 'none') {
    return html`
      <div class="table__head__sort">
        <zn-icon src="chevrons_up_down@lu" size="14"></zn-icon>
      </div>`;
  }

  return html`
    <div class="table__head__sort table__head__sort--active">
      <zn-icon src="${state === 'ascending' ? 'arrow-up@lu' : 'arrow-down@lu'}" size="14"></zn-icon>
    </div>`;
}

export function sortKeyHandler(onSort: () => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSort();
  };
}
