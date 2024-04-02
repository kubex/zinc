import '../../src/Chart';
import {html} from "lit";

export default {
  component: 'zn-chart',
  title: 'Components/Chart',
  tags: ['components', 'chart'],
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const dataset = [
  {
    label: 'Dataset 1',
    data: [
      {x: "Mon", y: 20000},
      {x: "Tue", y: 20400},
      {x: "Wed", y: 19000},
      {x: "Thu", y: 18700},
      {x: "Fri", y: 18942},
      {x: "Sat", y: 19243},
      {x: "Sun", y: 19400},
    ]
  }
];

const datasets = [
  {
    label: 'Dataset 1',
    data: [
      {x: "Mon", y: 20000},
      {x: "Tue", y: 20400},
      {x: "Wed", y: 19000},
      {x: "Thu", y: 18700},
      {x: "Fri", y: 18942},
      {x: "Sat", y: 19243},
      {x: "Sun", y: 19400},
    ],
    borderColor: 'rgb(79,180,107)',
    backgroundColor: 'rgb(39,168,78)',
  },
  {
    label: 'Dataset 2',
    data: [
      {x: "Mon", y: 10500},
      {x: "Tue", y: 10400},
      {x: "Wed", y: 9900},
      {x: "Thu", y: 10700},
      {x: "Fri", y: 8942},
      {x: "Sat", y: 9243},
      {x: "Sun", y: 9400},
    ],
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgb(241,63,100)',
  }
];

export const Default = ({datasets, labels}) =>
  html`
    <zn-chart .datasets=${datasets} .labels=${labels}></zn-chart>`;

export const MultiLine = () =>
  html`
    <zn-chart .datasets=${datasets} .labels=${labels}></zn-chart>`;

export const BarChart = () =>
  html`
    <zn-chart .datasets=${datasets} .labels=${labels} type="bar"></zn-chart>`;


Default.args = {
  datasets: dataset,
  labels: labels
}
