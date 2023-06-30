import {html} from 'lit-html';

export default {
  title: 'Elements/Form/DatePicker',
};

export const Default = ({caption}) =>
  html`
    <form method="POST">
      <zn-form-group .caption=${caption}>
        <zn-datepicker></zn-datepicker>
      </zn-form-group>
      <input type="submit" value="Submit"/>
    </form>
  `;

Default.args = {
  caption: 'Select a date',
}
