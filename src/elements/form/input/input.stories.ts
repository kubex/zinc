import {html} from 'lit-html';

export default {
  title: 'Elements/Form/Input',
};

export const Default = () =>
  html`
    <form method="POST">
      <zn-form-group caption="Personal Information" description="Use a permanent address where you can receive mail.">
        <zn-input label="First Name" span="3"><input type="text" name="first_name"/></zn-input>
        <zn-input label="Last Name" span="3"><input type="text" name="last_name"/></zn-input>
        <zn-input label="Email address" span="5"><input type="text" name="email"/></zn-input>
        <zn-input label="Country" span="3">
          <select>
            <option value="GB">United Kingdom</option>
          </select>
        </zn-input>
        <zn-input label="Street address"></zn-input>
        <zn-input span="2" label="City"><input type="text" name="city"/></zn-input>
        <zn-input span="2" label="State / Province"><input type="text" name="state"/></zn-input>
        <zn-input span="2" label="ZIP / Postal code"><input type="text" name="postal"/></zn-input>
      </zn-form-group>

      <input type="submit" value="Submit"/>
    </form>
  `;
