import {html} from 'lit-html';

export default {
  title: 'Elements/SimpleChart',
};

const labels = [
  "Jun 2016",
  "Jul 2016",
  "Aug 2016",
  "Sep 2016",
  "Oct 2016",
  "Nov 2016",
  "Dec 2016",
  "Jan 2017",
  "Feb 2017",
  "Mar 2017",
  "Apr 2017",
  "May 2017"
];

const dataset = [
  {
    data: [
      56.4,
      39.8,
      66.8,
      66.4,
      40.6,
      55.2,
      77.4,
      69.8,
      57.8,
      76,
      110.8,
      142.6
    ],
  }
];


export const Default = ({dataset, labels}) =>
  html`
    <zn-simplechart .datasets=${dataset} .labels=${labels}></zn-simplechart>`;

Default.args = {
  datasets: dataset,
  labels: labels
}