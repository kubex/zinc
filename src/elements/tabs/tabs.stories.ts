import {html} from 'lit-html';

export default {
  title: 'Elements/Tabs',
};

export const Default = () =>
  html`
    <zn-tabs title="Overview">
      <h2 slot="tab">Content</h2>
      <section slot="panel">
        <h1>Tab 1</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, adipisci aliquam asperiores
          aspernatur atque autem blanditiis consequatur cumque cupiditate delectus doloremque doloribus ducimus </p>
      </section>
      <h2 slot="tab">Columns</h2>
      <section slot="panel">
        <h1>Tab 2</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, adipisci aliquam asperiores
          aspernatur atque autem blanditiis consequatur cumque cupiditate delectus doloremque doloribus ducimus </p>
      </section>
      <h2 slot="tab">Tab 3</h2>
      <section slot="panel">
        <h1>Tab 3</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, adipisci aliquam asperiores
          aspernatur atque autem blanditiis consequatur cumque cupiditate delectus doloremque doloribus ducimus </p>
      </section>
    </zn-tabs>
  `;