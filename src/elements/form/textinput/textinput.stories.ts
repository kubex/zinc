import {html} from 'lit-html';

export default {
  title: 'Elements/Form/TextInput',
};

export const Default = ({label, span, prefix, name, placeholder}) =>
  html`
    <form method="POST">
      <zn-form-group>
        <zn-input .span=${span} .label=${label}>
          <zn-text-input .prefix=${prefix} .name=${name} .placeholder=${placeholder}></zn-text-input>
        </zn-input>
      </zn-form-group>
      <input type="submit" value="Submit"/>
    </form>

    <form method="POST">
      <zn-form-group>
        <zn-input .span=${span} .label=${label}>
          <zn-text-input .prefix=${prefix} .name=${name} .placeholder=${placeholder}>
            <input type="submit" value="Submit"/>
          </zn-text-input>
        </zn-input>
      </zn-form-group>
    </form>
  `;

Default.args = {
  label: 'Website',
  span: '4',
  prefix: 'https://',
  name: 'website',
  placeholder: 'www.example.com',
}
