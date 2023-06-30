import {html} from 'lit-html';

export default {
  title: 'Elements/Tabs',
};

export const Default = () =>
  html`
    <zn-tabs title="Overview">
      <h2 slot="tab">Content</h2>
      <section slot="panel">
        <form method="post" style="padding: 30px;">
          <zn-form-group caption="Profile"
                         description="This information will be displayed publicly so be careful what you share.">
            <zn-input span="4" label="Website">
              <zn-text-input prefix="https://" name="website" placeholder="www.example.com"></zn-text-input>
            </zn-input>
            <zn-input label="About" advice="Write a few sentences about yourself."><textarea></textarea></zn-input>
            <zn-input label="Photo"><input type="file"/></zn-input>
            <zn-input label="Cover photo">
              <zn-drag-upload text="Drag and drop a File or Click Upload"
                              types="image/png,image/jpeg,image/gif" size="10">
              </zn-drag-upload>
            </zn-input>
          </zn-form-group>
          <zn-form-group caption="Personal Information"
                         description="Use a permanent address where you can receive mail.">
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
          </zn-form-group>
          <input type="submit" value="Submit"/>
        </form>
      </section>
      <h2 slot="tab">Columns</h2>
      <section slot="panel">

        <zn-cols layout="1,1,1,1">
          <div slot="c1">Col 1a</div>
          <div slot="c2">Col 2a</div>
          <div slot="c3">Col 3a</div>
          <div slot="c4">Col 4a</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1b</div>
          <div slot="c2">Col 2b</div>
          <div slot="c3">Col 3b</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1c</div>
          <div slot="c2">Col 2c</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1d</div>
        </zn-cols>


        <zn-cols>
          <div slot="c1">Col 1e</div>
          <div slot="c2">Col 2e</div>
          <div slot="c3">Col 3e</div>
          <div slot="c4">Col 4e</div>
        </zn-cols>

        <zn-cols layout="3,1">
          <div slot="c1">Col 1f</div>
          <div slot="c2">Col 2f</div>
        </zn-cols>

        <zn-cols layout="2,1,1">
          <div slot="c1">Col 1g</div>
          <div slot="c2">Col 2g</div>
        </zn-cols>

        <hr/>

        <zn-cols>
          <div slot="c1">Col 1h</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1i</div>
          <div slot="c2">Col 2i</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1j</div>
          <div slot="c2">Col 2j</div>
          <div slot="c3">Col 3j</div>
        </zn-cols>

        <zn-cols>
          <div slot="c1">Col 1k</div>
          <div slot="c2">Col 2k</div>
          <div slot="c3">Col 3k</div>
          <div slot="c4">Col 4k</div>
        </zn-cols>

        <hr/>

        <zn-cols layout="3,1">
          <div slot="c1">Col 1l</div>
          <div slot="c2">Col 2l</div>
        </zn-cols>
      </section>
      <h2 slot="tab">Tab 3</h2>
      <section slot="panel">Content for tab 3</section>
    </zn-tabs>
  `;