import {html} from 'lit-html';

export default {
  title: 'Elements/Chip',
};

export const Default = ({content}) =>
  html`
      <zn-chip>${content}</zn-chip>
      <zn-chip success>${content}</zn-chip>
      <zn-chip warning>${content}</zn-chip>
      <zn-chip error>${content}</zn-chip>
      <zn-chip info>${content}</zn-chip>

      <hr/>

      <zn-chip outline>${content}</zn-chip>
      <zn-chip outline success>${content}</zn-chip>
      <zn-chip outline warning>${content}</zn-chip>
      <zn-chip outline error>${content}</zn-chip>
      <zn-chip outline info>${content}</zn-chip>
  `;

Default.args = {
  content: 'Default',
}