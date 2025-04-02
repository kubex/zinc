import {render, type TemplateResult} from "lit";

export function litToHTML<T extends HTMLElement>(templateResult: TemplateResult): T | null {
  const fragment = document.createDocumentFragment();
  render(templateResult, fragment)
  return fragment.firstElementChild as T;
}
