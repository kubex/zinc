import {html} from 'lit-html';

export default {
  title: 'Elements/Heading',
};

export const Default = ({content, caption}) =>
  html`
    <zn-heading caption="${caption}">${content}</zn-heading>
  `;

Default.args = {
  content: 'Get started by filling in the information below to start your new project.',
  caption: 'Create Project',
}