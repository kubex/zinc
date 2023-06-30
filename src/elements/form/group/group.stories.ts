import {html} from 'lit-html';

export default {
  title: 'Elements/Form/Group',
};

export const Default = ({caption, description}) =>
  html`
    <form method="POST" style="padding: 30px;">
      <zn-form-group .caption=${caption} .description=${description}>
        <input type="text" placeholder="Enter your name"/>
      </zn-form-group>
      <input type="submit" value="Submit"/>
    </form>
  `;

Default.args = {
  caption: 'Form Group Caption',
  description: 'This is an example of a form group, this is commonly used to wrap form input giving it a label and description',
}

export const CaptionOnly = ({caption}) =>
  html`
    <form method="POST" style="padding: 30px;">
      <zn-form-group .caption=${caption}>
        <input type="text" placeholder="Enter your name"/>
      </zn-form-group>
      <input type="submit" value="Submit"/>
    </form>
  `;

CaptionOnly.args = {
  caption: 'Form Group Caption',
}