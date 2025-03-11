---
meta:
  title: Table Examples
  description: Examples of tables using Zinc components and default styling.
---

# Table Examples

### Example Default table

This example demonstrates a simple table using Zinc table components. The table includes a header, body, and footer.

```html:preview

<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
      <th>Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Row 1, Cell 1</td>
      <td>Row 1, Cell 2</td>
      <td>Row 1, Cell 3</td>
    </tr>
    <tr>
      <td>Row 2, Cell 1</td>
      <td>Row 2, Cell 2</td>
      <td>Row 2, Cell 3</td>
    </tr>
  </tbody>
  <zn-table-footer>
    <tr>
      <td>Footer 1</td>
      <td>Footer 2</td>
      <td>Footer 3</td>
    </tr>
  </zn-table-footer>
</table>
```