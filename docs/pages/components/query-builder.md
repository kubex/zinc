---
meta:
  title: Query Builder
  description:
layout: component
---

```html:preview

<zn-query-builder
  filters="[
      {
        &quot;id&quot;:&quot;title&quot;,
        &quot;name&quot;:&quot;Title&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;active&quot;,
        &quot;name&quot;:&quot;Active&quot;,
        &quot;type&quot;:&quot;boolean&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;author&quot;,
        &quot;name&quot;:&quot;Author&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;fuzzy&quot;
        ]
      }
    ]">
</zn-query-builder>
```

## Examples

### Query String

This example will show the produced query string from the selected parameters.

```html:preview

<zn-query-builder
  id="query-string-example"
  filters="[
      {
        &quot;id&quot;:&quot;title&quot;,
        &quot;name&quot;:&quot;Title&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;author&quot;,
        &quot;name&quot;:&quot;Author&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;fuzzy&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;genre&quot;,
        &quot;name&quot;:&quot;Genre&quot;,
        &quot;options&quot;:{
          &quot;action&quot;:&quot;Action&quot;,
          &quot;comedy&quot;:&quot;Comedy&quot;,
          &quot;drama&quot;:&quot;Drama&quot;,
          &quot;fantasy&quot;:&quot;Fantasy&quot;,
          &quot;horror&quot;:&quot;Horror&quot;,
          &quot;mystery&quot;:&quot;Mystery&quot;,
          &quot;romance&quot;:&quot;Romance&quot;,
          &quot;thriller&quot;:&quot;Thriller&quot;,
          &quot;sci-fi&quot;:&quot;Science Fiction&quot;
        },
        &quot;maxOptionsVisible&quot;: &quot;3&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;in&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;rating&quot;,
        &quot;name&quot;:&quot;Rating&quot;,
        &quot;type&quot;:&quot;number&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;gt&quot;,
          &quot;gte&quot;,
          &quot;lt&quot;,
          &quot;lte&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;created&quot;,
        &quot;name&quot;:&quot;Created&quot;,
        &quot;type&quot;:&quot;date&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;before&quot;,
          &quot;after&quot;
        ]
      }
    ]">
</zn-query-builder>

<br>

<div style="word-wrap: break-word;"><b>Query String:</b> </span><span class="query-string"></span></div>
```

## Types

| Name      |
|-----------|
| `bool`    |
| `boolean` |
| `date`    |
| `number`  |

## Comparators

| Name              | Description                  |
|-------------------|------------------------------|
| `Eq`              | Equals                       |
| `Neq`             | Not Equals                   |
| `Before`          | Was Before                   |
| `After`           | Was After                    |
| `In`              | In                           |
| `MatchPhrasePre`  | Match Phrase Prefix          |
| `NMatchPhrasePre` | Does Not Match Phrase Prefix |
| `MatchPhrase`     | Match Phrase                 |
| `NMatchPhrase`    | Does Not Match Phrase        |
| `Match`           | Match                        |
| `NMatch`          | Does Not Match               |
| `Starts`          | Starts With                  |
| `NStarts`         | Does Not Start With          |
| `Wild`            | Wildcard Match               |
| `NWild`           | Does Not Match Wildcard      |
| `Fuzzy`           | Fuzzy Match With             |
| `NFuzzy`          | Does Not Match Fuzzy With    |
| `Gte`             | Greater Than or Equals       |
| `Gt`              | Greater Than                 |
| `Lt`              | Less Than                    |
| `Lte`             | Less Than or Equals          |