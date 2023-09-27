import {Meta} from "@storybook/web-components";

import '../../src/FormElements/MultiSelect';
import {html} from "lit";

const meta: Meta = {
  component: 'zn-multi-select',
  title: 'Elements/MultiSelect',
  tags: ['elements', 'multiselect', 'autodocs']
};

export default meta;

export const Default = () =>
  html`
    <zn-multi-select></zn-multi-select>`;


Default.args = {
  datasets: '',
  labels: ''
};
