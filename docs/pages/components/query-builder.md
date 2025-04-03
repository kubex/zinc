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
        &quot;id&quot;:&quot;1&quot;,
        &quot;name&quot;:&quot;Title&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;2&quot;,
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
        &quot;id&quot;:&quot;1&quot;,
        &quot;name&quot;:&quot;Title&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;2&quot;,
        &quot;name&quot;:&quot;Author&quot;,
        &quot;operators&quot;:[
          &quot;eq&quot;,
          &quot;fuzzy&quot;
        ]
      },
      {
        &quot;id&quot;:&quot;3&quot;,
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
        &quot;id&quot;:&quot;4&quot;,
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