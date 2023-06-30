import {html} from 'lit-html';

export default {
  title: 'Elements/Form/Checkbox',
};

export const Default = () =>
  html`
    <form method="post" style="padding: 30px;">
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
    </form>
  `;
