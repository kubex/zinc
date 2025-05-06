import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-linked-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-select name="linked-select" id="select-1">
        <option value="option1">Option 1</option>
      </zn-select>

      <zn-linked-select linked-select="select-1"
                        options="{&quot;-&quot;:{&quot;-&quot;:&quot;Select Department&quot;},&quot;FID:DEP:1677585809:MZxvTiWlzBlSG&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:DFP20NM0Q&quot;:&quot;Generic&quot;,&quot;FID:TKT:QUE:1678099064:8nGJ5OQfp&quot;:&quot;Money Back&quot;},&quot;FID:DEP:1677585809:Kd83L0aIhsGpB&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:ma9I3ORGu&quot;:&quot;Generic&quot;},&quot;FID:DEP:1677585809:3mBpgQnrkzLSO&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:cFvFFL8o6&quot;:&quot;Generic&quot;}}">
      </zn-linked-select> `);

    expect(el).to.exist;
  });
});
