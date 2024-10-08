import {html} from "lit";

import '../../src/Charts/DataChart';
import '../../src/Panel';

export default {
  component: 'zn-data-chart',
  title: 'Charts/DataChart',
  tags: ['charts', 'data-chart'],
};


export const Default = {
  render: ({type, categories, data, height}) =>
  {
    return html`
      <zn-panel>
        <zn-data-chart type="${type}" .categories=${categories} .data=${data} .height=${height}></zn-data-chart>
      </zn-panel>`;
  },
  args: {
    type: 'area',
    height: 300,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    data: [
      {
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91, 125],
      },
      {
        name: 'Series 2',
        data: [10, 20, 35, 40, 39, 50, 60, 81, 115],
      },
      {
        name: 'Series 3',
        data: [5, 10, 15, 20, 25, 30, 35, 40, 45],
      },
      {
        name: 'Series 4',
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, {
        name: 'Series 5',
        data: [20, 30, 35, 40, 39, 50, 30, 40, 65],
      }, {
        name: 'Series 6',
        data: [10, 20, 25, 30, 29, 40, 20, 30, 55],
      }, {
        name: 'Series 7',
        data: [5, 10, 15, 20, 15, 20, 10, 20, 35],
      }, {
        name: 'Series 8',
        data: [1, 2, 3, 4, 3, 4, 2, 4, 6],
      }, {
        name: 'Series 9',
        data: [20, 30, 35, 40, 39, 50, 30, 40, 65],
      }, {
        name: 'Series 10',
        data: [10, 20, 25, 30, 29, 40, 20, 30, 55],
      }
    ]
  },
  argTypes: {
    name: {control: 'text'},
    type: {control: 'select', options: ['line', 'bar', 'area']},
  },
};


export const TimeSeries = {
  render: ({type, data, xAxis}) =>
  {
    return html`
      <zn-data-chart type="${type}" .data=${data} xAxis="${xAxis}"></zn-data-chart>`;
  },
  args: {
    type: 'area',
    data: [
      {"name": "adyen-connector", "data": [[1726444800, 20]]},
      {"name": "checkout-connector", "data": [[1726444800, 4]]},
      {"name": "_", "data": [[1726444800, 1]]}
    ],
    xAxis: 'datetime',
  },
  argTypes: {
    name: {control: 'text'},
    type: {control: 'select', options: ['line', 'bar', 'area']},
  },
};
