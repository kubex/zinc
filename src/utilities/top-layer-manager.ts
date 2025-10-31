class TopLayerManager {
  private openDropdowns: Set<HTMLElement> = new Set();
  private openTooltips: Set<HTMLElement> = new Set();

  registerDropdown(el: HTMLElement) {
    this.openDropdowns.add(el);
  }

  unregisterDropdown(el: HTMLElement) {
    this.openDropdowns.delete(el);
  }

  isDropdownOpen() {
    return this.openDropdowns.size > 0;
  }

  registerTooltip(el: HTMLElement) {
    this.openTooltips.add(el);
  }

  unregisterTooltip(el: HTMLElement) {
    this.openTooltips.delete(el);
  }

  isTooltipOpen() {
    return this.openTooltips.size > 0;
  }
}

const topLayerManager = new TopLayerManager();

export default topLayerManager;
