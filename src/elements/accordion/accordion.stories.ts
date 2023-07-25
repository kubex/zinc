import {html} from 'lit-html';

export default {
  title: 'Elements/Accordion',
};

export const Default = ({inline}) =>
  html`
    <zn-accordion label="Label" caption="Used on 3 URLs" summary="1234-1234-1234-1234-1244">
      <zn-plist>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
      </zn-plist>
      <form method="POST" span="4">
        <zn-form-group caption="Add a URL">
          <zn-input>
          <zn-text-input prefix="https://" name="url" placeholder="This is the filled form response">
            <input type="submit" value="Add a URL"/>
          </zn-text-input>
        </zn-input>
        </zn-form-group>
      </form>
    </zn-accordion>
    <zn-accordion label="Label" caption="Used on 3 URLs" summary="1234-1234-1234-1234-1244">
      <zn-plist>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
      </zn-plist>
      <form method="POST" span="4">
        <zn-form-group caption="Add a URL">
          <zn-input>
            <zn-text-input prefix="https://" name="url" placeholder="This is the filled form response">
              <input type="submit" value="Add a URL"/>
            </zn-text-input>
          </zn-input>
        </zn-form-group>
      </form>
    </zn-accordion>
    <zn-accordion label="Used on 3 URLs" caption="Token Name Goes Here" summary="1234-1234-1234-1234-1244">
      <zn-plist>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
      </zn-plist>
      <form method="POST" span="4">
        <zn-form-group caption="Add a URL">
          <zn-input>
            <zn-text-input prefix="https://" name="url" placeholder="This is the filled form response">
              <input type="submit" value="Add a URL"/>
            </zn-text-input>
          </zn-input>
        </zn-form-group>
      </form>
    </zn-accordion>
    <zn-accordion label="Label" caption="Used on 3 URLs" summary="1234-1234-1234-1234-1244">
      <zn-plist>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
        <zn-prop inline=${inline} icon="close">https://kjnsdkjfndsjkfndsf-flkdsnfjkdf.io</zn-prop>
      </zn-plist>
      <form method="POST" span="4">
        <zn-form-group caption="Add a URL">
          <zn-input>
            <zn-text-input prefix="https://" name="url" placeholder="This is the filled form response">
              <input type="submit" value="Add a URL"/>
            </zn-text-input>
          </zn-input>
        </zn-form-group>
      </form>
    </zn-accordion>
  `;

Default.args = {
  inline: false,
}