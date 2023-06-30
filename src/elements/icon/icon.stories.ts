import {html} from 'lit-html';

export default {
  title: 'Elements/Icon',
};

export const Default = () =>
  html`
    24:
    <zn-icon src="wb_sunny" size="24" library="material"></zn-icon>
    <zn-icon src="wb_sunny" size="24" library="material-outlined"></zn-icon>
    <zn-icon src="wb_sunny" size="24" library="material-round"></zn-icon>
    <zn-icon src="wb_sunny" size="24" library="material-sharp"></zn-icon>
    <zn-icon src="wb_sunny" size="24" library="material-two-tone"></zn-icon>
    <zn-icon src="https://www.google.com/favicon.ico" size="24"></zn-icon>
    <hr/>
    48:

    <zn-icon src="face" size="48" library="material"></zn-icon>
    <zn-icon src="face" size="48" library="material-outlined"></zn-icon>
    <zn-icon src="face" size="48" library="material-round"></zn-icon>
    <zn-icon src="face" size="48" library="material-sharp"></zn-icon>
    <zn-icon src="face" size="48" library="material-two-tone"></zn-icon>
    <zn-icon src="https://www.google.com/favicon.ico" size="48"></zn-icon>
    <hr/>
    120:
    <zn-icon src="face" size="120" library="material"></zn-icon>
    <zn-icon src="face" size="120" library="material-outlined"></zn-icon>
    <zn-icon src="face" size="120" library="material-round"></zn-icon>
    <zn-icon src="face" size="120" library="material-sharp"></zn-icon>
    <zn-icon src="face" size="120" library="material-two-tone"></zn-icon>
    <zn-icon src="face" size="120" library="material-two-tone" class="bluey"></zn-icon>

    <zn-icon src="https://www.google.com/favicon.ico" size="120"></zn-icon>


    <hr/>
    <zn-icon>G</zn-icon>
    <zn-icon size="32">G</zn-icon>
    <zn-icon size="48">G</zn-icon>
    <zn-icon size="120">G</zn-icon>
    <zn-icon size="120">W</zn-icon>
    <zn-icon size="120">M</zn-icon>

    <hr/>
    <zn-icon src="auto_fix_high@material-two-tone"></zn-icon>
    <zn-icon src="auto_fix_high@material-two-tone" size="32"></zn-icon>
    <zn-icon src="auto_fix_high@material-two-tone" size="48"></zn-icon>
    <zn-icon src="auto_fix_high@material-two-tone" size="120"></zn-icon>
    <zn-icon src="auto_fix_high@material-two-tone" size="120"></zn-icon>
    <zn-icon src="auto_fix_high@material-two-tone" size="120"></zn-icon>

    <hr/>
    <zn-icon src="user@example.com" library="gravatar"></zn-icon>
    <zn-icon src="205e460b479e2e5b48aec07710c08d50" library="gravatar"></zn-icon>
    <zn-icon src="user@example.com#identicon" library="gravatar" size="32"></zn-icon>
    <zn-icon src="user@example.com#monsterid" library="gravatar" size="48"></zn-icon>
    <zn-icon src="user@example.com#wavatar" library="gravatar" size="120"></zn-icon>
    <zn-icon src="user@example.com#retro" library="gravatar" size="120"></zn-icon>
    <zn-icon src="user@example.com#robohash" library="gravatar" size="120"></zn-icon>
    <zn-icon src="205e460b479e2e5b48aec07710c08d50" library="gravatar" size="120"></zn-icon>

    <hr/>
    <zn-icon src="user@example.com" library="libravatar"></zn-icon>
    <zn-icon src="205e460b479e2e5b48aec07710c08d50" library="libravatar"></zn-icon>
    <zn-icon src="user@example.com#identicon" library="libravatar" size="32"></zn-icon>
    <zn-icon src="user@example.com#monsterid" library="libravatar" size="48"></zn-icon>
    <zn-icon src="user@example.com#wavatar" library="libravatar" size="120"></zn-icon>
    <zn-icon src="user@example.com#retro" library="libravatar" size="120"></zn-icon>
    <zn-icon src="user@example.com#robohash" library="libravatar" size="120"></zn-icon>
    <zn-icon src="user@example.com#pagan" library="libravatar" size="120"></zn-icon>
    <zn-icon src="example@gravatar.com" library="libravatar" size="120"></zn-icon>

    <hr/>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="8"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="16"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="32"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="48"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="100"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="150"></zn-icon>
    <zn-icon round src="example@gravatar.com" library="gravatar" size="200"></zn-icon>

    <hr/>
    <zn-icon src="face" size="120" library="mi"></zn-icon>
    <zn-icon src="face" size="120" library="mio"></zn-icon>
    <zn-icon src="face" size="120" library="mir"></zn-icon>
    <zn-icon src="face" size="120" library="mis"></zn-icon>
    <zn-icon src="face" size="120" library="mit"></zn-icon>
    <zn-icon src="face" size="120" library="mit" class="bluey"></zn-icon>

    <script src="../../../../dist/zn.js" type="text/javascript"></script>
    <style>
      zn-icon.bluey[library="material-two-tone"] {
        filter: invert(0.5) sepia(1) saturate(10) hue-rotate(181deg);
      }
    </style>
  `;