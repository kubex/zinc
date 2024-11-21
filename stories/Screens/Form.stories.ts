import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/index';

const meta: Meta = {
  title: 'Screens/Form',
  tags: ['screens', 'Form']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-panel caption="Form Example">
        <form method="POST" style="padding: 30px;">
          <zn-form-group caption="Something">
            <zn-datepicker></zn-datepicker>
          </zn-form-group>

          <zn-form-group>
            standard
            <zn-toggle name="tog-form" value="custom value"></zn-toggle>
            required
            <zn-toggle name="tog-form-required" required value="custom value"></zn-toggle>
          </zn-form-group>

          <zn-form-group caption="Profile"
                         description="This information will be displayed publicly so be careful what you share.">
            <zn-input span="4" label="Website" prefix="https://" suffix=".chargehive.cloud">
              <input type="text" name="website" placeholder="www.example.com" value="" required/>
            </zn-input>

            <zn-input label="About" advice="Write a few sentences about yourself."><textarea name="about"></textarea>
            </zn-input>
            <zn-input label="Photo"><input name="photo" type="file"/></zn-input>
            <zn-input label="Cover photo">
              <zn-drag-upload text="Drag and drop a File or Click Upload" name="cover_photo"
                              types="image/png,image/jpeg,image/gif" size="10">
              </zn-drag-upload>
            </zn-input>
          </zn-form-group>

          <zn-form-group caption="Personal Information"
                         description="Use a permanent address where you can receive mail.">
            <zn-input label="First Name" span="3"><input type="text" name="first_name"/></zn-input>
            <zn-input label="Last Name" span="3"><input type="text" name="last_name"/></zn-input>
            <zn-input label="Email address" span="5"><input type="text" name="email"/></zn-input>
            <zn-color-select label="Color" span="2" options="blue red orange"></zn-color-select>

            <zn-select name="country" label="Country">
              <zn-option value="GB">United Kingdom</zn-option>
              <zn-option value="DE">Germany</zn-option>
            </zn-select>
            <zn-input span="2" label="City"><input type="text" name="city"/></zn-input>
            <zn-input span="2" label="State / Province"><input type="text" name="state"/></zn-input>
            <zn-input span="2" label="ZIP / Postal code"><input type="text" name="postal"/></zn-input>
          </zn-form-group>

          <zn-form-group caption="Notifications"
                         description="We'll always let you know about important changes, but you pick what else you want to hear about.">
            <zn-input label="By Email">
              <zn-checkbox name="comments" title="Comments"
                           description="Get notified when someones posts a comment on a posting"></zn-checkbox>
              <zn-checkbox name="candidates" title="Candidates"
                           description="Get notified when a candidate applies for a job"></zn-checkbox>
              <zn-checkbox name="offers" title="Offers"
                           description="Get notified when a candidate accepts or rejects an offer"></zn-checkbox>
            </zn-input>
            <zn-input label="Push Notifications" summary="These are delivered via SMS to your mobile phone.">
              <zn-checkbox name="everything" title="Everything"></zn-checkbox>
              <zn-checkbox name="email" title="Same as email"></zn-checkbox>
              <zn-checkbox name="push" title="No push notifications"></zn-checkbox>
            </zn-input>
          
            <zn-radio-group label="Select an option" name="a" value="2">
              <zn-radio name="radio" value="1">Option 1</zn-radio>
              <zn-radio name="radio" value="2">Option 2</zn-radio>
              <zn-radio name="radio" value="3">Option 3</zn-radio>
            </zn-radio-group>
          </zn-form-group>

          <input type="submit" value="Submit"/>
        </form>
      </zn-panel>`;
  },
};
