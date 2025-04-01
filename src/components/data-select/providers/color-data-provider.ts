import type {DataProviderOption, LocalDataProvider} from "./provider";
import {html} from "lit";

export const colors = ['Red', 'Blue', 'Orange', 'Yellow', 'Indigo', 'Violet', 'Green', 'Pink', 'Gray']

export const colorDataProvider: LocalDataProvider<DataProviderOption> = {
  getName: 'color',
  getData: Object.entries(colors).map(([, value]: [string, string]) => {
    return {
      key: value.toLowerCase(),
      value,
      prefix: html`<div class="color-icon color-icon--${value.toLowerCase()}"></div>`
    };
  })
};

