import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

const screenSizes = {
  'sm': '360px',
  'smp': '480px',
  'md': '768px',
  'lg': '1100px',
  'hd': '1440px',
  '4k': '2560px'
};

export class ZincElement extends LitElement
{
  @property({ type: String, attribute: 't', reflect: true })
  public t: string = '';

  containerSize(width)
  {
    const screens = screenSizes;
    if(width > screens['4k'])
    {
      return '4k';
    }
    else if(width > parseInt(screens['hd']))
    {
      return 'hd';
    }
    else if(width > parseInt(screens['lg']))
    {
      return 'lg';
    }
    else if(width > parseInt(screens['md']))
    {
      return 'md';
    }
    else if(width > parseInt(screens['sm']))
    {
      return 'sm';
    }
    else
    {
      return 'xs';
    }
  }

  constructor()
  {
    super();

    window.addEventListener('theme-change', this._updateTheme.bind(this));
    this._updateTheme(null);
  }

  public _updateTheme(e)
  {
    if(e == null)
    {
      this.t = document.documentElement.getAttribute('t') ||
        window.document.documentElement.getAttribute('t') ||
        window.document.body.getAttribute('t');
    }
    else if(e.detail['theme'])
    {
      this.t = e.detail['theme'];
    }
    else if(e.detail)
    {
      this.t = e.detail;
    }
  }
}


export interface ZincFormControl extends ZincElement
{
  // Form attributes
  name: string;
  value: string;
  disabled?: boolean;
  defaultValue?: string;
  defaultChecked?: boolean;
  form?: string;

  // Validation attributes
  pattern?: string;
  min?: number | string | Date;
  max?: number | string | Date;
  step?: number | string;
  required?: boolean;
  minlength?: number;
  maxlength?: number;

  // Form Validation Properties
  readonly validity: ValidityState;
  readonly validationMessage: string;

  // Form Validation methods
  checkValidity: () => boolean;
  getForm: () => HTMLFormElement | null;
  reportValidity: () => boolean;
  setCustomValidity: (message: string) => void;
}