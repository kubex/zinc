import {html} from "lit";
import '../../src/Charts/Chart';
import '../../src/Panel';

export default {
  component: 'zn-chart',
  title: 'Charts/Chart',
  tags: ['charts', 'chart'],
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const data = [
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

const datas = [
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
  },
  {
    label: 'Dataset 2',
    data: [
      {x: "Mon", y:10400 },
      {x: "Tue", y: 9900},
      {x: "Wed", y: 10700},
      {x: "Thu", y: 8942},
      {x: "Fri", y: 9243},
      {x: "Sat", y: 9400},
      {x: "Sun", y: 8942},
    ],
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
  }
];

export const Default = ({data, labels}) =>
  html`
    <zn-panel>
      <zn-chart .data=${data} .labels=${labels}></zn-chart>
    </zn-panel>
  `;

export const MultiLine = () =>
  html`
    <zn-chart .data=${datas} .labels=${labels}></zn-chart>`;

export const BarChart = () =>
  html`
    <zn-chart .data=${datas} .labels=${labels} type="bar"></zn-chart>`;


Default.args = {
  data: datas,
  labels: labels
};
