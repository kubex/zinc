type NavigationEntry = Pick<PerformanceNavigationTiming, 'type'>;

export function shouldRestoreTabSelection(entries?: readonly NavigationEntry[]): boolean {
  const navigationEntries = entries ?? globalThis.performance?.getEntriesByType('navigation') as PerformanceNavigationTiming[] ?? [];
  const navigationType = navigationEntries[0]?.type;

  return navigationType === 'reload' || navigationType === 'back_forward';
}
