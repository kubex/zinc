import {html} from 'lit-html';

export default {
  title: 'Elements/Table',
};

export const Default = () =>
  html`
    <zn-table selectable="" borders=""
              data="{&quot;header&quot;:[{&quot;name&quot;:&quot;Transaction&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Date / Time&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Transacted&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Requested&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Gateway&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Gateway&quot;,&quot;display&quot;:&quot;&quot;}],&quot;items&quot;:[{&quot;caption&quot;:&quot;TRANSACTION_TYPE_CAPTURE&quot;,&quot;summary&quot;:&quot;PENDING&quot;,&quot;icon&quot;:&quot;&quot;,&quot;data&quot;:[&quot;2023-06-26 16:16:09&quot;,&quot;1.00 GBP&quot;,&quot;1.00 GBP&quot;,&quot;paysafe-connector&quot;,&quot;paysafe&quot;]},{&quot;caption&quot;:&quot;TRANSACTION_TYPE_AUTHORIZE&quot;,&quot;summary&quot;:&quot;COMPLETED&quot;,&quot;icon&quot;:&quot;&quot;,&quot;data&quot;:[&quot;2023-06-26 16:15:13&quot;,&quot;1.00 GBP&quot;,&quot;1.00 GBP&quot;,&quot;paysafe-connector&quot;,&quot;paysafe&quot;]}]}"></zn-table>

    <zn-table selectable borders cborders data='{
    "header": [
      {
        "name": "Col 1"
      },
      {
        "name":    "Col 2",
        "display": "lg"
      }, {
        "name":    "Col 3",
        "display": "sm"
      }
    ],
    "items":  [
      {
        "caption": "Caption Here",
        "summary": "Sub Caption Here",
        "icon":    "brooke@bajb.net",
        "data":    [
          "Col 2",
          "Col 3"
        ]
      },

      {
        "caption": "Caption Here",
        "summary": "Sub Caption Here",
        "icon":    "brooke@bajb.net",
        "data":    [
          "Col 2",
          "Col 3"
        ]
      },

      {
        "caption": "Caption Here",
        "summary": "Sub Caption Here",
        "icon":    "brooke@bajb.net",
        "data":    [
          "Col 2",
          "Col 3"
        ]
      }
    ]
  }'>
    </zn-table>

    <style>
      body {
        display: block;
        padding: 20px;
      }

      zn-cols {
        background: blue;
        margin: 20px 0;
      }

      zn-cols >div {
        background: white;
        flex-grow: 1;
      }
    </style>
  `;