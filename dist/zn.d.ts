declare module "utilities/base-path" {
    /** Sets the library's base path to the specified directory */
    export function setBasePath(path: string): void;
    /**
     * Gets the library's base path.
     *
     * The base path is used to load assets such as icons and images, so it needs to be set for components to work properly.
     * By default, this script will look for a script ending in zinc.js or zinc-autoloader.js and set the base path
     * to the directory that contains that file. To override this behavior, you can add the data-zinc attribute to any
     * script on the page (it probably makes the most sense to attach it to the Zinc script, but it could also be on a
     * bundle). The value can be a local folder, or it can point to a CORS-enabled endpoint such as a CDN.
     *
     *   <script src="bundle.js" data-zinc="/custom/base/path"></script>
     *
     * Alternatively, you can set the base path manually using the exported setBasePath() function.
     *
     * @param subpath - An optional path to append to the base path.
     */
    export function getBasePath(subpath?: string): string;
}
declare module "zinc-autoloader" {
    /**
     * Checks a node for undefined elements and attempts to register them
     */
    export function discover(root: Element | ShadowRoot): Promise<void>;
}
declare module "internal/tabbable" {
    /**
     * Returns the first and last bounding elements that are tabbable. This is more performant than checking every single
     * element because it short-circuits after finding the first and last ones.
     */
    export function getTabbableBoundary(root: HTMLElement | ShadowRoot): {
        start: HTMLElement;
        end: HTMLElement;
    };
    export function getTabbableElements(root: HTMLElement | ShadowRoot): HTMLElement[];
}
declare module "internal/theme" {
    import { SignalWatcher } from '@lit-labs/signals';
    export const themeSignal: import("@lit-labs/signals").Signal.State<string>;
    export function installThemeListener(): void;
    export { SignalWatcher };
}
declare module "internal/event" {
    export type EventTypeRequiresDetail<T> = T extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>> ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>> ? never : Partial<GlobalEventHandlersEventMap[T]['detail']> extends GlobalEventHandlersEventMap[T]['detail'] ? never : T : never : never;
    export type EventTypeDoesNotRequireDetail<T> = T extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>> ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>> ? T : Partial<GlobalEventHandlersEventMap[T]['detail']> extends GlobalEventHandlersEventMap[T]['detail'] ? T : never : T : T;
    export type EventTypesWithRequiredDetail = {
        [EventType in keyof GlobalEventHandlersEventMap as EventTypeRequiresDetail<EventType>]: true;
    };
    export type EventTypesWithoutRequiredDetail = {
        [EventType in keyof GlobalEventHandlersEventMap as EventTypeDoesNotRequireDetail<EventType>]: true;
    };
    type WithRequired<T, K extends keyof T> = T & {
        [P in K]-?: T[P];
    };
    export type ZincEventInit<T> = T extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, unknown>> ? GlobalEventHandlersEventMap[T] extends CustomEvent<Record<PropertyKey, never>> ? CustomEventInit<GlobalEventHandlersEventMap[T]['detail']> : Partial<GlobalEventHandlersEventMap[T]['detail']> extends GlobalEventHandlersEventMap[T]['detail'] ? CustomEventInit<GlobalEventHandlersEventMap[T]['detail']> : WithRequired<CustomEventInit<GlobalEventHandlersEventMap[T]['detail']>, 'detail'> : CustomEventInit : CustomEventInit;
    export type GetCustomEventType<T> = T extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[T] extends CustomEvent<unknown> ? GlobalEventHandlersEventMap[T] : CustomEvent<unknown> : CustomEvent<unknown>;
    export type ValidEventTypeMap = EventTypesWithRequiredDetail | EventTypesWithoutRequiredDetail;
    export function waitForEvent(el: HTMLElement, eventName: string): Promise<void>;
}
declare module "internal/zinc-element" {
    import { LitElement, type PropertyValues } from "lit";
    import type { EventTypeDoesNotRequireDetail, EventTypeRequiresDetail, EventTypesWithoutRequiredDetail, EventTypesWithRequiredDetail, GetCustomEventType, ZincEventInit } from "internal/event";
    import type { SignalWatcherApi } from "@lit-labs/signals";
    type Constructor<T = NonNullable<unknown>> = new (...args: any[]) => T;
    const ZincElementBase: typeof LitElement & Constructor<SignalWatcherApi>;
    export default class ZincElement extends ZincElementBase {
        dir: string;
        lang: string;
        t: string;
        protected willUpdate(changed: PropertyValues): void;
        static define(name: string, elementConstructor?: typeof ZincElement, options?: ElementDefinitionOptions): void;
        static dependencies: Record<string, typeof ZincElement>;
        constructor();
        emit<T extends string & keyof EventTypesWithoutRequiredDetail>(name: EventTypeDoesNotRequireDetail<T>, options?: ZincEventInit<T> | undefined): GetCustomEventType<T>;
        emit<T extends string & keyof EventTypesWithRequiredDetail>(name: EventTypeRequiresDetail<T>, options?: ZincEventInit<T>): GetCustomEventType<T>;
    }
    export interface ZincFormControl extends ZincElement {
        name: string;
        value: unknown;
        disabled?: boolean;
        defaultValue?: unknown;
        defaultChecked?: boolean;
        form?: string;
        storeKey?: string;
        pattern?: string;
        min?: number | string | Date;
        max?: number | string | Date;
        step?: number | 'any';
        required?: boolean;
        minlength?: number;
        maxlength?: number;
        readonly validity: ValidityState;
        readonly validationMessage: string;
        checkValidity: () => boolean;
        getForm: () => HTMLFormElement | null;
        reportValidity: () => boolean;
        setCustomValidity: (message: string) => void;
    }
}
declare module "internal/form-navigation" {
    export class FormNavigationController {
        private readonly form;
        constructor(form: HTMLFormElement);
        private handleKeyDown;
        private shouldSkipEnterKey;
        private shouldExcludeFromNavigation;
        private isSelectOption;
        private findParentSelect;
        private findParentGroup;
        private getGroupItems;
        private focusNextInGroup;
        private focusPreviousInGroup;
        private areRequiredFieldsFilled;
        private getNavigableControls;
        private findCurrentControlIndex;
        private focusNextControl;
        private focusPreviousControl;
        private submitForm;
        destroy(): void;
    }
    /**
     * Gets or creates a FormNavigationController for the given form
     */
    export function getFormNavigationController(form: HTMLFormElement): FormNavigationController;
}
declare module "internal/storage" {
    export class Store {
        storage: Storage;
        prefix: string;
        ttl: number;
        constructor(storage: Storage, prefix: string, ttl?: number);
        get(key: string): null | string;
        stripTtl(value: string | null): null | string;
        setWithTTL(key: string, value: string, ttl: number): void;
        set(key: string, value: string): void;
        remove(key: string): void;
        cleanup(): void;
    }
}
declare module "internal/form" {
    import type { ReactiveController, ReactiveControllerHost } from "lit";
    import type { ZincFormControl } from "internal/zinc-element";
    import type Button from "components/button/index";
    export const formCollections: WeakMap<HTMLFormElement, Set<ZincFormControl>>;
    export function clearFormStoreValues(formOrStoreKey: HTMLFormElement | string): void;
    export interface FormControlControllerOptions {
        /** A function that returns the form containing the form control. */
        form: (input: ZincFormControl) => HTMLFormElement | null;
        /** A function that returns the form control's name, which will be submitted with the form data. */
        name: (input: ZincFormControl) => string;
        /** A function that returns the form control's current value. */
        value: (input: ZincFormControl) => unknown | unknown[];
        /** A function that returns the form control's default value. */
        defaultValue: (input: ZincFormControl) => unknown | unknown[];
        /** A function that returns the form control's current disabled state. If disabled, the value won't be submitted. */
        disabled: (input: ZincFormControl) => boolean;
        /**
         * A function that maps to the form control's reportValidity() function. When the control is invalid, this will
         * prevent submission and trigger the browser's constraint violation warning.
         */
        reportValidity: (input: ZincFormControl) => boolean;
        /**
         * A function that maps to the form control's `checkValidity()` function. When the control is invalid, this will return false.
         *   this is helpful is you want to check validation without triggering the native browser constraint violation warning.
         */
        checkValidity: (input: ZincFormControl) => boolean;
        /** A function that sets the form control's value */
        setValue: (input: ZincFormControl, value: unknown) => void;
        /**
         * An array of event names to listen to. When all events in the list are emitted, the control will receive validity
         * states such as user-valid and user-invalid.user interacted validity states. */
        assumeInteractionOn: string[];
    }
    export class FormControlController implements ReactiveController {
        host: ZincFormControl & ReactiveControllerHost;
        form?: HTMLFormElement | null;
        options: FormControlControllerOptions;
        constructor(host: ReactiveControllerHost & ZincFormControl, options?: Partial<FormControlControllerOptions>);
        hostConnected(): Promise<void>;
        hostDisconnected(): void;
        hostUpdated(): void;
        private attachForm;
        private detachForm;
        private handleFormData;
        private handleFormSubmit;
        private enableSubmit;
        private handleFormReset;
        private handleInteraction;
        private attachFormPersistence;
        private detachFormPersistence;
        private restorePersistedValue;
        private persistHostValue;
        private checkFormValidity;
        private reportFormValidity;
        private setUserInteracted;
        private doAction;
        /** Returns the associated `<form>` element, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Resets the form, restoring all the control to their default value */
        reset(submitter?: HTMLInputElement | Button): void;
        /** Submits the form, triggering validation and form data injection. */
        submit(submitter?: HTMLInputElement | Button): void;
        /**
         * Synchronously sets the form control's validity. Call this when you know the future validity but need to update
         * the host element immediately, i.e. before Lit updates the component in the next update.
         */
        setValidity(isValid: boolean): void;
        /**
         * Updates the form control's validity based on the current value of `host.validity.valid`. Call this when anything
         * that affects constraint validation changes so the component receives the correct validity states.
         */
        updateValidity(): void;
        /**
         * Dispatches a non-bubbling, cancelable custom event of type `zn-invalid`.
         * If the `zm-invalid` event will be cancelled then the original `invalid`
         * event (which may have been passed as argument) will also be cancelled.
         * If no original `invalid` event has been passed then the `zn-invalid`
         * event will be cancelled before being dispatched.
         */
        emitInvalidEvent(originalInvalidEvent?: Event): void;
    }
    export const validValidityState: ValidityState;
    export const customErrorValidityState: ValidityState;
    export const valueMissingValidityState: ValidityState;
}
declare module "internal/slot" {
    import type { ReactiveController, ReactiveControllerHost } from 'lit';
    /** A reactive controller that determines when slots exist. */
    export class HasSlotController implements ReactiveController {
        host: ReactiveControllerHost & Element;
        slotNames: string[];
        constructor(host: ReactiveControllerHost & Element, ...slotNames: string[]);
        private hasDefaultSlot;
        private hasNamedSlot;
        test(slotName: string): boolean;
        hostConnected(): void;
        hostDisconnected(): void;
        getSlot(slotName: string): Element;
        getDefaultSlot(): HTMLElement[];
        getSlots(slotName: string): NodeListOf<HTMLElement>;
        private handleSlotChange;
    }
    /**
     * Given a slot, this function iterates over all of its assigned element and text nodes and returns the concatenated
     * HTML as a string. This is useful because we can't use slot.innerHTML as an alternative.
     */
    export function getInnerHTML(slot: HTMLSlotElement): string;
    /**
     * Given a slot, this function iterates over all of its assigned text nodes and returns the concatenated text as a
     * string. This is useful because we can't use slot.textContent as an alternative.
     */
    export function getTextContent(slot: HTMLSlotElement | undefined | null): string;
}
declare module "internal/watch" {
    import type { LitElement } from "lit";
    type UpdateHandler = (prev?: unknown, next?: unknown) => void;
    type NonUndefined<T> = T extends undefined ? never : T;
    type UpdateHandlerFunctionKeys<T extends object> = {
        [K in keyof T]-?: NonUndefined<T[K]> extends UpdateHandler ? K : never;
    }[keyof T];
    interface WatchOptions {
        /**
         * If true, will only start watching after the initial update/render
         */
        waitUntilFirstUpdate?: boolean;
    }
    /**
     * Runs when observed properties change, e.g. @property or @state, but before the component updates. To wait for an
     * update to complete after a change occurs, use `await this.updateComplete` in the handler. To start watching after the
     * initial update, set `{ waitUntilFirstUpdate: true }` or `this.hasUpdated` in the handler.
     *
     * Usage:
     *
     * ```ts
     * @watch('propName')
     * handlePropChanges(oldValue, newValue) {...}
     * ```
     *
     * @param propertyName
     * @param options
     */
    export function watch(propertyName: string | string[], options?: WatchOptions): <ElemClass extends LitElement>(proto: ElemClass, decoratedFnName: UpdateHandlerFunctionKeys<ElemClass>) => void;
}
declare module "utilities/top-layer-manager" {
    class TopLayerManager {
        private openDropdowns;
        private openTooltips;
        registerDropdown(el: HTMLElement): void;
        unregisterDropdown(el: HTMLElement): void;
        isDropdownOpen(): boolean;
        registerTooltip(el: HTMLElement): void;
        unregisterTooltip(el: HTMLElement): void;
        isTooltipOpen(): boolean;
    }
    const topLayerManager: TopLayerManager;
    export default topLayerManager;
}
declare module "translations/en" {
    import { type Translation } from "utilities/localize";
    const translation: Translation;
    export default translation;
}
declare module "utilities/localize" {
    import { LocalizeController as DefaultLocalizationController } from '@shoelace-style/localize';
    import type { Translation as DefaultTranslation } from '@shoelace-style/localize';
    export class LocalizeController extends DefaultLocalizationController<Translation> {
    }
    export { registerTranslation } from '@shoelace-style/localize';
    export interface Translation extends DefaultTranslation {
        $code: string;
        $name: string;
        $dir: 'ltr' | 'rtl';
        onChange: string;
        hidePassword: string;
        showPassword: string;
        clearEntry: string;
        numOptionsSelected: (num: number) => string;
        fileButtonText: string;
        fileButtonTextMultiple: string;
        folderButtonText: string;
        folderDragDrop: string;
        fileDragDrop: string;
        numFilesSelected: (num: number) => string;
    }
}
declare module "components/popup/popup.component" {
    import ZincElement from "internal/zinc-element";
    import type { CSSResultGroup } from 'lit';
    export interface VirtualElement {
        getBoundingClientRect: () => DOMRect;
        contextElement?: Element;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/popup
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnPopup extends ZincElement {
        static styles: CSSResultGroup;
        private anchorEl;
        private cleanup;
        /** A reference to the internal popup container. Useful for animating and styling the popup with JavaScript. */
        popup: HTMLElement;
        private arrowEl;
        /**
         * The element the popup will be anchored to. If the anchor lives outside of the popup, you can provide the anchor
         * element `id`, a DOM element reference, or a `VirtualElement`. If the anchor lives inside the popup, use the
         * `anchor` slot instead.
         */
        anchor: Element | string | VirtualElement;
        /**
         * Activates the positioning logic and shows the popup. When this attribute is removed, the positioning logic is torn
         * down and the popup will be hidden.
         */
        active: boolean;
        /**
         * The preferred placement of the popup. Note that the actual placement will vary as configured to keep the
         * panel inside of the viewport.
         */
        placement: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end';
        /**
         * Determines how the popup is positioned. The `absolute` strategy works well in most cases, but if overflow is
         * clipped, using a `fixed` position strategy can often workaround it.
         */
        strategy: 'absolute' | 'fixed';
        /** The distance in pixels from which to offset the panel away from its anchor. */
        distance: number;
        /** The distance in pixels from which to offset the panel along its anchor. */
        skidding: number;
        /**
         * Attaches an arrow to the popup. The arrow's size and color can be customized using the `--arrow-size` and
         * `--arrow-color` custom properties. For additional customizations, you can also target the arrow using
         * `::part(arrow)` in your stylesheet.
         */
        arrow: boolean;
        /**
         * The placement of the arrow. The default is `anchor`, which will align the arrow as close to the center of the
         * anchor as possible, considering available space and `arrow-padding`. A value of `start`, `end`, or `center` will
         * align the arrow to the start, end, or center of the popover instead.
         */
        arrowPlacement: 'start' | 'end' | 'center' | 'anchor';
        /**
         * The amount of padding between the arrow and the edges of the popup. If the popup has a border-radius, for example,
         * this will prevent it from overflowing the corners.
         */
        arrowPadding: number;
        /**
         * When set, placement of the popup will flip to the opposite site to keep it in view. You can use
         * `flipFallbackPlacements` to further configure how the fallback placement is determined.
         */
        flip: boolean;
        /**
         * If the preferred placement doesn't fit, popup will be tested in these fallback placements until one fits. Must be a
         * string of any number of placements separated by a space, e.g. "top bottom left". If no placement fits, the flip
         * fallback strategy will be used instead.
         * */
        flipFallbackPlacements: string;
        /**
         * When neither the preferred placement nor the fallback placements fit, this value will be used to determine whether
         * the popup should be positioned using the best available fit based on available space or as it was initially
         * preferred.
         */
        flipFallbackStrategy: 'best-fit' | 'initial';
        /**
         * The flip boundary describes clipping element(s) that overflow will be checked relative to when flipping. By
         * default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can
         * change the boundary by passing a reference to one or more elements to this property.
         */
        flipBoundary: Element | Element[];
        /** The amount of padding, in pixels, to exceed before the flip behavior will occur. */
        flipPadding: number;
        /** Moves the popup along the axis to keep it in view when clipped. */
        shift: boolean;
        /**
         * The shift boundary describes clipping element(s) that overflow will be checked relative to when shifting. By
         * default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can
         * change the boundary by passing a reference to one or more elements to this property.
         */
        shiftBoundary: Element | Element[];
        /** The amount of padding, in pixels, to exceed before the shift behavior will occur. */
        shiftPadding: number;
        /** When set, this will cause the popup to automatically resize itself to prevent it from overflowing. */
        autoSize: 'horizontal' | 'vertical' | 'both';
        /** Syncs the popup's width or height to that of the anchor element. */
        sync: 'width' | 'height' | 'both';
        /**
         * The auto-size boundary describes clipping element(s) that overflow will be checked relative to when resizing. By
         * default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can
         * change the boundary by passing a reference to one or more elements to this property.
         */
        autoSizeBoundary: Element | Element[];
        /** The amount of padding, in pixels, to exceed before the auto-size behavior will occur. */
        autoSizePadding: number;
        /**
         * When a gap exists between the anchor and the popup element, this option will add a "hover bridge" that fills the
         * gap using an invisible element. This makes listening for events such as `mouseenter` and `mouseleave` more sane
         * because the pointer never technically leaves the element. The hover bridge will only be drawn when the popover is
         * active.
         */
        hoverBridge: boolean;
        connectedCallback(): Promise<void>;
        disconnectedCallback(): void;
        updated(changedProps: Map<string, unknown>): Promise<void>;
        private handleAnchorChange;
        handleAnchorHover: () => void;
        private start;
        private stop;
        /** Forces the popup to recalculate and reposition itself. */
        reposition(): void;
        private updateHoverBridge;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/popup/index" {
    import ZnPopup from "components/popup/popup.component";
    export * from "components/popup/popup.component";
    export default ZnPopup;
    global {
        interface HTMLElementTagNameMap {
            'zn-popup': ZnPopup;
        }
    }
}
declare module "components/menu-item/submenu-controller" {
    import { type HasSlotController } from "internal/slot";
    import type { ReactiveController, ReactiveControllerHost } from 'lit';
    import { type LocalizeController } from "utilities/localize";
    import type ZnMenuItem from "components/menu-item/index";
    /** A reactive controller to manage the registration of event listeners for submenus. */
    export class SubmenuController implements ReactiveController {
        private host;
        private popupRef;
        private enableSubmenuTimer;
        private isConnected;
        private isPopupConnected;
        private skidding;
        private readonly hasSlotController;
        private readonly localize;
        private readonly submenuOpenDelay;
        constructor(host: ReactiveControllerHost & ZnMenuItem, hasSlotController: HasSlotController, localize: LocalizeController);
        hostConnected(): void;
        hostDisconnected(): void;
        hostUpdated(): void;
        private addListeners;
        private removeListeners;
        private handleMouseMove;
        private handleMouseOver;
        private handleSubmenuEntry;
        private handleKeyDown;
        private handleClick;
        private handleFocusOut;
        private handlePopupMouseover;
        private handlePopupReposition;
        private setSubmenuState;
        private enableSubmenu;
        private disableSubmenu;
        private updateSkidding;
        isExpanded(): boolean;
        renderSubmenu(): import("lit-html").TemplateResult<1>;
    }
}
declare module "utilities/sha256" {
    export function sha256(input: string): string;
}
declare module "components/icon/icon.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    export type IconLibrary = "src" | "material" | "material-outlined" | "material-round" | "material-sharp" | "material-two-tone" | "material-symbols-outlined" | "gravatar" | "libravatar" | "avatar" | "brands" | "line" | "lucide";
    export type IconColor = "default" | "primary" | "accent" | "info" | "warning" | "error" | "success" | "white" | "disabled" | "red" | "blue" | "green" | "orange" | "yellow" | "indigo" | "violet" | "pink" | "grey" | (string & Record<never, never>);
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/icon
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnIcon extends ZincElement {
        static styles: CSSResultGroup;
        src: string;
        alt: string;
        size: number;
        round: boolean;
        tile: boolean;
        depth: boolean;
        library: IconLibrary;
        color: IconColor;
        fill: IconColor;
        padded: boolean;
        blink: boolean;
        squared: boolean;
        private static readonly presetColors;
        private isPresetColor;
        gravatarOptions: string;
        defaultLibrary: IconLibrary;
        private libraryAutoSet;
        convertToLibrary(input: string): IconLibrary;
        private convertIndicatorToLibrary;
        connectedCallback(): void;
        protected willUpdate(changedProperties: PropertyValues<this>): void;
        protected getUpdateComplete(): Promise<boolean>;
        private parseSrc;
        private applyHashFragment;
        private normalizeRavatarEmail;
        render(): import("lit-html").TemplateResult<1>;
        private getAvatarInitials;
        private renderLucideIcon;
        private getLucideIcon;
        private toPascalCase;
        private getLucideSvg;
        private getSvgAttributes;
        private escapeSvgAttribute;
        protected getColorForAvatar(avatarInitials: string): string;
    }
}
declare module "components/icon/index" {
    import ZnIcon from "components/icon/icon.component";
    export * from "components/icon/icon.component";
    export default ZnIcon;
    global {
        interface HTMLElementTagNameMap {
            'zn-icon': ZnIcon;
        }
    }
}
declare module "components/menu-item/menu-item.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnPopup from "components/popup/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/menu-item
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnMenuItem extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-popup': typeof ZnPopup;
        };
        private cachedTextLabel;
        defaultSlot: HTMLSlotElement;
        menuItem: HTMLElement;
        /** The type of menu item to render. To use `checked`, this value must be set to `checkbox`. */
        type: 'normal' | 'checkbox';
        /** The item's visual style. A standalone item defaults to navigation styling;
         * a parent zn-menu sets this to `dropdown` or `shell` automatically. */
        variant: 'default' | 'dropdown' | 'shell';
        /** Draws the item in a checked state. */
        checked: boolean;
        checkedPosition: 'left' | 'right';
        /** A unique value to store in the menu item. This can be used as a way to identify menu items when selected. */
        value: string;
        /** Draws the menu item in a loading state. */
        loading: boolean;
        /** Draws the menu item in a disabled state, preventing selection. */
        disabled: boolean;
        color: string;
        href: string;
        dataPath: string;
        target: '_self' | '_blank' | '_parent' | '_top' | string;
        dataTarget: 'modal' | 'slide' | string;
        rel: string;
        gaid: string;
        confirm: boolean;
        /** Removes all padding from the menu item. */
        flush: boolean;
        /** Removes horizontal (left/right) padding only. Ignored if flush is set. */
        flushX: boolean;
        /** Removes vertical (top/bottom) padding only. Ignored if flush is set. */
        flushY: boolean;
        /** Removes the border from the menu item. */
        noBorder: boolean;
        /** Marks the menu item as currently active/selected. */
        active: boolean;
        private readonly localize;
        private readonly hasSlotController;
        private submenuController;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private handleDefaultSlotChange;
        private handleHostClick;
        private handleMouseOver;
        handleCheckedChange(): void;
        handleDisabledChange(): void;
        handleTypeChange(): void;
        /** Returns a text label based on the contents of the menu item's default slot. */
        getTextLabel(): string;
        isSubmenu(): boolean;
        private _isLink;
        render(): import("lit-html").TemplateResult;
    }
}
declare module "components/menu-item/index" {
    import ZnMenuItem from "components/menu-item/menu-item.component";
    export * from "components/menu-item/menu-item.component";
    export default ZnMenuItem;
    global {
        interface HTMLElementTagNameMap {
            'zn-menu-item': ZnMenuItem;
        }
    }
}
declare module "events/zn-select" {
    import type ZnMenuItem from "components/menu-item/index";
    export type ZnSelectEvent = CustomEvent<{
        item: ZnMenuItem | HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-select': ZnSelectEvent;
        }
    }
}
declare module "utilities/query" {
    export function deepQuery<T extends Element = Element>(selector: string, root?: Document | ShadowRoot | Element): T | null;
    export function deepQueryAll<T extends Element = Element>(selector: string, root?: Document | ShadowRoot | Element, out?: T[]): T[];
    export function deepQuerySelectorAll(selector: string, element: Element, stopSelector: string): Element[];
}
declare module "internal/offset" {
    /**
     * Returns an element's offset relative to its parent. Similar to element.offsetTop and element.offsetLeft, except the
     * parent doesn't have to be positioned relative or absolute.
     *
     * NOTE: This was created to work around what appears to be a bug in Chrome where a slotted element's offsetParent seems
     * to ignore elements inside the surrounding shadow DOM: https://bugs.chromium.org/p/chromium/issues/detail?id=920069
     */
    export function getOffset(element: HTMLElement, parent: HTMLElement): {
        top: number;
        left: number;
    };
}
declare module "internal/scroll" {
    /**
     * Prevents body scrolling. Keeps track of which elements requested a lock so multiple levels of locking are possible
     * without premature unlocking.
     */
    export function lockBodyScrolling(lockingEl: HTMLElement): void;
    /**
     * Unlocks body scrolling. Scrolling will only be unlocked once all elements that requested a lock call this method.
     */
    export function unlockBodyScrolling(lockingEl: HTMLElement): void;
    /** Scrolls an element into view of its container. If the element is already in view, nothing will happen. */
    export function scrollIntoView(element: HTMLElement, container: HTMLElement, direction?: 'horizontal' | 'vertical' | 'both', behavior?: 'smooth' | 'auto'): void;
}
declare module "components/dialog/dialog.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/dialog
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     *
     * @event zn-show - Emitted when the dialog is opens.
     * @event zn-close - Emitted when the dialog is closed.
     * @event {{ source: 'close-button' | 'keyboard' | 'overlay' }} zn-request-close - Emitted when the user attempts to
     * close the dialog by clicking the close button, clicking the overlay, or pressing escape. Calling
     * `event.preventDefault()` will keep the dialog open. Avoid using this unless closing the dialog will result in
     * destructive behavior such as data loss.
     *
     * @slot - The default slot.
     * @slot label - The dialog's label. Alternatively you can use the `label` attribute.
     * @slot header-icon - Optional icon to add to the left of the dialog's label (title). A color will be applied
     * to the icon depending on the dialog variant.
     * @slot announcement-intro - Optional Intro text to display below the icon, when using the variant `announcement`.
     * @slot header-actions - Optional actions to add to the header. Works best with `<zn-button>` elements.
     * @slot footer - The dialog's footer. This is typically used for buttons representing various options.
     * @slot footer-text - Optional text to include below the footer buttons, when using the variant `announcement`.
     *
     * @csspart base - The component's base wrapper.
     * @csspart header - The dialog's header. This element wraps the title and header actions.
     * @csspart header-actions - Optional actions to add to the header. Works best with `<zn-button>` elements.
     * @csspart title - The dialog's title.
     * @csspart close-button - The dialog's close button.
     * @csspart close-button__base - The close buttons exported `base` part.
     * @csspart body - The dialog's body.
     * @csspart footer - The dialog's footer.
     *
     * @cssproperty --width - The preferred width of the dialog. Note the dialog will shrink to accommodate smaller screens.
     * @cssproperty --header-spacing - The amount of padding to use for the header.
     * @cssproperty --body-spacing - The amount of padding to use for the body.
     * @cssproperty --footer-spacing - The amount of padding to use for the footer.
     */
    export default class ZnDialog extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
        };
        private readonly hasSlotController;
        private closeWatcher;
        dialog: HTMLDialogElement;
        closer: HTMLButtonElement;
        /** The dialog's theme variant. */
        variant: 'default' | 'warning' | 'announcement';
        /** The dialog's size. */
        size: 'small' | 'medium' | 'large' | 'custom';
        /**
         * Indicated whether of not the dialog is open. You can toggle this attribute to show and hide the dialog, or you can
         * use the `show()` and `hide()` methods and this attribute will reflect the dialog's state.
         */
        open: boolean;
        /**
         * The dialog's label as displayed in the header. You should always include a relevant label even when using
         * `no-header`, as it is required for proper accessibility. If you need to display HTML, use the `label` slot instead.
         */
        label: string;
        cosmic: boolean;
        /**
         * Disables the header. This will also remove the default close button, so please ensure you provide an easy,
         * accessible way to close the dialog.
         */
        noHeader: boolean;
        /**
         * The dialog's trigger element. This is used to open the dialog when clicked. If you do not provide a trigger, you
         * will need to manually open the dialog using the `show()` method.
         */
        trigger: string;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private requestClose;
        private addOpenListeners;
        private removeOpenListeners;
        /** Shows the dialog. */
        show(): void;
        /** Hides the dialog. */
        hide(): void;
        private closeClickHandler;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/dialog/index" {
    import ZnDialog from "components/dialog/dialog.component";
    export * from "components/dialog/dialog.component";
    export default ZnDialog;
    global {
        interface HTMLElementTagNameMap {
            'zn-dialog': ZnDialog;
        }
    }
}
declare module "components/confirm/confirm.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnDialog from "components/dialog/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/confirm-modal
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnConfirm extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-dialog': typeof ZnDialog;
        };
        private readonly hasSlotController;
        /** The dialog's theme variant. */
        variant: 'default' | 'warning' | 'announcement';
        /** The dialog's size. */
        size: 'small' | 'medium' | 'large';
        /** The dialogs type, which will determine the icon and color. */
        type: 'warning' | 'error' | 'success' | 'info';
        /**
         * Indicated whether of not the dialog is open. You can toggle this attribute to show and hide the dialog, or you can
         * use the `show()` and `hide()` methods and this attribute will reflect the dialog's state.
         */
        open: boolean;
        caption: string;
        action: string;
        content: string;
        confirmText: string;
        cancelText: string;
        hideIcon: boolean;
        /**
         * Show a loading state when the dialog is submitted.
         */
        showLoading: boolean;
        /**
         * The dialog's trigger element. This is used to open the dialog when clicked. If you do not provide a trigger, you
         * will need to manually open the dialog using the `show()` method.
         */
        trigger: string;
        /** The Dialogs announcement text. */
        announcement: string;
        /** The Dialogs footer text. */
        footerText: string;
        dialog: ZnDialog;
        /** Internal loading state used when showLoading is enabled */
        private loading;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        updateTriggers(): void;
        show: (event?: Event | undefined) => void;
        hide(): void;
        render(): import("lit-html").TemplateResult<1>;
        submitDialog(): void;
    }
}
declare module "components/confirm/index" {
    import ZnConfirm from "components/confirm/confirm.component";
    export * from "components/confirm/confirm.component";
    export default ZnConfirm;
    global {
        interface HTMLElementTagNameMap {
            'zn-confirm-modal': ZnConfirm;
        }
    }
}
declare module "components/tooltip/tooltip.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type Popup from "components/popup/index";
    /**
     * @summary The Tooltip component is used to display additional information when a user hovers over or clicks
     * on an element.
     *
     * @documentation https://zinc.style/components/tooltip
     * @status experimental
     * @since 1.0
     *
     * @event zn-show - Emitted when the tooltip is shown.
     * @event zn-after-show - Emitted after the tooltip is shown.
     * @event zn-hide - Emitted when the tooltip is hidden.
     * @event zn-after-hide - Emitted after the tooltip is hidden.
     *
     * @slot - The content of the tooltip
     * @slot anchor - The anchor the tooltip is attached to.
     */
    export default class ZnTooltip extends ZincElement {
        static styles: CSSResultGroup;
        private hoverTimeout;
        private closeWatcher;
        defaultSlot: HTMLSlotElement;
        body: HTMLElement;
        popup: Popup;
        content: string;
        placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
        disabled: boolean;
        distance: number;
        open: boolean;
        skidding: number;
        trigger: string;
        hoist: boolean;
        constructor();
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private hasTrigger;
        private handleBlur;
        private handleClick;
        private handleFocus;
        private handleDocumentKeyDown;
        private handleMouseOver;
        private handleMouseOut;
        handleOpenChange(): void;
        handleOptionsChange(): Promise<void>;
        handleDisabledChange(): void;
        show(): Promise<void>;
        hide(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/tooltip/index" {
    import ZnTooltip from "components/tooltip/tooltip.component";
    export * from "components/tooltip/tooltip.component";
    export default ZnTooltip;
    global {
        interface HTMLElementTagNameMap {
            'zn-tooltip': ZnTooltip;
        }
    }
}
declare module "components/menu/menu.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnConfirm from "components/confirm/index";
    import ZnDropdown from "components/dropdown/index";
    import ZnIcon from "components/icon/index";
    import ZnMenuItem from "components/menu-item/index";
    import ZnTooltip from "components/tooltip/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/menu
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnMenu extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-confirm': typeof ZnConfirm;
            'zn-dropdown': typeof ZnDropdown;
            'zn-icon': typeof ZnIcon;
            'zn-menu-item': typeof ZnMenuItem;
            'zn-tooltip': typeof ZnTooltip;
        };
        defaultSlot: HTMLSlotElement;
        actions: never[];
        /** The menu's visual style. `shell` renders the app-shell header dropdown
         * look: a padded panel with floating rounded items. Propagated to the
         * menu's items. */
        variant: 'default' | 'shell';
        connectedCallback(): void;
        /** @internal Gets all slotted menu items, ignoring dividers, headers, and other elements. */
        getAllItems(): ZnMenuItem[];
        /**
         * @internal Gets the current menu item, which is the menu item that has `tabindex="0"` within the roving tab index.
         * The menu item may or may not have focus, but for keyboard interaction purposes it's considered the "active" item.
         */
        getCurrentItem(): ZnMenuItem | undefined;
        /**
         * @internal Sets the current menu item to the specified element. This sets `tabindex="0"` on the target element and
         * `tabindex="-1"` to all other items. This method must be called prior to setting focus on a menu item.
         */
        setCurrentItem(item: ZnMenuItem): void;
        render(): import("lit-html").TemplateResult<1>;
        private handleClick;
        private handleKeyDown;
        private handleMouseDown;
        private handleSlotChange;
        protected updated(changedProperties: Map<string, unknown>): void;
        /**
         * @internal The variant applied to slotted items. A `default` menu still gives
         * its items the `dropdown` look (muted hover, no separators) — distinct from a
         * bare standalone menu item, which keeps the navigation styling.
         */
        get itemVariant(): 'dropdown' | 'shell';
        /** Keeps slotted menu items in sync with the menu's variant. */
        private propagateVariant;
        private isMenuItem;
    }
}
declare module "components/menu/index" {
    import ZnMenu from "components/menu/menu.component";
    export * from "components/menu/menu.component";
    export default ZnMenu;
    global {
        interface HTMLElementTagNameMap {
            'zn-menu': ZnMenu;
        }
    }
}
declare module "components/dropdown/dropdown.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type { ZnSelectEvent } from "events/zn-select";
    import type ZnPopup from "components/popup/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/dropdown
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnDropdown extends ZincElement {
        static styles: CSSResultGroup;
        popup: ZnPopup;
        trigger: HTMLSlotElement;
        panel: HTMLSlotElement;
        private closeWatcher;
        /** Indicates whether the dropdown is open */
        open: boolean;
        /** The placement of the dropdown. Note the actual placement may vary based on the available space */
        placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
        /** Disable the dropdown */
        disabled: boolean;
        /** By default, the dropdown will close when an item is selected. Set this to true to keep the dropdown open */
        stayOpenOnSelect: boolean;
        /** The dropdown will close when the user interacts outside the element**/
        containingElement?: HTMLElement;
        /** The distance in pixels from which to offset the panel away from the trigger */
        distance: number;
        /** The distance in pixels from which to offset the panel away from the trigger */
        skidding: number;
        /** Enable this option if the parent is overflow hidden and the dropdown is not visible */
        hoist: boolean;
        /** Syncs the popup width or height with the trigger element */
        sync: 'width' | 'height' | 'both' | undefined;
        uri: string;
        fetchedContent: string;
        connectedCallback(): void;
        focusOnTrigger(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        disconnectedCallback(): void;
        private getMenu;
        private addOpenListeners;
        private removeOpenListeners;
        /** Events */
        handlePanelSelect: (event: ZnSelectEvent) => void;
        private preloadContent;
        private handlePreload;
        handleTriggerClick(): Promise<void>;
        handleKeyDown(event: KeyboardEvent): void;
        private handleTriggerKeyDown;
        private handleTriggerKeyUp;
        private handleTriggerSlotChange;
        private handleDocumentMouseDown;
        handleDocumentKeyDown(event: KeyboardEvent): void;
        /** Opens the dropdown */
        show(): Promise<void>;
        /** Closes the dropdown */
        hide(): Promise<void>;
        /** Instructs the dropdown to reposition itself */
        reposition(): void;
        /** Aria related method */
        private updateAccessibleTrigger;
        handleOpenChange(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/dropdown/index" {
    import ZnDropdown from "components/dropdown/dropdown.component";
    export * from "components/dropdown/dropdown.component";
    export default ZnDropdown;
    global {
        interface HTMLElementTagNameMap {
            'zn-dropdown': ZnDropdown;
        }
    }
}
declare module "components/button/button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnTooltip from "components/tooltip/index";
    import type { IconColor, IconLibrary } from "components/icon/index";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Buttons represent actions that are available to the user.
     * @documentation https://inc.style/components/button
     * @status stable
     * @since 2.0
     *
     * @dependency zn-icon
     * @dependency zn-tooltip
     *
     * @event zn-blur - Emitted when the button loses focus.
     * @event zn-focus - Emitted when the button gains focus.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @slot - The button's label.
     * @slot prefix - A presentational prefix icon or similar element.
     * @slot suffix - A presentational suffix icon or similar element.
     * @slot cancel - Slot for custom cancel button/content when autoClick is active.
     *
     * @csspart base - The component's base wrapper.
     * @csspart prefix - The container that wraps the prefix.
     * @csspart label - The button's label.
     * @csspart suffix - The container that wraps the suffix.
     * @csspart caret - The button's caret icon, an `<zn-icon>` element.
     * @csspart spinner - The spinner that shows when the button is in the loading state.
     */
    export default class ZnButton extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-tooltip': typeof ZnTooltip;
            'zn-icon': typeof ZnIcon;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        private _autoClickTimeout;
        private _loadingState;
        button: HTMLButtonElement;
        countdownContainer: HTMLElement[];
        color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent' | 'star' | (string & Record<never, never>);
        hoverColor: string;
        text: boolean;
        outline: boolean;
        disabled: boolean;
        grow: boolean;
        square: boolean;
        /** Renders the button as an icon button (40x36). Pass `small` for the
         * 36x36 variant or `round` for a 36x36 circle: `icon-button`,
         * `icon-button="small"` or `icon-button="round"`. */
        iconButton: boolean | 'small' | 'round';
        /** With `icon-button`, removes the white background and border while
         * keeping the button's size. */
        plain: boolean;
        /** Disables the hover background, for contexts where the tint doesn't fit. */
        noHover: boolean;
        panelBackground: boolean;
        dropdownCloser: boolean;
        notification: number;
        mutedNotifications: boolean;
        verticalAlign: 'start' | 'center' | 'end';
        content: string;
        icon: string;
        gaid: string;
        iconPosition: 'left' | 'right';
        iconSize: string;
        iconColor: IconColor;
        iconFill: IconColor;
        iconLibrary: IconLibrary;
        type: 'button' | 'submit' | 'reset';
        name: string;
        value: string;
        form: string;
        formAction: string;
        formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        formMethod: 'post' | 'get';
        formNoValidate: boolean;
        formTarget: '_self' | '_blank' | '_parent' | '_top' | string;
        href: string;
        target: '_self' | '_blank' | '_parent' | '_top' | string;
        dataTarget: 'modal' | 'slide' | string;
        rel: string;
        tooltip: string;
        autoClick: boolean;
        autoClickDelay: number;
        loadingText: string;
        loadingTextPosition: 'left' | 'right' | 'center' | string;
        loading: boolean;
        get validity(): ValidityState;
        get validationMessage(): string;
        firstUpdated(): void;
        disconnectedCallback(): void;
        handleAutoClickChange(_old: boolean, value: boolean): Promise<void>;
        protected updated(changedProps: Map<string, any>): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        click(): void;
        handleClick: () => void;
        private _isLink;
        private _isButton;
        private getIconButtonColor;
        setupAutoClick(): void;
        updateCountdownText(): void;
        teardownAutoClick(): void;
        protected render(): unknown;
        private _getLoadingContainer;
    }
}
declare module "components/button/index" {
    import ZnButton from "components/button/button.component";
    export * from "components/button/button.component";
    export default ZnButton;
    global {
        interface HTMLElementTagNameMap {
            'zn-button': ZnButton;
        }
    }
}
declare module "components/absolute-container/absolute-container.component" {
    import ZincElement from "internal/zinc-element";
    import type { PropertyValues } from 'lit';
    /**
     * @summary The absolute container will take the total inner height of the content (positioned absolute), and set that
     * as it's min height, Creating enough space to show the content.
     *
     * @documentation https://zinc.style/components/absolute-container
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot
     *
     */
    export default class ZnAbsoluteContainer extends ZincElement {
        constructor();
        protected firstUpdated(_changedProperties: PropertyValues): void;
        resize(): void;
        createRenderRoot(): this;
    }
}
declare module "components/absolute-container/index" {
    import ZnAbsoluteContainer from "components/absolute-container/absolute-container.component";
    export * from "components/absolute-container/absolute-container.component";
    export default ZnAbsoluteContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-absolute-container': ZnAbsoluteContainer;
        }
    }
}
declare module "events/zn-input" {
    export type ZnInputEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-input': ZnInputEvent;
        }
    }
}
declare module "internal/default-value" {
    import type { ReactiveElement } from 'lit';
    export const defaultValue: (propertyName?: string) => (proto: ReactiveElement, key: string) => void;
}
declare module "components/toggle/toggle.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement, { type ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Toggles allow the user to switch an option on or off.
     * @documentation https://zinc.style/components/toggle
     * @status stable
     * @since 1.0
     *
     * @dependency zn-tooltip
     *
     * @event zn-input - Emitted when the toggle receives input.
     *
     * @slot - The toggle's label.
     *
     * @csspart base - The component's base wrapper containing the toggle switch.
     * @csspart control - The toggle switch control (the circular button that slides).
     *
     * @cssproperty --zn-toggle-margin - The margin around the toggle switch. Defaults to `8px 0`.
     */
    export default class ZnToggle extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        input: HTMLInputElement;
        hasFocus: boolean;
        title: string;
        name: string;
        value: string;
        fallbackValue: string;
        size: 'small' | 'medium' | 'large';
        disabled: boolean;
        checked: boolean;
        defaultChecked: boolean;
        form: string;
        required: boolean;
        helpText: string;
        triggerSubmit: boolean;
        onText: string;
        offText: string;
        label: string;
        inline: boolean;
        get validity(): ValidityState;
        get validationMessage(): string;
        firstUpdated(_changedProperties: PropertyValues): void;
        private handleBlur;
        private handleInvalid;
        private handleInput;
        private handleClick;
        private handleFocus;
        private handleKeyDown;
        click(): void;
        focus(options?: FocusOptions): void;
        blur(): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/toggle/index" {
    import ZnToggle from "components/toggle/toggle.component";
    export * from "components/toggle/toggle.component";
    export default ZnToggle;
    global {
        interface HTMLElementTagNameMap {
            'zn-toggle': ZnToggle;
        }
    }
}
declare module "components/collapsible/collapsible.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { Store } from "internal/storage";
    import ZincElement from "internal/zinc-element";
    import type { ZnInputEvent } from "events/zn-input";
    /**
     * @summary Toggles between showing and hiding content when clicked
     * @documentation https://zinc.style/components/collapsible
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon - The icon element
     *
     * @slot header - Clicking will toggle the show state of the data
     *
     * @csspart header - The header row (toggle).
     * @csspart caption - The caption text.
     */
    export default class ZnCollapsible extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        label: string;
        showNumber: boolean;
        countElement: string;
        expanded: boolean;
        defaultState: 'open' | 'closed';
        localStorage: boolean;
        storeKey: string;
        storeTtl: number;
        flush: boolean;
        numberOfItems: number;
        protected _store: Store;
        private readonly hasSlotController;
        private readonly observer;
        private showArrow;
        connectedCallback(): Promise<void>;
        handleCaptionToggle: (e: ZnInputEvent) => void;
        protected updated(changedProperties: PropertyValues): void;
        handleCollapse: (e: MouseEvent) => void;
        recalculateNumberOfItems: () => void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/collapsible/index" {
    import ZnCollapsible from "components/collapsible/collapsible.component";
    export * from "components/collapsible/collapsible.component";
    export default ZnCollapsible;
    global {
        interface HTMLElementTagNameMap {
            'zn-accordion': ZnCollapsible;
        }
    }
}
declare module "components/alert/alert.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/alert
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnAlert extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        caption: string;
        collapse: boolean;
        appearance: 'transparent' | 'solid';
        level: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'note' | 'cosmic';
        size: 'small' | 'medium' | 'large';
        render(): import("lit-html").TemplateResult<1>;
        hideAlert(): void;
    }
}
declare module "components/alert/index" {
    import ZnAlert from "components/alert/alert.component";
    export * from "components/alert/alert.component";
    export default ZnAlert;
    global {
        interface HTMLElementTagNameMap {
            'zn-alert': ZnAlert;
        }
    }
}
declare module "components/button-group/button-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/button-group
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --grow - Use flex-grow to fill available space.
     * @cssproperty --start - Justify content at the start of the flex space.
     */
    export default class ZnButtonGroup extends ZincElement {
        static styles: CSSResultGroup;
        direction: 'horizontal' | 'vertical';
        grow: boolean;
        wrap: boolean;
        start: boolean;
        gap: boolean;
        defaultSlot: HTMLSlotElement;
        private handleSlotChange;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/button-group/index" {
    import ZnButtonGroup from "components/button-group/button-group.component";
    export * from "components/button-group/button-group.component";
    export default ZnButtonGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-button-group': ZnButtonGroup;
        }
    }
}
declare module "components/chat-message/clean-message" {
    /** Strip scripts and event/handler attributes from an untrusted HTML string. */
    export function cleanHTML(message: string): string;
}
declare module "components/chat-message/chat-message.component" {
    import { type CSSResultGroup, nothing } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    export type ChatMessageActionType = '' | 'connected.agent' | 'attachment.added' | 'multi.answer' | 'transfer' | 'ended' | 'error' | 'message-sending' | 'customer.ended' | 'customer.connected' | 'customer.disconnected' | 'internal';
    /**
     * @summary A single message in a chat-style conversation: avatar, sender,
     * time, optional badge, and a message bubble with optional actions. Also renders
     * system events (connections, transfers, etc.) as a centred card.
     * @documentation https://zinc.style/components/chat-message
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The message content. Ignored when the `message` attribute is set.
     * @slot badge - Rendered in the header after the sender and time (e.g. an INTERNAL NOTE chip).
     * @slot attachments - Attachments displayed beneath the message content. Use `zn-chat-message-attachment`,
     * which auto-assigns itself to this slot.
     * @slot edit-dialog-trigger - Action rendered at the end of the bubble (e.g. a remove icon button).
     * @slot edit-dialog - Pass-through for an associated dialog element.
     *
     * @csspart base - The component's base wrapper.
     * @csspart avatar - The avatar column.
     * @csspart body - The header and bubble column.
     * @csspart header - The sender/time/badge row.
     * @csspart bubble - The message bubble.
     * @csspart content - The message content within the bubble.
     * @csspart attachments - The attachments row beneath the message content.
     * @csspart system-card - The card rendered for system action types.
     *
     * @cssproperty --message-background - The bubble's background color.
     */
    export default class ZnChatMessage extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        static readonly SYSTEM_ACTION_TYPES: readonly string[];
        private static readonly DISPLAYED_ACTION_TYPES;
        /** The sender's name, also used for the avatar. */
        sender: string;
        /**
         * The message body as an HTML string. When set, it is sanitized (scripts and event
         * handlers stripped), newlines become line breaks and bare URLs become links. When
         * omitted the default slot is rendered instead.
         */
        message: string;
        /** Unix timestamp (seconds) of the message, shown as HH:MM (with date if not today). */
        time: string;
        /** Overrides the avatar source. Defaults to `sender`. */
        avatar: string;
        /** The kind of message. Drives system-card rendering, the sending state and badges. */
        actionType: ChatMessageActionType;
        /** Marks the message as initiated by the customer (affects styling and grouping). */
        customerInitiated: boolean;
        /** Marks the message as initiated by an agent (affects styling and grouping). */
        agentInitiated: boolean;
        /** Hides the sender's name in the message header. */
        hideSender: boolean;
        /** Whether any element is assigned to the `attachments` slot — drives the attachments row visibility. */
        private hasAttachments;
        connectedCallback(): void;
        protected render(): import("lit-html").TemplateResult<1> | typeof nothing;
        protected firstUpdated(): void;
        private handleAttachmentsSlotChange;
        private syncHasAttachments;
        private isSystemMessage;
        private renderSystemCard;
        private systemLabel;
        private renderHeader;
        private renderContent;
        /** HH:MM only — used on the system card. */
        private getTime;
        /** HH:MM, prefixed with the date when the message is not from today. */
        private getSentTime;
    }
}
declare module "components/chat-message/index" {
    import ZnChatMessage from "components/chat-message/chat-message.component";
    export * from "components/chat-message/chat-message.component";
    export default ZnChatMessage;
    global {
        interface HTMLElementTagNameMap {
            'zn-chat-message': ZnChatMessage;
        }
    }
}
declare module "components/chat-message-attachment/chat-message-attachment.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    /**
     * @summary A single file or link attachment for a `zn-chat-message` or `zn-content-block`.
     * Renders an icon and a label as a link, styled to match the message's attachments row. It is
     * intended to be used only inside a `zn-chat-message` or `zn-content-block` and is automatically
     * placed in that component's `attachments` slot.
     * @documentation https://zinc.style/components/chat-message-attachment
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The attachment label. Falls back to the `name` attribute when empty.
     *
     * @csspart base - The attachment link.
     * @csspart icon - The leading icon.
     * @csspart label - The attachment label.
     */
    export default class ZnChatMessageAttachment extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        /** The URL the attachment links to. */
        href: string;
        /** The attachment label (e.g. the file name). Used when the default slot is empty. */
        name: string;
        /** The leading icon name. */
        icon: string;
        /**
         * Where to open the link. Defaults to a new tab. Reflected so the console's
         * pagelet link interception (`[href]:not([target])`) skips the host and the
         * browser handles the click natively (download / new tab) instead of
         * loading the file URL as a pagelet.
         */
        target: string;
        /** Prompt a download rather than navigating to the link. */
        download: boolean;
        connectedCallback(): void;
        protected render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/chat-message-attachment/index" {
    import ZnChatMessageAttachment from "components/chat-message-attachment/chat-message-attachment.component";
    export * from "components/chat-message-attachment/chat-message-attachment.component";
    export default ZnChatMessageAttachment;
    global {
        interface HTMLElementTagNameMap {
            'zn-chat-message-attachment': ZnChatMessageAttachment;
        }
    }
}
declare module "components/chip/chip.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/chip
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnChip extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        caption: string;
        iconSize: number;
        type: 'info' | 'success' | 'warning' | 'error' | 'primary' | 'transparent' | 'custom' | 'neutral';
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        private readonly hasSlotController;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/chip/index" {
    import ZnChip from "components/chip/chip.component";
    export * from "components/chip/chip.component";
    export default ZnChip;
    global {
        interface HTMLElementTagNameMap {
            'zn-chip': ZnChip;
        }
    }
}
declare module "components/well/well.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/well
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot.
     */
    export default class ZnWell extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        inline: boolean;
        private readonly hasSlotController;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/well/index" {
    import ZnWell from "components/well/well.component";
    export * from "components/well/well.component";
    export default ZnWell;
    global {
        interface HTMLElementTagNameMap {
            'zn-well': ZnWell;
        }
    }
}
declare module "components/copy-button/copy-button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type ZnTooltip from "components/tooltip/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/copy-button
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnCopyButton extends ZincElement {
        static styles: CSSResultGroup;
        copyIcon: HTMLSlotElement;
        successIcon: HTMLSlotElement;
        errorIcon: HTMLSlotElement;
        tooltip: ZnTooltip;
        isCopying: boolean;
        status: 'rest' | 'success' | 'error';
        value: string;
        copyLabel: string;
        src: string;
        size: number;
        /**
         * An id that references an element in the same document from which data will be copied. If both this and `value` are
         * present, this value will take precedence. By default, the target element's `textContent` will be copied. To copy an
         * attribute, append the attribute name wrapped in square brackets, e.g. `from="el[value]"`. To copy a property,
         * append a dot and the property name, e.g. `from="el.value"`.
         */
        from: string;
        render(): import("lit-html").TemplateResult<1>;
        private showStatus;
        private handleCopy;
    }
}
declare module "components/copy-button/index" {
    import ZnCopyButton from "components/copy-button/copy-button.component";
    export * from "components/copy-button/copy-button.component";
    export default ZnCopyButton;
    global {
        interface HTMLElementTagNameMap {
            'zn-copy-button': ZnCopyButton;
        }
    }
}
declare module "events/zn-filter-change" {
    export type ZnFilterChangeEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-filter-change': ZnFilterChangeEvent;
        }
    }
}
declare module "events/zn-search-change" {
    export type ZnSearchChangeEvent = CustomEvent<{
        value: string;
        formData: Record<string, any>;
        searchUri?: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-search-change': ZnSearchChangeEvent;
        }
    }
}
declare module "components/data-table-filter/data-table-filter.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement, { type ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/data-table-filter
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnDataTableFilter extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private _formController;
        filters: string;
        name: string;
        value: string;
        get validationMessage(): string;
        get validity(): ValidityState;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleQBClear: () => void;
        handleQBReset: () => void;
        handleQBUpdate: () => void;
        closeSlideout(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/data-table-filter/index" {
    import ZnDataTableFilter from "components/data-table-filter/data-table-filter.component";
    export * from "components/data-table-filter/data-table-filter.component";
    export default ZnDataTableFilter;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-table-filter': ZnDataTableFilter;
        }
    }
}
declare module "components/input/input.component" {
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnTooltip from "components/tooltip/index";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/input
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-tooltip
     *
     * @event zn-blur - Emitted when the control loses focus.
     * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
     * @event zn-clear - Emitted when the clear button is activated.
     * @event zn-focus - Emitted when the control gains focus.
     * @event zn-input - Emitted when the control receives input.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @slot label - The input's label. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot context-note - Used to add contextual text that is displayed above the input, on the right. Alternatively, you can use the `context-note` attribute.
     * @slot prefix - Used to prepend a presentational icon or similar element to the input.
     * @slot suffix - Used to append a presentational icon or similar element to the input.
     * @slot clear-icon - An icon to use in lieu of the default clear icon.
     * @slot show-password-icon - An icon to use in lieu of the default show password icon.
     * @slot hide-password-icon - An icon to use in lieu of the default hide password icon.
     * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
     *
     * @csspart form-control - The form control that wraps the label, input, and help text.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The input's wrapper.
     * @csspart form-control-help-text - The help text's wrapper.
     * @csspart base - The component's base wrapper.
     * @csspart input - The internal `<input>` control.
     * @csspart prefix - The container that wraps the prefix.
     * @csspart clear-button - The clear button.
     * @csspart password-toggle-button - The password toggle button.
     * @csspart suffix - The container that wraps the suffix.
     */
    export default class ZnInput extends ZincElement implements ZincFormControl {
        static styles: import("lit").CSSResult;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-tooltip': typeof ZnTooltip;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        private readonly localize;
        input: HTMLInputElement;
        colorPicker: HTMLInputElement;
        private hasFocus;
        private isUserTyping;
        title: string;
        private __numberInput;
        private __dateInput;
        /**
         * The type of input. Works the same as native `<input>` element. But only a subset of types is supported. Defaults
         * to `text`
         */
        type: 'color' | 'currency' | 'date' | 'datetime-local' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url';
        /** The name of the input, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the input, submitted as a name/value pair with form data. */
        value: any;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string;
        /** The inputs size **/
        size: 'x-small' | 'small' | 'medium' | 'large';
        /** Draws a pill-styled input **/
        pill: boolean;
        /** The inputs label. If you need to display HTML, use the `label` slot. **/
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
         * `label-tooltip` slot.
         * **/
        labelTooltip: string;
        /**
         * Text that appears above the input, on the right, to add additional context. If you need to display HTML
         * in this text, use the `context-note` slot instead
         */
        contextNote: string;
        /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
        helpText: string;
        /** Adds a clear button when the input is not empty **/
        clearable: boolean;
        /** Adds the default optional icon for this input type. Currently only types `email` and `tel` have a default
         * optional icon.
         */
        optionalIcon: boolean;
        /** Disables the input **/
        disabled: boolean;
        /** Fills the input background white **/
        filled: boolean;
        /** Placeholder text to show as a hint when the input is empty. */
        placeholder: string;
        /** Makes the input read-only **/
        readonly: boolean;
        /** Adds a button to toggle the passwords visibility, only applies to password types **/
        passwordToggle: boolean;
        /** Determines whether or no the password is currently visible. Only applies to password types **/
        passwordVisible: boolean;
        /** Hides the browsers built-in increment/decrement spin buttons for number inputs **/
        noSpinButtons: boolean;
        /** The color format to display for color inputs. Only applies when type is 'color'. **/
        colorFormat: 'hex' | 'rgb' | 'hsl' | 'oklch';
        /**
         * By default, form-controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside a form and associate it with the form that has this `id`. The form must be
         * in the same document or shadow root for this to work.
         */
        form: string;
        /** Makes the input a required field. */
        required: boolean;
        /** A regular expression pattern to validate input against. */
        pattern: string;
        /** The minimum length of input that will be considered valid. */
        minlength: number;
        /** The maximum length of input that will be considered valid. */
        maxlength: number;
        /** The input's minimum value. Only applies to date and number input types. */
        min: number | string;
        /** The input's maximum value. Only applies to date and number input types. */
        max: number | string;
        /**
         * Specifies the granularity that the value must adhere to, or the special value `any` which means no stepping is
         * implied, allowing any numeric value. Only applies to date and number input types.
         */
        step: number | 'any';
        /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
        autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
        /** Indicates whether the browser's autocorrect feature is on or off. */
        autocorrect: 'off' | 'on';
        /**
         * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
         * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
         */
        autocomplete: string;
        /** Indicates that the input should receive focus on page load. */
        autofocus: boolean;
        /** Used to customize the label or icon of the Enter key on virtual keyboards. */
        enterkeyhint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
        /** Enables spell checking on the input. */
        spellcheck: boolean;
        /**
         * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
         * keyboard on supportive devices.
         */
        inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
        /**
         * Gets or sets the current value as `date` object. Returns `null` if the value can't be converted. This will use
         * the native `<input type="{{type}}">` implementation and may result in an error.
         */
        get valueAsDate(): Date | null;
        set valueAsDate(newValue: Date | null);
        /** Gets or sets the current value as a number. Return `null` if the value can't be converted. */
        get valueAsNumber(): number;
        set valueAsNumber(newValue: number);
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        private validateMinMax;
        private hexToRgb;
        private rgbToHex;
        private hexToOklch;
        private oklchToHex;
        private hexToHsl;
        private hslToHex;
        private convertToHex;
        private convertFromHex;
        private handleBlur;
        private handleChange;
        private handleClearClick;
        private handleFocus;
        private handleInput;
        private handleInvalid;
        private handleKeyDown;
        private handlePasswordToggle;
        private handleColorSwatchClick;
        private handleColorPickerChange;
        private focusInput;
        handleDisabledChange(): void;
        handleStepChange(): void;
        handleValueChange(): Promise<void>;
        handleColorFormatChange(): Promise<void>;
        /** Sets focus on the input. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the input. */
        blur(): void;
        /** Selects all the text in the input. */
        select(): void;
        /** Sets the start and end positions of the text selection (0-based). */
        setSelectionRange(selectionStart: number, selectionEnd: number, selectionDirection?: 'forward' | 'backward' | 'none'): void;
        /** Replaces a range of text with a new string. */
        setRangeText(replacement: string, start?: number, end?: number, selectMode?: 'select' | 'start' | 'end' | 'preserve'): void;
        /** Displays the browser picker for an input element (only works if the browser supports it for the input type). */
        showPicker(): void;
        /** Increments the value of a numeric input type by the value of the step attribute. */
        stepUp(): void;
        /** Decrements the value of a numeric input type by the value of the step attribute. */
        stepDown(): void;
        /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/input/index" {
    import ZnInput from "components/input/input.component";
    export * from "components/input/input.component";
    export default ZnInput;
    global {
        interface HTMLElementTagNameMap {
            'zn-input': ZnInput;
        }
    }
}
declare module "components/data-select/providers/country-data-provider" {
    import type { DataProviderOption, LocalDataProvider } from "components/data-select/providers/provider";
    export const countryDataProvider: LocalDataProvider<DataProviderOption>;
}
declare module "components/data-select/providers/currency-data-provider" {
    import type { DataProviderOption, LocalDataProvider } from "components/data-select/providers/provider";
    export const currencyDataProvider: (allowCommon?: boolean) => LocalDataProvider<DataProviderOption>;
}
declare module "components/data-select/providers/color-data-provider" {
    import type { DataProviderOption, LocalDataProvider } from "components/data-select/providers/provider";
    export const colors: string[];
    export const colorDataProvider: LocalDataProvider<DataProviderOption>;
}
declare module "components/data-select/providers/country-code-data-provider" {
    import type { DataProviderOption, LocalDataProvider } from "components/data-select/providers/provider";
    export const countryDialPrefixDataProvider: LocalDataProvider<DataProviderOption>;
}
declare module "components/data-select/providers/us-state-data-provider" {
    import type { DataProviderOption, LocalDataProvider } from "components/data-select/providers/provider";
    export const usStateDataProvider: LocalDataProvider<DataProviderOption>;
}
declare module "components/data-select/providers/provider" {
    import type { HTMLTemplateResult } from "lit";
    /**
     * Providers are what the data select component uses to get data. They are
     * responsible for defining the data.
     */
    export interface LocalDataProvider<T> {
        getName: string;
        getData: T[];
    }
    export interface RemoteDataProvider<T> {
        getName: string;
        getData: () => Promise<T[]>;
    }
    export interface DataProviderOption {
        key: string;
        value: string;
        prefix?: string | HTMLTemplateResult;
    }
    export const emptyDataProvider: LocalDataProvider<DataProviderOption>;
    export * from "components/data-select/providers/country-data-provider";
    export * from "components/data-select/providers/currency-data-provider";
    export * from "components/data-select/providers/color-data-provider";
    export * from "components/data-select/providers/country-code-data-provider";
    export * from "components/data-select/providers/us-state-data-provider";
}
declare module "components/option/option.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/option
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The option's label.
     * @slot prefix - Used to prepend an icon or similar element to the menu item.
     * @slot suffix - Used to append an icon or similar element to the menu item.
     *
     * @csspart checked-option-icon - The checked option icon, an `<zn-icon>` element.
     * @csspart base - The component's base wrapper.
     * @csspart label - The option's label.
     * @csspart prefix - The container that wraps the prefix.
     * @csspart suffix - The container that wraps the suffix.
     */
    export default class ZnOption extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        private cachedTextLabel;
        private readonly localize;
        multiple: boolean;
        defaultSlot: HTMLSlotElement;
        current: boolean;
        hasHover: boolean;
        /**
         * The option's value. When selected, the containing form control will receive this value. The value must be unique
         * from other options in the same group. Values may contain spaces when using JSON array syntax on the parent select.
         */
        value: string;
        /** Draws the option in a disabled state, preventing selection. */
        disabled: boolean;
        selected: boolean;
        connectedCallback(): void;
        private handleDefaultSlotChange;
        private handleMouseEnter;
        private handleMouseLeave;
        handleDisabledChange(): void;
        handleSelectedChange(): void;
        /** Returns a plain text label based on the option's content. */
        getTextLabel(): string;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/option/index" {
    import ZnOption from "components/option/option.component";
    export * from "components/option/option.component";
    export default ZnOption;
    global {
        interface HTMLElementTagNameMap {
            'zn-option': ZnOption;
        }
    }
}
declare module "internal/animate" {
    /**
     * Animates an element using keyframes. Returns a promise that resolves after the animation completes or gets canceled.
     */
    export function animateTo(el: HTMLElement, keyframes: Keyframe[], options?: KeyframeAnimationOptions): Promise<unknown>;
    /** Parses a CSS duration and returns the number of milliseconds. */
    export function parseDuration(delay: number | string): number;
    /** Tells if the user has enabled the "reduced motion" setting in their browser or OS. */
    export function prefersReducedMotion(): boolean;
    /**
     * Stops all active animations on the target element. Returns a promise that resolves after all animations are canceled.
     */
    export function stopAnimations(el: HTMLElement): Promise<unknown[]>;
    /**
     * We can't animate `height: auto`, but we can calculate the height and shim keyframes by replacing it with the
     * element's scrollHeight before the animation.
     */
    export function shimKeyframesHeightAuto(keyframes: Keyframe[], calculatedHeight: number): {
        height: string | number | null | undefined;
        composite?: CompositeOperationOrAuto;
        easing?: string;
        offset?: number | null;
    }[];
}
declare module "internal/conditional" {
    import type { ReactiveController, ReactiveControllerHost } from 'lit';
    export interface ConditionalHost {
        conditional: string;
        disabled: boolean;
    }
    /** A reactive controller that disables the host when linked selects have a value. */
    export class ConditionalController implements ReactiveController {
        host: ReactiveControllerHost & Element & ConditionalHost;
        private conditionals;
        private initiallyDisabled;
        private readonly handleChange;
        constructor(host: ReactiveControllerHost & Element & ConditionalHost);
        /** Call from the host's `firstUpdated()` to parse IDs, find elements, attach listeners, and run the initial check. */
        setup(): void;
        hostConnected(): void;
        hostDisconnected(): void;
        /** Re-evaluate the conditional state. Call from the host when needed. */
        check(): void;
        private checkConditionals;
    }
}
declare module "utilities/animation-registry" {
    export interface ElementAnimation {
        keyframes: Keyframe[];
        rtlKeyframes?: Keyframe[];
        options?: KeyframeAnimationOptions;
    }
    export interface ElementAnimationMap {
        [animationName: string]: ElementAnimation;
    }
    export interface GetAnimationOptions {
        /**
         * The component's directionality. When set to "rtl", `rtlKeyframes` will be preferred over `keyframes` where
         * available using getAnimation().
         */
        dir: string;
    }
    /**
     * Sets a default animation. Components should use the `name.animation` for primary animations and `name.part.animation`
     * for secondary animations, e.g. `dialog.show` and `dialog.overlay.show`. For modifiers, use `drawer.showTop`.
     */
    export function setDefaultAnimation(animationName: string, animation: ElementAnimation | null): void;
    /** Sets a custom animation for the specified element. */
    export function setAnimation(el: Element, animationName: string, animation: ElementAnimation | null): void;
    /** Gets an element's animation. Falls back to the default if no animation is found. */
    export function getAnimation(el: Element, animationName: string, options: GetAnimationOptions): ElementAnimation;
}
declare module "components/opt-group/opt-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Groups options within a `<zn-select>` under a labeled header, similar to `<optgroup>` in native HTML.
     * @documentation https://zinc.style/components/opt-group
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot for `<zn-option>` elements.
     *
     * @csspart base - The component's base wrapper.
     * @csspart label - The group label element.
     */
    export default class ZnOptGroup extends ZincElement {
        static styles: CSSResultGroup;
        /** The label for the opt-group, displayed as a non-selectable header above the grouped options. */
        label: string;
        /** Disables all options within the group. */
        disabled: boolean;
        connectedCallback(): void;
        handleLabelChange(): void;
        handleDisabledChange(): void;
        /** @internal - Updates visibility of the group based on whether any child options are visible. */
        updateVisibility(): void;
        render(): import("lit-html").TemplateResult<1>;
        private handleSlotChange;
        private propagateDisabled;
    }
}
declare module "components/opt-group/index" {
    import ZnOptGroup from "components/opt-group/opt-group.component";
    export * from "components/opt-group/opt-group.component";
    export default ZnOptGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-opt-group': ZnOptGroup;
        }
    }
}
declare module "events/zn-remove" {
    export type ZnRemoveEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-remove': ZnRemoveEvent;
        }
    }
}
declare module "components/select/select.component" {
    import { FormControlController } from "internal/form";
    import ZincElement from "internal/zinc-element";
    import ZnChip from "components/chip/index";
    import ZnIcon from "components/icon/index";
    import ZnOptGroup from "components/opt-group/index";
    import ZnOption from "components/option/index";
    import ZnPopup from "components/popup/index";
    import type { CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/select
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-opt-group
     * @dependency zn-option
     * @dependency zn-popup
     * @dependency zn-tag
     *
     * @slot - The listbox options. Must be `<zn-option>` elements. You can use `<zn-opt-group>` to group options under a labeled header, or `<zn-divider>` to group items visually.
     * @slot label - The input's label. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot context-note - Used to add contextual text that is displayed above the select, on the right. Alternatively, you can use the `context-note` attribute.
     * @slot prefix - Used to prepend a presentational icon or similar element to the combobox.
     * @slot clear-icon - An icon to use in lieu of the default clear icon.
     * @slot expand-icon - The icon to show when the control is expanded and collapsed. Rotates on open and close.
     * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
     *
     * @event zn-change - Emitted when the control's value changes.
     * @event zn-clear - Emitted when the control's value is cleared.
     * @event zn-input - Emitted when the control receives input.
     * @event zn-focus - Emitted when the control gains focus.
     * @event zn-blur - Emitted when the control loses focus.
     * @event zn-show - Emitted when the select's menu opens.
     * @event zn-after-show - Emitted after the select's menu opens and all animations are complete.
     * @event zn-hide - Emitted when the select's menu closes.
     * @event zn-after-hide - Emitted after the select's menu closes and all animations are complete.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     * @event zn-load - Emitted when options have been successfully loaded from the `src` URL.
     * @event zn-error - Emitted when loading options from the `src` URL fails.
     *
     * @csspart search-loading - The container shown while a remote search request is in flight.
     * @csspart max-results-indicator - The message shown when results are truncated by `max-results`.
     * @csspart form-control - The form control that wraps the label, input, and help text.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The select's wrapper.
     * @csspart form-control-help-text - The help text's wrapper.
     * @csspart combobox - The container the wraps the prefix, combobox, clear icon, and expand button.
     * @csspart prefix - The container that wraps the prefix slot.
     * @csspart display-input - The element that displays the selected option's label, an `<input>` element.
     * @csspart listbox - The listbox container where options are slotted.
     * @csspart tags - The container that houses option tags when `multiselect` is used.
     * @csspart tag - The individual tags that represent each multiselect option.
     * @csspart tag__base - The tag's base part.
     * @csspart tag__content - The tag's content part.
     * @csspart tag__remove-button - The tag's remove button.
     * @csspart tag__remove-button__base - The tag's remove button base part.
     * @csspart clear-button - The clear button.
     * @csspart expand-icon - The container that wraps the expand icon.
     */
    export default class ZnSelect extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-opt-group': typeof ZnOptGroup;
            'zn-option': typeof ZnOption;
            'zn-popup': typeof ZnPopup;
            'zn-tag': typeof ZnChip;
        };
        protected readonly formControlController: FormControlController;
        private readonly conditionalController;
        private readonly hasSlotController;
        private readonly localize;
        private typeToSelectString;
        private typeToSelectTimeout;
        private closeWatcher;
        popup: ZnPopup;
        combobox: HTMLSlotElement;
        displayInput: HTMLInputElement;
        valueInput: HTMLInputElement;
        listbox: HTMLSlotElement;
        prefixSlot: HTMLSlotElement;
        private hasFocus;
        displayLabel: string;
        currentOption: ZnOption;
        selectedOptions: ZnOption[];
        private valueHasChanged;
        private inputPrefix;
        /** @internal - current search/filter text when search is enabled (lowercased for matching) */
        private _searchQuery;
        /** @internal - raw display value of the search input (preserves case for the input field). Reactive so the
         * free-text "Add" row re-renders on every keystroke, not just when the match/no-match state changes. */
        private _searchDisplayValue;
        /** @internal - whether the "no matching options" empty state is visible */
        private _noResultsVisible;
        /** @internal - whether the free-text "Add" row is the active keyboard-navigation target */
        private _addOptionActive;
        /** @internal */
        private _fetchedOptions;
        /** @internal */
        private _fetchLoading;
        /** @internal */
        private _fetchError;
        /** @internal */
        private _fetchAbortController;
        /** @internal - debounce timer for remote search */
        private _searchDebounceTimer;
        /** @internal - whether a remote search fetch is in progress (distinct from initial load) */
        private _searchLoading;
        /** @internal - the query string of the last successful remote search */
        private _lastRemoteQuery;
        /** @internal - whether the last remote result set was exhaustive (fewer than maxResults returned) */
        private _lastRemoteExhaustive;
        /** @internal - total number of results before maxResults truncation (0 = not truncated) */
        private _totalResultCount;
        /**
         * @internal - tracks selected items by key/value during remote search so they survive
         * when search results replace the fetched options list.
         */
        private _selectedRemoteItems;
        /** The name of the select, submitted as a name/value pair with form data. */
        name: string;
        nonRemovable: boolean;
        private _value;
        get value(): string | string[];
        /**
         * The current value of the select, submitted as a name/value pair with form data. When `multiple` is enabled, the
         * value property will be an array. Values may contain spaces when using JSON array syntax in the attribute,
         * e.g. `value='["my value", "their value"]'`. Space-delimited strings are still supported for backward compatibility.
         */
        set value(val: string | string[]);
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string | string[];
        /** The select's size. */
        size: 'small' | 'medium' | 'large';
        /** Placeholder text to show as a hint when the select is empty. */
        placeholder: string;
        /** Allows more than one option to be selected. */
        multiple: boolean;
        /** Max number of options that can be selected when `multiple` is true. Set to 0 to allow unlimited selections. */
        maxOptions: number;
        /**
         * The maximum number of selected options to show when `multiple` is true. After the maximum, "+n" will be shown to
         * indicate the number of additional items that are selected. Set to 0 to remove the limit.
         */
        maxOptionsVisible: number;
        /** Disables the select control. */
        disabled: boolean;
        /** Adds a clear button when the select is not empty. */
        clearable: boolean;
        /**
         * Indicates whether or not the select is open. You can toggle this attribute to show and hide the menu, or you can
         * use the `show()` and `hide()` methods and this attribute will reflect the select's open state.
         */
        open: boolean;
        /**
         * Enable this option to prevent the listbox from being clipped when the component is placed inside a container with
         * `overflow: auto|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all, scenarios.
         */
        hoist: boolean;
        /** Draws a pill-style select with rounded edges. */
        pill: boolean;
        /** Enables search/filter functionality. When enabled, the user can type into the select to filter the visible options. */
        search: boolean;
        /**
         * Allows the user to enter values that are not in the options list ("free text"). Implies the editable,
         * filtering input behavior of `search`. A typed value that doesn't match an existing option is committed
         * by pressing Enter, clicking the "Add" row, or blurring the field, and becomes a selected option — a tag
         * when `multiple` is enabled. The committed value is both the option's value and its label.
         */
        freeText: boolean;
        /** The select's label. If you need to display HTML, use the `label` slot instead. */
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
        labelTooltip: string;
        /** Text that appears above the input, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
        contextNote: string;
        /**
         * The preferred placement of the selects menu. Note that the actual placement may vary as needed to keep the listbox
         * inside the viewport.
         */
        placement: 'top' | 'bottom';
        /** The select's help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        /** The select's required attribute. */
        required: boolean;
        cacheKey: string;
        triggerSubmit: boolean;
        /**
         * A function that customizes the tags to be rendered when multiple=true. The first argument is the option, the second
         * is the current tag's index.  The function should return either a Lit TemplateResult or a string containing trusted HTML of the symbol to render at
         * the specified value.
         */
        getTag: (option: ZnOption, index: number) => TemplateResult | string | HTMLElement;
        /** Automatically select the first option if no value is set. */
        selectFirst: boolean;
        distinct: string;
        conditional: string;
        /**
         * The URL to fetch options from. When set, the component fetches JSON from this URL and renders the results as
         * options. The expected format is an array of objects with `key` and `value` properties:
         * `[{"key": "us", "value": "United States"}, ...]`
         * When not set, the component works exactly as before using slotted `<zn-option>` elements.
         */
        dataUri: string;
        /**
         * Context data to send as a header when fetching options from the URL specified by the `src` property.
         */
        contextData: string;
        /**
         * The maximum number of options to display from a remote fetch response. Set to 0 for unlimited.
         * Only applies when fetching from `data-uri`.
         */
        maxResults: number;
        /**
         * Debounce delay in milliseconds for remote search requests. The component waits this long after the user
         * stops typing before sending a request.
         */
        searchDebounce: number;
        /**
         * The query parameter name appended to the `data-uri` URL for remote search requests.
         * Defaults to `"q"`, e.g. `/api/items?q=search+term`. Set to a custom value like `"search"` or `"filter"` to match your API.
         */
        searchParam: string;
        /**
         * When set alongside `search` and `data-uri`, the component will not fetch options on initial load.
         * Options are only fetched when the user starts typing a search query.
         */
        searchOnly: boolean;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private updateHasInputPrefix;
        private addOpenListeners;
        private removeOpenListeners;
        private handleFocus;
        private handleBlur;
        private handleDocumentFocusIn;
        private handleDocumentKeyDown;
        private handleDocumentMouseDown;
        private handleLabelClick;
        private handleComboboxMouseDown;
        private handleComboboxKeyDown;
        private handleClearClick;
        private handleClearMouseDown;
        /** Whether the component is in remote-search mode (search + dataUri both set) */
        private get _isRemoteSearch();
        /** Whether the display input is editable and filters options (search or free-text). */
        private get _isTypeable();
        /** Handles text input on the display input for search/filter mode */
        private handleSearchInput;
        /** Filters visible options based on the current search query */
        private filterOptions;
        /** Clears the search query and shows all options */
        private clearSearch;
        /**
         * Commits the current typed text as a selected value when `free-text` is enabled. A selected `<zn-option>`
         * (value = label = trimmed text) is created in the light DOM so the value flows through the existing
         * tag/value/selection machinery and appears as a deselectable row in the listbox. Returns `true` when
         * something was committed, `false` when there was nothing to commit.
         */
        private commitFreeText;
        /**
         * The trimmed pending text to offer as a free-text "Add" row, or `null` when no Add row should be shown
         * (free-text disabled, dropdown closed, input empty, or the text exactly matches an existing option).
         */
        private get _freeTextAddValue();
        /** Commits the typed value when the "Add" row is pressed, keeping focus on the input. */
        private handleAddOptionMouseDown;
        /**
         * In free-text mode, creates a hidden `<zn-option>` for any value that has no matching option, so values
         * set via the `value`/`defaultValue` attribute (e.g. previously-saved custom entries) render as tags or
         * the display value on load. No-op when free-text is disabled.
         */
        private _materialiseFreeTextValues;
        /**
         * Creates a free-text-marked `<zn-option>` in the light DOM (value = label) and returns it. The option is
         * a normal, visible, selectable row so the user can deselect a custom value from the dropdown like any
         * other option; the `data-free-text` marker lets us drop it from the DOM once it's no longer selected.
         */
        private _createFreeTextOption;
        private handleOptionClick;
        private handleDefaultSlotChange;
        private handleTagRemove;
        private getAllOptions;
        private getAllOptGroups;
        private getVisibleOptions;
        getFirstOption(): ZnOption | null;
        private setCurrentOption;
        private setSelectedOptions;
        private toggleOptionSelection;
        private selectionChanged;
        protected get tags(): TemplateResult<1>[];
        /**
         * Renders hidden <zn-option> elements for items that are currently selected but not present in
         * the latest `_fetchedOptions` (e.g. because a remote search narrowed the results). This keeps
         * them in the DOM so `handleDefaultSlotChange` can find and re-select them.
         */
        private _renderSelectedRemoteItems;
        private handleInvalid;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleDisabledChange(): void;
        handleSrcChange(): void;
        private _handleFetchError;
        /** Builds the localStorage cache key for a given search query */
        private _buildCacheKey;
        /** Reads cached results from localStorage */
        private _readCache;
        /** Writes results to localStorage cache */
        private _writeCache;
        /**
         * Parses raw JSON data into the internal fetched-options format.
         * Applies `maxResults` limiting to flat option arrays.
         */
        private _parseOptions;
        /** Fetches options from the URL specified by the `data-uri` property. Optionally appends a search query. */
        fetchOptions(searchQuery?: string): Promise<void>;
        attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
        handleValueChange(): void;
        handleOpenChange(): Promise<void>;
        /** Shows the listbox. */
        show(): Promise<void>;
        /** Hides the listbox. */
        hide(): Promise<void>;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message: string): void;
        /** Sets focus on the control. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the control. */
        blur(): void;
        private updateDependencies;
        private updateDependencyState;
        private toggleDisabled;
        render(): TemplateResult<1>;
    }
}
declare module "components/select/index" {
    import ZnSelect from "components/select/select.component";
    export * from "components/select/select.component";
    export default ZnSelect;
    global {
        interface HTMLElementTagNameMap {
            'zn-select': ZnSelect;
        }
    }
}
declare module "components/data-select/data-select.component" {
    import { type DataProviderOption, type LocalDataProvider } from "components/data-select/providers/provider";
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { FormControlController } from "internal/form";
    import ZincElement from "internal/zinc-element";
    import ZnOption from "components/option/index";
    import ZnSelect from "components/select/index";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary A select component with built-in data providers for common options like colors, currencies, and countries.
     * @documentation https://zinc.style/components/data-select
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-select
     * @dependency zn-option
     *
     * @event zn-input - Emitted when the select's value changes.
     * @event zn-clear - Emitted when the clear button is activated.
     * @event blur - Emitted when the select loses focus.
     *
     * @slot label - The select's label. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot context-note - Used to add contextual text that is displayed above the select, on the right. Alternatively, you can use the `context-note` attribute.
     * @slot help-text - Text that describes how to use the select. Alternatively, you can use the `help-text` attribute.
     *
     * @csspart combobox - The container that wraps the prefix, combobox, clear icon, and expand button (forwarded from zn-select).
     * @csspart expand-icon - The container that wraps the expand icon (forwarded from zn-select).
     * @csspart form-control-help-text - The help text's wrapper (forwarded from zn-select).
     * @csspart form-control-input - The select's wrapper (forwarded from zn-select).
     * @csspart display-input - The element that displays the selected option's label (forwarded from zn-select).
     */
    export default class ZnDataSelect extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-select': typeof ZnSelect;
            'zn-option': typeof ZnOption;
        };
        select: ZnSelect;
        /** The name of the select. Used for form submission. */
        name: string;
        /** The value of the select. Used for form submission. When `multiple` is enabled, this is an array of strings. */
        value: string | string[];
        /** The provider of the select. */
        provider: 'color' | 'currency' | 'country' | 'phone' | 'us-state';
        /** The position of the icon. */
        iconPosition: 'start' | 'end' | 'none';
        /** An array of keys to use for filtering the options in the selected provider. */
        filter: string[];
        /** The selects size. */
        size: 'small' | 'medium' | 'large';
        /** Should we show the clear button */
        clearable: boolean;
        /** Include an "All" option at the top. */
        allowAll: boolean;
        /** Include a "Common" option that selects multiple common currencies. */
        allowCommon: boolean;
        /** The selects label. If you need to display HTML, use the `label` slot instead. */
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
        labelTooltip: string;
        /** Text that appears above the input, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
        contextNote: string;
        /**
         * The preferred placement of the selects menu. Note that the actual placement may vary as needed to keep the listbox
         * inside the viewport.
         */
        placement: 'top' | 'bottom';
        /** The selects help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /** The selects required attribute. */
        required: boolean;
        /** Disables the select. */
        disabled: boolean;
        iconOnly: boolean;
        multiple: boolean;
        selectFirst: boolean;
        distinct: string;
        conditional: string;
        protected readonly formControlController: FormControlController;
        private readonly selectObserver;
        get validationMessage(): string;
        get validity(): ValidityState;
        constructor();
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): Promise<void>;
        protected updated(_changedProperties: PropertyValues): Promise<void>;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        closeOnTab: (e: KeyboardEvent) => void;
        handleValueChange(): Promise<void>;
        handleInput: (e: Event) => void;
        handleClear: () => void;
        getLocalProvider(name: string): LocalDataProvider<DataProviderOption>;
        blur: () => void;
        protected render(): import("lit-html").TemplateResult<1>;
        private _updatePrefix;
        private _updateIconEmptyState;
        private getPlaceholder;
        private _observeSelectDisabled;
        private _syncDisabledState;
        private _normalizeValue;
    }
}
declare module "components/data-select/index" {
    import ZnDataSelect from "components/data-select/data-select.component";
    export * from "components/data-select/data-select.component";
    export default ZnDataSelect;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-select': ZnDataSelect;
        }
    }
}
declare module "utilities/lit-to-html" {
    import { type TemplateResult } from "lit";
    export function litToHTML<T extends HTMLElement>(templateResult: TemplateResult): T | null;
}
declare module "events/zn-change" {
    export type ZnChangeEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-change': ZnChangeEvent;
        }
    }
}
declare module "components/datepicker/datepicker.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnTooltip from "components/tooltip/index";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary A date picker component with calendar popup and input validation.
     * @documentation https://zinc.style/components/datepicker
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-tooltip
     *
     * @event zn-change - Emitted when the date value changes.
     * @event zn-input - Emitted when the input value changes.
     * @event zn-blur - Emitted when the input loses focus.
     * @event zn-focus - Emitted when the input gains focus.
     *
     * @slot label - The datepicker's label. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Tooltip content for the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot context-note - Additional context text displayed above the input. Alternatively, you can use the `context-note` attribute.
     * @slot help-text - Help text displayed below the input. Alternatively, you can use the `help-text` attribute.
     * @slot prefix - Content to display before the input (in addition to the default calendar icon).
     * @slot suffix - Content to display after the input.
     *
     * @csspart base - The component's base wrapper.
     * @csspart form-control - The form control wrapper.
     * @csspart form-control-label - The label element.
     * @csspart form-control-input - The input wrapper.
     * @csspart form-control-help-text - The help text element.
     *
     * @property format - Date format using AirDatepicker tokens. Default: 'dd/MM/yyyy'
     *   Supported formats:
     *   - dd/MM/yyyy (31/12/2024) - Default
     *   - MM/dd/yyyy (12/31/2024)
     *   - yyyy-MM-dd (2024-12-31)
     *   - dd-MM-yyyy (31-12-2024)
     *   - yyyy/MM/dd (2024/12/31)
     *
     * @cssproperty --zn-input-* - Inherited input component CSS custom properties.
     */
    export default class ZnDatepicker extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-tooltip': typeof ZnTooltip;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        input: HTMLInputElement;
        private hasFocus;
        title: string;
        /** The name of the input, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the input, submitted as a name/value pair with form data. */
        value: any;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string;
        /** The inputs size **/
        size: 'small' | 'medium' | 'large';
        /** The inputs label. If you need to display HTML, use the `label` slot. **/
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
         * `label-tooltip` slot.
         * **/
        labelTooltip: string;
        /**
         * Text that appears above the input, on the right, to add additional context. If you need to display HTML
         * in this text, use the `context-note` slot instead
         */
        contextNote: string;
        /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
        helpText: string;
        /** Disables the input **/
        disabled: boolean;
        /** Placeholder text to show as a hint when the input is empty. */
        placeholder: string;
        /** Makes the input read-only **/
        readonly: boolean;
        /**
         * By default, form-controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside a form and associate it with the form that has this `id`. The form must be
         * in the same document or shadow root for this to work.
         */
        form: string;
        flush: boolean;
        /** Makes the input a required field. */
        required: boolean;
        /** Adds a clear button to the calendar for removing a selected date. **/
        clearable: boolean;
        /** Makes the input a range picker. **/
        range: boolean;
        /** Disallows selecting past dates. **/
        disablePastDates: boolean;
        /** Minimum date that can be selected. Overrides disable-past-dates if both are set. Accepts Date object or date string. **/
        minDate?: string | Date;
        /** Maximum date that can be selected. Accepts Date object or date string. **/
        maxDate?: string | Date;
        /**
         * Date format for display and input. Uses AirDatepicker format tokens.
         *
         * Common formats:
         * - 'dd/MM/yyyy' (31/12/2024) - Default, European style
         * - 'MM/dd/yyyy' (12/31/2024) - US style
         * - 'yyyy-MM-dd' (2024-12-31) - ISO style
         * - 'dd-MM-yyyy' (31-12-2024) - Alternative European
         * - 'yyyy/MM/dd' (2024/12/31) - Alternative ISO
         *
         * Format tokens:
         * - dd: Day with leading zero (01-31)
         * - MM: Month with leading zero (01-12)
         * - yyyy: Full year (2024)
         */
        format: string;
        /** Display time selector. **/
        timePicker?: boolean;
        /** Display only time selector, without date. **/
        onlyTimepicker?: boolean;
        /**
         * Time format for display and input selector. Uses AirDatepicker format tokens.
         * Default : hh:mm AA
         *
         * Possible symbols:
         * h — hours in 12-hour mode
         * hh — hours in 12-hour mode with leading zero
         * H — hours in 24-hour mode
         * HH — hours in 24-hour mode with leading zero
         * m — minutes
         * mm — minutes with leading zero
         * aa — day period lower case
         * AA — day period upper case
         */
        timeFormat?: string;
        container?: string | HTMLElement;
        private _instance;
        get timestamp(): number;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        handleDisabledChange(): void;
        handleValueChange(): Promise<void>;
        handleDatepickerOptionsChange(): void;
        /** Sets focus on the input. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the input. */
        blur(): void;
        /** Selects all the text in the input. */
        select(): void;
        /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message: string): void;
        init(): void;
        private handleInput;
        private handleChange;
        private handleInvalid;
        private handleKeyDown;
        private handlePaste;
        private handleBlur;
        private isValidDateString;
        private parseDate;
        private parseDateString;
        private isDateInRange;
        private clearInvalidDate;
        private getFormatSeparator;
        private escapeRegex;
        private normalizeDate;
        private autoFormatDate;
        updated(_changedProperties: PropertyValues): void;
        firstUpdated(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/datepicker/index" {
    import ZnDatepicker from "components/datepicker/datepicker.component";
    export * from "components/datepicker/datepicker.component";
    export default ZnDatepicker;
    global {
        interface HTMLElementTagNameMap {
            'zn-datepicker': ZnDatepicker;
        }
    }
}
declare module "components/query-builder/query-builder.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnInput from "components/input/index";
    import ZnOption from "components/option/index";
    import ZnSelect from "components/select/index";
    import type { ZincFormControl } from "internal/zinc-element";
    export type QueryBuilderData = QueryBuilderItem[];
    export interface QueryBuilderItem {
        id: string;
        name: string;
        type?: QueryBuilderType;
        options?: QueryBuilderOptions;
        operators: QueryBuilderOperators[];
        dateSubmitFormat?: QueryBuilderDateSubmitFormat;
        maxOptionsVisible?: string;
    }
    /**
     * Controls how `date` and `dateTime` filter values are serialized when the
     * query is submitted.
     *
     * - `'iso'` — RFC 3339 / ISO 8601 (e.g. `2026-06-09T16:05:00Z`).
     * - `'timestamp'` — Unix timestamp in seconds since epoch.
     * - `'legacy'` — whatever format the current system emits. Kept so existing
     *                   backends keep working while consumers migrate to one of the
     *                   formats above. - DEFAULT
     */
    export type QueryBuilderDateSubmitFormat = 'iso' | 'timestamp' | 'legacy';
    export type QueryBuilderType = 'bool' | 'boolean' | 'date' | 'dateTime' | 'number';
    export interface QueryBuilderOptions {
        [key: string | number]: string | number;
    }
    export enum QueryBuilderOperators {
        Eq = "eq",
        Neq = "neq",
        Eqi = "eqi",
        Neqi = "neqi",
        Before = "before",
        After = "after",
        In = "in",
        Nin = "nin",
        MatchPhrasePre = "matchphrasepre",
        NMatchPhrasePre = "nmatchphrasepre",
        MatchPhrase = "matchphrase",
        NMatchPhrase = "nmatchphrase",
        Match = "match",
        NMatch = "nmatch",
        Contains = "contains",
        DoesNotContain = "doesnotcontain",
        Starts = "starts",
        NStarts = "nstarts",
        Ends = "ends",
        NEnds = "nends",
        Wild = "wild",
        NWild = "nwild",
        Like = "like",
        NLike = "nlike",
        Fuzzy = "fuzzy",
        NFuzzy = "nfuzzy",
        Gte = "gte",
        Gt = "gt",
        Lt = "lt",
        Lte = "lte"
    }
    export interface CreatedRule {
        id: string;
        name: string;
        operator: string;
        value: string;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/query-builder
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-input
     * @dependency zn-option
     * @dependency zn-select
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnQueryBuilder extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-input': typeof ZnInput;
            'zn-option': typeof ZnOption;
            'zn-select': typeof ZnSelect;
        };
        private _selectedRules;
        private _formController;
        private _previousOperator;
        container: HTMLDivElement;
        addRule: ZnSelect;
        input: HTMLInputElement;
        filters: QueryBuilderData;
        dropdown: boolean;
        name: string;
        value: PropertyKey;
        showValues: string[];
        get validationMessage(): string;
        get validity(): ValidityState;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
        private _handleChange;
        private _addRule;
        private _createInput;
        private _changeValueInput;
        private _createBooleanInput;
        private _createNumberInput;
        private _createDateInput;
        private _createSelectInput;
        private _createDefaultInput;
        private _updateOperatorValue;
        private _updateDateValue;
        private _updateValue;
        private updateInValue;
        private _changeRule;
        private _getRulePosition;
        private _removeRule;
        clear(): void;
        reset(): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
    }
}
declare module "components/query-builder/index" {
    import ZnQueryBuilder from "components/query-builder/query-builder.component";
    export * from "components/query-builder/query-builder.component";
    export default ZnQueryBuilder;
    global {
        interface HTMLElementTagNameMap {
            'zn-query-builder': ZnQueryBuilder;
        }
    }
}
declare module "components/data-table-search/data-table-search.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement, { type ZincFormControl } from "internal/zinc-element";
    import ZnInput from "components/input/index";
    /**
     * @summary A search component for data tables.
     * @documentation https://zinc.style/components/data-table-search
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-input
     *
     * @event zn-search-change - Emitted when the search value changes (debounced).
     *
     * @slot - The default slot for additional form inputs.
     *
     * @csspart base - The component's base wrapper.
     *
     * @property {string} name - The name of the search input field (default: "search").
     * @property {string} value - The current search value.
     * @property {string} placeholder - The placeholder text for the search input (default: "Search...").
     * @property {string} helpText - Help text displayed below the search input.
     * @property {string} searchUri - Optional URI to use for search operations.
     * @property {number} debounceDelay - The delay in milliseconds before triggering a search (default: 500).
     */
    export default class ZnDataTableSearch extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-input': typeof ZnInput;
        };
        private _formController;
        private _searchTimeout?;
        name: string;
        value: string;
        placeholder: string;
        helpText: string;
        searchUri: string | undefined;
        debounceDelay: number;
        get validationMessage(): string;
        get validity(): ValidityState;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        /**
         * Collects form data from slotted input elements
         */
        getFormData(): Record<string, any>;
        handleInput: (e: Event) => void;
        handleClear: () => void;
        disconnectedCallback(): void;
        /**
         * Emit the search change event with form data
         */
        private emitSearchChange;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/data-table-search/index" {
    import ZnDataTableSearch from "components/data-table-search/data-table-search.component";
    export * from "components/data-table-search/data-table-search.component";
    export default ZnDataTableSearch;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-table-search': ZnDataTableSearch;
        }
    }
}
declare module "components/empty-state/empty-state.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/empty-state
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnEmptyState extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        caption: string;
        description: string;
        type: 'error' | 'info' | 'primary' | '';
        padded: boolean;
        private readonly hasSlotController;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/empty-state/index" {
    import ZnEmptyState from "components/empty-state/empty-state.component";
    export * from "components/empty-state/empty-state.component";
    export default ZnEmptyState;
    global {
        interface HTMLElementTagNameMap {
            'zn-empty-state': ZnEmptyState;
        }
    }
}
declare module "components/hover-container/hover-container.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type Popup from "components/popup/index";
    /**
     * @summary The HoverContainer component is used to display additional information when a user hovers over or clicks
     * on an element.
     *
     * @documentation https://zinc.style/components/hover-container
     * @status experimental
     * @since 1.0
     *
     * @event zn-show - Emitted when the hover-container is shown.
     * @event zn-after-show - Emitted after the hover-container is shown.
     * @event zn-hide - Emitted when the hover-container is hidden.
     * @event zn-after-hide - Emitted after the hover-container is hidden.
     *
     * @slot - The content of the hover-container
     * @slot anchor - The anchor the hover-container is attached to.
     */
    export default class ZnHoverContainer extends ZincElement {
        static styles: CSSResultGroup;
        private hoverTimeout;
        private closeWatcher;
        defaultSlot: HTMLSlotElement;
        body: HTMLElement;
        popup: Popup;
        content: string;
        placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
        disabled: boolean;
        distance: number;
        open: boolean;
        skidding: number;
        trigger: string;
        hoist: boolean;
        constructor();
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private hasTrigger;
        private handleBlur;
        private handleClick;
        private handleFocus;
        private handleDocumentKeyDown;
        private handleMouseOver;
        private handleMouseOut;
        handleOpenChange(): void;
        handleOptionsChange(): Promise<void>;
        handleDisabledChange(): void;
        show(): Promise<void>;
        hide(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/hover-container/index" {
    import ZnHoverContainer from "components/hover-container/hover-container.component";
    export * from "components/hover-container/hover-container.component";
    export default ZnHoverContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-hover-container': ZnHoverContainer;
        }
    }
}
declare module "components/skeleton/skeleton.component" {
    import ZincElement from "internal/zinc-element";
    import type { CSSResultGroup } from "lit";
    /**
     * @summary Skeleton loaders provide visual placeholders while content is loading, improving perceived performance and user experience.
     * @documentation https://zinc.style/components/skeleton
     * @status experimental
     * @since 1.0
     *
     * @property {string} speed - Animation speed for the shimmer effect. Default: "3s"
     * @property {string} width - Width of the skeleton element. Default: "100%"
     * @property {string} height - Height of the skeleton element. Default: "20px"
     * @property {string} radius - Border radius of the skeleton element. Default: "4px"
     */
    export default class ZnSkeleton extends ZincElement {
        static styles: CSSResultGroup;
        speed: string;
        width: string;
        height: string;
        radius: string;
        protected render(): unknown;
    }
}
declare module "components/skeleton/index" {
    import ZnSkeleton from "components/skeleton/skeleton.component";
    export * from "components/skeleton/skeleton.component";
    export default ZnSkeleton;
    global {
        interface HTMLElementTagNameMap {
            'zn-skeleton': ZnSkeleton;
        }
    }
}
declare module "components/style/style.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    export default class ZnStyle extends ZincElement {
        static styles: CSSResultGroup;
        private readonly localize;
        color: string;
        border: string;
        size: string;
        error: boolean;
        success: boolean;
        info: boolean;
        warning: boolean;
        primary: boolean;
        accent: boolean;
        center: boolean;
        display: null;
        font: string;
        width: string;
        height: string;
        pad: string;
        margin: string;
        muted: boolean;
        gutter: boolean;
        autoMargin: string;
        connectedCallback(): void;
        createRenderRoot(): this;
    }
}
declare module "components/style/index" {
    import ZnStyle from "components/style/style.component";
    export * from "components/style/style.component";
    export default ZnStyle;
    global {
        interface HTMLElementTagNameMap {
            'zn-style': ZnStyle;
        }
    }
}
declare module "components/data-table/data-table.component" {
    import { type CSSResultGroup, type TemplateResult } from 'lit';
    import { type ZnFilterChangeEvent } from "events/zn-filter-change";
    import { type ZnSearchChangeEvent } from "events/zn-search-change";
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnButtonGroup from "components/button-group/index";
    import ZnChip from "components/chip/index";
    import ZnConfirm from "components/confirm/index";
    import ZnDataTableSearch from "components/data-table-search/index";
    import ZnDropdown from "components/dropdown/index";
    import ZnEmptyState from "components/empty-state/index";
    import ZnHoverContainer from "components/hover-container/index";
    import ZnMenu from "components/menu/index";
    import ZnMenuItem from "components/menu-item/index";
    import ZnSkeleton from "components/skeleton/index";
    import ZnStyle from "components/style/index";
    interface Cell {
        text: string;
        column: string;
        color?: string;
        style?: string;
        iconSrc?: string;
        iconColor?: string;
        iconSize?: number;
        iconStyle?: string;
        hoverContent?: string;
        hoverPlacement?: string;
        chipColor?: string;
        gaid?: string;
        sortValue?: string;
        uri?: string;
        target?: string;
        copyable?: boolean;
    }
    interface Row {
        id: string;
        uri?: string;
        target?: string;
        actions?: ActionConfig[];
        cells: Cell[];
    }
    interface Response {
        rows: Row[];
        perPage: number;
        total: number;
        page: number;
    }
    export enum ActionSlots {
        delete = "delete-action",
        modify = "modify-action",
        create = "create-action",
        filter = "filter",
        filter_top = "filter-top",
        sort = "sort",
        search = "search",
        inputs = "inputs"
    }
    interface ActionConfig {
        text: string;
        uri: string;
        target: string;
        gaid: string;
        confirmType: string;
        confirmTitle: string;
        confirmContent: string;
        icon: string;
        iconSrc?: string;
        color?: string;
        type: string;
    }
    interface HeaderConfig {
        key: string;
        label: string;
        required?: boolean;
        default?: boolean;
        sortable?: boolean;
        filterable?: boolean;
        hideHeader?: boolean;
        hideColumn?: boolean;
        secondary?: boolean;
        type?: string;
        cellTemplate?: Cell;
        ifEmpty?: Cell;
    }
    type DisplayTemplate = (cell: Cell, row: Row, header: HeaderConfig) => TemplateResult | string;
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/data-table
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-empty-state
     * @dependency zn-chip
     * @dependency zn-hover-container
     * @dependency zn-dropdown
     * @dependency zn-menu
     * @dependency zn-menu-item
     * @dependency zn-button-group
     * @dependency zn-confirm
     * @dependency zn-skeleton
     * @dependency zn-data-table-search
     *
     * @slot - The default slot.
     * @slot search - Slot for search component.
     * @slot sort - Slot for sort component.
     * @slot filter - Slot for filter component.
     * @slot filter-top - Slot for top-level filter component.
     * @slot delete-action - Slot for delete action button.
     * @slot modify-action - Slot for modify action button.
     * @slot create-action - Slot for create action button.
     * @slot inputs - Slot for additional input controls.
     * @slot empty-state - Slot for custom empty state.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnDataTable extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-empty-state': typeof ZnEmptyState;
            'zn-chip': typeof ZnChip;
            'zn-hover-container': typeof ZnHoverContainer;
            'zn-dropdown': typeof ZnDropdown;
            'zn-menu': typeof ZnMenu;
            'zn-menu-item': typeof ZnMenuItem;
            'zn-button-group': typeof ZnButtonGroup;
            'zn-confirm': typeof ZnConfirm;
            'zn-skeleton': typeof ZnSkeleton;
            'zn-style': typeof ZnStyle;
            'zn-data-table-search': typeof ZnDataTableSearch;
        };
        dataUri: string;
        data: Row[] | Row;
        sortColumn: string;
        sortDirection: string;
        localSort: boolean;
        filter: string;
        search: string;
        wideColumn: string;
        key: string;
        headers: Record<string, HeaderConfig>;
        displayTemplates: Record<string, DisplayTemplate>;
        hiddenHeaders: string;
        hiddenColumns: string;
        unsortableHeaders: string;
        unsortable: boolean;
        hidePagination: boolean;
        standalone: boolean;
        caption: string;
        emptyStateCaption: string;
        emptyStateIcon: string;
        hideCheckboxes: boolean;
        filters: [];
        method: 'GET' | 'POST';
        noInitialLoad: boolean;
        groupBy: string;
        groups: string;
        itemsPerPage: number;
        selectAllButton: ZnButton;
        private _initialLoad;
        private _hasLoadedData;
        private _lastTableContent;
        private readonly resizeObserver;
        private page;
        private totalPages;
        private _rows;
        private numberOfRowsSelected;
        private selectedRows;
        private tableContainer;
        private hasSlotController;
        private _dataTask;
        private rowHasActions;
        private _expandedRows;
        private _hiddenCells;
        private _secondaryHeaders;
        private _formatTemplates;
        requestParams: Record<string, any>;
        refresh(): void;
        render(): TemplateResult<1>;
        connectedCallback(): void;
        private getTemplate;
        disconnectedCallback(): void;
        filterChangeListener: (e: ZnFilterChangeEvent) => void;
        searchChangeListener: (e: ZnSearchChangeEvent) => void;
        emptyState(): TemplateResult<1>;
        renderTable(data: Response): TemplateResult<1>;
        humanize(str: string): string;
        renderTableData(data: any): TemplateResult<1>;
        getTableHeader(): TemplateResult<1>;
        getTableFooter(): TemplateResult<1>;
        getRowsSelected(): TemplateResult<1> | null;
        getRowsPerPage(): TemplateResult<1> | null;
        private getPageRange;
        getPagination(): TemplateResult<1> | null;
        getActions(): TemplateResult<1>[];
        goToPage(page: number): void;
        goToFirstPage(): void;
        goToPreviousPage(): void;
        goToNextPage(): void;
        goToLastPage(): void;
        updateRowsPerPage(event: Event): void;
        selectAll(event: Event): void;
        selectRow(e: Event): void;
        clearSelectedRows(event: Event): void;
        updateSort(key: string): () => void;
        renderCell(data: Cell, row?: Row, header?: HeaderConfig): TemplateResult | ZincElement;
        private updateActionKeys;
        private getTableSortIcon;
        private renderCellHeader;
        private renderCellBody;
        private hasHiddenColumns;
        private renderExpanderCell;
        private renderDetailsRow;
        private toggleRowExpansion;
        private isRowSelected;
        private getRows;
        private getSelectedKeys;
        private updateKeys;
        private updateSelectAll;
        private updateModifyKeys;
        private updateDeleteKeys;
        private extractComparable;
        private sortData;
        private sortLocalData;
        private loadingTable;
        private renderActions;
    }
}
declare module "components/data-table/index" {
    import ZnDataTable from "components/data-table/data-table.component";
    export * from "components/data-table/data-table.component";
    export default ZnDataTable;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-table': ZnDataTable;
        }
    }
}
declare module "components/cols/cols.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/columns
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnCols extends ZincElement {
        static styles: CSSResultGroup;
        layout: string;
        maxColumns: number;
        noGap: boolean;
        border: boolean;
        pad: boolean;
        divide: boolean;
        padX: boolean;
        padY: boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/cols/index" {
    import ZnCols from "components/cols/cols.component";
    export * from "components/cols/cols.component";
    export default ZnCols;
    global {
        interface HTMLElementTagNameMap {
            'zn-cols': ZnCols;
        }
    }
}
declare module "components/defined-label/defined-label.component" {
    import { type CSSResultGroup, type PropertyValues, type TemplateResult } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    import type ZnDropdown from "components/dropdown/index";
    import type ZnInput from "components/input/index";
    /**
     * @summary This component provides a labeled input with support for predefined and custom labels,
     * allowing users to select or enter label-value pairs within a dropdown interface.
     * @documentation https://zinc.style/components/defined-label
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-dropdown
     * @dependency zn-input
     * @dependency zn-option
     * @dependency zn-panel
     * @dependency zn-select
     * @dependency zn-sp
     *
     * @csspart input - The component's main input.
     * @csspart input-value - The label's value inputs.
     */
    export default class ZnDefinedLabel extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        input: ZnInput;
        dropdown: ZnDropdown;
        value: string;
        inputValue: string;
        inputSize: 'x-small' | 'small' | 'medium' | 'large';
        name: string;
        title: string;
        disabled: boolean;
        allowCustom: boolean;
        predefinedLabels: never[];
        get validationMessage(): string;
        get validity(): ValidityState;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        handleValueChange(): Promise<void>;
        protected firstUpdated(changedProperties: PropertyValues): void;
        private handleChange;
        private handleInput;
        private handleClick;
        private handleInputValueChange;
        private handleInputValueInput;
        private handleFormSubmit;
        render(): TemplateResult<1>;
    }
}
declare module "components/defined-label/index" {
    import ZnDefinedLabel from "components/defined-label/defined-label.component";
    export * from "components/defined-label/defined-label.component";
    export default ZnDefinedLabel;
    global {
        interface HTMLElementTagNameMap {
            'zn-defined-label': ZnDefinedLabel;
        }
    }
}
declare module "components/note/note.component" {
    import { type colors } from "components/data-select/providers/color-data-provider";
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/note
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot caption - The note's caption.
     * @slot date - The note's date.
     * @slot body - The note's body.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnNote extends ZincElement {
        static styles: CSSResultGroup;
        color: typeof colors[number];
        caption: string;
        date: string;
        body: string;
        private readonly hasSlotController;
        private expanded;
        private _toggleExpand;
        protected render(): unknown;
    }
}
declare module "components/note/index" {
    import ZnNote from "components/note/note.component";
    export * from "components/note/note.component";
    export default ZnNote;
    global {
        interface HTMLElementTagNameMap {
            'zn-note': ZnNote;
        }
    }
}
declare module "components/tile/tile.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/tile
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnTile extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        caption: string;
        description: string;
        href: string;
        dataTarget: string;
        gaid: string;
        dataUri: string;
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        inline: boolean;
        /** Renders the caption in the normal table-content weight instead of bold. */
        plain: boolean;
        /** Set by `zn-tile-group` to lay the tile out as a shared-column subgrid row. */
        grouped: boolean;
        private _isLink;
        private _handleActionsClick;
        render(): import("lit-html").TemplateResult;
    }
}
declare module "components/tile/index" {
    import ZnTile from "components/tile/tile.component";
    export * from "components/tile/tile.component";
    export default ZnTile;
    global {
        interface HTMLElementTagNameMap {
            'zn-tile': ZnTile;
        }
    }
}
declare module "components/tile-group/tile-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Aligns a list of `zn-tile` rows into shared, content-driven columns so values
     * and actions line up across every row, with optional dividing borders.
     * @documentation https://zinc.style/components/tile-group
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-tile
     *
     * @slot - One or more `zn-tile` elements.
     *
     * @csspart base - The component's base wrapper (the grid container).
     *
     * @cssproperty --zn-tile-cols - The number of value/action columns (set automatically).
     */
    export default class ZnTileGroup extends ZincElement {
        static styles: CSSResultGroup;
        /** Draws a dividing border between rows. */
        divide: boolean;
        private _mutationObserver;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _handleSlotChange;
        private _sync;
        protected render(): unknown;
    }
}
declare module "components/tile-group/index" {
    import ZnTileGroup from "components/tile-group/tile-group.component";
    export * from "components/tile-group/tile-group.component";
    export default ZnTileGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-tile-group': ZnTileGroup;
        }
    }
}
declare module "components/tile-property/tile-property.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/tile-property
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnTileProperty extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        icon: string;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/tile-property/index" {
    import ZnTileProperty from "components/tile-property/tile-property.component";
    export * from "components/tile-property/tile-property.component";
    export default ZnTileProperty;
    global {
        interface HTMLElementTagNameMap {
            'zn-tile-property': ZnTileProperty;
        }
    }
}
declare module "components/channel-tile/channel-tile.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    export type ChannelTileColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'disabled';
    /**
     * @summary A channel/queue slot tile with two faces: an active (occupied) state
     * showing an in-progress item, and an available (empty) state advertising
     * capacity — optionally reserving an incoming item with an auto-accept countdown.
     * @documentation https://zinc.style/components/channel-tile
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     *
     * @event zn-accept - Emitted when an available tile is accepted (click or auto-accept).
     *  Cancelable — call `preventDefault()` to suppress the built-in `accept-uri` fetch.
     * @event zn-reject - Emitted when the reject control is pressed.
     *
     * @slot title - Replaces the primary line. Falls back to the `title` attribute (or "Available" when unset in the available state).
     * @slot subtitle - Replaces the secondary line. Falls back to the `subtitle` attribute.
     * @slot leading - Replaces the leading icon in the active state.
     * @slot action - Action content for the available state (e.g. a form). Falls back to a default accept button.
     * @slot footer - Trailing content (e.g. status badges) in the active state.
     *
     * @csspart base - The component's base wrapper.
     * @csspart progress - The progress indicator (incoming countdown overlay or active progress bar).
     *
     * @cssproperty --channel-tile-color - Resolved accent color (set from the `color` property).
     */
    export default class ZnChannelTile extends ZincElement {
        static styles: CSSResultGroup;
        /** Renders the empty/available face instead of the active face. */
        available: boolean;
        /** (Available only) the tile is reserving an incoming item awaiting acceptance. */
        incoming: boolean;
        /** Free-form grouping/theming key (reflected so consumers can query/style by it). */
        variant: string;
        /** Top-bar text (e.g. brand). */
        header: string;
        /** Leading icon (active state). */
        icon: string;
        /** Accent color driving the leading icon and `--channel-tile-color`. */
        color: ChannelTileColor;
        /** Primary line. Defaults to "Available" in the available state when unset. */
        title: string;
        /** Secondary line. */
        subtitle: string;
        /** (Active only) progress bar fill, 0–100. */
        progress: number;
        /** (Active only) CSS color for the progress bar fill. */
        progressColor: string;
        /** Identifier carried in `zn-accept` / `zn-reject` event details. */
        itemId: string;
        /** (Available only) when set, accepting fetches this URI unless `zn-accept` is canceled. */
        acceptUri: string;
        /** (Available/incoming) epoch (seconds or millis) at which the reservation window ends. */
        reservedUntil: number;
        /** (Available/incoming) auto-accept window length in milliseconds. */
        autoAcceptDelay: number;
        /** (Available/incoming) whether a reject control is offered. */
        rejectable: boolean;
        /** Icon for the built-in accept button. */
        acceptIcon: string;
        /** Optional analytics id forwarded to the built-in accept button. */
        acceptGaid: string;
        /** Icon for the reject control. */
        rejectIcon: string;
        /** Accessible label for the reject control. */
        rejectLabel: string;
        private _tickInterval;
        private _autoAcceptFired;
        protected firstUpdated(changed: PropertyValues): void;
        disconnectedCallback(): void;
        protected updated(changed: PropertyValues): void;
        private _isCountingDown;
        private _startTicker;
        private _stopTicker;
        private _maybeAutoAccept;
        private _accept;
        private _reservedUntilMs;
        private _countdownPercent;
        private _handleReject;
        private _handleClick;
        protected render(): unknown;
        private _renderLeading;
        private _renderAvailableAction;
    }
}
declare module "components/channel-tile/index" {
    import ZnChannelTile from "components/channel-tile/channel-tile.component";
    export * from "components/channel-tile/channel-tile.component";
    export default ZnChannelTile;
    global {
        interface HTMLElementTagNameMap {
            'zn-channel-tile': ZnChannelTile;
        }
    }
}
declare module "components/chart/builders" {
    import type { EChartsOption } from 'echarts';
    export type ChartType = 'area' | 'bar' | 'line' | 'sankey';
    export interface SeriesItem {
        name: string;
        data: any[];
        color?: string;
    }
    export interface SankeyEdge {
        source: string;
        target: string;
        value: number;
    }
    export interface BuilderProps {
        type: ChartType;
        data: SeriesItem[];
        categories: string[];
        xAxisType?: 'datetime' | 'category' | 'numeric';
        yAxisAppend?: string;
        stacked: boolean;
        enableAnimations: boolean | number;
        datapointSize: number;
        colors?: string[];
        theme: 'light' | 'dark';
        smooth?: boolean;
        scale?: boolean | number;
        textColor?: string;
        borderColor?: string;
    }
    export function buildBarOption(props: BuilderProps): EChartsOption;
    export function buildLineOption(props: BuilderProps): EChartsOption;
    export function buildAreaOption(props: BuilderProps): EChartsOption;
    export function buildSankeyOption(props: BuilderProps): EChartsOption;
}
declare module "components/chart/echarts-loader" {
    import type * as echartsCore from 'echarts/core';
    export type EChartsModule = typeof echartsCore;
    export function loadECharts(): Promise<EChartsModule>;
}
declare module "components/chart/chart.component" {
    import { type ChartType, type SeriesItem } from "components/chart/builders";
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Chart component powered by Apache ECharts.
     * @documentation https://zinc.style/components/data-chart
     * @status experimental
     * @since 1.0
     *
     * @csspart base - The component's base wrapper.
     */
    export default class ZnChart extends ZincElement {
        static styles: CSSResultGroup;
        type: ChartType;
        data: SeriesItem[];
        categories: string[];
        xAxis: 'datetime' | 'category' | 'numeric';
        datapointSize: number;
        stacked: boolean;
        live: boolean;
        dataUrl: string;
        liveInterval: number;
        height: number;
        enableAnimations: boolean | number;
        yAxisAppend: string;
        colors?: string[];
        syncGroup?: string;
        smooth: boolean;
        scale: boolean | number;
        private chart?;
        private echarts?;
        private initPromise?;
        private liveTimer?;
        private readonly resizeObserver;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected getUpdateComplete(): Promise<boolean>;
        private getTheme;
        private getTextColor;
        private getBorderColor;
        private buildOption;
        private initChart;
        private startLive;
        private reinit;
        attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
        disconnectedCallback(): void;
        protected render(): unknown;
    }
}
declare module "components/chart/index" {
    import ZnChart from "components/chart/chart.component";
    export * from "components/chart/chart.component";
    export default ZnChart;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-chart': ZnChart;
        }
    }
}
declare module "components/simple-chart/simple-chart.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary A simple, pre-styled bar chart.
     * @documentation https://zinc.style/components/simple-chart
     * @status experimental
     * @since 1.0
     */
    export default class ZnSimpleChart extends ZincElement {
        static styles: CSSResultGroup;
        datasets?: {
            data: number[];
        }[];
        labels?: string[];
        enableAnimations: boolean | number;
        private chart?;
        private initPromise?;
        private readonly resizeObserver;
        firstUpdated(): void;
        protected getUpdateComplete(): Promise<boolean>;
        private initChart;
        disconnectedCallback(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/simple-chart/index" {
    import ZnSimpleChart from "components/simple-chart/simple-chart.component";
    export * from "components/simple-chart/simple-chart.component";
    export default ZnSimpleChart;
    global {
        interface HTMLElementTagNameMap {
            'zn-simple-chart': ZnSimpleChart;
        }
    }
}
declare module "events/zn-menu-select" {
    export type ZnMenuSelectEvent = CustomEvent<{
        value: string;
        element: HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-menu-select': ZnMenuSelectEvent;
        }
    }
}
declare module "components/navbar/navbar.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { Store } from "internal/storage";
    import ZincElement from "internal/zinc-element";
    import ZnDropdown from "components/dropdown/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/navbar
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-dropdown
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot expand - Expanding action panels rendered alongside the navbar items.
     * @slot bottom - Content rendered below the navbar row (e.g. chips, filters).
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnNavbar extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-dropdown': typeof ZnDropdown;
        };
        navigation: never[];
        fullWidth: boolean;
        iconBar: boolean;
        slim: boolean;
        border: boolean;
        hideOne: boolean;
        flush: boolean;
        gutter: boolean;
        stacked: boolean;
        dropdown: never[];
        noPad: false;
        manualAddItems: boolean;
        isolated: boolean;
        color: string;
        masterId: string;
        storeKey: string;
        storeTtl: number;
        localStorage: boolean;
        private _preItems;
        private _postItems;
        private _appended;
        private _expanding;
        private _openedTabs;
        private readonly _itemsObserver;
        private _navItems;
        private _expandable;
        private _extendedMenu;
        private readonly _cloneSources;
        private readonly _lightDomClones;
        private _navItemsGap;
        private _expandableMargin;
        private _totalItemWidth;
        private _resizeFrame;
        private _resizeController;
        protected _store: Store;
        appendItem(item: Element): void;
        private _cloneLightItem;
        private _syncLightDomItems;
        addExpandingAction(action: Element): void;
        constructor();
        private readonly _expandingActionObserver;
        private _scheduleResize;
        private _observeExpandingAction;
        private _adoptNewLightItems;
        connectedCallback(): void;
        private _updateVisibility;
        itemCount(): number;
        private _resolveAvailableWidth;
        private _measureTotalItemWidth;
        private _getItemWidth;
        private _getHorizontalSpacing;
        private _getMoreItemWidth;
        private _syncLastVisibleItem;
        private _getExpandableWidth;
        handleResize: () => void;
        private _syncExtendedActive;
        addItem(item: Element, persist?: boolean): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private _loadStoredTabs;
        private _saveTabToStorage;
        private handleClick;
        protected updated(_changedProperties: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/navbar/index" {
    import ZnNavbar from "components/navbar/navbar.component";
    export * from "components/navbar/navbar.component";
    export default ZnNavbar;
    global {
        interface HTMLElementTagNameMap {
            'zn-navbar': ZnNavbar;
        }
    }
}
declare module "components/header/header.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/header
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnHeader extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        fullLocation: string;
        entityId: string;
        entityIdShow: boolean;
        transparent: boolean;
        caption: string;
        icon: string;
        navigation: never[];
        fullWidth: boolean;
        previousPath: string;
        previousTarget: string;
        hideBreadcrumb: boolean;
        private navbar;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleAltPress: () => void;
        handleAltUp: () => void;
        updateNav(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/header/index" {
    import ZnHeader from "components/header/header.component";
    export * from "components/header/header.component";
    export default ZnHeader;
    global {
        interface HTMLElementTagNameMap {
            'zn-header': ZnHeader;
        }
    }
}
declare module "utilities/md5" {
    export function md5(string: string): string;
}
declare module "components/expanding-action/expanding-action.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/expanding-action
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnExpandingAction extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        method: 'drop' | 'fill';
        contextUri: string;
        count: string;
        color: string;
        prefetch: boolean;
        basis: string;
        maxHeight: string;
        open: boolean;
        masterId: string;
        fetchStyle: string;
        noPrefetch: boolean;
        private _panel;
        private _panels;
        private _knownUri;
        private _actions;
        private _preload;
        private _metaObserved;
        private _placementObserver?;
        private readonly _countObserver;
        private readonly _colorObserver;
        constructor();
        connectedCallback(): Promise<void>;
        firstUpdated(_changedProperties: PropertyValues): void;
        _observeMetaData(): void;
        _registerActions(): void;
        _addAction(action: HTMLElement): void;
        _uriToId(actionUri: string): string;
        _handleClick(event: PointerEvent): void;
        _createUriPanel(actionEle: Element, actionUri: string, actionId: string): HTMLDivElement;
        fetchUri(target: HTMLElement): void;
        fetchContextHeaders(): Promise<void>;
        clickAction(target: HTMLElement): void;
        handleIconClicked: () => void;
        handleIconCloseClicked: () => void;
        private _updateTriggerSide;
        private _observePlacement;
        disconnectedCallback(): void;
        render(): import("lit-html").TemplateResult<1>;
        protected renderDropdown(): import("lit-html").TemplateResult<1>;
        protected renderFill(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/expanding-action/index" {
    import ZnExpandingAction from "components/expanding-action/expanding-action.component";
    export * from "components/expanding-action/expanding-action.component";
    export default ZnExpandingAction;
    global {
        interface HTMLElementTagNameMap {
            'zn-expanding-action': ZnExpandingAction;
        }
    }
}
declare module "components/tab/tab.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Defines a tab panel for use inside zn-page.
     * @documentation https://zinc.style/components/tab
     * @status experimental
     * @since 1.0
     *
     * @slot - The tab panel content.
     */
    export default class ZnTab extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        priority: number;
        uri: string;
        /** When present, zn-page opens this tab on load instead of the first tab. */
        selected: boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/tab/index" {
    import ZnTab from "components/tab/tab.component";
    export * from "components/tab/tab.component";
    export default ZnTab;
    global {
        interface HTMLElementTagNameMap {
            'zn-tab': ZnTab;
        }
    }
}
declare module "components/tabs/tabs.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { Store } from "internal/storage";
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/tabs
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnTabs extends ZincElement {
        static styles: CSSResultGroup;
        masterId: string;
        defaultUri: string;
        _current: string;
        _split: number;
        _splitMin: number;
        _splitMinSecondary: number;
        _splitMax: number;
        primaryCaption: string;
        secondaryCaption: string;
        noPrefetch: boolean;
        noCache: boolean;
        localStorage: boolean;
        storeKey: string;
        storeTtl: number;
        padded: boolean;
        fetchStyle: string;
        fullWidth: boolean;
        paddedRight: boolean;
        monitor: string;
        caption: string;
        description: string;
        protected preload: boolean;
        protected _store: Store;
        protected _activeClicks: number;
        private _panel;
        private _panels;
        private _activeTab;
        private _tabs;
        private _actions;
        private _knownUri;
        private readonly hasSlotController;
        private readonly _domObserver;
        private readonly _monitorObserver;
        constructor();
        connectedCallback(): Promise<void>;
        monitorDom(): void;
        _addPanel(panel: HTMLElement): void;
        _addTab(tab: HTMLElement): void;
        reRegisterTabs: () => void;
        firstUpdated(_changedProperties: PropertyValues): void;
        switchTab(inc: number): void;
        nextTab(): void;
        previousTab(): void;
        _prepareTab(tabId: string): void;
        _uriToId(tabUri: string): string;
        _createUriPanel(tabEle: Element, tabUri: string, tabId: string): HTMLDivElement;
        _handleClick(event: PointerEvent): void;
        fetchUriTab(target: HTMLElement): void;
        clickTab(target: HTMLElement, refresh: boolean): void;
        getRefTab(target: HTMLElement): string | null;
        setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab?: string | null): void;
        _setTabEleActive(ele: Element, active: boolean): void;
        selectTab(tabName: string, refresh: boolean): boolean;
        getActiveTab(): Element[];
        observerDom(): void;
        removeTabAndPanel(tabId: string): void;
        _registerTabs: () => void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/tabs/index" {
    import ZnTabs from "components/tabs/tabs.component";
    export * from "components/tabs/tabs.component";
    export default ZnTabs;
    global {
        interface HTMLElementTagNameMap {
            'zn-tabs': ZnTabs;
        }
    }
}
declare module "components/page/page.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZnButton from "components/button/index";
    import ZnCopyButton from "components/copy-button/index";
    import ZnExpandingAction from "components/expanding-action/index";
    import ZnIcon from "components/icon/index";
    import ZnNavbar from "components/navbar/index";
    import ZnTab from "components/tab/index";
    import ZnTabs from "components/tabs/index";
    /**
     * @summary Combines a page header with tab navigation and tab panels.
     * @documentation https://zinc.style/components/page
     * @status experimental
     * @since 1.0
     *
     * @slot - Page content. Use zn-tab for named tabs and header-action/header-actions for header actions.
     * @slot description - Rich subtitle/description content. Falls back to the `summary` attribute when empty.
     * @slot bottom - Content rendered below the navbar row (e.g. chips, filters). Forwarded to the navbar's bottom slot.
     */
    export default class ZnPage extends ZnTabs {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-copy-button': typeof ZnCopyButton;
            'zn-expanding-action': typeof ZnExpandingAction;
            'zn-icon': typeof ZnIcon;
            'zn-navbar': typeof ZnNavbar;
            'zn-tab': typeof ZnTab;
        };
        private readonly pageSlotController;
        caption: string;
        entityId: string;
        entityIdShow: boolean;
        fullLocation: string;
        modal: boolean;
        nested: boolean;
        primary: boolean;
        previousPath: string;
        previousTarget: string;
        summary: string;
        private scrolled;
        private tabDefinitions;
        private hasExpandingActions;
        private actionObserver;
        private tabObserver;
        connectedCallback(): Promise<void>;
        disconnectedCallback(): void;
        private handleAltPress;
        private handleAltUp;
        private handleBreadcrumbSlotChange;
        _registerTabs: () => void;
        firstUpdated(changedProperties: PropertyValues): void;
        private getOwnExpandingActions;
        private getNavbar;
        private refreshExpandingActionsState;
        private syncExpandingActionsToNavbar;
        private prepareTabs;
        private parsePriority;
        private compareTabs;
        private captionToId;
        private uniqueId;
        private handlePageScroll;
        updated(changedProperties: PropertyValues): void;
        private handleNavigationSelect;
        private activateTab;
        private activateInitialPageTab;
        private activateTabDefinition;
        private findNavItemForUri;
        private registerPagePanels;
        private registerPageNavigationTabs;
        private syncNavigationActive;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/page/index" {
    import ZnPage from "components/page/page.component";
    export * from "components/page/page.component";
    export default ZnPage;
    global {
        interface HTMLElementTagNameMap {
            'zn-page': ZnPage;
        }
    }
}
declare module "components/icon-picker/brand-icons" {
    export const brandIcons: string[];
}
declare module "components/icon-picker/line-icons" {
    export const lineIcons: string[];
}
declare module "components/icon-picker/material-icons" {
    export const materialIcons: string[];
    export const material_outlinedIcons: string[];
    export const material_roundIcons: string[];
    export const material_sharpIcons: string[];
    export const material_two_toneIcons: string[];
    export const material_symbols_outlinedIcons: string[];
}
declare module "components/icon-picker/icon-picker.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnDialog from "components/dialog/index";
    import ZnIcon from "components/icon/index";
    import ZnInput from "components/input/index";
    import ZnOption from "components/option/index";
    import ZnSelect from "components/select/index";
    import type { ZincFormControl } from "internal/zinc-element";
    export default class ZnIconPicker extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-button': typeof ZnButton;
            'zn-dialog': typeof ZnDialog;
            'zn-input': typeof ZnInput;
            'zn-select': typeof ZnSelect;
            'zn-option': typeof ZnOption;
        };
        private readonly formControlController;
        name: string;
        icon: string;
        label: string;
        library: string;
        color: string;
        noColor: boolean;
        noLibrary: boolean;
        helpText: string;
        disabled: boolean;
        required: boolean;
        form: string;
        defaultValue: string;
        private _dialogOpen;
        private _searchQuery;
        private _iconList;
        private _filteredIcons;
        private _pendingIcon;
        private _pendingLibrary;
        private _pendingColor;
        private _dialog;
        get value(): string;
        set value(val: string);
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(_message: string): void;
        private static readonly freeInputLibraries;
        private isFreeInputLibrary;
        private getIconsForLibrary;
        private openDialog;
        private closeDialog;
        private handleConfirm;
        private handleCancel;
        private handleSearchInput;
        private filterIcons;
        private handleIconSelect;
        private handleLibraryChange;
        private handleColorInput;
        private handleFreeInput;
        private handleClear;
        private _handleTriggerClick;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/icon-picker/index" {
    import ZnIconPicker from "components/icon-picker/icon-picker.component";
    export * from "components/icon-picker/icon-picker.component";
    export default ZnIconPicker;
    global {
        interface HTMLElementTagNameMap {
            'zn-icon-picker': ZnIconPicker;
        }
    }
}
declare module "components/inline-edit/inline-edit.component" {
    import { type CSSResultGroup, type HTMLTemplateResult, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnSelect from "components/select/index";
    import type { ZincFormControl } from "internal/zinc-element";
    import type ZnInput from "components/input/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/inline-edit
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - Default slot. When `input-type` is `select`, accepts `zn-option` elements to define select options. If provided, takes precedence over the `options` property.
     * @slot example - An example slot.
     * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnInlineEdit extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        private readonly hasSlotController;
        private readonly conditionalController;
        value: string | string[];
        name: string;
        placeholder: string;
        editText: string;
        conditional: string;
        disabled: boolean;
        inline: boolean;
        padded: boolean;
        size: 'small' | 'medium' | 'large';
        required: boolean;
        pattern: string;
        multiple: boolean;
        clearable: boolean;
        min: string | number;
        max: string | number;
        step: number | 'any';
        inputType: 'select' | 'text' | 'data-select' | 'number' | 'textarea';
        textareaRows: 1;
        options: {
            [key: string]: string;
        };
        selectProvider: string;
        iconPosition: 'start' | 'end' | 'none';
        /**
         * The URL to fetch options from. When set , the component fetches JSON from this URL and renders the results as
         * options. The expected format is an array of objects with `key` and `value` properties:
         * `[{"key": "us", "value": "United States"}, ...]`
         * When not set, the component works exactly as before using slotted `<zn-option>` elements.
         * Only works with type select.
         */
        dataUri: string;
        /**
         * Context data to send as a header when fetching options from the URL specified by the `src` property.
         */
        contextData: string;
        /** Enables search/filtering on select inputs. */
        search: boolean;
        /**
         * Allows entering values that aren't in the options list on select inputs ("free text"). Setting this implies
         * `input-type="select"` (unless a data `provider` is used) and forwards the behavior to the inner `<zn-select>`.
         */
        freeText: boolean;
        /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
        helpText: string;
        /** The text direction for the input (ltr or rtl) **/
        dir: 'ltr' | 'rtl' | 'auto';
        /**
         * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
         * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
         */
        autocomplete: string;
        private hasFocus;
        private isEditing;
        private _valueBeforeEdit;
        input: ZnInput | ZnSelect;
        defaultValue: string | string[];
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        firstUpdated(): Promise<void>;
        protected willUpdate(changedProperties: PropertyValues): void;
        handleValueChange(): Promise<void>;
        handleIsEditingChange(): Promise<void>;
        mouseEventHandler: (e: MouseEvent) => void;
        escKeyHandler: (e: KeyboardEvent) => void;
        submitKeyHandler: (e: KeyboardEvent) => void;
        captureMouseDown: (e: MouseEvent) => void;
        captureKeyDown: (e: KeyboardEvent) => void;
        handleEditClick: (e: MouseEvent) => void;
        handleSubmitClick: (e: MouseEvent) => void;
        handleCancelClick: (e: MouseEvent) => void;
        handleBlur: () => void;
        handleInput: (e: Event) => void;
        private moveSlottedOptionsToSelect;
        handleSlotChange: () => Promise<void>;
        protected render(): import("lit-html").TemplateResult<1>;
        protected _getTextAreaInput(): HTMLTemplateResult;
        protected _getTextInput(): HTMLTemplateResult;
        protected _getNumberInput(): HTMLTemplateResult;
        protected _getSelectInput(): HTMLTemplateResult;
        protected _getDataSelectInput(): HTMLTemplateResult;
    }
}
declare module "components/inline-edit/index" {
    import ZnInlineEdit from "components/inline-edit/inline-edit.component";
    export * from "components/inline-edit/inline-edit.component";
    export default ZnInlineEdit;
    global {
        interface HTMLElementTagNameMap {
            'zn-inline-edit': ZnInlineEdit;
        }
    }
}
declare module "components/pagination/pagination.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Pagination component for navigating through pages of content.
     * @documentation https://zinc.style/components/pagination
     * @status experimental
     * @since 1.0
     */
    export default class ZnPagination extends ZincElement {
        static styles: CSSResultGroup;
        limit: number;
        total: number;
        page: number;
        uri: string;
        protected _createLink(page: number): string;
        protected _calculatePages(): number;
        protected render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/pagination/index" {
    import ZnPagination from "components/pagination/pagination.component";
    export * from "components/pagination/pagination.component";
    export default ZnPagination;
    global {
        interface HTMLElementTagNameMap {
            'zn-pagination': ZnPagination;
        }
    }
}
declare module "components/vertical-stepper/vertical-stepper.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Vertical steppers display a sequence of steps in a vertical layout with descriptions and optional icons.
     * @documentation https://zinc.style/components/vertical-stepper
     * @status experimental
     * @since 1.0
     *
     * @property {boolean} last - When true, removes the connecting line below this step (use for the final step in a sequence).
     * @property {boolean} first - When true, indicates this is the first step in the sequence (affects visual styling).
     * @property {boolean} active - When true, highlights this step as the current active step in the process.
     * @property {string} description - A descriptive text explaining what happens in this step or its current status.
     * @property {string} caption - The main label/title for this step.
     *
     * @slot icon - Optional slot for adding an icon or indicator before the step content.
     *
     * @csspart vs - The main container for the vertical stepper.
     * @csspart vs__left - The left section containing the icon and connecting line.
     * @csspart vs__icon - The icon container.
     * @csspart vs__line - The vertical connecting line between steps.
     * @csspart vs__right - The right section containing caption and description text.
     * @csspart vs__caption - The caption/title text element.
     * @csspart vs__description - The description text element.
     */
    export default class ZnVerticalStepper extends ZincElement {
        static styles: CSSResultGroup;
        last: boolean;
        first: boolean;
        active: boolean;
        description: string;
        caption: string;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/vertical-stepper/index" {
    import ZnVerticalStepper from "components/vertical-stepper/vertical-stepper.component";
    export * from "components/vertical-stepper/vertical-stepper.component";
    export default ZnVerticalStepper;
    global {
        interface HTMLElementTagNameMap {
            'zn-vertical-stepper': ZnVerticalStepper;
        }
    }
}
declare module "components/timer/timer.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/timer
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnTimer extends ZincElement {
        static styles: CSSResultGroup;
        private timestamp;
        private _timerId;
        disconnectedCallback(): void;
        private _getLastMessage;
        render(): import("lit-html").TemplateResult<1>;
        private _getTimes;
    }
}
declare module "components/timer/index" {
    import ZnTimer from "components/timer/timer.component";
    export * from "components/timer/timer.component";
    export default ZnTimer;
    global {
        interface HTMLElementTagNameMap {
            'zn-timer': ZnTimer;
        }
    }
}
declare module "components/panel/panel.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Panels are versatile containers that provide structure for organizing content with optional headers and footers.
     * @documentation https://zinc.style/components/panel
     * @status experimental
     * @since 1.0
     *
     * @slot - The panel's main content.
     * @slot actions - Actions displayed in the panel header (buttons, chips, etc).
     * @slot footer - Content displayed in the panel footer.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --zn-panel-basis - The flex-basis of the panel. Can be set using the basis-px attribute.
     */
    export default class ZnPanel extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        basis: number;
        caption: string;
        icon: string;
        tabbed: boolean;
        headerBorderless: boolean;
        cosmic: boolean;
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        flushFooter: boolean;
        transparent: boolean;
        shadow: boolean;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        protected render(): unknown;
    }
}
declare module "components/panel/index" {
    import ZnPanel from "components/panel/panel.component";
    export * from "components/panel/panel.component";
    export default ZnPanel;
    global {
        interface HTMLElementTagNameMap {
            'zn-panel': ZnPanel;
        }
    }
}
declare module "components/table/table.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/table
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnTable extends ZincElement {
        static styles: CSSResultGroup;
        fixedFirst: boolean;
        hasActions: boolean;
        headless: boolean;
        allLeft: boolean;
        data: any;
        boolIcons: boolean;
        private columns;
        private columnDisplay;
        private wideColumn;
        private rows;
        private readonly resizeObserver;
        resizing(): void;
        connectedCallback(): void;
        tableHead(): import("lit-html").TemplateResult<1> | undefined;
        tableBody(): import("lit-html").TemplateResult<1>;
        columnContent(col: any): any;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/table/index" {
    import ZnTable from "components/table/table.component";
    export * from "components/table/table.component";
    export default ZnTable;
    global {
        interface HTMLElementTagNameMap {
            'zn-table': ZnTable;
        }
    }
}
declare module "components/pane/pane.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/pane
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnPane extends ZincElement {
        static styles: CSSResultGroup;
        flush: boolean;
        protected _header: HTMLElement | null;
        connectedCallback(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/pane/index" {
    import ZnPane from "components/pane/pane.component";
    export * from "components/pane/pane.component";
    export default ZnPane;
    global {
        interface HTMLElementTagNameMap {
            'zn-pane': ZnPane;
        }
    }
}
declare module "utilities/on" {
    export type OnEvent = Event & {
        selectedTarget: EventTarget;
        path: EventTarget[];
    };
    interface OnEventListener {
        (evt: OnEvent): void;
    }
    export function on(delegate: EventTarget, eventName: string, targetSelector: string, callback: OnEventListener): () => void;
}
declare module "components/split-pane/split-pane.component" {
    import { type CSSResultGroup } from 'lit';
    import { Store } from "internal/storage";
    import ZincElement from "internal/zinc-element";
    import { PropertyValues } from "@lit/reactive-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/split-pane
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnSplitPane extends ZincElement {
        static styles: CSSResultGroup;
        storage: Storage;
        mouseMoveHandler: null | EventListener;
        mouseUpHandler: null | EventListener;
        private currentPixelSize;
        private currentPercentSize;
        private currentContainerSize;
        private focusChangeHandler;
        private primaryFull;
        private resizeObserver;
        private parentIsNarrow;
        calculatePixels: boolean;
        preferSecondarySize: boolean;
        minimumPaneSize: number;
        minimumSecondaryPaneSize: number;
        maximumPaneSize: number;
        initialSize: number;
        storeKey: string;
        border: boolean;
        vertical: boolean;
        primaryCaption: string;
        secondaryCaption: string;
        _focusPane: number;
        padded: boolean;
        paddedRight: boolean;
        gap: boolean;
        hide: 'primary' | 'secondary' | '';
        mergedNavigation: boolean;
        localStorage: boolean;
        storeTtl: number;
        protected _store: Store;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private refreshNarrowState;
        firstUpdated(changedProperties: PropertyValues): void;
        applyStoredSize(): void;
        resize(e: any): void;
        setSize(primaryPanelPixels: number): void;
        _setFocusPane(idx: number): void;
        private getDirectNestedSplitPanes;
        private updateNestedNavigationMerging;
        private getPaneIndexForNestedSplitPane;
        private getNestedNavigationItems;
        private getDirectNestedSplitPanesForPane;
        private getNavigationItems;
        protected render(): unknown;
    }
}
declare module "components/split-pane/index" {
    import ZnSplitPane from "components/split-pane/split-pane.component";
    export * from "components/split-pane/split-pane.component";
    export default ZnSplitPane;
    global {
        interface HTMLElementTagNameMap {
            'zn-split-pane': ZnSplitPane;
        }
    }
}
declare module "components/sidebar/sidebar.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/sidebar
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnSidebar extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        open: boolean;
        startScrolled: boolean;
        wide: boolean;
        private domObserver;
        constructor();
        connectedCallback(): void;
        scrollBottom(): void;
        render(): import("lit-html").TemplateResult<1>;
        _expander(): import("lit-html").TemplateResult<1>;
        handleClick(e: any): void;
    }
}
declare module "components/sidebar/index" {
    import ZnSidebar from "components/sidebar/sidebar.component";
    export * from "components/sidebar/sidebar.component";
    export default ZnSidebar;
    global {
        interface HTMLElementTagNameMap {
            'zn-sidebar': ZnSidebar;
        }
    }
}
declare module "components/sp/sp.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    export const defaultSizes: {
        px: string;
        xxs: string;
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    /**
     * @summary A flexible layout container for spacing and arranging child elements in rows or columns with configurable gap, padding, and dividers.
     * @documentation https://zinc.style/components/sp
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnSp extends ZincElement {
        static styles: CSSResultGroup;
        divide: boolean;
        gap: keyof typeof defaultSizes;
        row: boolean;
        align: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
        justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
        grow: boolean;
        padX: boolean;
        padY: boolean;
        noGap: boolean;
        noPosition: boolean;
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        flushT: boolean;
        flushB: boolean;
        flushL: boolean;
        flushR: boolean;
        widthContainer: boolean;
        formContainer: boolean;
        wideFormContainer: boolean;
        connectedCallback(): void;
        protected render(): unknown;
    }
}
declare module "components/sp/index" {
    import ZnSp from "components/sp/sp.component";
    export * from "components/sp/sp.component";
    export default ZnSp;
    global {
        interface HTMLElementTagNameMap {
            'zn-sp': ZnSp;
        }
    }
}
declare module "components/stepper/stepper.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Steppers provide visual feedback about progress through a multi-step process or workflow.
     * @documentation https://zinc.style/components/stepper
     * @status experimental
     * @since 1.0
     *
     * @property {string} caption - A descriptive label displayed above the stepper to indicate the current step or phase.
     * @property {string} label - An optional label displayed above the caption, typically used for the wizard or workflow name.
     * @property {number} steps - The total number of steps in the process.
     * @property {number} value - The current step position (0 to steps). Progress is calculated as value/steps.
     * @property {boolean} show-progress - When true, displays the step count (e.g., "2 / 5 steps") next to the caption.
     *
     * @csspart step-container - The container holding the progress line and steps.
     * @csspart step-line - The background line showing the full step track.
     * @csspart step-progress - The filled progress indicator showing completion.
     * @csspart steps - The container for individual step markers.
     * @csspart step - An individual step marker circle.
     * @csspart header - The header container with caption and progress text.
     * @csspart caption - The caption text element.
     * @csspart progress - The progress count text (e.g., "2 / 5 steps").
     * @csspart label - The label text container.
     * @csspart info - The label text element.
     */
    export default class ZnStepper extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        label: string;
        steps: number;
        value: number;
        showProgress: boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/stepper/index" {
    import ZnStepper from "components/stepper/stepper.component";
    export * from "components/stepper/stepper.component";
    export default ZnStepper;
    global {
        interface HTMLElementTagNameMap {
            'zn-stepper': ZnStepper;
        }
    }
}
declare module "components/stat/stat.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/stats-tile
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnStatsTile extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        amount: string;
        type: string;
        previous: string;
        currency: string;
        showDelta: boolean;
        color: 'primary' | 'error' | 'info' | 'warning' | 'success' | 'neutral';
        calcPercentageDifference(): number;
        getCurrentAmount(): string;
        private getDisplayAmount;
        diffText(): import("lit-html").TemplateResult<1> | null;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/stat/index" {
    import ZnStat from "components/stat/stat.component";
    export * from "components/stat/stat.component";
    export default ZnStat;
    global {
        interface HTMLElementTagNameMap {
            'zn-stat': ZnStat;
        }
    }
}
declare module "components/scroll-container/scroll-container.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/scroll-container
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnScrollContainer extends ZincElement {
        static styles: CSSResultGroup;
        startScrolled: boolean;
        private container;
        private footer;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        scrollEnd(): void;
        private readonly _footerResizeObserver;
        private readonly _domObserver;
        connectedCallback(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/scroll-container/index" {
    import ZnScrollContainer from "components/scroll-container/scroll-container.component";
    export * from "components/scroll-container/scroll-container.component";
    export default ZnScrollContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-scroll-container': ZnScrollContainer;
        }
    }
}
declare module "components/progress-tile/progress-tile.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/progress-tile
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnProgressTile extends ZincElement {
        static styles: CSSResultGroup;
        startTime: number;
        waitTime: number;
        maxTime: number;
        endTime: number;
        maxWaitTime: number;
        waitingAgentResponse: boolean;
        status: string;
        avatar: string;
        caption: string;
        private _timerInterval;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private getHumanReadableTime;
        protected render(): unknown;
    }
}
declare module "components/progress-tile/index" {
    import ZnProgressTile from "components/progress-tile/progress-tile.component";
    export * from "components/progress-tile/progress-tile.component";
    export default ZnProgressTile;
    global {
        interface HTMLElementTagNameMap {
            'zn-progress-tile': ZnProgressTile;
        }
    }
}
declare module "components/progress-bar/progress-bar.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    export type ProgressBarColor = 'current' | 'info' | 'error' | 'success' | 'warning';
    /**
     * @summary Progress bars provide visual feedback about the completion status of a task or process.
     * @documentation https://zinc.style/components/progress-bar
     * @status experimental
     * @since 1.0
     *
     * @csspart header - The header container that contains the caption and progress text.
     * @csspart caption - The caption text element.
     * @csspart progress - The progress percentage text element.
     * @csspart bar - The SVG element containing the progress bar.
     * @csspart track - The background track of the progress bar.
     * @csspart fill - The filled portion of the progress bar indicating progress.
     * @csspart footer - The footer container that contains the description.
     * @csspart info - The description text element.
     *
     * @cssproperty --zn-border-color - The color of the progress bar background track.
     * @cssproperty --zn-progress-bar-color - The color of the progress bar fill.
     * @cssproperty --zn-text-heading - The color of the caption text.
     * @cssproperty --zn-text - The color of the progress percentage and description text.
     * @cssproperty --zn-spacing-x-small - The spacing between header/footer and the progress bar.
     */
    export default class ZnProgressBar extends ZincElement {
        static styles: CSSResultGroup;
        caption: string | undefined;
        color: ProgressBarColor;
        description: string | undefined;
        value: number | undefined;
        showProgress: boolean | undefined;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/progress-bar/index" {
    import ZnProgressBar from "components/progress-bar/progress-bar.component";
    export * from "components/progress-bar/progress-bar.component";
    export default ZnProgressBar;
    global {
        interface HTMLElementTagNameMap {
            'zn-progress-bar': ZnProgressBar;
        }
    }
}
declare module "components/order-table/order-table.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    interface OrderTableData {
        headers: string[];
        items: {
            caption?: string;
            summary?: string;
            data: string[];
            sub?: {
                caption?: string;
                summary?: string;
                data: string[];
            }[];
        }[];
        tax?: string;
        discount?: string;
        total?: string;
        paid?: string;
        remaining?: string;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/order-table
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnOrderTable extends ZincElement {
        static styles: CSSResultGroup;
        data: OrderTableData;
        private isMobile;
        private modifiedData;
        connectedCallback(): void;
        disconnectedCallback(): void;
        resizeEventHandler: () => void;
        render(): import("lit-html").TemplateResult<1>;
        getHeaders(): import("lit-html").TemplateResult<1>;
        getRows(): import("lit-html").TemplateResult<1>;
        getCaption(item: any): import("lit-html").TemplateResult<1>;
        getSubItems(item: any): import("lit-html").TemplateResult<1>;
        getSummary(): import("lit-html").TemplateResult<1>;
        private getMobileRows;
        getMobileSubItems(item: any): import("lit-html").TemplateResult<1>;
        getMobileCaption(item: any, extra: any): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/order-table/index" {
    import ZnOrderTable from "components/order-table/order-table.component";
    export * from "components/order-table/order-table.component";
    export default ZnOrderTable;
    global {
        interface HTMLElementTagNameMap {
            'zn-order-table': ZnOrderTable;
        }
    }
}
declare module "components/bulk-actions/bulk-actions.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnInput from "components/input/index";
    import ZnOption from "components/option/index";
    import ZnSelect from "components/select/index";
    export interface CreatedRule {
        id: string;
        name: string;
        value: string;
    }
    export type BulkActionData = BulkActionItem[];
    export interface BulkActionItem {
        id: string;
        name: string;
        type?: 'bool' | 'boolean' | 'date' | 'number';
        options?: {
            [key: string]: string;
        };
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/bulk-actions
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-input
     * @dependency zn-option
     * @dependency zn-select
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnBulkActions extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-input': typeof ZnInput;
            'zn-option': typeof ZnOption;
            'zn-select': typeof ZnSelect;
        };
        container: HTMLDivElement;
        addRule: ZnSelect;
        input: HTMLInputElement;
        name: string;
        value: PropertyKey;
        actions: BulkActionData;
        private _selectedRules;
        private _formController;
        get validationMessage(): string;
        get validity(): ValidityState;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
        private _handleChange;
        private _addRule;
        private _createInput;
        private _updateValue;
        private _getRulePosition;
        private _changeRule;
        private _removeRule;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
    }
}
declare module "components/bulk-actions/index" {
    import ZnBulkActions from "components/bulk-actions/bulk-actions.component";
    export * from "components/bulk-actions/bulk-actions.component";
    export default ZnBulkActions;
    global {
        interface HTMLElementTagNameMap {
            'zn-bulk-actions': ZnBulkActions;
        }
    }
}
declare module "components/editor/modules/toolbar/tool/tool.component" {
    import ZincElement from "internal/zinc-element";
    export default class ZnEditorTool extends ZincElement {
        uri: string;
        label: string;
        key: string;
        icon: string;
        handler: string;
        contextMenu: boolean;
        order?: number | null;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/toolbar/tool/index" {
    import ZnEditorTool from "components/editor/modules/toolbar/tool/tool.component";
    export * from "components/editor/modules/toolbar/tool/tool.component";
    export default ZnEditorTool;
    global {
        interface HTMLElementTagNameMap {
            'zn-editor-tool': ZnEditorTool;
        }
    }
}
declare module "components/editor/modules/toolbar/toolbar.component" {
    import { type CSSResultGroup, type PropertyValues } from "lit";
    import ZincElement from "internal/zinc-element";
    import type { EditorFeatureConfig } from "components/editor/editor.component";
    export default class ToolbarComponent extends ZincElement {
        static styles: CSSResultGroup;
        containerWidth: number;
        private _toolbarEl;
        private _groups;
        private _overflowMenu;
        private _overflowGroup;
        private _featureConfig;
        private _resizeId;
        private readonly _resizeObserver;
        private _movedContent;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleResize: () => void;
        configureToolbar(config: EditorFeatureConfig): void;
        private getToolbarWidth;
        private getOverflowGroupWidth;
        private restoreMovedContent;
        private moveContentTo;
        private isGroupEmpty;
        private updateEmptyGroups;
        private _updateDividerClasses;
        private calculateOverflow;
        private _dispatchOverflowEvent;
        private populateOverflowMenu;
        render(): import("lit-html").TemplateResult<1>;
        private _textOptions;
        private _formatOptions;
        private _commonFormatOptions;
        private _historyOptions;
        private _colorOptions;
        private _listOptions;
        private _insertOptions;
        private _emojiOptions;
        private _dateOption;
    }
}
declare module "components/editor/modules/dialog/dialog.component" {
    import { type CSSResultGroup, type PropertyValues } from "lit";
    import ZincElement from "internal/zinc-element";
    export default class DialogComponent extends ZincElement {
        static styles: CSSResultGroup;
        private hasFocus;
        /** Set when loaded content declares it renders its own header (including a
         * [dialog-closer] control) via a composed zn-dialog-header event, replacing
         * the floating chrome close button. */
        private hasContentHeader;
        dialogEl: HTMLDialogElement;
        open: boolean;
        uri: string;
        private closeWatcher;
        private _editorId;
        set editorId(value: string);
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private handleContentCloserClick;
        setContent(content: string): void;
        handleOpenChange(): void;
        private addOpenListeners;
        private removeOpenListeners;
        private requestClose;
        private _getLoadingState;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/dialog/dialog" {
    import type DialogComponent from "components/editor/modules/dialog/dialog.component";
    import type Quill from "quill";
    class Dialog {
        private readonly _quill;
        private readonly _editorId;
        private readonly _document;
        private _component;
        constructor(quill: Quill, options: {
            editorId: string;
        });
        private _initDialog;
        get component(): DialogComponent;
        private _mountPoint;
        private createComponent;
        isOpen(): boolean;
        close(): void;
    }
    export default Dialog;
}
declare module "components/editor/modules/emoji/emoji-mart-loader" {
    import type { Picker, SearchIndex } from 'emoji-mart';
    export interface EmojiMart {
        Picker: typeof Picker;
        SearchIndex: typeof SearchIndex;
        data: Record<string, unknown>;
    }
    export function loadEmojiMart(): Promise<EmojiMart>;
}
declare module "components/editor/modules/emoji/emoji" {
    import Quill from 'quill';
    export interface EmojiResult {
        native?: string;
        skins?: {
            native?: string;
        }[];
        id?: string;
        shortcodes?: string;
    }
    class Emoji {
        private readonly _quill;
        private _mo;
        constructor(quill: Quill);
        private getHostEditor;
        private getToolbarEmojiContainer;
        private getTheme;
        initPicker(): void;
        private onEmojiSelect;
    }
    export default Emoji;
}
declare module "components/editor/modules/toolbar/toolbar" {
    import "components/editor/modules/toolbar/toolbar.component";
    import Quill from "quill";
    import QuillToolbar from "quill/modules/toolbar";
    import type { EditorFeatureConfig } from "components/editor/editor.component";
    import type ToolbarComponent from "components/editor/modules/toolbar/toolbar.component";
    class Toolbar extends QuillToolbar {
        private readonly _quill;
        private readonly _component;
        private _formatters;
        constructor(quill: Quill, options: {
            container: ToolbarComponent;
            handlers?: Record<string, (value?: any) => void>;
            config?: EditorFeatureConfig;
        });
        callFormat(key: string, value?: string | boolean | undefined): void;
        trigger(key: string): void;
        private _slottedToolButton;
        private _attachToolbarHandlers;
        private _onToolbarClick;
        private _syncToolbarState;
        private _updateHeadingFormatMenu;
        private _updateListFormatMenu;
        private _updateTextFormatMenu;
        private _updateColorFormatMenu;
        private _getTextFormats;
        private _updateMenuCheckedState;
        private _updateDropdownTrigger;
        private _syncButtonState;
        private _insertDivider;
        private _openDatePicker;
        private _openDialog;
        private _handleOverflowUpdate;
        private _addImage;
    }
    export default Toolbar;
}
declare module "components/editor/modules/attachment/attachment" {
    import type Quill from 'quill';
    interface AttachmentOptions {
        upload: (file: File) => Promise<{
            path: any;
            url: any;
            filename: any;
        }>;
        onFileUploaded?: (node: HTMLElement, { url }: {
            url: string;
        }) => void;
        attachmentInput?: HTMLInputElement;
    }
    export default class Attachment {
        private _quill;
        private _options;
        private _fileHolder;
        constructor(quill: Quill, options: AttachmentOptions);
        private _selectLocalImage;
        private _fileChanged;
        addAttachment(file: File, dataUrl?: string): void;
        private _attachmentContainer;
        private _createAttachmentContainer;
        private _insertAttachment;
        private _updateAttachment;
        private _createAttachment;
        /** Clear every staged attachment preview and reset the backing form input. */
        reset(): void;
        private _removeAttachment;
        private _uploadAttachment;
    }
}
declare module "components/editor/modules/context-menu/context-menu-component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    export interface ResultItem {
        icon: string;
        label: string;
        format?: string;
        key?: string;
        value?: string | boolean;
        order?: number;
    }
    export default class ContextMenuComponent extends ZincElement {
        static styles: CSSResultGroup;
        open: boolean;
        query: string;
        results: ResultItem[];
        private _activeIndex;
        show(): void;
        hide(): void;
        setPosition(left: number, top: number): void;
        setActiveIndex(index: number): void;
        getActiveIndex(): number;
        private _onClickItem;
        protected willUpdate(changed: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/context-menu/quick-action/quick-action.component" {
    import ZincElement from "internal/zinc-element";
    export default class ZnEditorQuickAction extends ZincElement {
        uri: string;
        label: string;
        content: string;
        key: string;
        icon: string;
        order?: number | null;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/context-menu/quick-action/index" {
    import ZnEditorQuickAction from "components/editor/modules/context-menu/quick-action/quick-action.component";
    export * from "components/editor/modules/context-menu/quick-action/quick-action.component";
    export default ZnEditorQuickAction;
    global {
        interface HTMLElementTagNameMap {
            'zn-editor-quick-action': ZnEditorQuickAction;
        }
    }
}
declare module "components/editor/modules/context-menu/context-menu" {
    import "components/editor/modules/context-menu/context-menu-component";
    import Quill from "quill";
    import type { EditorFeatureConfig } from "components/editor/editor.component";
    class ContextMenu {
        private _quill;
        private readonly _toolbarModule;
        private _component;
        private _startIndex;
        private _keydownHandler;
        private _docClickHandler;
        private _featureConfig;
        constructor(quill: Quill, options: {
            config: EditorFeatureConfig;
        });
        private initComponent;
        private attachEvents;
        private createComponent;
        private onDocumentClick;
        private updateFromEditor;
        private positionComponent;
        private getToolbarQuery;
        private onKeydown;
        private onToolbarSelect;
        private _clickToolbarItem;
        private _applySelectedFormat;
        private deleteLastIndex;
        private _getOptions;
        private show;
        private hide;
        isOpen(): boolean;
    }
    export default ContextMenu;
}
declare module "components/editor/modules/date-picker/date-picker" {
    import Quill from "quill";
    class DatePicker {
        private readonly _quill;
        constructor(quill: Quill);
        private _initPicker;
        private getToolbarDateContainer;
        private _onDateSelect;
    }
    export default DatePicker;
}
declare module "components/editor/modules/drag-drop/drag-drop" {
    import type Quill from 'quill';
    interface DragAndDropOptions {
        onDrop: (file: File, options: object) => void;
        draggableContentTypePattern: string;
        draggables: [];
    }
    export default class DragAndDrop {
        private _quill;
        private _options;
        private _container;
        private _draggables;
        constructor(quill: Quill, options: DragAndDropOptions);
        nullReturner: () => null;
        handleDrop: (e: DragEvent) => void;
    }
    export const getFileDataUrl: (file: any) => Promise<unknown>;
}
declare module "components/editor/modules/emoji/headless/headless-emoji.component" {
    import ZincElement from "internal/zinc-element";
    import type { CSSResultGroup, PropertyValues } from 'lit';
    export interface ResultItem {
        emojiChar: string;
        label: string;
    }
    export default class HeadlessEmojiComponent extends ZincElement {
        static styles: CSSResultGroup;
        open: boolean;
        query: string;
        results: ResultItem[];
        private _activeIndex;
        show(): void;
        hide(): void;
        setPosition(left: number, top: number): void;
        setActiveIndex(index: number): void;
        getActiveIndex(): number;
        private onMouseEnterItem;
        private onClickItem;
        protected willUpdate(changed: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/emoji/headless/headless-emoji" {
    import "components/editor/modules/emoji/headless/headless-emoji.component";
    import Quill from 'quill';
    class HeadlessEmoji {
        private _quill;
        private _component;
        private _startIndex;
        private _keydownHandler;
        private _docClickHandler;
        constructor(quill: Quill);
        private initComponent;
        private attachEvents;
        private createComponent;
        private onDocumentClick;
        private updateFromEditor;
        private positionComponent;
        private getEmojiQuery;
        private onKeydown;
        private onEmojiSelect;
        private replaceAtQuery;
        private show;
        private hide;
        isOpen(): boolean;
    }
    export default HeadlessEmoji;
}
declare module "components/editor/modules/image-resize/image-resize" {
    import Quill, { Module } from "quill";
    interface ImageResizeOptions {
        overlayStyles?: Partial<CSSStyleDeclaration>;
    }
    class ImageResize extends Module<ImageResizeOptions> {
        static DEFAULTS: ImageResizeOptions;
        private _focusedImage;
        private _overlay;
        constructor(quill: Quill, options: ImageResizeOptions);
        handleClick: (e: MouseEvent) => void;
        handleScroll: () => void;
        show: (image: HTMLImageElement) => void;
        hide: () => void;
        showOverlay: () => void;
        hideOverlay: () => void;
        repositionElements: () => void;
        setUserSelect: (value: string) => void;
        checkImage: (e: KeyboardEvent) => void;
    }
    export default ImageResize;
}
declare module "components/editor/modules/ai/panel/ai-panel.component" {
    import ZincElement from "internal/zinc-element";
    import type { CSSResultGroup } from "lit";
    export default class AIPanelComponent extends ZincElement {
        static styles: CSSResultGroup;
        promptInput: HTMLTextAreaElement;
        open: boolean;
        refine?: (prompt: string) => void;
        refineBuiltIn?: (e: Event) => void;
        show(): void;
        hide(): void;
        private handleTriggerKeyDown;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/modules/ai/tooltip/ai-tooltip.component" {
    import ZincElement from "internal/zinc-element";
    import type { CSSResultGroup } from "lit";
    export default class AITooltipComponent extends ZincElement {
        static styles: CSSResultGroup;
        open: boolean;
        show(): void;
        hide(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/textarea/textarea.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { type ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Textareas collect data from the user and allow multiple lines of text.
     * @documentation https://zinc.style/components/textarea
     * @status stable
     * @since 2.0
     *
     * @slot label - The textareas label. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot context-note - Used to add contextual text that is displayed above the textarea, on the right. Alternatively, you can use the `context-note` attribute.
     * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
     *
     * @event zn-blur - Emitted when the control loses focus.
     * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
     * @event zn-focus - Emitted when the control gains focus.
     * @event zn-input - Emitted when the control receives input.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @csspart form-control - The form control that wraps the label, input, and help text.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The input's wrapper.
     * @csspart form-control-help-text - The help text's wrapper.
     * @csspart base - The component's base wrapper.
     * @csspart textarea - The internal `<textarea>` control.
     */
    export default class ZnTextarea extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        private readonly hasSlotController;
        private readonly resizeObserver;
        /** Ensures we only attempt to derive the initial value from light DOM content once */
        private _didInitFromContent;
        formControl: HTMLElement;
        input: HTMLTextAreaElement;
        hasFocus: boolean;
        title: string;
        /** The name of the textarea, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the textarea, submitted as a name/value pair with form data. */
        value: string;
        /** The text area's size. */
        size: 'small' | 'medium' | 'large';
        /**  The textarea label. If you need to display HTML, use the `label` slot instead. */
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
        labelTooltip: string;
        /** Text that appears above the textarea, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
        contextNote: string;
        /** The text area's help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /** Placeholder text to show as a hint when the input is empty. */
        placeholder: string;
        /** The number of rows to display by default. */
        rows: number;
        /** Controls how the textarea can be resized. */
        resize: 'none' | 'vertical' | 'auto';
        /** Disables the textarea. */
        disabled: boolean;
        /** Makes the textarea readonly. */
        readonly: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        flush: boolean;
        /** Makes the textarea a required field. */
        required: boolean;
        /** The minimum length of input that will be considered valid. */
        minlength: number;
        /** The maximum length of input that will be considered valid. */
        maxlength: number;
        /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
        autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
        /** Indicates whether the browser's autocorrect feature is on or off. */
        autocorrect: string;
        /**
         * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
         * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
         */
        autocomplete: string;
        /** Indicates that the input should receive focus on page load. */
        autofocus: boolean;
        /** Used to customize the label or icon of the Enter key on virtual keyboards. */
        enterkeyhint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
        /** Enables spell checking on the textarea. */
        spellcheck: boolean;
        /**
         * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
         * keyboard on supportive devices.
         */
        inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string;
        transparent: boolean;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        connectedCallback(): void;
        firstUpdated(): void;
        private handleBlur;
        private handleChange;
        private handleFocus;
        private handleInput;
        private handleInvalid;
        private handleKeyDown;
        private setTextareaHeight;
        handleDisabledChange(): void;
        handleRowsChange(): void;
        handleValueChange(): Promise<void>;
        /** Sets focus on the textarea. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the textarea. */
        blur(): void;
        /** Selects all the text in the textarea. */
        select(): void;
        /** Gets or sets the textarea scroll position. */
        scrollPosition(position?: {
            top?: number;
            left?: number;
        }): {
            top: number;
            left: number;
        } | undefined;
        /** Sets the start and end positions of the text selection (0-based). */
        setSelectionRange(selectionStart: number, selectionEnd: number, selectionDirection?: 'forward' | 'backward' | 'none'): void;
        /** Replaces a range of text with a new string. */
        setRangeText(replacement: string, start?: number, end?: number, selectMode?: 'select' | 'start' | 'end' | 'preserve'): void;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/textarea/index" {
    import ZnTextarea from "components/textarea/textarea.component";
    export * from "components/textarea/textarea.component";
    export default ZnTextarea;
    global {
        interface HTMLElementTagNameMap {
            'zn-textarea': ZnTextarea;
        }
    }
}
declare module "components/editor/modules/ai/index" {
    import Quill from "quill";
    class QuillAI {
        private _quill;
        private readonly _path;
        private _component;
        private _selectedText;
        private _prompt;
        private _aiResponseContent;
        constructor(quill: Quill, options: {
            path: string;
        });
        private _initComponent;
        private _attachEvents;
        private _latestContent;
        processAIRequest(): Promise<void>;
        private _createTooltipComponent;
        private _createPanelComponent;
        private _replaceTooltip;
        private _onDocumentClick;
        private _updateFromEditor;
        private _positionComponent;
        private _setPanelPosition;
        resetComponent(): void;
        private _show;
        private _hide;
        private _onEscapeKey;
        private _attachPanelEvents;
        private _clickPreDefinedEvent;
        private _enterCustomPrompt;
    }
    export default QuillAI;
}
declare module "components/editor/modules/time-tracking/time-tracking" {
    import type Quill from 'quill';
    interface TimeTrackingOptions {
        startTimeInput?: HTMLInputElement;
        openTimeInput?: HTMLInputElement;
    }
    export default class TimeTracking {
        private _quill;
        private _options;
        private _startTime;
        private _openTime;
        constructor(quill: Quill, options: TimeTrackingOptions);
        private _updateOpenTime;
        private _updateStartTime;
    }
}
declare module "components/editor/modules/events/zn-editor-insert" {
    export type ZnEditorInsertEvent = CustomEvent<{
        mode: 'insert' | 'replace';
        text?: string;
        html?: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-editor-insert': ZnEditorInsertEvent;
        }
    }
}
declare module "components/editor/editor.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { Store } from "internal/storage";
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    export interface EditorFeatureConfig {
        codeBlocksEnabled?: boolean;
        dividersEnabled?: boolean;
        linksEnabled?: boolean;
        attachmentsEnabled?: boolean;
        imagesEnabled?: boolean;
        videosEnabled?: boolean;
        datesEnabled?: boolean;
        emojisEnabled?: boolean;
        codeEnabled?: boolean;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/editor
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnEditor extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private formControlController;
        private editor;
        private editorHtml;
        private toolbar;
        id: string;
        name: string;
        value: string;
        interactionType: 'ticket' | 'chat';
        uploadAttachmentUrl: string;
        codeBlocksEnabled: boolean;
        dividersEnabled: boolean;
        linksEnabled: boolean;
        attachmentsEnabled: boolean;
        imagesEnabled: boolean;
        videosEnabled: boolean;
        datesEnabled: boolean;
        emojisEnabled: boolean;
        codeEnabled: boolean;
        aiEnabled: boolean;
        aiPath: string;
        /**
         * Caches unsent content while typing and restores it when the editor next loads,
         * so agent replies in tickets/chats survive reloads and navigation. Use a key
         * unique to the conversation (e.g. the ticket ID). The cache is cleared on submit.
         */
        storeKey: string;
        /** Cached-content expiry in seconds. Defaults to 1 day. */
        storeTtl: number;
        /** Cache to localStorage instead of sessionStorage, persisting across tabs and browser restarts. */
        localStorage: boolean;
        protected _store: Store;
        private quillElement;
        private _content;
        private _selectionRange;
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private _handleTextChange;
        private _isEmpty;
        private _cacheContent;
        private _clearCachedContent;
        private _getQuillKeyboardBindings;
        private _handleEditorChange;
        private _handleEditorInsert;
        private _insertHtml;
        private _replaceTextAtSelection;
        private _insertTextAtSelection;
        private _closePopups;
        private _closeAiPanel;
        private _closeDialog;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/editor/index" {
    import ZnEditor from "components/editor/editor.component";
    export * from "components/editor/editor.component";
    export default ZnEditor;
    global {
        interface HTMLElementTagNameMap {
            'zn-editor': ZnEditor;
        }
    }
}
declare module "components/checkbox/checkbox.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import type { ZincFormControl } from "internal/zinc-element";
    type ColorOption = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent';
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/checkbox
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The checkbox's label.
     * @slot description - A description of the checkbox's label. Serves as help text for a checkbox item. Alternatively, you can use the `description` attribute.
     * @slot selected-content - Use to nest rich content (like an input) inside a selected checkbox item. Use only with the contained style.
     *
     * @event zn-blur - Emitted when the checkbox loses focus.
     * @event zn-change - Emitted when the checked state changes.
     * @event zn-focus - Emitted when the checkbox gains focus.
     * @event zn-input - Emitted when the checkbox receives input.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @csspart base - The component's base wrapper.
     * @csspart control - The square container that wraps the checkbox's checked state.
     * @csspart control--checked - Matches the control part when the checkbox is checked.
     * @csspart control--indeterminate - Matches the control part when the checkbox is indeterminate.
     * @csspart checked-icon - The checked icon, an `<zn-icon>` element.
     * @csspart unchecked-icon - The unchecked icon, an `<zn-icon>` element.
     * @csspart indeterminate-icon - The indeterminate icon, an `<zn-icon>` element.
     * @csspart label - The container that wraps the checkbox's label.
     * @csspart description - The container that wraps the checkbox's description.
     * @csspart selected-content - The container that wraps optional content that appears when a checkbox is checked.
     */
    export default class ZnCheckbox extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        input: HTMLInputElement;
        private hasFocus;
        title: string;
        /** The name of the checkbox, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the checkbox, submitted as a name/value pair with form data. */
        value: string;
        /** The unchecked value of the checkbox, submitted as a name/value pair with form data. */
        uncheckedValue: string;
        /** The checkbox's size. */
        size: 'small' | 'medium' | 'large';
        /** Disables the checkbox. */
        disabled: boolean;
        /** Draws the checkbox in a checked state. */
        checked: boolean;
        /**
         * Draws the checkbox in an indeterminate state. This is usually applied to checkboxes that represents a "select
         * all/none" behavior when associated checkboxes have a mix of checked and unchecked states.
         */
        indeterminate: boolean;
        /** Draws a container around the checkbox. */
        contained: boolean;
        /** Removes a container around the checkbox. */
        borderless: boolean;
        /** Applies styles relevant to checkboxes in a horizontal layout. */
        horizontal: boolean;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultChecked: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        /** Makes the checkbox a required field. */
        required: boolean;
        /** Submits the form when checkbox is clicked. */
        submitOnClick: boolean;
        /** The checkbox's help text. If you need to display HTML, use the `description` slot instead. */
        description: string;
        label: string;
        labelTooltip: string;
        /** The icon to show when the checkbox is checked. */
        checkedIcon: string;
        /** The icon to show when the checkbox is unchecked. */
        uncheckedIcon: string;
        /** The color of the checkbox. */
        color: ColorOption;
        /** The color of the checkbox when checked. Overrides `color`. */
        checkedColor: ColorOption;
        /** The color of the checkbox when unchecked. Overrides `color`. */
        uncheckedColor: ColorOption;
        /** Gets the validity state object */
        get validity(): ValidityState;
        get isChecked(): boolean;
        /** Gets the validation message */
        get validationMessage(): string;
        firstUpdated(): void;
        private handleClick;
        private handleBlur;
        private handleInput;
        private handleInvalid;
        private handleFocus;
        private handleSelectedContentClick;
        handleDisabledChange(): void;
        handleStateChange(): void;
        /** Simulates a click on the checkbox. */
        click(): void;
        /** Sets focus on the checkbox. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the checkbox. */
        blur(): void;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /**
         * Sets a custom validation message. The value provided will be shown to the user when the form is submitted. To clear
         * the custom validation message, call this method with an empty string.
         */
        setCustomValidity(message: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/checkbox/index" {
    import ZnCheckbox from "components/checkbox/checkbox.component";
    export * from "components/checkbox/checkbox.component";
    export default ZnCheckbox;
    global {
        interface HTMLElementTagNameMap {
            'zn-checkbox': ZnCheckbox;
        }
    }
}
declare module "components/form-group/form-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/form-group
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot.
     *
     */
    export default class ZnFormGroup extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        /**
         * The form group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
         * instead.
         */
        label: string;
        /**
         * Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
         * `label-tooltip` slot instead.
         */
        labelTooltip: string;
        /** The form groups help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        forceCols: boolean;
        layout: string;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/form-group/index" {
    import ZnFormGroup from "components/form-group/form-group.component";
    export * from "components/form-group/form-group.component";
    export default ZnFormGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-form-group': ZnFormGroup;
        }
    }
}
declare module "components/input-group/input-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary A wrapper component that groups inputs and selects visually.
     * @documentation https://zinc.style/components/input-group
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot for inputs and selects.
     * @slot label - The input group's label. Alternatively, you can use the `label` attribute.
     *
     * @csspart base - The component's base wrapper.
     * @csspart form-control - The form control wrapper.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The input group container.
     */
    export default class ZnInputGroup extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        defaultSlot: HTMLSlotElement;
        /** The input group's label. If you need to display HTML, use the `label` slot. */
        label: string;
        /** Adds a gap between the grouped elements, preserving individual border radii. Use `sm`, `md`, or `lg`. */
        gap: 'sm' | 'md' | 'lg';
        private handleSlotChange;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/input-group/index" {
    import ZnInputGroup from "components/input-group/input-group.component";
    export * from "components/input-group/input-group.component";
    export default ZnInputGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-input-group': ZnInputGroup;
        }
    }
}
declare module "components/linked-select/linked-select.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnSelect from "components/select/index";
    import type { ZincFormControl } from "internal/zinc-element";
    import type { ZnSelectEvent } from "events/zn-select";
    interface linkedSelectOption {
        [key: string]: string;
    }
    interface linkedSelectOptions {
        [key: string]: linkedSelectOption[];
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/linked-select
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnLinkedSelect extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        name: string;
        value: string;
        checked: boolean;
        options: linkedSelectOptions;
        linkedSelect: string;
        cacheKey: string;
        label: string;
        input: ZnSelect;
        private linkedSelectElement;
        private readonly formControlController;
        get displayLabel(): string;
        get validity(): ValidityState;
        get validationMessage(): string;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        disconnectedCallback(): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        handleLinkedSelectChange: () => void;
        handleChange(e: Event): void;
        handleSelectChange: (e: ZnSelectEvent) => void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/linked-select/index" {
    import ZnLinkedSelect from "components/linked-select/linked-select.component";
    export * from "components/linked-select/linked-select.component";
    export default ZnLinkedSelect;
    global {
        interface HTMLElementTagNameMap {
            'zn-linked-select': ZnLinkedSelect;
        }
    }
}
declare module "components/radio/radio.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/radio
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The radio's label.
     * @slot description - A description of the radio's label. Serves as help text for a radio item. Alternatively, you can use the `description` attribute.
     * @slot selected-content - Use to nest rich content (like an input) inside a selected radio item. Use only with the contained style.
     *
     * @event zn-blur - Emitted when the radio loses focus.
     * @event zn-change - Emitted when the checked state changes.
     * @event zn-focus - Emitted when the radio gains focus.
     * @event zn-input - Emitted when the radio receives input.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @csspart base - The component's base wrapper.
     * @csspart control - The square container that wraps the radio's checked state.
     * @csspart control--checked - Matches the control part when the radio is checked.
     * @csspart checked-icon - The checked icon, an `<zn-icon>` element.
     * @csspart label - The container that wraps the radio's label.
     * @csspart description - The container that wraps the radio's description.
     * @csspart selected-content - The container that wraps optional content that appears when a radio is checked.
     */
    export default class ZnRadio extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        input: HTMLInputElement;
        private hasFocus;
        title: string;
        /** The name of the radio, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the radio, submitted as a name/value pair with form data. */
        value: string;
        /** The radio's size. */
        size: 'small' | 'medium' | 'large';
        /** Disables the radio. */
        disabled: boolean;
        /** Draws the radio in a checked state. */
        checked: boolean;
        /** Draws a container around the radio. */
        contained: boolean;
        /** Applies styles relevant to radios in a horizontal layout. */
        horizontal: boolean;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultChecked: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        /** Makes the radio a required field. */
        required: boolean;
        /** The radio's help text. If you need to display HTML, use the `description` slot instead. */
        description: string;
        label: string;
        labelTooltip: string;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        firstUpdated(): void;
        private handleClick;
        private handleBlur;
        private handleInput;
        private handleInvalid;
        private handleFocus;
        private handleSelectedContentClick;
        handleDisabledChange(): void;
        handleStateChange(): void;
        /** Simulates a click on the radio. */
        click(): void;
        /** Sets focus on the radio. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the radio. */
        blur(): void;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /**
         * Sets a custom validation message. The value provided will be shown to the user when the form is submitted. To clear
         * the custom validation message, call this method with an empty string.
         */
        setCustomValidity(message: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/radio/index" {
    import ZnRadio from "components/radio/radio.component";
    export * from "components/radio/radio.component";
    export default ZnRadio;
    global {
        interface HTMLElementTagNameMap {
            'zn-radio': ZnRadio;
        }
    }
}
declare module "components/rating/rating.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/rating
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnRating extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        rating: HTMLElement;
        private hoverValue;
        private isHovering;
        label: string;
        name: string;
        value: number;
        max: number;
        precision: number;
        readonly: boolean;
        disabled: boolean;
        size: 'small' | 'medium' | 'large';
        getSymbol: (value: number) => string;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(): void;
        private _roundToPrecision;
        private _getValueFromXCoordinate;
        private _getValueFromMousePosition;
        private _getValueFromTouchPosition;
        private _setValue;
        private _handleClick;
        private _handleMouseEnter;
        private _handleMouseMove;
        private _handleMouseLeave;
        private _handleTouchStart;
        private _handleTouchMove;
        private _handleTouchEnd;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/rating/index" {
    import ZnRating from "components/rating/rating.component";
    export * from "components/rating/rating.component";
    export default ZnRating;
    global {
        interface HTMLElementTagNameMap {
            'zn-rating': ZnRating;
        }
    }
}
declare module "components/radio-group/radio-group.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { FormControlController } from "internal/form";
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/radio-group
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnRadioGroup extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        protected readonly formControlController: FormControlController;
        private readonly hasSlotController;
        private customValidityMessage;
        private validationTimeout;
        defaultSlot: HTMLSlotElement;
        validationInput: HTMLInputElement;
        private errorMessage;
        defaultValue: string;
        /**
         * The radio group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
         * instead.
         */
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
        labelTooltip: string;
        /** The radio groups' help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /** The name of the radio group, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the radio group, submitted as a name/value pair with form data. */
        value: string;
        /** The radio group's size. This size will be applied to all child radios */
        size: 'small' | 'medium' | 'large';
        /** The checkbox group's orientation. Changes the group's layout from the default (vertical) to horizontal. */
        horizontal: boolean;
        /** The checkbox group's style. Changes the group's style from the default (plain) style to the 'contained' style. This style will be applied to all child checkboxes. */
        contained: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        /** Ensures a child radio is checked before allowing the containing form to submit. */
        required: boolean;
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private getAllRadios;
        private handleRadioClick;
        private handleKeyDown;
        private handleLabelClick;
        private handleInvalid;
        private syncRadioElements;
        private syncRadios;
        private updateCheckedRadio;
        handleSizeChange(): void;
        handleValueChange(): void;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message?: string): void;
        focus(options?: FocusOptions): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/radio-group/index" {
    import ZnRadioGroup from "components/radio-group/radio-group.component";
    export * from "components/radio-group/radio-group.component";
    export default ZnRadioGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-radio-group': ZnRadioGroup;
        }
    }
}
declare module "components/file/file.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { type ZincFormControl } from "internal/zinc-element";
    import ZnDialog from "components/dialog/index";
    import type ZnButton from "components/button/index";
    /**
     * @summary File controls allow selecting an arbitrary number of files for uploading.
     * @documentation https://zinc.style/components/drag-upload
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     * @dependency zn-dialog
     *
     * @slot label - The file control's label. Alternatively, you can use the `label` attribute.
     * @slot help-text - Text that describes how to use the file control.
     *    Alternatively, you can use the `help-text` attribute.
     * @slot trigger - Optional content to be used as trigger instead of the default content.
     *    Opening the file dialog on click and as well as drag and drop will work for this content.
     *    Following attributes will no longer work: *label*, *droparea*, *help-text*, *size*,
     *    *hide-value*. Also if using the disabled attribute, the disabled styling will not be
     *    applied and must be taken care of yourself.
     *
     * @event zn-blur - Emitted when the control loses focus.
     * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
     * @event zn-clear - Emitted when the user confirms clearing the selected file or `src`.
     * @event zn-error - Emitted when multiple files are selected via drag and drop, without
     * the `multiple` property being set.
     * @event zn-focus - Emitted when the control gains focus.
     * @event zn-input - Emitted when the control receives input.
     *
     * @csspart form-control - The form control that wraps the label, input, and help text.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The input's wrapper.
     * @csspart form-control-help-text - The help text's wrapper.
     * @csspart button-wrapper - The wrapper around the button and text value.
     * @csspart button - The zn-button acting as a file input.
     * @csspart button__base - The zn-button's exported `base` part.
     * @csspart value - The chosen files or placeholder text for the file input.
     * @csspart droparea - The element wrapping the drop zone.
     * @csspart droparea-background - The background of the drop zone.
     * @csspart upload - The upload button shown in the droparea when no file is selected.
     * @csspart preview - The image preview rendered in the droparea for previewable files.
     * @csspart filename - The filename label rendered in the droparea for non-previewable files.
     * @csspart clear - The clear button rendered in the droparea when a file is present.
     * @csspart clear-confirm - The confirmation dialog shown before clearing the file.
     * @csspart link - The current link anchor rendered when `show-link` is enabled.
     * @csspart trigger - The container that wraps the trigger.
     *
     * @animation file.iconDrop - The animation to use for the file icon
     * when a file is dropped
     * @animation file.text.disappear - The disappear animation to use for the file placeholder text
     * when a file is dropped
     * @animation file.text.appear - The appear animation to use for the file placeholder text
     * when a file is dropped
     */
    export default class ZnFile extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-dialog': typeof ZnDialog;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        private readonly localize;
        private userIsDragging;
        private fileObjectUrl;
        input: HTMLInputElement;
        button: ZnButton;
        dropareaWrapper: HTMLDivElement;
        dropareaIcon: HTMLSpanElement;
        inputChosen: HTMLSpanElement;
        clearConfirmDialog: HTMLElement & {
            show: () => void;
            hide: () => void;
        };
        /**
         * The selected files as a FileList object containing a list of File objects.
         * The FileList behaves like an array, so you can get the number of selected files
         * via its length property.
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#getting_information_on_selected_files)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#getting_information_on_selected_files
         */
        set files(v: FileList | null);
        get files(): FileList | null;
        /** The name of the file control, submitted as a name/value pair with form data. */
        name: string;
        /**
         * The current value of the input, submitted as a name/value pair with form data.
         * Beware that the only valid value when setting a file input is an empty string!
         */
        /**
         * The value of the file control contains a string that represents the path of the selected file.
         * If multiple files are selected, the value represents the first file in the list.
         * If no file is selected, the value is an empty string.
         * Beware that the only valid value when setting a file control is an empty string!
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#value)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#value
         */
        set value(v: string);
        get value(): string;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string;
        /** The file control's size. */
        size: 'small' | 'medium' | 'large';
        /** The file control's label. If you need to display HTML, use the `label` slot instead. */
        label: string;
        /** If this is set, then the only way to remove files is to click the cross next to them. */
        clearable: boolean;
        /**
         * The file control's help text.
         * If you need to display HTML, use the `help-text` slot instead.
         */
        helpText: string;
        /** Disables the file control. */
        disabled: boolean;
        /** Draw the file control as a drop area */
        droparea: boolean;
        /**
         * Comma separated list of supported file types
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
         * @example <zn-file accept=".jpg,.jpeg,.png,.gif,text/plain,image/*"></zn-file>
         */
        accept: string;
        /**
         * Specifies the types of files that the server accepts.
         * Can be set either to user or environment.
         * Works only when not using a droparea!
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
         */
        capture: 'user' | 'environment';
        /**
         * Indicates whether the user can select more than one file.
         * Has no effect if webkitdirectory is set.
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple
         */
        multiple: boolean;
        /**
         * Indicates that the file control should let the user select directories instead of files.
         * When a directory is selected, the directory and its entire hierarchy of contents are included
         * in the set of selected items.
         * Note: This is a non-standard attribute but is supported in the major browsers.
         * [see MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
         */
        webkitdirectory: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element.
         * This attribute allows you to place the form control outside of a form and associate it
         * with the form that has this `id`. The form must be in the same document
         * or shadow root for this to work.
         */
        form: string;
        /** Makes the input a required field. */
        required: boolean;
        /** Suppress the value from being displayed in the file control */
        hideValue: boolean;
        /**
         * URL of an already-uploaded file (e.g., from a CDN) to display as the current value
         * when no file has been selected locally. If the URL points to an image, it is rendered
         * as a preview inside the droparea. Otherwise the URL is shown as a filename.
         */
        src: string;
        /**
         * When enabled, automatically submit the surrounding form whenever the value changes
         * (file selected, dropped, or cleared). Useful for forms that only contain this control
         * and a CSRF token.
         */
        triggerSubmit: boolean;
        /**
         * When enabled, render the current link (`previewSrc`) as a clickable URL below the control.
         * Useful for showing the existing CDN link alongside the preview.
         */
        showLink: boolean;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        /**
         * Checks for validity but does not show a validation message.
         * Returns `true` when valid and `false` when invalid.
         */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message: string): void;
        handleDisabledChange(): void;
        handleValueChange(): Promise<void>;
        /** Sets focus on the button or droparea. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the button or droparea. */
        blur(): void;
        private handleInvalid;
        private handleFiles;
        private handleTransferItems;
        private getFilesFromEntry;
        private handleClick;
        /** Handles the change event of the native input */
        private handleChange;
        private handleDragOver;
        private handleDragLeave;
        private handleDrop;
        /**
         * Handle the focus of the droparea and emit focus event
         */
        private handleFocus;
        /**
         * Handle the blur of the droparea and emit blur event
         */
        private handleBlur;
        /**
         * Remove a file from the list of files
         */
        private removeFile;
        /** Open the confirm dialog before clearing. */
        private handleClearClick;
        /** Clear the current value after the user confirms. */
        private confirmClear;
        private updatePreview;
        /**
         * Returns the URL currently shown in the droparea — the locally-selected file's object URL
         * if a file is selected, otherwise the externally supplied `src`. Useful for getting the
         * current CDN link to submit alongside form data.
         */
        get previewSrc(): string;
        disconnectedCallback(): void;
        private renderFileValueWithDelete;
        private renderDroparea;
        private renderButton;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/file/index" {
    import ZnFile from "components/file/file.component";
    export * from "components/file/file.component";
    export default ZnFile;
    global {
        interface HTMLElementTagNameMap {
            'zn-file': ZnFile;
        }
    }
}
declare module "components/checkbox-group/checkbox-group.component" {
    import { type CSSResultGroup } from 'lit';
    import { FormControlController } from "internal/form";
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Shotrt summary of the component's intended use.
     * @documentation https://zinc.style/components/checkbox-group
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot where `<zn-checkbox>` elements are placed.
     * @slot label - The checkbox group's label. Required for proper accessibility. Alternatively, you can use the `label` attribute.
     * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
     * @slot help-text - Text that describes how to use the checkbox group. Alternatively, you can use the `help-text` attribute.
     *
     * @event zn-change - Emitted when the checkbox group's selected value changes.
     * @event zn-input - Emitted when the checkbox group receives user input.
     * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
     *
     * @csspart form-control - The form control that wraps the label, input, and help text.
     * @csspart form-control-label - The label's wrapper.
     * @csspart form-control-input - The input's wrapper.
     * @csspart form-control-help-text - The help text's wrapper.
     */
    export default class ZnCheckboxGroup extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        protected readonly formControlController: FormControlController;
        private readonly hasSlotController;
        private customValidityMessage;
        private validationTimeout;
        defaultSlot: HTMLSlotElement;
        validationInput: HTMLInputElement;
        private errorMessage;
        /**
         * The checkbox group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot instead. */
        label: string;
        /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
        labelTooltip: string;
        /** The checkbox groups's help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /** The name of the checkbox group, submitted as a name/value pair with form data. */
        name: string;
        /**
         * The current value of the checkbox group, submitted as a name/value pair with form data.
         */
        value: string[];
        /** The checkbox group's size. This size will be applied to all child checkboxes. */
        size: 'small' | 'medium' | 'large';
        /** The checkbox group's orientation. Changes the group's layout from the default (vertical) to horizontal. */
        horizontal: boolean;
        /** The checkbox group's style. Changes the group's style from the default (plain) style to the 'contained' style. This style will be applied to all child checkboxes. */
        contained: boolean;
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
         * the same document or shadow root for this to work.
         */
        form: string;
        /** Ensures at least one child checkbox is checked before allowing the containing form to submit. */
        required: boolean;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        connectedCallback(): void;
        firstUpdated(): void;
        private getAllCheckboxes;
        private handleCheckboxClick;
        private handleInvalid;
        private syncCheckboxElements;
        private syncCheckboxes;
        private updateCheckboxValidity;
        private getValueFromCheckboxes;
        private addEventListenerToCheckboxes;
        handleSizeChange(): void;
        handleValueChange(): void;
        /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(message?: string): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/checkbox-group/index" {
    import ZnCheckboxGroup from "components/checkbox-group/checkbox-group.component";
    export * from "components/checkbox-group/checkbox-group.component";
    export default ZnCheckboxGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-checkbox-group': ZnCheckboxGroup;
        }
    }
}
declare module "components/item/item.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnTooltip from "components/tooltip/index";
    /**
     * @summary Used for listing items in a description list. Caption on the right, content on the left.
     * @documentation https://zinc.style/components/item
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-tooltip
     *
     * @slot - The default slot. Can either be slotted or use the value attribute
     * @slot actions - Used for adding actions to a zn-item.
     *
     * @csspart base - The items base wrapper
     * @csspart caption - The items caption
     * @csspart icon - The items icon
     */
    export default class ZnItem extends ZincElement {
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-tooltip': typeof ZnTooltip;
        };
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        stacked: boolean;
        size: 'small' | 'medium' | 'large';
        editOnHover: boolean;
        helpTooltip: string;
        icon: string;
        value: string;
        inline: boolean;
        grid: boolean;
        noPadding: boolean;
        flush: boolean;
        alignEnd: boolean;
        alignCenter: boolean;
        connectedCallback(): void;
        protected updated(_changedProperties: PropertyValues): void;
        protected _hasContent(): boolean;
        protected _hasRequiredSlot(): boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/item/index" {
    import ZnItem from "components/item/item.component";
    export * from "components/item/item.component";
    export default ZnItem;
    global {
        interface HTMLElementTagNameMap {
            'zn-item': ZnItem;
        }
    }
}
declare module "components/button-menu/button-menu.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type ZnButton from "components/button/index";
    interface CustomButtonWidths {
        button: ZnButton;
        width: number;
    }
    /**
     * @summary Automatically hides buttons in a menu when the screen is too small.
     * @documentation https://zinc.style/components/button-menu
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot.
     *
     */
    export default class ZnButtonMenu extends ZincElement {
        static styles: CSSResultGroup;
        maxWidth: number;
        containerWidth: number;
        limit: number;
        maxLevel: number;
        iconSize: number;
        noGap: boolean;
        noPadding: boolean;
        private _buttons;
        private _originalButtons;
        private _resizeRafId;
        private readonly resizeObserver;
        protected firstUpdated(_changedProperties: PropertyValues): Promise<void>;
        watchContainerMaxWidth(): void;
        connectedCallback(): void;
        calculateVisibleButtons(): void;
        calculateMenuButtons(totalButtons: number, visibleButtons: number, buttons: CustomButtonWidths[]): void;
        private getButtonLabel;
        render(): import("lit-html").TemplateResult<1>;
        addButton(button: ZnButton): void;
        setDynamicButtons(btns: NodeListOf<ZnButton>): void;
        removeButton(id: string): void;
        removeAllButtons(): void;
    }
}
declare module "components/button-menu/index" {
    import ZnButtonMenu from "components/button-menu/button-menu.component";
    export * from "components/button-menu/button-menu.component";
    export default ZnButtonMenu;
    global {
        interface HTMLElementTagNameMap {
            'zn-button-menu': ZnButtonMenu;
        }
    }
}
declare module "components/slideout/slideout.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/slideout
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     *
     * @event zn-show - Emitted when the slideout is opens.
     * @event zn-close - Emitted when the slideout is closed.
     * @event {{ source: 'close-button' | 'keyboard' | 'overlay' }} zn-request-close - Emitted when the user attempts to
     * close the slideout by clicking the close button, clicking the overlay, or pressing escape. Calling
     * `event.preventDefault()` will keep the slideout open. Avoid using this unless closing the slideout will result in
     * destructive behavior such as data loss.
     *
     * @slot - The default slot.
     * @slot label - The slideout's label. Alternatively you can use the `label` attribute.
     *
     * @csspart base - The component's base wrapper.
     * @csspart header - The slideout's header. This element wraps the title and header actions.
     * @csspart close-button - The slideout's close button.
     * @csspart close-button__base - The close buttons exported `base` part.
     * @csspart body - The slideout's body.
     *
     * @cssproperty --width - The preferred width of the slideout. Note the slideout will shrink to accommodate smaller screens.
     * @cssproperty --header-spacing - The amount of padding to use for the header.
     * @cssproperty --body-spacing - The amount of padding to use for the body.
     */
    export default class ZnSlideout extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
        };
        private readonly localize;
        private closeWatcher;
        slideout: HTMLDialogElement;
        panel: HTMLElement;
        overlay: HTMLElement;
        /**
         * Indicated whether of not the slideout is open. You can toggle this attribute to show and hide the slideout, or you can
         * use the `show()` and `hide()` methods and this attribute will reflect the slideout's state.
         */
        open: boolean;
        /**
         * The slideout's label as displayed in the header. You should always include a relevant label even when using
         * `no-header`, as it is required for proper accessibility. If you need to display HTML, use the `label` slot instead.
         */
        label: string;
        /**
         * The slideout's trigger element. This is used to open the slideout when clicked. If you do not provide a trigger, you
         * will need to manually open the slideout using the `show()` method.
         */
        trigger: string;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private requestClose;
        private addOpenListeners;
        private removeOpenListeners;
        /** Shows the slideout. */
        show(): Promise<void>;
        /** Hides the slideout. */
        hide(): Promise<void>;
        private closeClickHandler;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/slideout/index" {
    import ZnSlideout from "components/slideout/slideout.component";
    export * from "components/slideout/slideout.component";
    export default ZnSlideout;
    global {
        interface HTMLElementTagNameMap {
            'zn-slideout': ZnSlideout;
        }
    }
}
declare module "components/data-table-sort/data-table-sort.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/data-table-sort
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnDataTableSort extends ZincElement {
        static styles: CSSResultGroup;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/data-table-sort/index" {
    import ZnDataTableSort from "components/data-table-sort/data-table-sort.component";
    export * from "components/data-table-sort/data-table-sort.component";
    export default ZnDataTableSort;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-table-sort': ZnDataTableSort;
        }
    }
}
declare module "components/action-bar/action-bar.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/action-bar
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnActionBar extends ZincElement {
        static styles: CSSResultGroup;
        private readonly localize;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/action-bar/index" {
    import ZnActionBar from "components/action-bar/action-bar.component";
    export * from "components/action-bar/action-bar.component";
    export default ZnActionBar;
    global {
        interface HTMLElementTagNameMap {
            'zn-action-bar': ZnActionBar;
        }
    }
}
declare module "components/page-nav/page-nav.component" {
    import { type CSSResultGroup } from 'lit';
    import ZnTabs from "components/tabs/index";
    interface PageNavData {
        data: PageNavigation[];
    }
    interface PageNavigation {
        title: string;
        items: PageNavigationItem[];
    }
    interface PageNavigationItem {
        icon?: string;
        label: string;
        uri: string;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/page-nav
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnPageNav extends ZnTabs {
        static styles: CSSResultGroup;
        navigation: PageNavData;
        breadcrumb: string;
        toggleNavigation(): void;
        setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab?: string | null): void;
        clickTab(target: HTMLElement, refresh: boolean, close?: boolean): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/page-nav/index" {
    import ZnPageNav from "components/page-nav/page-nav.component";
    export * from "components/page-nav/page-nav.component";
    export default ZnPageNav;
    global {
        interface HTMLElementTagNameMap {
            'zn-page-nav': ZnPageNav;
        }
    }
}
declare module "components/status-indicator/status-indicator.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Circular status indicators.
     * @documentation https://zinc.style/components/status-indicator
     * @status experimental
     * @since 1.0
     */
    export default class ZnStatusIndicator extends ZincElement {
        static styles: CSSResultGroup;
        type: 'success' | 'error' | 'warning' | 'info' | 'disabled';
        /**
         * A secondary status type. When set, the indicator animates between `type`
         * and this colour to represent a status transitioning between two states
         * (e.g. `warning` and `disabled`).
         */
        altType?: 'success' | 'error' | 'warning' | 'info' | 'disabled';
        /** Animates a throbbing glow effect around the indicator. */
        glow: boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/status-indicator/index" {
    import ZnStatusIndicator from "components/status-indicator/status-indicator.component";
    export * from "components/status-indicator/status-indicator.component";
    export default ZnStatusIndicator;
    global {
        interface HTMLElementTagNameMap {
            'zn-status-indicator': ZnStatusIndicator;
        }
    }
}
declare module "components/split-button/split-button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type { ZincFormControl } from "internal/zinc-element";
    import type { ZnMenuSelectEvent } from "events/zn-menu-select";
    import type ZnButton from "components/button/index";
    import type ZnDropdown from "components/dropdown/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/split-button
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnSplitButton extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        caption: string;
        href: string;
        name: string;
        value: string;
        defaultValue: string;
        type: string;
        dropdown: ZnDropdown;
        button: ZnButton;
        connectedCallback(): void;
        disconnectedCallback(): void;
        handleMenuItemClick(e: ZnMenuSelectEvent): void;
        handleTriggerClick(): void;
        render(): import("lit-html").TemplateResult<1>;
        private renderTriggerSlot;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        get validity(): ValidityState;
        get validationMessage(): string;
        private _isButton;
    }
}
declare module "components/split-button/index" {
    import ZnSplitButton from "components/split-button/split-button.component";
    export * from "components/split-button/split-button.component";
    export default ZnSplitButton;
    global {
        interface HTMLElementTagNameMap {
            'zn-split-button': ZnSplitButton;
        }
    }
}
declare module "components/content-block/content-block.component" {
    import ZincElement from "internal/zinc-element";
    import type { PropertyValues } from 'lit';
    interface TextRow {
        lines: string[];
        type: 'reply' | 'text';
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/content-block
     * @status experimental
     * @since 1.0
     *
     * @slot attachments - Attachments displayed at the bottom of the content when the block is
     * expanded. Use `zn-chat-message-attachment`, which auto-assigns itself to this slot.
     *
     * @csspart attachments - The attachments row at the bottom of the content.
     * @csspart header-attachments - The attachment count indicator in the header.
     */
    export default class ContentBlock extends ZincElement {
        static styles: import("lit").CSSResult;
        time: string;
        sender: string;
        avatar: string;
        outbound: boolean;
        noCollapse: boolean;
        short: boolean;
        defaultDisplay: 'text' | 'html';
        htmlNodes: Node[];
        iframe: Promise<HTMLIFrameElement>;
        private readonly hasSlotController;
        private attachmentCount;
        private _textRows;
        private readonly _footerObserver;
        private _replaceDebounce;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _collapseContent;
        private _toggleText;
        private _toggleHtml;
        private _resizeIframe;
        private handleAttachmentsSlotChange;
        private syncAttachmentCount;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected render(): import("lit-html").TemplateResult<1>;
        protected truncateText(): string;
        private _handleSlotChange;
        private _debouncedReplace;
        private _replaceImagePlaceholders;
        protected getTextSections(): TextRow[];
        showReply(e: MouseEvent): void;
    }
}
declare module "components/content-block/index" {
    import ZnContentBlock from "components/content-block/content-block.component";
    export * from "components/content-block/content-block.component";
    export default ZnContentBlock;
    global {
        interface HTMLElementTagNameMap {
            'zn-content-block': ZnContentBlock;
        }
    }
}
declare module "components/filter-wrapper/filter-wrapper.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/filter-wrapper
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnFilterWrapper extends ZincElement {
        static styles: CSSResultGroup;
        button: string;
        private hasSubmitButton;
        handleSubmit: (event: Event) => void;
        connectedCallback(): void;
        private renderDefaultButton;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/filter-wrapper/index" {
    import ZnFilterWrapper from "components/filter-wrapper/filter-wrapper.component";
    export * from "components/filter-wrapper/filter-wrapper.component";
    export default ZnFilterWrapper;
    global {
        interface HTMLElementTagNameMap {
            'zn-filter-wrapper': ZnFilterWrapper;
        }
    }
}
declare module "components/settings-container/settings-container.component" {
    import { type CSSResultGroup } from 'lit';
    import { type ZnChangeEvent } from "events/zn-change";
    import ZincElement from "internal/zinc-element";
    interface SettingsContainerFilter {
        attribute: string;
        checked: boolean;
        label: string;
        itemSelector?: string;
        toggleAttribute?: string;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/settings-container
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-show - Emitted when the pull tab panel opens.
     * @event zn-hide - Emitted when the pull tab panel closes.
     *
     * @slot - The default slot.
     * @slot filter - Filter definitions used to toggle visibility of content.
     * @slot dropdown-content - Custom content for the settings panel.
     * @slot tab - Extra content rendered inside the pull tab next to the chevron.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnSettingsContainer extends ZincElement {
        static styles: CSSResultGroup;
        filters: SettingsContainerFilter[];
        position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
        storeKey: string;
        noScroll: boolean;
        pullTab: boolean;
        open: boolean;
        private panelExpanded;
        private readonly _mutationObserver;
        private _updateFiltersScheduled;
        private _store;
        private _hiddenElements;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private handleDocumentMouseDown;
        private togglePullTab;
        private hidePullTab;
        private handlePanelTransitionEnd;
        private scheduleUpdateFilters;
        private handleContentSlotChange;
        private handleFiltersSlotChange;
        private recomputeFiltersFromSlot;
        private updateSingleFilter;
        updateFilters(): void;
        updateFilter(e: ZnChangeEvent): void;
        render(): import("lit-html").TemplateResult<1>;
        private renderPullTab;
        private getDropdownContent;
    }
}
declare module "components/settings-container/index" {
    import ZnSettingsContainer from "components/settings-container/settings-container.component";
    export * from "components/settings-container/settings-container.component";
    export default ZnSettingsContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-settings-container': ZnSettingsContainer;
        }
    }
}
declare module "components/filter-container/filter-container.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/filter-container
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnFilterContainer extends ZincElement {
        static styles: CSSResultGroup;
        attr: string;
        handleSearchChange(event: Event): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/filter-container/index" {
    import ZnFilterContainer from "components/filter-container/filter-container.component";
    export * from "components/filter-container/filter-container.component";
    export default ZnFilterContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-filter-container': ZnFilterContainer;
        }
    }
}
declare module "components/reveal/reveal.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/reveal
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-example
     *
     * @event zn-event-name - Emitted as an example.
     *
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @usage
     * ```html
     * <zn-reveal duration="3000"
     *            initial="******@hotmail.com"
     *            revealed="john.doe@hotmail.com" toggle>
     * </zn-reveal>
     * ```
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnReveal extends ZincElement {
        static styles: CSSResultGroup;
        duration: number;
        initial: string;
        revealed: string;
        hideDelay: number;
        private _isRevealed;
        private _isToggled;
        private _hideTimer?;
        disconnectedCallback(): void;
        private _clearHideTimer;
        protected handleToggleReveal(): void;
        protected handleMouseEnter(): void;
        protected handleMouseLeave(): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/reveal/index" {
    import ZnReveal from "components/reveal/reveal.component";
    export * from "components/reveal/reveal.component";
    export default ZnReveal;
    global {
        interface HTMLElementTagNameMap {
            'zn-reveal': ZnReveal;
        }
    }
}
declare module "components/audio-select/audio-select.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type { ZnChangeEvent } from "events/zn-change";
    interface AudioFile {
        name: string;
        url: string;
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/audio-select
     * @status experimental
     * @since 1.0
     *
     * @slot - The default slot.
     * @slot actions - The actions slot.
     * @slot footer - The footer slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnAudioSelect extends ZincElement {
        static styles: CSSResultGroup;
        private _isPlaying;
        private readonly _audio;
        value: string;
        label: string;
        placeholder: string;
        files: AudioFile[];
        constructor();
        disconnectedCallback(): void;
        updated(changedProperties: PropertyValues): void;
        stopAudio(): void;
        handleSelectChange(e: ZnChangeEvent): void;
        togglePreview(e: CustomEvent): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/audio-select/index" {
    import ZnAudioSelect from "components/audio-select/audio-select.component";
    export * from "components/audio-select/audio-select.component";
    export default ZnAudioSelect;
    global {
        interface HTMLElementTagNameMap {
            'zn-audio-select': ZnAudioSelect;
        }
    }
}
declare module "components/translations/translations.component" {
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnButtonGroup from "components/button-group/index";
    import ZnDropdown from "components/dropdown/index";
    import ZnInlineEdit from "components/inline-edit/index";
    import ZnInput from "components/input/index";
    import ZnMenu from "components/menu/index";
    import type { PropertyValues } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    export default class ZnTranslations extends ZincElement implements ZincFormControl {
        static styles: import("lit").CSSResult;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-button-group': typeof ZnButtonGroup;
            'zn-dropdown': typeof ZnDropdown;
            'zn-inline-edit': typeof ZnInlineEdit;
            'zn-input': typeof ZnInput;
            'zn-menu': typeof ZnMenu;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        name: string;
        value: string;
        label: string;
        disabled: boolean;
        required: boolean;
        flush: boolean;
        inputType: 'select' | 'text' | 'number' | 'textarea';
        textareaRows: number | undefined;
        /** When true, hides the individual language navbar and defers language control to a parent zn-translation-group. */
        grouped: boolean;
        languages: Record<string, string>;
        values: Record<string, string>;
        private _activeLanguage;
        private _overflowIndex;
        private _lastObservedWidth;
        private _measureRafId;
        constructor();
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(): void;
        /** Sets the active language externally. Used by zn-translation-group. */
        setActiveLanguage(language: string): void;
        /** Returns the currently active language. */
        getActiveLanguage(): string;
        /** Adds a language key to this component's values if not already present. Used by zn-translation-group. */
        addLanguageKey(languageCode: string): void;
        /** Returns all language codes that have values. */
        getValueLanguages(): string[];
        disconnectedCallback(): void;
        protected firstUpdated(): void;
        protected updated(changedProperties: PropertyValues): void;
        private _scheduleLangOverflow;
        private _computeLangOverflow;
        willUpdate(changedProperties: PropertyValues): void;
        private handleLanguageAdd;
        private handleOverflowSelect;
        private switchLanguage;
        private handleValueUpdate;
        private updateValue;
        private handleKeyDown;
        private handleSubmit;
        private isRTLLanguage;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/translations/index" {
    import ZnTranslations from "components/translations/translations.component";
    export * from "components/translations/translations.component";
    export default ZnTranslations;
}
declare module "components/key/key.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary A legend key item, typically used alongside charts to label and toggle visibility of data series by category.
     * @documentation https://zinc.style/components/key
     * @status experimental
     * @since 1.0
     *
     * @slot - The description of the key.
     */
    export default class ZnKey extends ZincElement {
        static styles: CSSResultGroup;
        icon: string;
        attribute: string;
        value: string;
        color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
        active: boolean;
        iconSize: number;
        private _handleClick;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/key/index" {
    import ZnKey from "components/key/key.component";
    export * from "components/key/key.component";
    export default ZnKey;
    global {
        interface HTMLElementTagNameMap {
            'zn-key': ZnKey;
        }
    }
}
declare module "components/key-container/key-container.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary A legend container that manages key items, typically used alongside charts to toggle visibility of data series by category.
     * @documentation https://zinc.style/components/key-container
     * @status experimental
     * @since 1.0
     *
     * @slot - The content to be filtered.
     * @slot keys - The key items (zn-key) that define the filters.
     *
     * @event zn-change - Emitted when the set of active keys changes.
     */
    export default class ZnKeyContainer extends ZincElement {
        static styles: CSSResultGroup;
        keysSlot: HTMLSlotElement;
        defaultSlot: HTMLSlotElement;
        position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
        target: string;
        itemSelector: string;
        filterAttribute: string;
        noScroll: boolean;
        private _hiddenElements;
        private _targetElement;
        connectedCallback(): void;
        firstUpdated(): void;
        private _handleKeyChange;
        private getKeys;
        private updateFilters;
        private itemMatchesKey;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/key-container/index" {
    import ZnKeyContainer from "components/key-container/key-container.component";
    export * from "components/key-container/key-container.component";
    export default ZnKeyContainer;
    global {
        interface HTMLElementTagNameMap {
            'zn-key-container': ZnKeyContainer;
        }
    }
}
declare module "components/animated-button/animated-button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/icon.component";
    export default class ZnAnimatedButton extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        private currentState;
        private errorMessage;
        /** The text to display in the idle state */
        idleText: string;
        /** The text to display in the processing state */
        processingText: string;
        /** The text to display in the success state */
        successText: string;
        /** The text to display in the failure state */
        failureText: string;
        /** The URL to redirect to after successful purchase */
        redirectUrl: string;
        /** Delay in milliseconds before redirecting after success (default: 1500ms) */
        redirectDelay: number;
        /** Delay in milliseconds before resetting from failure state (default: 2000ms) */
        failureResetDelay: number;
        /** Disabled state */
        disabled: boolean;
        /** The name of the form control (required for form submission) */
        name: string;
        /** The value of the form control */
        value: string;
        private resetTimeout?;
        private redirectTimeout?;
        disconnectedCallback(): void;
        private clearTimeouts;
        /** Programmatically trigger the purchase flow */
        purchase(): void;
        /** Set the button to success state manually */
        setSuccess(): void;
        /** Set the button to failure state manually with optional error message */
        setFailure(message?: string): void;
        /** Reset the button to idle state */
        reset(): void;
        private handlePurchase;
        private scheduleRedirect;
        private scheduleReset;
        private handleClick;
        protected render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/animated-button/index" {
    import ZnAnimatedButton from "components/animated-button/animated-button.component";
    export * from "components/animated-button/animated-button.component";
    export default ZnAnimatedButton;
    global {
        interface HTMLElementTagNameMap {
            'zn-animated-button': ZnAnimatedButton;
        }
    }
}
declare module "components/translation-group/translation-group.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZnButton from "components/button/index";
    import ZnButtonGroup from "components/button-group/index";
    import ZnDropdown from "components/dropdown/index";
    import ZnHeader from "components/header/index";
    import ZnMenu from "components/menu/index";
    import ZnPanel from "components/panel/panel.component";
    /**
     * @summary A panel-styled container that provides a shared language toggle for multiple zn-translations children.
     *
     * @dependency zn-button
     * @dependency zn-button-group
     * @dependency zn-dropdown
     * @dependency zn-menu
     *
     * @event zn-language-change - Emitted when the active language changes. Detail: `{ language: string }`.
     *
     * @slot - Default slot for `<zn-translations>` elements.
     * @slot actions - Actions displayed in the panel header alongside language buttons.
     *
     * @csspart base - The component's base wrapper.
     */
    export default class ZnTranslationGroup extends ZnPanel {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-button-group': typeof ZnButtonGroup;
            'zn-dropdown': typeof ZnDropdown;
            'zn-header': typeof ZnHeader;
            'zn-menu': typeof ZnMenu;
        };
        private readonly _slotController;
        /** The group label displayed in the panel header. */
        label: string;
        /** The available languages for the group. */
        languages: Record<string, string>;
        private _activeLanguage;
        /** Tracks all language codes that have been activated across children. */
        private _activatedLanguages;
        private _overflowIndex;
        private _lastObservedWidth;
        private _measureRafId;
        constructor();
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected updated(changedProperties: PropertyValues): void;
        private _scheduleLangOverflow;
        private _computeLangOverflow;
        private getAllTranslations;
        /** Sync grouped state, languages, and active language to all children. */
        private syncChildren;
        private syncChildLanguages;
        private handleSlotChange;
        private switchLanguage;
        private handleLanguageAdd;
        private handleOverflowSelect;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/translation-group/index" {
    import ZnTranslationGroup from "components/translation-group/translation-group.component";
    export * from "components/translation-group/translation-group.component";
    export default ZnTranslationGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-translation-group': ZnTranslationGroup;
        }
    }
}
declare module "components/priority-list/priority-list.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { FormControlController } from "internal/form";
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import type { ZincFormControl } from "internal/zinc-element";
    export interface PriorityItem {
        key: string;
        priority: number;
    }
    /**
     * @summary A reorderable list where each item receives a numerical priority based on its position. Supports drag-and-drop
     *   and keyboard reordering. Priority values are submitted as form data via hidden inputs.
     *
     * @documentation https://zinc.style/components/priority-list
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @slot - The default slot where list items are placed. Each slotted element must have a `value` attribute that
     *   uniquely identifies the item. The component automatically assigns slot names to project each item into the
     *   correct position. The item's position in the list determines its priority (top = `priority-start`, incrementing).
     * @slot label - The component's label. Required for proper accessibility. Alternatively, use the `label` attribute.
     * @slot label-tooltip - Used to add text displayed in a tooltip next to the label.
     * @slot help-text - Text that describes how to use the component. Alternatively, use the `help-text` attribute.
     *
     * @event zn-change - Emitted when the order of items changes.
     * @event zn-reorder - Emitted when items are reordered. Call `getPriorityMap()` on the component to get
     *   the updated `{ key: string, priority: number }[]` array.
     *
     * @csspart form-control - The form control wrapper.
     * @csspart form-control-label - The label wrapper.
     * @csspart form-control-input - The input area wrapper.
     * @csspart form-control-help-text - The help text wrapper.
     * @csspart list - The list container.
     * @csspart item - An individual list item row.
     * @csspart drag-handle - The drag handle icon.
     * @csspart priority - The priority number badge.
     * @csspart content - The content area of an item.
     *
     * @cssproperty --zn-priority-list-item-gap - The gap between list items. Defaults to `var(--zn-spacing-2x-small)`.
     * @cssproperty --zn-priority-list-item-padding - The padding inside each item. Defaults to `var(--zn-spacing-small) var(--zn-spacing-medium)`.
     * @cssproperty --zn-priority-list-handle-color - The color of the drag handle. Defaults to `var(--zn-color-neutral-500)`.
     * @cssproperty --zn-priority-list-priority-color - The color of the priority number. Defaults to `var(--zn-color-neutral-600)`.
     */
    export default class ZnPriorityList extends ZincElement implements ZincFormControl {
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        static styles: CSSResultGroup;
        protected readonly formControlController: FormControlController;
        private readonly hasSlotController;
        hiddenInputsContainer: HTMLDivElement;
        /**
         * The name prefix for form submission. Each item generates a hidden input named `{name}[{itemValue}]`
         * with the priority number as its value.
         */
        name: string;
        /**
         * The current ordered list of item keys, reflecting the visual order. This is the source of truth for ordering.
         * Each entry should match a `value` attribute on a slotted child element.
         */
        get value(): string[];
        set value(val: string[]);
        private _value;
        defaultValue: string[];
        /** The component's label. Required for proper accessibility. */
        label: string;
        /** Text that appears in a tooltip next to the label. */
        labelTooltip: string;
        /** Help text that describes how to use the component. */
        helpText: string;
        /**
         * Associates the control with a form by id. The form must be in the same document or shadow root.
         */
        form: string;
        /** The size of the list items. */
        size: 'small' | 'medium' | 'large';
        /** Whether the priority list is disabled. */
        disabled: boolean;
        /** Ensures the form control has a value before allowing submission. */
        required: boolean;
        /** The starting priority number. Defaults to 1. */
        priorityStart: number;
        /**
         * When set, the associated form will be submitted with the given action URL whenever items are reordered.
         * If set to an empty string, the form will be submitted using its existing action.
         */
        formAction: string;
        /**
         * A comma-separated list of item keys defining the initial display order.
         * Keys must match the `value` attributes on slotted children.
         * Any slotted items not listed are appended at the end in DOM order.
         */
        order: string;
        private draggedKey;
        private isDragging;
        private dragOverKey;
        /** Gets the validity state object. */
        get validity(): ValidityState;
        /** Gets the validation message. */
        get validationMessage(): string;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        /**
         * Initialize item order from slotted children if no explicit value was provided.
         * If an `order` attribute is set, use it to define the initial order,
         * appending any slotted items not listed in the order at the end.
         */
        private _initializeOrderFromSlot;
        /**
         * Gets all direct children with a `value` attribute (excluding those in reserved slots).
         */
        private _getSlottedItems;
        /**
         * Assigns `slot` attributes to light DOM children based on their `value` attribute,
         * so they project into the correct named slot in the shadow DOM.
         */
        private _assignSlotNames;
        /**
         * Returns the priority map: an array of { key, priority } objects.
         */
        getPriorityMap(): PriorityItem[];
        /**
         * Syncs hidden inputs so form data includes priority values.
         */
        private _syncHiddenInputs;
        /**
         * Moves an item from one index to another.
         */
        private _moveItem;
        /**
         * Submits the associated form if a `formaction` attribute is set.
         */
        private _submitForm;
        private _handleDragStart;
        private _handleDragEnd;
        private _handleDragOver;
        private _handleDragLeave;
        private _handleDrop;
        private _handleKeyDown;
        private _handleSlotChange;
        /** Checks for validity but does not show a validation message. */
        checkValidity(): boolean;
        /** Gets the associated form, if one exists. */
        getForm(): HTMLFormElement | null;
        /** Checks for validity and shows the browser's validation message if the control is invalid. */
        reportValidity(): boolean;
        /** Sets a custom validation message. Pass an empty string to restore validity. */
        setCustomValidity(_message?: string): void;
        protected updated(changedProperties: PropertyValues): void;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/priority-list/index" {
    import ZnPriorityList from "components/priority-list/priority-list.component";
    export * from "components/priority-list/priority-list.component";
    export default ZnPriorityList;
    global {
        interface HTMLElementTagNameMap {
            'zn-priority-list': ZnPriorityList;
        }
    }
}
declare module "components/markdown-editor/markdown-editor.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    import type ZnTextarea from "components/textarea/index";
    import ZnPanel from "components/panel/panel.component";
    type ViewMode = 'editor' | 'split' | 'preview';
    /**
     * @summary A markdown editor with live preview, split view, and a fullscreen mode.
     * @documentation https://zinc.style/components/markdown-editor
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-textarea
     * @dependency zn-button-group
     * @dependency zn-icon
     *
     * @event zn-change - Emitted when the markdown content changes.
     * @event zn-input - Emitted on each keystroke in the editor.
     * @event zn-view-mode-change - Emitted when the user switches between editor / split / preview.
     *
     * @slot label - The editor label. Alternatively, use the `label` attribute.
     * @slot help-text - Help text shown below the editor. Alternatively, use the `help-text` attribute.
     *
     * @csspart base - The component's base wrapper.
     * @csspart toolbar - The toolbar containing the view-mode and fullscreen controls.
     * @csspart editor - The textarea wrapper.
     * @csspart preview - The rendered markdown preview.
     */
    export default class ZnMarkdownEditor extends ZnPanel implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        private readonly markdownSlotController;
        private debounceTimer;
        textarea: ZnTextarea;
        previewEl: HTMLDivElement;
        /** The name of the control, submitted as part of form data. */
        name: string;
        /** The current markdown content. */
        value: string;
        /** The default value — used when resetting the form. */
        defaultValue: string;
        /** The control's label. If you need HTML, use the `label` slot. */
        label: string;
        /** Help text displayed below the editor. If you need HTML, use the `help-text` slot. */
        helpText: string;
        /** Placeholder text shown when the editor is empty. */
        placeholder: string;
        /** Number of rows for the textarea. */
        rows: number;
        /** Which view to show. */
        viewMode: ViewMode;
        /**
         * Key used to persist the selected view mode to `localStorage`. Set to an empty string to disable persistence.
         */
        storageKey: string;
        /** Makes the editor required for form submission. */
        required: boolean;
        /** Makes the editor read-only. */
        readonly: boolean;
        /** Disables the editor. */
        disabled: boolean;
        /** Whether the editor is currently expanded to cover its containing positioned ancestor. */
        expanded: boolean;
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        /** Sets focus on the editor. */
        focus(options?: FocusOptions): void;
        /** Removes focus from the editor. */
        blur(): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private readStoredViewMode;
        private writeStoredViewMode;
        private renderPreview;
        private handleInput;
        private handleChange;
        private handleViewToggle;
        private handleExpandToggle;
        handleViewModeChange(): Promise<void>;
        handleValueChange(): Promise<void>;
        handleMarkedReady(): void;
        render(): import("lit-html").TemplateResult<1>;
        markdownHelperBtn(): import("lit-html").TemplateResult<1>;
        private renderViewButton;
    }
}
declare module "components/markdown-editor/index" {
    import ZnMarkdownEditor from "components/markdown-editor/markdown-editor.component";
    export * from "components/markdown-editor/markdown-editor.component";
    export default ZnMarkdownEditor;
    global {
        interface HTMLElementTagNameMap {
            'zn-markdown-editor': ZnMarkdownEditor;
        }
    }
}
declare module "components/flow-builder/flow.types" {
    import type { TemplateResult } from 'lit';
    /** Which steps-panel tab a node type appears under. */
    export type FlowGroup = 'entrypoint' | 'trigger' | 'action' | 'rule';
    /** A single connection point on a node (input or output). */
    export interface FlowPort {
        id: string;
        /** Branch name shown on the wire pill (outputs). */
        label?: string;
        /** Branch configuration (filters / conditions for taking this path), edited via the branch editor. */
        data?: Record<string, unknown>;
    }
    /** A choice in a filter field's operator or value dropdown. */
    export interface FlowFilterOption {
        value: string;
        /** Display text; defaults to the value. */
        label?: string;
    }
    /** One control row of a branch filter (e.g. "[in the last ▾] [6] [month(s) ▾]"). */
    export interface FlowFilterField {
        id: string;
        /** Leading text shown before the controls. */
        label?: string;
        /** The value control. Defaults to 'select' when `options` are given, else 'text'. */
        type?: 'select' | 'number' | 'text';
        /** Operator choices shown before the value (e.g. "at least" / "in the last" / "is equal to"). */
        operators?: FlowFilterOption[];
        /** Value choices for a 'select' field. */
        options?: FlowFilterOption[];
        /** Choices for an adjustable trailing unit dropdown (e.g. day(s) / month(s)); shown instead of `suffix`. */
        units?: FlowFilterOption[];
        /** Trailing unit text (e.g. "time(s)") when the unit isn't adjustable. */
        suffix?: string;
        placeholder?: string;
        /** Initial value when the filter is added to a condition. */
        value?: string | number;
    }
    /** An operator's display label: its own, a well-known default for its value, else the value itself. */
    export function operatorLabel(option: FlowFilterOption): string;
    /** A filter offered by the built-in branch conditions editor. */
    export interface FlowBranchFilter {
        id: string;
        label: string;
        description?: string;
        fields: FlowFilterField[];
    }
    /** One configured condition: a filter plus its per-field operator / value / unit entries. */
    export interface FlowBranchCondition {
        /** The `FlowBranchFilter` id this condition uses. */
        filter: string;
        values: Record<string, {
            operator?: string;
            value?: string | number;
            unit?: string;
        }>;
    }
    /**
     * A branch's full condition set as persisted on the output port's
     * `data.conditions`: the outer array is OR-ed, each inner group AND-ed.
     */
    export type FlowBranchConditions = FlowBranchCondition[][];
    /** Read the conditions persisted on an output port (`port.data.conditions`). */
    export function branchConditions(port: FlowPort): FlowBranchConditions;
    /**
     * Describes a kind of node that can be placed on the canvas. Consumers register
     * these with the builder to extend it — the steps panel and inspector are driven
     * entirely by the registered types, so no library changes are needed to add a
     * new custom component.
     */
    export interface FlowNodeType {
        /** Unique key, persisted on every placed node. */
        type: string;
        label: string;
        /** Steps-panel tab the type is listed under. */
        group: FlowGroup;
        /** Collapsible category within the tab (e.g. "Contacts"). */
        category?: string;
        /** zn-icon `src` (e.g. "mail" or "mail@lu"). */
        icon?: string;
        /** zn-icon `library`, when not encoded in `icon`. */
        iconLibrary?: string;
        /** Accent color for the icon tile / ports — any CSS color. */
        color?: string;
        description?: string;
        /** Input ports. Defaults to a single unlabelled input. Pass `[]` for a trigger. */
        inputs?: FlowPort[];
        /** Output ports. Defaults to a single unlabelled output. e.g. TRUE/FALSE for a split. */
        outputs?: FlowPort[];
        /** Initial `data` for a freshly placed node. */
        defaultData?: Record<string, unknown>;
        /**
         * Filters offered by the built-in branch conditions editor for this type's
         * output branches (AND/OR groups persisted on the port's `data.conditions`).
         * Ignored when `renderBranchConfig` is set.
         */
        branchFilters?: FlowBranchFilter[];
        /** Renders the inspector body for a selected node of this type. */
        renderConfig?: (node: FlowNodeInstance, update: (data: Record<string, unknown>) => void) => TemplateResult;
        /** Renders the branch editor body (filters / conditions) for one of this type's output branches. */
        renderBranchConfig?: (node: FlowNodeInstance, port: FlowPort, update: (patch: Partial<FlowPort>) => void) => TemplateResult;
    }
    /** A node placed on the canvas. */
    export interface FlowNodeInstance {
        id: string;
        type: string;
        x: number;
        y: number;
        /** Overrides the type label when set. */
        label?: string;
        /** Per-instance input ports; overrides the type's when set (user-configurable). */
        inputs?: FlowPort[];
        /** Per-instance output ports; overrides the type's when set (user-configurable). */
        outputs?: FlowPort[];
        data: Record<string, unknown>;
    }
    export interface FlowEndpoint {
        node: string;
        port: string;
    }
    export interface FlowConnection {
        id: string;
        source: FlowEndpoint;
        target: FlowEndpoint;
    }
    export interface FlowNote {
        id: string;
        x: number;
        y: number;
        text: string;
        width?: number;
        height?: number;
    }
    /** The complete serialisable state of a flow. */
    export interface FlowState {
        nodes: FlowNodeInstance[];
        connections: FlowConnection[];
        notes: FlowNote[];
    }
    export const DEFAULT_INPUT: FlowPort;
    export const DEFAULT_OUTPUT: FlowPort;
    /**
     * Sentinel port id for the extra "+" a fully-connected node always offers.
     * Using it (attaching a stray branch, dropping a step, or moving a node onto it)
     * materialises a real output port on the node first.
     */
    export const NEW_OUTPUT_PORT = "__new__";
    /** Drag-and-drop MIME used to carry a node type id from the steps panel to the canvas. */
    export const FLOW_TYPE_MIME = "application/x-zn-flow-type";
    /**
     * A cached 1×1 transparent image. Pass it to `dataTransfer.setDragImage()` to
     * suppress the browser's default drag image — the builder renders its own
     * in-canvas drop preview instead.
     */
    export function emptyDragImage(): HTMLImageElement;
    /**
     * Fixed node geometry. Cards are a uniform size so the canvas can compute exact
     * port coordinates from a node's position alone — no DOM measurement, which
     * keeps connection rendering and hit-testing reliable under pan/zoom.
     */
    export const NODE_WIDTH = 240;
    export const NODE_HEIGHT = 60;
    /**
     * Horizontal spacing between the branches of a multi-output node. Matches the
     * untangle layer gap (card width + 80) so two sibling children fit side by side
     * directly under their drops — straight downward wires, no elbows.
     */
    export const BRANCH_SPREAD: number;
    export const BUS_OFFSET = 40;
    export const PILL_DROP = 40;
    export const PILL_HEIGHT = 40;
    export const PILL_MAX_WIDTH = 240;
    /** Extra pill height per wrapped line (matches the pill's CSS line-height). */
    export const PILL_LINE_HEIGHT = 20;
    /**
     * Canvas y of a branch pill's top edge. A pill on a wire to a child below is
     * centred along the run from its node's bottom to the child's top — equal wire
     * above and below, however long or tight. A sole output's wire is a straight
     * stem with no bus to respect, so its pill may rise above the bus line to stay
     * centred; fan branches stop at the bus. Open branches and loop/side wires
     * keep the fixed drop below the bus.
     */
    export function branchPillTop(node: Pick<FlowNodeInstance, 'y'>, pillH: number, child?: Pick<FlowNodeInstance, 'y'>, soleOutput?: boolean): number;
    /**
     * Estimated pill box for a branch name: sizes to the text up to the max width,
     * then hard-wraps — the height grows a grid unit per extra line. The pill DOM
     * sizes itself from its content (fixed padding); this estimate drives the wire
     * geometry and collision footprints, so it uses the same ~7.2px/char metric.
     */
    export function pillSize(label: string): {
        w: number;
        h: number;
    };
    /** The grid everything on the canvas snaps to (matches the dotted background). */
    export const GRID_SIZE = 20;
    export function snapToGrid(v: number): number;
    interface Rect {
        x: number;
        y: number;
        w: number;
        h: number;
        /** Clearance this rect claims around itself. */
        m: number;
    }
    /** A function resolving a node type key to its registered type. */
    export type FlowTypeOf = (type: string) => FlowNodeType | undefined;
    /**
     * Canvas x for each of a node's branch drops: the natural fan position under
     * the source. Pills never shift sideways to chase their child — the wire into
     * a pill is always a straight vertical, and any lateral offset to the child is
     * taken up by the elbow below the pill (which still enters the child from
     * straight above).
     */
    export function branchDropXs(node: FlowNodeInstance, typeOf: FlowTypeOf): number[];
    /**
     * The rects a node occupies on the canvas: its card plus each branch-name pill,
     * at the exact positions the canvas draws them.
     */
    export function nodeObstacles(node: FlowNodeInstance, typeOf: FlowTypeOf, nodes: FlowNodeInstance[], connections: FlowConnection[]): Rect[];
    /** Whether two nodes' footprints (cards and branch pills) would overlap. */
    export function nodesCollide(a: FlowNodeInstance, b: FlowNodeInstance, typeOf: FlowTypeOf, nodes: FlowNodeInstance[], connections: FlowConnection[]): boolean;
    /**
     * Whether any of `node`'s branch pills overlap another node's footprint. A
     * pill centres between its node and the connected child, so moving the CHILD
     * moves the pill — drags use this to check the moved node's parents, whose
     * displaced pills could land on a third node.
     */
    export function pillsCollide(node: FlowNodeInstance, typeOf: FlowTypeOf, nodes: FlowNodeInstance[], connections: FlowConnection[]): boolean;
    /** Whether a bare card placed at `pos` would hit any of `node`'s footprint. */
    export function cardCollides(pos: {
        x: number;
        y: number;
    }, node: FlowNodeInstance, typeOf: FlowTypeOf, nodes: FlowNodeInstance[], connections: FlowConnection[]): boolean;
    export const NOTE_WIDTH = 200;
    export const NOTE_HEIGHT = 120;
    export const NOTE_MIN_WIDTH = 120;
    export const NOTE_MIN_HEIGHT = 80;
    /** Canvas-space coordinate of a port anchor on a node of the given size. */
    export function portAnchor(node: Pick<FlowNodeInstance, 'x' | 'y'>, side: 'in' | 'out', index: number, count: number): {
        x: number;
        y: number;
    };
    export function emptyFlowState(): FlowState;
    /** Resolve a type's inputs, falling back to a single default input. */
    export function typeInputs(type: FlowNodeType | undefined): FlowPort[];
    /** Resolve a type's outputs, falling back to a single default output. */
    export function typeOutputs(type: FlowNodeType | undefined): FlowPort[];
    /** A node's effective inputs — its per-instance override, else the type's. */
    export function nodeInputs(node: FlowNodeInstance, type: FlowNodeType | undefined): FlowPort[];
    /** A node's effective outputs — its per-instance override, else the type's. */
    export function nodeOutputs(node: FlowNodeInstance, type: FlowNodeType | undefined): FlowPort[];
    /** A node's first input id, or null when it accepts no inputs (an entrypoint). */
    export function firstInputId(node: FlowNodeInstance, type: FlowNodeType | undefined): string | null;
    /** The connection occupying a given output port, if any. */
    export function connectionAt(state: FlowState, nodeId: string, port: string): FlowConnection | undefined;
    /** Whether an output port has no downstream connection (shows a "+"). */
    export function isOpenOutput(state: FlowState, nodeId: string, port: string): boolean;
    /** All node ids reachable downstream from a node (excluding the node itself). */
    export function descendantIds(state: FlowState, nodeId: string): Set<string>;
    /**
     * Whether connecting `sourceNode`'s output to `targetNode` would create a cycle —
     * i.e. the target is the source itself or already downstream of it. The builder
     * allows loops, but consumers can use this to validate flows that must stay acyclic.
     */
    export function wouldCreateCycle(state: FlowState, sourceNode: string, targetNode: string): boolean;
    /**
     * The connections that close loops: each cycle's back-edge in a DFS forest
     * grown from the roots (every cycle contains exactly one such edge). Used to
     * render loop wires distinctly and to keep the untangle layering acyclic.
     */
    export function loopConnections(nodes: FlowNodeInstance[], connections: FlowConnection[]): Set<FlowConnection>;
}
declare module "components/flow-builder/modules/flow-branch-conditions/flow-branch-conditions.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnIcon from "components/icon/index";
    import ZnInput from "components/input/index";
    import ZnOption from "components/option/index";
    import ZnSelect from "components/select/index";
    import { type FlowBranchConditions, type FlowBranchFilter } from "components/flow-builder/flow.types";
    /**
     * @summary The built-in branch conditions editor: pick filters from a searchable list, then
     *   combine them into AND groups joined by OR. Rendered by `<zn-flow-builder>`'s branch editor
     *   for node types that declare `branchFilters`; edits are drafted locally and only applied
     *   on Save.
     * @documentation https://zinc.style/components/flow-branch-conditions
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     * @dependency zn-input
     * @dependency zn-option
     * @dependency zn-select
     *
     * @event flow-conditions-save - Emitted on Save with `detail.conditions` (OR groups of AND-ed conditions).
     * @event flow-conditions-cancel - Emitted on Cancel, with the draft discarded.
     *
     * @csspart base - The editor wrapper.
     * @csspart picker - The filter picker (search + list).
     * @csspart conditions - The configured condition groups.
     */
    export default class ZnFlowBranchConditions extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-icon': typeof ZnIcon;
            'zn-input': typeof ZnInput;
            'zn-option': typeof ZnOption;
            'zn-select': typeof ZnSelect;
        };
        /** The filters available to build conditions from. */
        filters: FlowBranchFilter[];
        /** The saved conditions being edited; changes stay in a local draft until Save. */
        value: FlowBranchConditions;
        private _draft;
        /** Group index the picker adds into (`_draft.length` starts a new OR group), or null when closed. */
        private _picker;
        private _search;
        /** JSON of the last `value` the draft was built from, so re-renders that pass an
         *  equivalent value (fresh array refs) don't wipe in-progress edits. */
        private _valueJson;
        protected willUpdate(changed: PropertyValues): void;
        private _emit;
        private _save;
        private _cancel;
        private _cloneDraft;
        private _addCondition;
        private _removeCondition;
        private _setField;
        private _renderPicker;
        /**
         * A select's minimum width, sized so its longest label never truncates
         * (estimated per char, plus padding and the chevron). When the row can't
         * fit it, flex-wrap gives the select its own full-width line instead.
         */
        private static _selectMinWidth;
        private _renderField;
        private _renderCondition;
        private _renderConditions;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-branch-conditions/index" {
    import ZnFlowBranchConditions from "components/flow-builder/modules/flow-branch-conditions/flow-branch-conditions.component";
    export * from "components/flow-builder/modules/flow-branch-conditions/flow-branch-conditions.component";
    export default ZnFlowBranchConditions;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-branch-conditions': ZnFlowBranchConditions;
        }
    }
}
declare module "components/flow-builder/modules/flow-node/flow-node.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnDropdown from "components/dropdown/index";
    import ZnIcon from "components/icon/index";
    import ZnMenu from "components/menu/index";
    import ZnMenuItem from "components/menu-item/index";
    import { type FlowNodeInstance, type FlowNodeType } from "components/flow-builder/flow.types";
    /**
     * @summary A single node tile on the flow canvas, with input/output ports and a context menu.
     * @documentation https://zinc.style/components/flow-node
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-button
     * @dependency zn-dropdown
     * @dependency zn-menu
     * @dependency zn-menu-item
     *
     * @event flow-node-select - Emitted when the node body is clicked.
     * @event flow-node-grab - Emitted on pointerdown of the node body to begin a move (handled by the canvas).
     * @event flow-node-action - Emitted when a context-menu action (delete/duplicate/move) is chosen.
     * @event flow-port-click - An output port was clicked; the canvas starts (or attaches) a branch.
     *
     * @csspart base - The node card wrapper.
     */
    export default class ZnFlowNode extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-button': typeof ZnButton;
            'zn-dropdown': typeof ZnDropdown;
            'zn-menu': typeof ZnMenu;
            'zn-menu-item': typeof ZnMenuItem;
        };
        node: FlowNodeInstance;
        type: FlowNodeType;
        selected: boolean;
        error: boolean;
        dragging: boolean;
        /** A stray branch is snapped onto this node — highlight it as the drop target. */
        linkTarget: boolean;
        protected updated(changed: PropertyValues): void;
        private get nodeTitle();
        private get nodeSubtitle();
        private _emit;
        private _onBodyPointerDown;
        private _action;
        private _renderPorts;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-node/index" {
    import ZnFlowNode from "components/flow-builder/modules/flow-node/flow-node.component";
    export * from "components/flow-builder/modules/flow-node/flow-node.component";
    export default ZnFlowNode;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-node': ZnFlowNode;
        }
    }
}
declare module "components/flow-builder/flow-registry" {
    import type { FlowGroup, FlowNodeType } from "components/flow-builder/flow.types";
    /**
     * Holds the set of {@link FlowNodeType}s available to a flow builder. This is
     * the modular extension point: register custom node types here and the steps panel
     * and inspector pick them up automatically.
     */
    export class FlowRegistry {
        private types;
        register(type: FlowNodeType): this;
        registerAll(types: FlowNodeType[]): this;
        get(type: string): FlowNodeType | undefined;
        has(type: string): boolean;
        all(): FlowNodeType[];
        byGroup(group: FlowGroup): FlowNodeType[];
        /** Map of category name -> types, preserving insertion order, for one group. */
        categories(group: FlowGroup): Map<string, FlowNodeType[]>;
        clear(): void;
    }
}
declare module "components/flow-builder/modules/flow-canvas/flow-canvas.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnFlowNode from "components/flow-builder/modules/flow-node/index";
    import ZnIcon from "components/icon/index";
    import { type FlowConnection, type FlowNodeInstance, type FlowNote } from "components/flow-builder/flow.types";
    import type { FlowRegistry } from "components/flow-builder/flow-registry";
    /**
     * @summary The pannable, zoomable surface that renders flow nodes and the connections between them.
     * @documentation https://zinc.style/components/flow-canvas
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     * @dependency zn-flow-node
     *
     * @event flow-interaction-start - A drag (node/note move or resize) has begun; the builder snapshots for undo.
     * @event flow-change-commit - A drag or operation finished and the state should be persisted/emitted.
     * @event flow-output-assign - A step was dropped on an open output's "+".
     * @event flow-output-move-target - An open output's "+" was chosen as the destination while moving a node.
     * @event flow-link-assign - A stray branch (started from an output's "+") was attached to an existing node.
     * @event flow-wire-pick - An existing wire's "+" was clicked; the builder opens the step picker to insert.
     * @event flow-wire-assign - A step was dropped on a wire's "+" to insert a step.
     * @event flow-branch-pick - A branch pill was clicked; the builder opens the branch editor.
     * @event flow-branch-delete - A branch pill's delete button was clicked; the builder removes the branch.
     * @event flow-undo - The undo toolbar button was pressed.
     * @event flow-redo - The redo toolbar button was pressed.
     * @event flow-add-note - The add-note toolbar button was pressed.
     * @event flow-untangle - The untangle toolbar button was pressed; the builder auto-arranges the nodes.
     * @event flow-note-change - A note's text was edited.
     * @event flow-note-delete - A note was removed.
     *
     * @csspart base - The canvas viewport.
     * @csspart toolbar - The floating toolbar.
     * @csspart bin - The delete drop-zone shown bottom-right while dragging a node or step.
     */
    export default class ZnFlowCanvas extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-icon': typeof ZnIcon;
            'zn-flow-node': typeof ZnFlowNode;
        };
        nodes: FlowNodeInstance[];
        connections: FlowConnection[];
        notes: FlowNote[];
        registry: FlowRegistry;
        selectedNodeId: string | null;
        errorNodes: Set<string>;
        /** When set, the canvas is in "move" mode: open "+" slots act as drop targets for this node. */
        movingNodeId: string | null;
        /** The node type being dragged from the steps panel, used to render the drop preview. */
        dragType: string | null;
        /** The branch being edited, as `nodeId:portId` — highlights its pill. */
        selectedBranch: string | null;
        private zoom;
        private panX;
        private panY;
        private drag;
        /** Whether the current drag (node or step) is over the delete bin. */
        private _overBin;
        /** Canvas-space top-left where a step, if dropped now, would be placed. */
        private _dropGhost;
        /** The stray branch being drawn from an output port until it attaches or cancels. */
        private _linking;
        private _linkPos;
        /** The valid node under the cursor while linking — the preview snaps to its input. */
        private _linkTarget;
        /** Last pointer position (client coords) while linking, for edge auto-pan. */
        private _linkClient;
        private _linkScrollRaf;
        private _dragMoved;
        /** Centre the flow when it first arrives; any earlier user interaction opts out. */
        private _viewInitialised;
        connectedCallback(): void;
        disconnectedCallback(): void;
        /**
         * Wheel navigation: scroll pans vertically, side-scroll (or Shift+scroll)
         * pans horizontally, and Ctrl/Cmd+scroll — including trackpad pinch — zooms
         * toward the cursor.
         */
        private _onWheel;
        protected updated(changed: PropertyValues): void;
        private _emit;
        /** Convert a client (screen) coordinate to canvas space, accounting for pan/zoom. */
        screenToCanvas(clientX: number, clientY: number): {
            x: number;
            y: number;
        };
        private _typeFor;
        private _setupWindow;
        private _teardownWindow;
        private _onBackgroundPointerDown;
        private _onNodeGrab;
        /** While linking, a node click attaches the branch — swallow the selection. */
        private _onNodeSelect;
        /**
         * A node's output stem port was clicked. If a branch is already in flight from
         * another node, attach it here; otherwise start one — from the node's first
         * open output if it has one, else as a brand-new branch (materialised by the
         * builder on attach).
         */
        private _onPortClick;
        /**
         * An orphaned branch pill's port was clicked. If a branch from another node
         * is already in flight, attach it to this pill's node; otherwise start a
         * stray branch that continues from this pill.
         */
        private _onBranchPortClick;
        private _startLink;
        private _onLinkPointerMove;
        private _updateLinkFromClient;
        /**
         * While a branch rides the cursor, holding the pointer near (or past) a
         * canvas edge auto-pans in that direction, so the target can be off-screen.
         * Runs per frame until the link attaches or cancels.
         */
        private _linkEdgeScroll;
        private _onLinkKeyDown;
        private _cancelLink;
        private _onPointerMove;
        private _onPointerUp;
        /** Whether a client-space point is over the delete bin. */
        private _binHit;
        private _beginMove;
        /**
         * A node's outputs all leave from a single bottom-centre stem and fan out along a
         * shared horizontal bus — one branch per output. Each branch drops on the source's
         * own side (so fan-in branches from different nodes never stack their pills), then
         * routes to its connected child or ends in a "+" add-point (open).
         */
        private _outputLayout;
        /** Canvas-space anchor of a node's input port for an incoming connection. */
        private _inputAnchor;
        /**
         * Per-connection nudges for elbow horizontals. An elbow runs at the exact
         * midpoint of its gap (equal drop and approach) unless wires to *different*
         * targets would share the same line — those read as a merge, so each
         * conflicting target gets its own grid-step offset. Wires fanning in to the
         * same input keep sharing a line: their join is real.
         */
        private _elbowMidOffsets;
        /**
         * Whether an orthogonal segment passes through any node card (with margin) —
         * or the approach zone above one, where incoming arrows land. A foreign wire
         * running just over a card's input port reads as connecting to it, so routes
         * keep well clear of that strip too.
         */
        private _segmentBlocked;
        private _routeClear;
        /**
         * Orthogonal waypoints from a branch exit to a child's input. The wire always
         * enters the input from above (arrow pointing down), and never passes through
         * a node card: each candidate route is checked against every card, scanning
         * alternative lanes / side-steps / detours until one is clear.
         */
        private _routePoints;
        private static _pathFrom;
        /**
         * Open output slots ("+" add-points) across all nodes — only rendered while
         * they're meaningful targets (dragging a step in, or moving a node). Idle
         * canvases show no stray stubs; branches start from the node's output port.
         */
        private _addPoints;
        /** Midpoint "+" insert-points on each connected branch (hidden while moving). */
        private _wirePoints;
        /** Convert a canvas-space point to screen coordinates (for anchoring popovers). */
        private _screenFromCanvas;
        private _onAddClick;
        private _onWireAddClick;
        private _onViewportDragOver;
        private _onViewportDragLeave;
        private _clearDropGhost;
        private _onAddPointDragOver;
        private _onAddDrop;
        private _onWireDrop;
        private _onBinDragOver;
        private _onBinDragLeave;
        private _onBinDrop;
        private _zoomBy;
        /** Canvas-space bounding box of the whole flow: nodes, branch drops, and notes. */
        private _contentBounds;
        /** Reset zoom and centre the flow in the viewport, zooming out to fit if needed. */
        private _resetView;
        private _viewportCursorClass;
        private _renderConnections;
        /**
         * Output labels (branch names) render as a clickable pill on their branch;
         * hovering slides out a delete button that removes the branch (and its wire).
         * Keyed by node+port so deleting one never hands its DOM (with its hovered,
         * visible delete button) to a different pill — which flickered on screen.
         */
        private _renderBranchPills;
        private _renderAddPoints;
        private _renderWireAddPoints;
        private _renderDropGhost;
        private _startNoteGrab;
        private _startNoteResize;
        private _renderNotes;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-canvas/index" {
    import ZnFlowCanvas from "components/flow-builder/modules/flow-canvas/flow-canvas.component";
    export * from "components/flow-builder/modules/flow-canvas/flow-canvas.component";
    export default ZnFlowCanvas;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-canvas': ZnFlowCanvas;
        }
    }
}
declare module "components/flow-builder/modules/flow-step-group/flow-step-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnCollapsible from "components/collapsible/index";
    /**
     * @summary A collapsible category of `<zn-flow-step>`s inside a `<zn-flow-steps>` (typically a `<zn-tabs>` panel).
     *   Wraps `<zn-collapsible>` for the standard expand/collapse behaviour and spacing.
     * @documentation https://zinc.style/components/flow-step-group
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-collapsible
     *
     * @slot - The group's `<zn-flow-step>`s.
     */
    export default class ZnFlowStepGroup extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-collapsible': typeof ZnCollapsible;
        };
        caption: string;
        /** Start collapsed. Defaults to open. */
        collapsed: boolean;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-step-group/index" {
    import ZnFlowStepGroup from "components/flow-builder/modules/flow-step-group/flow-step-group.component";
    export * from "components/flow-builder/modules/flow-step-group/flow-step-group.component";
    export default ZnFlowStepGroup;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-step-group': ZnFlowStepGroup;
        }
    }
}
declare module "components/flow-builder/flow-layout" {
    import { type FlowNodeType, type FlowState } from "components/flow-builder/flow.types";
    /** Horizontal gap between node origins within a layer (= BRANCH_SPREAD, so siblings land under their drops). */
    export const LAYOUT_H_GAP: number;
    /**
     * Vertical gap between layers: a 160 card-to-card gap — a centred pill gets 60
     * of wire above and below — keeping the arranged flow compact.
     */
    export const LAYOUT_V_GAP = 220;
    /**
     * "Untangle" auto-layout: assigns every node a position in a layered, top-down
     * flow. Layers come from the longest path back to a root (the graph is a DAG —
     * connects are cycle-guarded), ordering within a layer follows where each node's
     * parents sit (barycenter, respecting the parents' output-port order), and the
     * coordinate passes centre children under the branch anchors they hang from.
     * Returns the new positions; the caller applies them.
     */
    export function untangledPositions(state: FlowState, typeOf: (type: string) => FlowNodeType | undefined): Map<string, {
        x: number;
        y: number;
    }>;
}
declare module "components/flow-builder/flow-builder.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnFlowBranchConditions from "components/flow-builder/modules/flow-branch-conditions/index";
    import ZnFlowCanvas from "components/flow-builder/modules/flow-canvas/index";
    import ZnFlowStepGroup from "components/flow-builder/modules/flow-step-group/index";
    import ZnIcon from "components/icon/index";
    import ZnInput from "components/input/index";
    import ZnNavbar from "components/navbar/index";
    import ZnTabs from "components/tabs/index";
    import { type FlowNodeType, type FlowState } from "components/flow-builder/flow.types";
    /**
     * @summary A drag-and-drop visual flow builder: steps panel, pan/zoom canvas, and a config inspector.
     * @documentation https://zinc.style/components/flow-builder
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-input
     * @dependency zn-tabs
     * @dependency zn-navbar
     * @dependency zn-flow-branch-conditions
     * @dependency zn-flow-canvas
     * @dependency zn-flow-node
     *
     * @event zn-flow-change - Emitted whenever the flow state changes. `event.detail.state` is the new FlowState.
     * @event zn-flow-selection-change - Emitted when the selected node changes. `event.detail.nodeId`.
     * @event zn-flow-connect - Emitted when a connection is created. `event.detail.connection`.
     *
     * @slot - `<zn-flow-step>` type declarations; never displayed, each `group`/`category` routes the
     *   step into the right tab and collapsible grouping of the rendered panel. A step may nest
     *   `<zn-flow-filter>` declarations (each holding `<zn-flow-filter-field>`s, whose operator /
     *   option choices are nested `<zn-flow-operator>` / `<zn-flow-option>` elements) — or set a
     *   `branch-filters` JSON attribute — to drive the built-in branch conditions editor.
     * @slot header-left - Actions shown on the left of the header bar (e.g. Close / Undo All Changes).
     * @slot header-right - Actions shown on the right of the header bar (e.g. Apply Changes).
     * @slot sidebar - Extra right-panel content (status, version history), below the configuration errors.
     *
     * @csspart base - The grid wrapper.
     * @csspart header - The full-width header action bar (only rendered when header slots are filled).
     * @csspart steps - The left steps panel.
     * @csspart inspector - The right panel while a node or branch is selected.
     */
    export default class ZnFlowBuilder extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
            'zn-input': typeof ZnInput;
            'zn-tabs': typeof ZnTabs;
            'zn-navbar': typeof ZnNavbar;
            'zn-flow-branch-conditions': typeof ZnFlowBranchConditions;
            'zn-flow-canvas': typeof ZnFlowCanvas;
            'zn-flow-step-group': typeof ZnFlowStepGroup;
        };
        /** Node types to make available, registered into the internal registry. */
        nodeTypes: FlowNodeType[];
        heading: string;
        subheading: string;
        /** Node ids flagged as having configuration errors (drives the red node styling). */
        errorNodes: string[];
        /**
         * Auto-save the flow to localStorage (1-day TTL). Omit to disable. A bare
         * `auto-save` saves every 5 minutes; a numeric value sets the interval in
         * minutes (`auto-save="5"`). Restore with `restoreAutoSave()`.
         */
        autoSave: number | null;
        /** Optional hint shown beneath each steps-panel tab. */
        entrypointsHint: string;
        triggersHint: string;
        actionsHint: string;
        rulesHint: string;
        private registry;
        private _state;
        private _selectedNodeId;
        /** The output branch open in the branch editor, if any. */
        private _selectedBranch;
        private _search;
        /** The steps-panel tab currently shown; the search only filters this tab. */
        private _activeGroup;
        private readonly _hasSlot;
        /** Side panels tucked away via their edge chevrons. */
        private _stepsCollapsed;
        private _sideCollapsed;
        /** The node being relocated via the MOVE menu action, if any. */
        private _movingNodeId;
        /** The "+" picker popover target (an open output, or a wire to insert into), if open. */
        private _picker;
        /** The node type currently being dragged from the steps panel, for the canvas drop preview. */
        private _draggingType;
        private _history;
        private _redo;
        private _seq;
        private _untangleRaf;
        /** Applies the in-flight untangle's final positions; used when it's cut short. */
        private _untangleSettle;
        /**
         * Bumped whenever the state is replaced wholesale (undo / redo / setState) so the
         * guarded renderConfig / renderBranchConfig bodies rebuild against the fresh node
         * objects. Value edits don't bump it — the consumer's config DOM stays in place,
         * which is what lets its inputs commit live without losing focus.
         */
        private _configRevision;
        private get _listeners();
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _autoSaveTimer;
        private _statusTimer;
        private _justSavedTimer;
        /** Guards the restore prompt from re-triggering on restoreAutoSave's own setState. */
        private _restoring;
        /** Epoch of the newest auto-save (also picked up from storage on start). */
        private _lastSavedAt;
        /** Briefly true right after a save — flashes "Auto-saved" in the status pill. */
        private _justSaved;
        /** Re-render clock for the "last saved Xm ago" label. */
        private _statusNow;
        /** A fresh auto-save differing from the loaded flow — offer to restore it. */
        private _restorePrompt;
        /** localStorage key for this builder's auto-saves — its id, else its heading. */
        private get _autoSaveKey();
        private _stopAutoSave;
        private _restartAutoSave;
        /** An empty canvas is never saved — it would clobber a stored flow with nothing. */
        private _autoSaveTick;
        /** The stored auto-save, purging it when past its TTL (or unreadable). */
        private _readAutoSave;
        /** Load the auto-saved flow, if one exists within the 1-day TTL. */
        restoreAutoSave(): boolean;
        /**
         * A flow was just loaded — when a fresh auto-save differs from it, ask the
         * user whether to pick up their draft instead.
         */
        private _offerRestoreIfNewer;
        private _onKeyDown;
        protected willUpdate(changed: PropertyValues): void;
        protected firstUpdated(changed: PropertyValues): void;
        private static _parsePorts;
        /** Parse an operator / option list: a JSON array (strings or `{value,label}`) or comma-separated values. */
        private static _parseFilterOptions;
        /**
         * Option list declared as child elements — the tidy form. The element's text
         * is the label; a `value` attribute overrides the stored value:
         * `<zn-flow-operator value="gte">at least</zn-flow-operator>`.
         */
        private static _nestedFilterOptions;
        private static _filterFieldFromEl;
        /**
         * A step's branch filters: the `branch-filters` JSON attribute, or nested
         * `<zn-flow-filter>` declarations each holding `<zn-flow-filter-field>`s.
         */
        private static _parseBranchFilters;
        private _typeFromStep;
        /** Register a FlowNodeType for every slotted <zn-flow-step>. */
        private _registerSlottedTypes;
        registerNodeType(type: FlowNodeType): this;
        registerNodeTypes(types: FlowNodeType[]): this;
        getState(): FlowState;
        setState(next: FlowState): void;
        get value(): string;
        set value(json: string);
        /**
         * The full flow state — nodes with their positions, connections, branch
         * data, and notes — ready for persisting. Lets `JSON.stringify(builder)`
         * serialize the flow directly, e.g. as a POST body.
         */
        toJSON(): FlowState;
        undo: () => void;
        redo: () => void;
        /**
         * Auto-arrange the nodes into evenly spaced layers that follow the flow,
         * animating them into place (wires and pills track them since everything is
         * derived from the node coordinates). Undoable as a single step.
         */
        untangle: () => void;
        private _cancelUntangle;
        private _clone;
        private _pushHistory;
        private _commit;
        /**
         * Drop connections whose endpoints reference ports that no longer exist — e.g.
         * after a user removes a node's output (branch) via its config.
         */
        private _pruneConnections;
        private _syncSelection;
        /** The node + output port of the branch open in the editor, if both still exist. */
        private _branchSelection;
        private _id;
        /**
         * Snap to the grid and, if another node's footprint (card or branch pills)
         * occupies the spot, walk outward in grid-step rings to the nearest free one.
         */
        private _freePosition;
        private _addNode;
        private _deleteNode;
        private _duplicateNode;
        /** Canvas position for a node newly placed off a source node's output. */
        private _positionBelowOutput;
        /**
         * Resolve an output port id on a node: the "new branch" sentinel materialises a
         * fresh, labelled output port (per-instance), so it exists before connecting.
         */
        private _ensureOutput;
        /**
         * Every connected output is a configurable branch — default its name so the
         * pill renders, however the connection was made (arrow, drop, or move).
         */
        private _ensureBranchLabel;
        /** Create a node and attach it to an open output slot of an existing node. */
        private _addNodeAtOutput;
        /**
         * Wire an open output to an existing node — targets its first input. Fan-in
         * and loops (a branch pointing back to an earlier step) are both allowed;
         * only wiring a node directly to itself is refused.
         */
        private _linkNodeAtOutput;
        /** Insert a new node in the middle of an existing connection (split the wire). */
        private _insertNodeOnWire;
        private _select;
        private _onBranchPick;
        /** Remove an output branch and its wire. Undoable. */
        private _onBranchDelete;
        private _onSelect;
        private _onNodeAction;
        private _onInteractionStart;
        private _onOutputAssign;
        /** A stray branch was attached to an existing node (fan-in). */
        private _onLinkAssign;
        private _onWirePick;
        private _onWireAssign;
        /** Re-attach the node being moved to the chosen open output slot. */
        private _onOutputMoveTarget;
        private _onAddNote;
        private _onNoteChange;
        private _onNoteDelete;
        private _onDragStart;
        private _onDragEnd;
        private _onStepDrag;
        private _onCanvasDragOver;
        private _onCanvasDrop;
        private _renderSteps;
        private _hintFor;
        private _renderStep;
        private _renderStepsContent;
        private _renderStepsPanel;
        private _renderInspector;
        /** Replace one of the node's output ports (per-instance override), keeping its id. */
        private _updateBranch;
        /** Persist the built-in conditions editor's draft onto the branch and close it. Undoable. */
        private _saveBranchConditions;
        private _renderBranchEditor;
        private _renderRightPanel;
        private _renderHeader;
        private _renderSidebar;
        private _renderAutoSaveStatus;
        private _renderRestorePrompt;
        private _renderPicker;
        private _pickType;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/index" {
    import ZnFlowBuilder from "components/flow-builder/flow-builder.component";
    export * from "components/flow-builder/flow-builder.component";
    export * from "components/flow-builder/flow.types";
    export * from "components/flow-builder/flow-registry";
    export default ZnFlowBuilder;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-builder': ZnFlowBuilder;
        }
    }
}
declare module "components/flow-builder/modules/flow-steps/flow-steps.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnInput from "components/input/index";
    /**
     * @summary A search + scroll wrapper for building a standalone steps panel. Place a standard
     *   `<zn-tabs>` (with a `<zn-navbar slot="top">` and panels of `<zn-flow-step-group>` /
     *   `<zn-flow-step>`) inside it; the search box filters the slotted items.
     * @documentation https://zinc.style/components/flow-steps
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-input
     *
     * @slot - The steps panel content, typically a `<zn-tabs>`.
     *
     * @csspart search - The search input.
     */
    export default class ZnFlowSteps extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-input': typeof ZnInput;
        };
        searchable: boolean;
        searchPlaceholder: string;
        private _search;
        /** Re-applies the filter when zn-tabs moves `selected` to another panel. */
        private _tabObserver;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected updated(changed: PropertyValues): void;
        /** True when the element isn't tabbed, or sits in the active (selected) tab panel. */
        private _inActiveTab;
        /** Filter the slotted items (and hide emptied groups) by the search term — active tab only. */
        private _applyFilter;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-steps/index" {
    import ZnFlowSteps from "components/flow-builder/modules/flow-steps/flow-steps.component";
    export * from "components/flow-builder/modules/flow-steps/flow-steps.component";
    export default ZnFlowSteps;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-steps': ZnFlowSteps;
        }
    }
}
declare module "components/flow-builder/modules/flow-step/flow-step.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    /**
     * @summary A draggable step in the `<zn-flow-steps>`, representing a registered node type. Drag
     *   it onto the canvas (or a "+" slot) of a `<zn-flow-builder>` to add that step.
     * @documentation https://zinc.style/components/flow-step
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @event flow-step-drag - Emitted on dragstart with `detail.type`, so the builder can preview the drop.
     * @event flow-step-drag-end - Emitted on dragend.
     *
     * @slot - The step's label. May also hold `<zn-flow-filter>` declarations (never displayed)
     *   that drive the flow builder's built-in branch conditions editor.
     *
     * @csspart base - The row.
     */
    export default class ZnFlowStep extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        /** The node type id this item creates when dropped. */
        type: string;
        /** Display label; falls back to the slotted text. Also used as the node's label. */
        label: string;
        icon: string;
        iconLibrary: string;
        color: string;
        description: string;
        /** JSON array of input ports — `""` for a trigger (no input), omit for a single default input. */
        inputs: string;
        /** JSON array of outputs (`"a"` or `{"id","label"}`), e.g. `'[{"id":"true","label":"TRUE"}]'`. Omit for one default output. */
        outputs: string;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected updated(changed: PropertyValues): void;
        private _onDragStart;
        private _onDragEnd;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/flow-builder/modules/flow-step/index" {
    import ZnFlowStep from "components/flow-builder/modules/flow-step/flow-step.component";
    export * from "components/flow-builder/modules/flow-step/flow-step.component";
    export default ZnFlowStep;
    global {
        interface HTMLElementTagNameMap {
            'zn-flow-step': ZnFlowStep;
        }
    }
}
declare module "components/page-builder/page.types" {
    import type { TemplateResult } from 'lit';
    /** A section placed on a page. */
    export interface PageSection {
        id: string;
        type: string;
        /** Overrides the type label when set (per-instance rename). */
        label?: string;
        /** Section content, keyed by field name (the inspector's `name` attributes). */
        data: Record<string, unknown>;
        /** Slot contents for container sections, sized to the type's `slots`. Empty slots are null. */
        children?: (PageSection | null)[];
    }
    /** The complete serialisable state of a page. Order = render order. */
    export interface PageState {
        sections: PageSection[];
    }
    /**
     * Describes a kind of section that can be placed on a page. Declared via
     * `<template type slot="config">` children or registered programmatically —
     * the palette and inspector are driven entirely by registered types.
     */
    export interface PageSectionType {
        /** Unique key, persisted on every placed section. */
        type: string;
        label: string;
        /** zn-icon `src`. */
        icon?: string;
        iconLibrary?: string;
        /** Accent colour for the icon tile — any CSS colour. */
        color?: string;
        /** Collapsible palette category. */
        category?: string;
        description?: string;
        /** Inspector form markup (from a slotted `<template slot="config">`). */
        configTemplate?: HTMLTemplateElement;
        /** Programmatic inspector body — takes precedence over `configTemplate`. */
        renderConfig?: (section: PageSection, update: (data: Record<string, unknown>) => void) => TemplateResult;
        /**
         * Number of child slots this section offers on the canvas (a container tile);
         * rendered as a 3-column grid. Containers cannot be placed inside other containers.
         */
        slots?: number;
        /** Section type keys allowed in this container's slots. Omit to allow any non-container type. */
        accepts?: string[];
    }
    /** A container section's slot contents, padded/truncated to the type's slot count. */
    export function sectionChildren(section: PageSection, type: PageSectionType): (PageSection | null)[];
    /** Drag-and-drop MIME carrying a section type id from the palette to the canvas. */
    export const PAGE_TYPE_MIME = "application/x-zn-page-type";
    /** Drag-and-drop MIME carrying a placed section's id when reordering. */
    export const PAGE_SECTION_MIME = "application/x-zn-page-section";
    export function emptyPageState(): PageState;
    /** Unique-enough id for a new section, stable across edits once assigned. */
    export function generateSectionId(): string;
    /** Card summary: the section's first non-empty string value, else the type description. */
    export function sectionSummary(section: PageSection, type?: PageSectionType): string;
}
declare module "components/page-builder/page-registry" {
    import type { PageSectionType } from "components/page-builder/page.types";
    /**
     * Holds the set of {@link PageSectionType}s available to a page builder.
     * Register custom section types here (or via slotted templates) and the
     * palette and inspector pick them up automatically.
     */
    export class PageSectionRegistry {
        private types;
        register(type: PageSectionType): this;
        registerAll(types: PageSectionType[]): this;
        get(type: string): PageSectionType | undefined;
        has(type: string): boolean;
        all(): PageSectionType[];
        /** Map of category name -> types, preserving insertion order. Uncategorised under ''. */
        categories(): Map<string, PageSectionType[]>;
        clear(): void;
    }
}
declare module "components/page-builder/modules/page-palette-item/page-palette-item.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    /**
     * @summary A draggable palette entry in `<zn-page-builder>`, representing a registered
     *   section type. Drag it onto the canvas to add that section. Unlike zn-page-section-card
     *   (host-wired), this element wires its own drag behaviour so it is draggable standalone.
     * @documentation https://zinc.style/components/page-palette-item
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     *
     * @csspart base - The card row.
     */
    export default class ZnPagePaletteItem extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-icon': typeof ZnIcon;
        };
        /** The section type id this item creates when dropped. */
        type: string;
        label: string;
        description: string;
        icon: string;
        iconLibrary: string;
        color: string;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected updated(changed: PropertyValues): void;
        private _onDragStart;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/page-builder/modules/page-palette-item/index" {
    import ZnPagePaletteItem from "components/page-builder/modules/page-palette-item/page-palette-item.component";
    export * from "components/page-builder/modules/page-palette-item/page-palette-item.component";
    export default ZnPagePaletteItem;
    global {
        interface HTMLElementTagNameMap {
            'zn-page-palette-item': ZnPagePaletteItem;
        }
    }
}
declare module "components/page-builder/modules/page-section-card/page-section-card.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnButton from "components/button/index";
    import ZnIcon from "components/icon/index";
    /**
     * @summary A section card on the `<zn-page-builder>` canvas: icon tile, label, one-line
     *   summary, and hover actions (duplicate / remove). Purely presentational — the builder
     *   wires up dragging, focus, selection and keyboard handling on the host element.
     * @documentation https://zinc.style/components/page-section-card
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     *
     * @event page-card-duplicate - The duplicate action was clicked (internal; not in the typed event map).
     * @event page-card-remove - The remove action was clicked (internal; not in the typed event map).
     *
     * @csspart base - The card row.
     */
    export default class ZnPageSectionCard extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-button': typeof ZnButton;
            'zn-icon': typeof ZnIcon;
        };
        label: string;
        summary: string;
        icon: string;
        iconLibrary: string;
        color: string;
        selected: boolean;
        /** Set when the section's type has no registered template — renders greyed. */
        unknown: boolean;
        protected updated(changed: PropertyValues): void;
        private _action;
        private _actionKeydown;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/page-builder/modules/page-section-card/index" {
    import ZnPageSectionCard from "components/page-builder/modules/page-section-card/page-section-card.component";
    export * from "components/page-builder/modules/page-section-card/page-section-card.component";
    export default ZnPageSectionCard;
    global {
        interface HTMLElementTagNameMap {
            'zn-page-section-card': ZnPageSectionCard;
        }
    }
}
declare module "components/page-builder/page-builder.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import { type PageSection, type PageSectionType, type PageState } from "components/page-builder/page.types";
    import ZincElement from "internal/zinc-element";
    import ZnCollapsible from "components/collapsible/index";
    import ZnIcon from "components/icon/index";
    import ZnInput from "components/input/index";
    import ZnPagePaletteItem from "components/page-builder/modules/page-palette-item/index";
    import ZnPageSectionCard from "components/page-builder/modules/page-section-card/index";
    /**
     * @summary A config-driven page composer: a palette of predefined section types, a linear
     *   canvas of section cards, and an inspector for editing each section's content.
     * @documentation https://zinc.style/components/page-builder
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-collapsible
     * @dependency zn-icon
     * @dependency zn-input
     * @dependency zn-page-palette-item
     * @dependency zn-page-section-card
     *
     * @event zn-page-change - Emitted whenever the page state changes. `event.detail.state` is the new PageState.
     * @event zn-page-selection-change - Emitted when the selected section changes. `event.detail.sectionId`.
     *
     * @slot config - `<template type="…">` declarations; never displayed. Each template's attributes
     *   (type, label, icon, icon-library, color, category, description, slots, accepts) declare a
     *   palette entry and its content declares the inspector form for that type. `slots` makes the
     *   section a container with that many child slots; `accepts` is a comma-separated list of the
     *   type keys its slots allow.
     * @slot header-left - Actions shown on the left of the header bar.
     * @slot header-right - Actions shown on the right of the header bar.
     *
     * @csspart base - The grid wrapper.
     * @csspart header - The full-width header action bar (only rendered when header slots are filled).
     * @csspart palette - The left palette panel.
     * @csspart canvas - The centre section-card canvas.
     * @csspart inspector - The right panel while a section is selected.
     */
    export default class ZnPageBuilder extends ZincElement {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-collapsible': typeof ZnCollapsible;
            'zn-icon': typeof ZnIcon;
            'zn-input': typeof ZnInput;
            'zn-page-palette-item': typeof ZnPagePaletteItem;
            'zn-page-section-card': typeof ZnPageSectionCard;
        };
        /** The page state as a JSON string. Parsed on set; invalid JSON is ignored with a warning. */
        config: string;
        heading: string;
        subheading: string;
        /** Section types to make available, registered into the internal registry. */
        sectionTypes: PageSectionType[];
        /** Collapses the left palette. Auto-set when the builder becomes narrow. */
        paletteCollapsed: boolean;
        /** Collapses the inspector while a section is selected. */
        inspectorCollapsed: boolean;
        /**
         * Auto-save the page to localStorage (1-day TTL). Omit to disable. A bare
         * `auto-save` saves every 5 minutes; a numeric value sets the interval in
         * minutes (`auto-save="2"`). Restore with `restoreAutoSave()`.
         */
        autoSave: number | null;
        private registry;
        private _state;
        private _selectedId;
        private _search;
        /** Index of the drop zone whose "+" type picker is open, if any. */
        private _pickerIndex;
        private _dragOverIndex;
        /** The container slot a drag is currently over, if any. */
        private _slotDragOver;
        /** The container slot whose "+" type picker is open, if any. */
        private _slotPicker;
        /** The stamped config form for the selected section; rebuilt on selection change. */
        private _form;
        private readonly _hasSlot;
        private _history;
        private _redoStack;
        /** A deep copy of the current page state. */
        get state(): PageState;
        /** Replaces the page state wholesale (does not emit zn-page-change). */
        set state(next: PageState);
        handleConfigChange(): void;
        handleSectionTypesChange(): void;
        registerSectionType(type: PageSectionType): this;
        registerSectionTypes(types: PageSectionType[]): this;
        /**
         * Auto-collapses the palette when the builder crosses into narrow — only on the
         * crossing, so re-expanding while narrow stays a user choice.
         */
        private _wasNarrow;
        private _resizeObserver;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _autoSaveTimer;
        private _statusTimer;
        private _justSavedTimer;
        /** Guards the restore prompt from re-triggering on restoreAutoSave's own state install. */
        private _restoring;
        /** Epoch of the newest auto-save (also picked up from storage on start). */
        private _lastSavedAt;
        /** Briefly true right after a save — flashes "Auto-saved" in the status pill. */
        private _justSaved;
        /** Re-render clock for the "last saved Xm ago" label. */
        private _statusNow;
        /** A fresh auto-save differing from the loaded page — offer to restore it. */
        private _restorePrompt;
        /** localStorage key for this builder's auto-saves — its id, else its heading. */
        private get _autoSaveKey();
        private _stopAutoSave;
        private _restartAutoSave;
        /** An empty page is never saved — it would clobber a stored page with nothing. */
        private _autoSaveTick;
        /** The stored auto-save, purging it when past its TTL (or unreadable). */
        private _readAutoSave;
        /** Load the auto-saved page, if one exists within the 1-day TTL. */
        restoreAutoSave: () => boolean;
        /**
         * A page was just loaded — when a fresh auto-save differs from it, ask the
         * user whether to pick up their draft instead.
         */
        private _offerRestoreIfNewer;
        protected willUpdate(changed: PropertyValues): void;
        private _typeFromTemplate;
        private _registerSlottedTemplates;
        /** Normalises and installs an externally provided state; resets selection. */
        private _applyExternalState;
        /** Finds a section by id, searching top-level sections and slotted children. */
        private _findSection;
        /** New sections array with the section patched wherever it lives (top level or slot). */
        private _patchSection;
        /** Detaches a section wherever it lives: removed from the top level, or its slot nulled. */
        private _extract;
        /** Installs a new state from a user edit and notifies listeners. */
        private _commit;
        private _selectedSection;
        private _select;
        private _pushHistory;
        undo: () => void;
        redo: () => void;
        /** Adds a section of a registered type at `index` (default: end). Returns null for unknown types. */
        addSection(type: string, index?: number): PageSection | null;
        /** Adds a new section of a registered type into a container's slot. Returns null if not allowed. */
        addSectionToSlot(type: string, containerId: string, slotIndex: number): PageSection | null;
        private _removeSection;
        private _duplicateSection;
        /** Moves a section (top-level or slotted) to a top-level position. */
        private _moveSection;
        /**
         * Moves a section into a container's slot. Dropping onto an occupied slot swaps
         * the two children (slot-to-slot reordering); top-level sections and containers
         * only enter empty slots / never enter slots respectively.
         */
        private _moveToSlot;
        private _onCardDragStart;
        /** Whether a drag carries one of the builder's own payloads. */
        private _isPageDrag;
        private _onSlotDragOver;
        private _onSlotDrop;
        private _onZoneDragOver;
        private _onZoneDrop;
        private _onCanvasDragOver;
        private _onCanvasDrop;
        private _onCardKeydown;
        private _renderPalette;
        private _renderPaletteItem;
        private _renderAutoSaveStatus;
        private _renderRestorePrompt;
        private _renderCanvas;
        /** The one card template both the page list and slot cells render. */
        private _renderSectionCard;
        private _renderCard;
        private _renderSlot;
        /** Types allowed in a container's slots: non-containers, filtered by its accepts list. */
        private _slotTypes;
        /** The one type-picker template both drop zones and slot cells render. */
        private _renderTypePicker;
        private _renderDropZone;
        /**
         * Clones the selected type's config template into a live form and prefills each
         * `[name]` control from the section's data. The element is rendered directly by
         * Lit (`${this._form}`) so user-entered values survive unrelated re-renders.
         */
        private _buildInspectorForm;
        private _isBooleanControl;
        /** Handles change/input events bubbling from stamped form controls. */
        private _onInspectorInput;
        private _updateSectionData;
        private _renameSection;
        private _renderInspector;
        render(): import("lit-html").TemplateResult<1>;
    }
}
declare module "components/page-builder/index" {
    import ZnPageBuilder from "components/page-builder/page-builder.component";
    export * from "components/page-builder/page-builder.component";
    export * from "components/page-builder/page.types";
    export * from "components/page-builder/page-registry";
    export default ZnPageBuilder;
    global {
        interface HTMLElementTagNameMap {
            'zn-page-builder': ZnPageBuilder;
        }
    }
}
declare module "utilities/form" {
    export { clearFormStoreValues } from "internal/form";
}
declare module "events/zn-after-hide" {
    export type ZnAfterHideEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-after-hide': ZnAfterHideEvent;
        }
    }
}
declare module "events/zn-after-show" {
    export type ZnAfterShowEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-after-show': ZnAfterShowEvent;
        }
    }
}
declare module "events/zn-hide" {
    export type ZnHideEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-hide': ZnHideEvent;
        }
    }
}
declare module "events/zn-blur" {
    export type ZnBlurEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-blur': ZnBlurEvent;
        }
    }
}
declare module "events/zn-focus" {
    export type ZnFocusEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-focus': ZnFocusEvent;
        }
    }
}
declare module "events/zn-show" {
    export type ZnShowEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-show': ZnShowEvent;
        }
    }
}
declare module "events/zn-purchase" {
    export type ZnPurchaseEvent = CustomEvent<{
        value: string;
        setSuccess: () => void;
        setFailure: (message?: string) => void;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-purchase': ZnPurchaseEvent;
        }
    }
}
declare module "events/zn-redirect" {
    export type ZnRedirectEvent = CustomEvent<{
        url: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-redirect': ZnRedirectEvent;
        }
    }
}
declare module "events/zn-language-change" {
    export type ZnLanguageChangeEvent = CustomEvent<{
        language: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-language-change': ZnLanguageChangeEvent;
        }
    }
}
declare module "events/zn-reorder" {
    export type ZnReorderEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-reorder': ZnReorderEvent;
        }
    }
}
declare module "events/zn-accept" {
    export type ZnAcceptEvent = CustomEvent<{
        itemId: string;
        acceptUri: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-accept': ZnAcceptEvent;
        }
    }
}
declare module "events/zn-reject" {
    export type ZnRejectEvent = CustomEvent<{
        itemId: string;
        variant: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-reject': ZnRejectEvent;
        }
    }
}
declare module "events/zn-flow-change" {
    import type { FlowState } from "components/flow-builder/flow.types";
    export type ZnFlowChangeEvent = CustomEvent<{
        state: FlowState;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-flow-change': ZnFlowChangeEvent;
        }
    }
}
declare module "events/zn-flow-selection-change" {
    export type ZnFlowSelectionChangeEvent = CustomEvent<{
        nodeId: string | null;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-flow-selection-change': ZnFlowSelectionChangeEvent;
        }
    }
}
declare module "events/zn-flow-connect" {
    import type { FlowConnection } from "components/flow-builder/flow.types";
    export type ZnFlowConnectEvent = CustomEvent<{
        connection: FlowConnection;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-flow-connect': ZnFlowConnectEvent;
        }
    }
}
declare module "events/zn-page-change" {
    import type { PageState } from "components/page-builder/page.types";
    export type ZnPageChangeEvent = CustomEvent<{
        state: PageState;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-page-change': ZnPageChangeEvent;
        }
    }
}
declare module "events/zn-page-selection-change" {
    export type ZnPageSelectionChangeEvent = CustomEvent<{
        sectionId: string | null;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-page-selection-change': ZnPageSelectionChangeEvent;
        }
    }
}
declare module "events/events" {
    export type { ZnAfterHideEvent } from "events/zn-after-hide";
    export type { ZnAfterShowEvent } from "events/zn-after-show";
    export type { ZnHideEvent } from "events/zn-hide";
    export type { ZnBlurEvent } from "events/zn-blur";
    export type { ZnFocusEvent } from "events/zn-focus";
    export type { ZnInputEvent } from "events/zn-input";
    export type { ZnShowEvent } from "events/zn-show";
    export type { ZnPurchaseEvent } from "events/zn-purchase";
    export type { ZnRedirectEvent } from "events/zn-redirect";
    export type { ZnSearchChangeEvent } from "events/zn-search-change";
    export type { ZnLanguageChangeEvent } from "events/zn-language-change";
    export type { ZnReorderEvent } from "events/zn-reorder";
    export type { ZnAcceptEvent } from "events/zn-accept";
    export type { ZnRejectEvent } from "events/zn-reject";
    export type { ZnFlowChangeEvent } from "events/zn-flow-change";
    export type { ZnFlowSelectionChangeEvent } from "events/zn-flow-selection-change";
    export type { ZnFlowConnectEvent } from "events/zn-flow-connect";
    export type { ZnPageChangeEvent } from "events/zn-page-change";
    export type { ZnPageSelectionChangeEvent } from "events/zn-page-selection-change";
}
declare module "zinc" {
    export { default as Button } from "components/button/index";
    export { default as Icon } from "components/icon/index";
    export { default as AbsoluteContainer } from "components/absolute-container/index";
    export { default as Tooltip } from "components/tooltip/index";
    export { default as Popup } from "components/popup/index";
    export { default as Collapsible } from "components/collapsible/index";
    export { default as Alert } from "components/alert/index";
    export { default as ButtonGroup } from "components/button-group/index";
    export { default as ChatMessage } from "components/chat-message/index";
    export { default as ChatMessageAttachment } from "components/chat-message-attachment/index";
    export { default as Chip } from "components/chip/index";
    export { default as Well } from "components/well/index";
    export { default as CopyButton } from "components/copy-button/index";
    export { default as DataTable } from "components/data-table/index";
    export { default as Cols } from "components/cols/index";
    export { default as Confirm } from "components/confirm/index";
    export { default as Dialog } from "components/dialog/index";
    export { default as Dropdown } from "components/dropdown/index";
    export { default as Menu } from "components/menu/index";
    export { default as MenuItem } from "components/menu-item/index";
    export { default as DefinedLabel } from "components/defined-label/index";
    export { default as EmptyState } from "components/empty-state/index";
    export { default as Note } from "components/note/index";
    export { default as Tile } from "components/tile/index";
    export { default as TileGroup } from "components/tile-group/index";
    export { default as TileProperty } from "components/tile-property/index";
    export { default as ChannelTile } from "components/channel-tile/index";
    export { default as Chart } from "components/chart/index";
    export { default as SimpleChart } from "components/simple-chart/index";
    export { default as Header } from "components/header/index";
    export { default as Navbar } from "components/navbar/index";
    export { default as Page } from "components/page/index";
    export { default as Tab } from "components/tab/index";
    export { default as IconPicker } from "components/icon-picker/index";
    export { default as InlineEdit } from "components/inline-edit/index";
    export { default as Pagination } from "components/pagination/index";
    export { default as VerticalStepper } from "components/vertical-stepper/index";
    export { default as Timer } from "components/timer/index";
    export { default as Tabs } from "components/tabs/index";
    export { default as Panel } from "components/panel/index";
    export { default as Table } from "components/table/index";
    export { default as Pane } from "components/pane/index";
    export { default as SplitPane } from "components/split-pane/index";
    export { default as Sidebar } from "components/sidebar/index";
    export { default as Sp } from "components/sp/index";
    export { default as Stepper } from "components/stepper/index";
    export { default as Stat } from "components/stat/index";
    export { default as ScrollContainer } from "components/scroll-container/index";
    export { default as QueryBuilder } from "components/query-builder/index";
    export { default as ProgressTile } from "components/progress-tile/index";
    export { default as ProgressBar } from "components/progress-bar/index";
    export { default as OrderTable } from "components/order-table/index";
    export { default as BulkActions } from "components/bulk-actions/index";
    export { default as Editor } from "components/editor/index";
    export { default as EditorTool } from "components/editor/modules/toolbar/tool/index";
    export { default as EditorQuickAction } from "components/editor/modules/context-menu/quick-action/index";
    export { default as EditorDialog } from "components/editor/modules/dialog/dialog.component";
    export { default as Toggle } from "components/toggle/index";
    export { default as Input } from "components/input/index";
    export { default as Select } from "components/select/index";
    export { default as Option } from "components/option/index";
    export { default as Textarea } from "components/textarea/index";
    export { default as Checkbox } from "components/checkbox/index";
    export { default as Datepicker } from "components/datepicker/index";
    export { default as FormGroup } from "components/form-group/index";
    export { default as InputGroup } from "components/input-group/index";
    export { default as LinkedSelect } from "components/linked-select/index";
    export { default as Radio } from "components/radio/index";
    export { default as Rating } from "components/rating/index";
    export { default as RadioGroup } from "components/radio-group/index";
    export { default as File } from "components/file/index";
    export { default as CheckboxGroup } from "components/checkbox-group/index";
    export { default as Item } from "components/item/index";
    export { default as DataSelect } from "components/data-select/index";
    export { default as ButtonMenu } from "components/button-menu/index";
    export { default as HoverContainer } from "components/hover-container/index";
    export { default as Slideout } from "components/slideout/index";
    export { default as DataTableFilter } from "components/data-table-filter/index";
    export { default as DataTableSort } from "components/data-table-sort/index";
    export { default as DataTableSearch } from "components/data-table-search/index";
    export { default as ActionBar } from "components/action-bar/index";
    export { default as ExpandingAction } from "components/expanding-action/index";
    export { default as PageNav } from "components/page-nav/index";
    export { default as StatusIndicator } from "components/status-indicator/index";
    export { default as SplitButton } from "components/split-button/index";
    export { default as Skeleton } from "components/skeleton/index";
    export { default as Style } from "components/style/index";
    export { default as ContentBlock } from "components/content-block/index";
    export { default as FilterWrapper } from "components/filter-wrapper/index";
    export { default as SettingsContainer } from "components/settings-container/index";
    export { default as FilterContainer } from "components/filter-container/index";
    export { default as Reveal } from "components/reveal/index";
    export { default as AudioSelect } from "components/audio-select/index";
    export { default as Translations } from "components/translations/index";
    export { default as Key } from "components/key/index";
    export { default as KeyContainer } from "components/key-container/index";
    export { default as AnimatedButton } from "components/animated-button/index";
    export { default as TranslationGroup } from "components/translation-group/index";
    export { default as OptGroup } from "components/opt-group/index";
    export { default as PriorityList } from "components/priority-list/index";
    export { default as MarkdownEditor } from "components/markdown-editor/index";
    export { default as FlowBuilder } from "components/flow-builder/index";
    export { default as FlowSteps } from "components/flow-builder/modules/flow-steps/index";
    export { default as FlowStepGroup } from "components/flow-builder/modules/flow-step-group/index";
    export { default as FlowStep } from "components/flow-builder/modules/flow-step/index";
    export { default as FlowBranchConditions } from "components/flow-builder/modules/flow-branch-conditions/index";
    export { default as PageBuilder } from "components/page-builder/index";
    export { default as PagePaletteItem } from "components/page-builder/modules/page-palette-item/index";
    export { default as PageSectionCard } from "components/page-builder/modules/page-section-card/index";
    export { default as ZincElement } from "internal/zinc-element";
    export * from "utilities/on";
    export * from "utilities/query";
    export * from "utilities/lit-to-html";
    export * from "utilities/form";
    export * from "events/events";
}
declare module "components/editor/modules/events/zn-command-select" {
    export type ZnCommandSelectEvent = CustomEvent<{
        item: HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-command-select': ZnCommandSelectEvent;
        }
    }
}
declare module "components/editor/modules/events/zn-dialog-header" {
    /**
     * Dispatched (composed, bubbling) by editor-dialog content that renders its
     * own header row, including a [dialog-closer] control. The dialog responds by
     * removing its floating chrome close button so content doesn't need to
     * reserve space for it.
     */
    export type ZnDialogHeaderEvent = CustomEvent<void>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-dialog-header': ZnDialogHeaderEvent;
        }
    }
}
declare module "components/editor/modules/events/zn-editor-update" {
    export type ZnEditorUpdateEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-editor-update': ZnEditorUpdateEvent;
        }
    }
}
declare module "components/hover-container/hover-container" {
    import '../../../dist/zn.min.js';
}
declare module "events/zn-after-collapse" {
    export type ZnAfterExpandEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-after-expand': ZnAfterExpandEvent;
        }
    }
}
declare module "events/zn-after-expand" {
    export type ZnAfterCollapseEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-after-collapse': ZnAfterCollapseEvent;
        }
    }
}
declare module "events/zn-cancel" {
    export type ZnCancelEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-cancel': ZnCancelEvent;
        }
    }
}
declare module "events/zn-clear" {
    export type ZnClearEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-clear': ZnClearEvent;
        }
    }
}
declare module "events/zn-close" {
    export type ZnCloseEvent = CustomEvent<{
        element: Element;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-close': ZnCloseEvent;
        }
    }
}
declare module "events/zn-collapse" {
    export type ZnCollapseEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-collapse': ZnCollapseEvent;
        }
    }
}
declare module "events/zn-copy" {
    export type ZnCopyEvent = CustomEvent<{
        value: string;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-copy': ZnCopyEvent;
        }
    }
}
declare module "events/zn-element-added" {
    export type ZnElementAddedEvent = CustomEvent<{
        element: Element;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-element-added': ZnElementAddedEvent;
        }
    }
}
declare module "events/zn-error" {
    export type ZnErrorEvent = CustomEvent<{
        status?: number;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-error': ZnErrorEvent;
        }
    }
}
declare module "events/zn-expand" {
    export type ZnExpandEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-expand': ZnExpandEvent;
        }
    }
}
declare module "events/zn-finish" {
    export type ZnFinishEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-finish': ZnFinishEvent;
        }
    }
}
declare module "events/zn-hover" {
    export type ZnHoverEvent = CustomEvent<{
        phase: 'start' | 'move' | 'end';
        value: number;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-hover': ZnHoverEvent;
        }
    }
}
declare module "events/zn-initial-focus" {
    export type ZnInitialFocusEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-initial-focus': ZnInitialFocusEvent;
        }
    }
}
declare module "events/zn-invalid" {
    export type ZnInvalidEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-invalid': ZnInvalidEvent;
        }
    }
}
declare module "events/zn-load" {
    export type ZnLoadEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-load': ZnLoadEvent;
        }
    }
}
declare module "events/zn-menu-ready" {
    export type ZnMenuReadyEvent = CustomEvent<{
        value: string;
        element: HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-menu-ready': ZnMenuReadyEvent;
        }
    }
}
declare module "events/zn-open" {
    export type ZnOpenEvent = CustomEvent<{
        element: Element;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-open': ZnOpenEvent;
        }
    }
}
declare module "events/zn-request-close" {
    export type ZnRequestCloseEvent = CustomEvent<{
        source: 'close-button' | 'keyboard' | 'overlay';
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-request-close': ZnRequestCloseEvent;
        }
    }
}
declare module "events/zn-sort-change" {
    export type ZnSortChangeEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-sort-change': ZnSortChangeEvent;
        }
    }
}
declare module "events/zn-submit" {
    export type ZnSubmitEvent = CustomEvent<{
        value: string | string[];
        element: HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-submit': ZnSubmitEvent;
        }
    }
}
