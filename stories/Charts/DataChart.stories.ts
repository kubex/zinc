import '../../src/Charts/DataChart';

export default {
  component: 'zn-data-chart',
  title: 'Charts/DataChart',
  tags: ['charts', 'data-chart'],
};


export const Default = {
  args: {
    name: 'Data Chart',
    type: 'line',
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
      }
    ]
  },
  argTypes: {
    name: {control: 'text'},
    type: {control: 'select', options: ['line', 'bar', 'area']},
  },
};
