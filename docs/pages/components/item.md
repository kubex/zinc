---
meta:
  title: Item
  description:
layout: component
---

```html:preview

<zn-sp divide no-gap>
  <zn-item caption="Full name" description="this is description" edit-on-hover>
    <zn-inline-edit name="name" 
                    value="EN"
                    options="{&quot;&quot;:&quot;-&quot;,&quot;EN&quot;:&quot;English&quot;,&quot;IT&quot;:&quot;Italian&quot;,&quot;FR&quot;:&quot;French&quot;,&quot;DE&quot;:&quot;German&quot;,&quot;ES&quot;:&quot;Spanish&quot;,&quot;PT&quot;:&quot;Portuguese&quot;,&quot;AB&quot;:&quot;Abkhazian&quot;,&quot;OM&quot;:&quot;Afan\/Oromoor\/Oriya&quot;,&quot;AA&quot;:&quot;Afar&quot;,&quot;AF&quot;:&quot;Afrikaans&quot;,&quot;SQ&quot;:&quot;Albanian&quot;,&quot;AM&quot;:&quot;Amharic&quot;,&quot;AR&quot;:&quot;Arabic&quot;,&quot;HY&quot;:&quot;Armenian&quot;,&quot;AS&quot;:&quot;Assamese&quot;,&quot;AY&quot;:&quot;Aymara&quot;,&quot;AZ&quot;:&quot;Azerbaijani&quot;,&quot;BA&quot;:&quot;Bashkir&quot;,&quot;EU&quot;:&quot;Basque&quot;,&quot;BN&quot;:&quot;Bengali\/Bangla&quot;,&quot;DZ&quot;:&quot;Bhutani&quot;,&quot;BH&quot;:&quot;Bihari&quot;,&quot;BI&quot;:&quot;Bislama&quot;,&quot;BR&quot;:&quot;Breton&quot;,&quot;BG&quot;:&quot;Bulgarian&quot;,&quot;MY&quot;:&quot;Burmese&quot;,&quot;BE&quot;:&quot;Byelorussian&quot;,&quot;KM&quot;:&quot;Cambodian&quot;,&quot;CA&quot;:&quot;Catalan&quot;,&quot;ZH&quot;:&quot;Chinese&quot;,&quot;CO&quot;:&quot;Corsican&quot;,&quot;HR&quot;:&quot;Croatian&quot;,&quot;CS&quot;:&quot;Czech&quot;,&quot;DA&quot;:&quot;Danish&quot;,&quot;NL&quot;:&quot;Dutch&quot;,&quot;EO&quot;:&quot;Esperanto&quot;,&quot;ET&quot;:&quot;Estonian&quot;,&quot;FO&quot;:&quot;Faeroese&quot;,&quot;FJ&quot;:&quot;Fiji&quot;,&quot;FI&quot;:&quot;Finnish&quot;,&quot;FY&quot;:&quot;Frisian&quot;,&quot;GL&quot;:&quot;Galician&quot;,&quot;KA&quot;:&quot;Georgian&quot;,&quot;EL&quot;:&quot;Greek&quot;,&quot;KL&quot;:&quot;Greenlandic&quot;,&quot;GN&quot;:&quot;Guarani&quot;,&quot;GU&quot;:&quot;Gujarati&quot;,&quot;HA&quot;:&quot;Hausa&quot;,&quot;HE&quot;:&quot;Hebrew&quot;,&quot;HI&quot;:&quot;Hindi&quot;,&quot;HU&quot;:&quot;Hungarian&quot;,&quot;IS&quot;:&quot;Icelandic&quot;,&quot;ID&quot;:&quot;Indonesian&quot;,&quot;IA&quot;:&quot;Interlingua&quot;,&quot;IE&quot;:&quot;Interlingue&quot;,&quot;IK&quot;:&quot;Inupiak&quot;,&quot;GA&quot;:&quot;Irish&quot;,&quot;JA&quot;:&quot;Japanese&quot;,&quot;JV&quot;:&quot;Javanese&quot;,&quot;KN&quot;:&quot;Kannada&quot;,&quot;KS&quot;:&quot;Kashmiri&quot;,&quot;KK&quot;:&quot;Kazakh&quot;,&quot;RW&quot;:&quot;Kinyarwanda&quot;,&quot;KY&quot;:&quot;Kirghiz&quot;,&quot;RN&quot;:&quot;Kirundi&quot;,&quot;KO&quot;:&quot;Korean&quot;,&quot;KU&quot;:&quot;Kurdish&quot;,&quot;LO&quot;:&quot;Laothian&quot;,&quot;LA&quot;:&quot;Latin&quot;,&quot;LV&quot;:&quot;Latvian\/Lettish&quot;,&quot;LN&quot;:&quot;Lingala&quot;,&quot;LT&quot;:&quot;Lithuanian&quot;,&quot;MK&quot;:&quot;Macedonian&quot;,&quot;MG&quot;:&quot;Malagasy&quot;,&quot;MS&quot;:&quot;Malay&quot;,&quot;ML&quot;:&quot;Malayalam&quot;,&quot;MT&quot;:&quot;Maltese&quot;,&quot;MI&quot;:&quot;Maori&quot;,&quot;MR&quot;:&quot;Marathi&quot;,&quot;MO&quot;:&quot;Moldavian&quot;,&quot;MN&quot;:&quot;Mongolian&quot;,&quot;NA&quot;:&quot;Nauru&quot;,&quot;NB&quot;:&quot;Norwegian Bokm\u00e5l&quot;,&quot;NE&quot;:&quot;Nepali&quot;,&quot;NO&quot;:&quot;Norwegian&quot;,&quot;OC&quot;:&quot;Occitan&quot;,&quot;PS&quot;:&quot;Pashto\/Pushto&quot;,&quot;FA&quot;:&quot;Persian&quot;,&quot;PL&quot;:&quot;Polish&quot;,&quot;PA&quot;:&quot;Punjabi&quot;,&quot;QU&quot;:&quot;Quechua&quot;,&quot;RM&quot;:&quot;Rhaeto-Romance&quot;,&quot;RO&quot;:&quot;Romanian&quot;,&quot;RU&quot;:&quot;Russian&quot;,&quot;SM&quot;:&quot;Samoan&quot;,&quot;SG&quot;:&quot;Sangro&quot;,&quot;SA&quot;:&quot;Sanskrit&quot;,&quot;GD&quot;:&quot;Scots\/Gaelic&quot;,&quot;SR&quot;:&quot;Serbian&quot;,&quot;SH&quot;:&quot;Serbo-Croatian&quot;,&quot;ST&quot;:&quot;Sesotho&quot;,&quot;TN&quot;:&quot;Setswana&quot;,&quot;SN&quot;:&quot;Shona&quot;,&quot;SD&quot;:&quot;Sindhi&quot;,&quot;SE&quot;:&quot;Northern Sami&quot;,&quot;SI&quot;:&quot;Singhalese&quot;,&quot;SS&quot;:&quot;Siswati&quot;,&quot;SK&quot;:&quot;Slovak&quot;,&quot;SL&quot;:&quot;Slovenian&quot;,&quot;SO&quot;:&quot;Somali&quot;,&quot;SU&quot;:&quot;Sundanese&quot;,&quot;SW&quot;:&quot;Swahili&quot;,&quot;SV&quot;:&quot;Swedish&quot;,&quot;TL&quot;:&quot;Tagalog&quot;,&quot;TG&quot;:&quot;Tajik&quot;,&quot;TA&quot;:&quot;Tamil&quot;,&quot;TT&quot;:&quot;Tatar&quot;,&quot;TE&quot;:&quot;Tegulu&quot;,&quot;TH&quot;:&quot;Thai&quot;,&quot;BO&quot;:&quot;Tibetan&quot;,&quot;TI&quot;:&quot;Tigrinya&quot;,&quot;TO&quot;:&quot;Tonga&quot;,&quot;TS&quot;:&quot;Tsonga&quot;,&quot;TR&quot;:&quot;Turkish&quot;,&quot;TK&quot;:&quot;Turkmen&quot;,&quot;TW&quot;:&quot;Twi&quot;,&quot;UK&quot;:&quot;Ukrainian&quot;,&quot;UR&quot;:&quot;Urdu&quot;,&quot;UZ&quot;:&quot;Uzbek&quot;,&quot;VI&quot;:&quot;Vietnamese&quot;,&quot;VO&quot;:&quot;Volapuk&quot;,&quot;CY&quot;:&quot;Welsh&quot;,&quot;WO&quot;:&quot;Wolof&quot;,&quot;XH&quot;:&quot;Xhosa&quot;,&quot;JI&quot;:&quot;Yiddish&quot;,&quot;YO&quot;:&quot;Yoruba&quot;,&quot;ZU&quot;:&quot;Zulu&quot;}"></zn-inline-edit>
  </zn-item>
  <zn-item caption="Full name">
    Margot Foster
  </zn-item>
  <zn-item caption="Full name">
    margot.foster@example.com
  </zn-item>
  <zn-item caption="Full name">
    lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  </zn-item>
</zn-sp>
```

## Examples

### Lots of Content

```html:preview
<zn-item caption="Full name">
  lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna 
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</zn-item>
```

### Icons

```html:preview

<zn-item caption="Full name" icon="person" description="this is description">
  This is the content
</zn-item>

<zn-cols layout="1, 1">
  <zn-item inline icon="person">
    <div>First Name</div>
    <div>Second Name</div>
  </zn-item>
  <zn-item inline icon="person">This is the content</zn-item>
</zn-cols>
```

### Multiple Actions

Example of multiple actions in a description item.

```html:preview

<zn-item caption="Address">
  <div><strong>Company</strong> Example here </div>
  <div><strong>Line 1</strong> Example here </div>
  <div><strong>Line 2</strong> Example here </div>
  <div><strong>Line 3</strong> Example here </div>
  <div><strong>Town</strong> Example here </div>
  <div><strong>County</strong> Example here </div>
  <div><strong>Postal Code</strong> Example here </div>
  <div><strong>Country</strong> Example here </div>
  
  <zn-button id="address-modal" slot="actions" size="x-small" color="secondary" modal>Edit</zn-button>
  <zn-button id="address-modal" slot="actions" size="x-small" color="secondary" modal>Edit</zn-button>
  
</zn-item>
```

