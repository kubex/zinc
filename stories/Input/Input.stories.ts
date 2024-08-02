import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/Input';

const meta: Meta = {
  component: 'zn-input',
  title: 'Input/Input',
  tags: ['input', 'input'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ for: forAttr, label, class: classAttr, advice, summary, prefix, suffix }) =>
  {
    return html`
      <zn-input for="${forAttr}" label="${label}" class="${classAttr}" advice="${advice}" summary="${summary}"
                prefix="${prefix}" suffix="${suffix}">
        <input type="text" id="${forAttr}" name="${forAttr}"/>
      </zn-input>`;
  },
  args: {
    for: 'text',
    label: 'Hello World',
    class: '',
    advice: 'Some advice',
    summary: 'The summary',
    prefix: 'prefix',
    suffix: 'suffix'
  },
};

export const Normal: Story = {
  render: ({ for: forAttr, label, class: classAttr, advice, summary}) =>
  {
    return html`
      <zn-input for="${forAttr}" label="${label}" class="${classAttr}" advice="${advice}" summary="${summary}">
        <input type="text" id="${forAttr}" name="${forAttr}"/>
      </zn-input>`;
  },
  args: {
    for: 'text',
    label: 'Hello World',
    class: '',
    advice: 'Some advice',
    summary: 'The summary',
  },
};

export const Suffix: Story = {
  render: ({ for: forAttr, label, class: classAttr, advice, summary, suffix }) =>
  {
    return html`
      <zn-input for="${forAttr}" label="${label}" class="${classAttr}" advice="${advice}" summary="${summary}"
                suffix="${suffix}">
        <input type="text" id="${forAttr}" name="${forAttr}"/>
      </zn-input>`;
  },
  args: {
    for: 'text',
    label: 'Hello World',
    class: '',
    advice: 'Some advice',
    summary: 'The summary',
    suffix: 'Suffix',
  },
};

export const TextArea: Story = {
  render: ({ for: forAttr, label, class: classAttr, advice, summary, prefix, suffix }) =>
  {
    return html`
      <zn-input for="${forAttr}" label="${label}" class="${classAttr}" advice="${advice}" summary="${summary}"
                prefix="${prefix}" suffix="${suffix}">
        <textarea id="${forAttr}" name="${forAttr}"></textarea>
      </zn-input>`;
  },
  args: {
    for: 'text',
    label: 'Hello World',
    class: '',
    advice: 'Some advice',
    summary: 'The summary',
    prefix: 'prefix',
    suffix: 'suffix'
  },
};
