import type {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';

// FunctionParams extracts the parameters of a function type
export type FunctionParams<T> = T extends (...args: infer P) => any ? P : never;

export interface Translation {
  $code: string, // e.g. en, fr
  $name: string, // e.g. English, French
  $dir: 'ltr' | 'rtl',

  onChange: string
}

export interface DefaultTranslation extends Translation {
  [key: string]: any;
}

export interface ExistsOptions {
  lang: string;
  includeFallback: boolean;
}

const connectedElements = new Set<HTMLElement>();
const translations: Map<string, Translation> = new Map<string, Translation>();
const isClient = (typeof MutationObserver !== "undefined" && typeof document !== "undefined" && typeof document.documentElement !== "undefined")

let fallback: Translation;
let documentDirection = 'ltr'
let documentLanguage = 'en'

if (isClient) {
  const documentElementObserver = new MutationObserver(update);
  documentDirection = document.documentElement.dir || 'ltr';
  documentLanguage = document.documentElement.lang || navigator.language;

  // Watch for changes to the document element's dir and lang attributes
  // and run the update function when they change
  documentElementObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir', 'lang']
  });
}

/**
 * Registers one or more translations
 * @param translation
 */
export function registerTranslation(...translation: Translation[]) {
  translation.map(t => {
    const code = t.$code.toLowerCase();

    if (translations.has(code)) {
      // Merge translations that share the same code
      translations.set(code, {...translations.get(code), ...t});
    } else {
      translations.set(code, t)
    }

    if (!fallback) {
      fallback = t;
    }
  });

  update();
}

/**
 * Updates all localized elements that are currently connected
 */
export function update() {
  if (isClient) {
    documentDirection = document.documentElement.dir || 'ltr';
    documentLanguage = document.documentElement.lang || 'en';
  }

  [...connectedElements].forEach((el: LitElement) => {
    // If the element has a requestUpdate method, call it
    if (typeof el.requestUpdate === 'function') {
      el.requestUpdate();
    }
  });
}

/**
 * Localize Reactive Controller for components built with LitElement
 *
 * To use this controller, import the class and instantiate it in a custom element constructor:
 *
 * ```ts
 * private localize = new LocalizeController(this);
 * ```
 *
 * This will add the element to the set and make it respond to changes to <html dir|lang> automatically. To make it
 * respond to changes on its own dir|lang, make it a property:
 *
 * ```ts
 * @property() dir: string;
 * @property() lang: string;
 * ```
 * To use translation method, call it like this:
 *
 * ```ts
 * ${this.localize.term('term_key_here')}
 * ${this.localize.date('2025-03-31')}
 * ${this.localize.number(123456)}
 * ```
 */
export class LocalizeController<UserTranslation extends Translation = DefaultTranslation> implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    connectedElements.add(this.host);
  }

  hostDisconnected() {
    connectedElements.delete(this.host);
  }

  /**
   * Gets the host element's directionality as determined by the `dir` attribute.
   * The return value is lowercased and trimmed.
   */
  dir() {
    return `${this.host.dir || documentDirection}`.toLowerCase().trim();
  }

  /**
   * Get the host element's language as determined by the `lang` attribute.
   * The return value is lowercased and trimmed.
   */
  lang() {
    return `${this.host.lang || documentLanguage}`.toLowerCase().trim();
  }

  /**
   * Gets the translation data for the specified language
   *
   * @param lang
   * @private
   */
  private getTranslationData(lang: string) {
    // convert "en_US" to "en-US". Note that both underscore and hyphen are valid separators, but underscores
    // result in a range check error in the new intl API
    const locale = new Intl.Locale(lang.replace(/_/g, '-'));
    const language = locale?.language.toLowerCase();
    const region = locale?.region?.toLowerCase();
    const primary = <UserTranslation>translations.get(`${language}-${region}`);
    const secondary = <UserTranslation>translations.get(language);

    return {locale, language, region, primary, secondary};
  }

  /**
   * Determines if the specified key exists in the translation data, optionally including fallbacks
   *
   * @param key
   * @param options
   */
  exists<K extends keyof UserTranslation>(key: K, options: Partial<ExistsOptions>): boolean {
    const {primary, secondary} = this.getTranslationData(options.lang ?? this.lang());

    options = {
      includeFallback: false,
      ...options
    };

    return !!((primary && primary[key])
      || (secondary && secondary[key])
      || (options.includeFallback && fallback && fallback[key as keyof Translation]));
  }

  /**
   * Outputs the translated term
   *
   * @param key
   * @param args
   */
  term<K extends keyof UserTranslation>(key: K, ...args: FunctionParams<UserTranslation[K]>): string {
    const {primary, secondary} = this.getTranslationData(this.lang());
    let term: any;

    if (primary && primary[key]) {
      term = primary[key];
    } else if (secondary && secondary[key]) {
      term = secondary[key];
    } else if (fallback && fallback[key as keyof Translation]) {
      term = fallback[key as keyof Translation];
    } else {
      console.error(`No translation found for: ${String(key)}`);
      return String(key);
    }

    if (typeof term === 'function') {
      return term(...args) as string;
    }

    return term;
  }

  /**
   * Outputs the localized date in the specified format
   *
   * @param dateToFormat
   * @param options
   */
  date(dateToFormat: Date | string, options?: Intl.DateTimeFormatOptions): string {
    dateToFormat = new Date(dateToFormat);
    return new Intl.DateTimeFormat(this.lang(), options).format(dateToFormat);
  }

  /**
   * Outputs a localized number in the specified format
   *
   * @param numberToFormat
   * @param options
   */
  number(numberToFormat: number | string, options?: Intl.NumberFormatOptions): string {
    numberToFormat = Number(numberToFormat);
    return isNaN(numberToFormat) ? '' : new Intl.NumberFormat(this.lang(), options).format(numberToFormat);
  }

  /**
   * Outputs a localized time in relative term
   *
   * @param value
   * @param unit
   * @param options
   */
  relativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): string {
    return new Intl.RelativeTimeFormat(this.lang(), options).format(value, unit);
  }
}
