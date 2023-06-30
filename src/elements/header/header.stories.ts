import {html} from 'lit-html';

export default {
  title: 'Elements/Header',
};

export const Default = ({content}) =>
  html`
    <zn-header caption="Francis Matthews"></zn-header>

    <br/>

    <zn-header caption="Mark Neale" max-width="1022">
      <button>Action Button</button>
      <button>Action Button</button>
      <button>Action Button</button>
    </zn-header>
    <br/>

    <zn-header transparent caption="Francis Matthews"
               breadcrumb='[{"title": "Transactions", "path": "/"},
            {"title": "Payments", "path": "/communication"},
            {"title": "Refunds", "path": "/communication"}]'
               navigation='[{"title": "Transactions", "path": "/", "default":true},
            {"title": "Payments", "path": "/communication"},
            {"title": "Refunds", "path": "/communication"}]'>
    </zn-header>
    <br/>

    <zn-header max-width caption="Celeste Blankenship"
               navigation='[{"title": "Summary", "path": "/", "default":true},
            {"title": "Communication", "path": "/communication"},
            {"title": "Subscriptions", "path": "/communication"},
            {"title": "Finances", "path": "/communication"}]'>

      <button>Action Button</button>
      <button>Action Button</button>
    </zn-header>

    <br/>

    <zn-header
      navigation='[{"title": "Summary", "path": "/", "default":true},
            {"title": "Communication", "path": "/communication"},
            {"title": "Subscriptions", "path": "/communication"},
            {"title": "Finances", "path": "/communication"}]'>
    </zn-header>

    <style>
      button {
        background-color: #ff5800;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
      }
    </style>
  `;

Default.args = {
  content: 'Default',
}