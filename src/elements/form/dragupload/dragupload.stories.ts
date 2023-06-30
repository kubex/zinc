import {html} from 'lit-html';

export default {
  title: 'Elements/Form/DragUpload',
};

export const Default = ({label, text, types, size}) =>
  html`
    <form method="post">
      <zn-form-group>
        <zn-input .label=${label}>
          <zn-drag-upload .text=${text} .types=${types} .size=${size}>
          </zn-drag-upload>
        </zn-input>
      </zn-form-group>
      
      <input type="submit" value="Submit"/>
    </form>
  `;

Default.args = {
  label: 'Cover Photo',
  text: 'Drag and drop a File or Click Upload',
  types: 'image/png,image/jpeg,image/gif',
  size: '10',
}
