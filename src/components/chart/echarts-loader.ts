import type * as echartsCore from 'echarts/core';

export type EChartsModule = typeof echartsCore;

let promise: Promise<EChartsModule> | undefined;

// Lazy-load echarts so it lands in its own chunk instead of the main bundle.
export function loadECharts(): Promise<EChartsModule> {
  promise ??= (async () => {
    const [core, charts, components, renderers] = await Promise.all([
      import('echarts/core'),
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ]);
    core.use([
      charts.BarChart,
      charts.FunnelChart,
      charts.GaugeChart,
      charts.HeatmapChart,
      charts.LineChart,
      charts.PieChart,
      charts.RadarChart,
      charts.SankeyChart,
      charts.ScatterChart,
      charts.SunburstChart,
      charts.TreemapChart,
      components.GridComponent,
      components.TooltipComponent,
      components.LegendComponent,
      components.TitleComponent,
      components.DataZoomComponent,
      components.RadarComponent,
      components.VisualMapComponent,
      renderers.CanvasRenderer,
    ]);
    return core;
  })();
  return promise;
}
