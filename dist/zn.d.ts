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
    import type { ReactiveController, ReactiveControllerHost } from "lit";
    /**
     * ThemeController is a reactive controller that listens for theme changes
     * and updates the theme property on the host element.
     *
     * if you want to reflect the theme attribute to the host element, you can use
     * the following code:
     *
     * ```ts
     * import { ThemeController } from "@zinc/internal/theme";
     *
     * export default class MyElement extends HTMLElement {
     *    @property({ reflect: true }) t = '';
     *    ...
     *  ```
     */
    export class ThemeController implements ReactiveController {
        host: ReactiveControllerHost & HTMLElement;
        t: string;
        constructor(host: ReactiveControllerHost & HTMLElement);
        hostConnected(): void;
        hostDisconnected(): void;
        handleThemeEventUpdate: (e: CustomEvent & {
            theme: string;
        }) => void;
        getDefaultTheme: () => void;
    }
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
    import { LitElement } from "lit";
    import type { EventTypeDoesNotRequireDetail, EventTypeRequiresDetail, EventTypesWithoutRequiredDetail, EventTypesWithRequiredDetail, GetCustomEventType, ZincEventInit } from "internal/event";
    export default class ZincElement extends LitElement {
        dir: string;
        lang: string;
        t: string;
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
declare module "internal/form" {
    import type { ReactiveController, ReactiveControllerHost } from "lit";
    import type { ZincFormControl } from "internal/zinc-element";
    import type Button from "components/button/index";
    export const formCollections: WeakMap<HTMLFormElement, Set<ZincFormControl>>;
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
        render(): import("lit").TemplateResult<1>;
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
        renderSubmenu(): import("lit").TemplateResult<1>;
    }
}
declare module "utilities/md5" {
    export function md5(string: string): string;
}
declare module "components/icon/icon.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    type IconLibrary = "src" | "material" | "material-outlined" | "material-round" | "material-sharp" | "material-two-tone" | "material-symbols-outlined" | "gravatar" | "libravatar" | "avatar" | "brands" | "line";
    export type IconColor = "default" | "primary" | "accent" | "info" | "warning" | "error" | "success" | "white" | "disabled" | "red" | "blue" | "green" | "orange" | "yellow" | "indigo" | "violet" | "pink" | "grey" | (string & {});
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
        padded: boolean;
        blink: boolean;
        squared: boolean;
        private static readonly presetColors;
        private isPresetColor;
        gravatarOptions: string;
        defaultLibrary: IconLibrary;
        convertToLibrary(input: string): IconLibrary;
        connectedCallback(): void;
        ravatarOptions(): void;
        render(): import("lit").TemplateResult<1>;
        private getAvatarInitials;
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
        render(): import("lit").TemplateResult;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
        private handleClick;
        private handleKeyDown;
        private handleMouseDown;
        private handleSlotChange;
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
        render(): import("lit").TemplateResult<1>;
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
    import type { IconColor } from "components/icon/index";
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
        color: 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent' | 'star';
        size: 'content' | 'x-small' | 'small' | 'medium' | 'large';
        text: boolean;
        outline: boolean;
        disabled: boolean;
        grow: boolean;
        square: boolean;
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
        private domObserver;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        resize(): void;
        observerDom(): void;
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
        render(): import("lit").TemplateResult<1>;
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
        private observer;
        private showArrow;
        connectedCallback(): Promise<void>;
        handleCaptionToggle: (e: ZnInputEvent) => void;
        protected updated(changedProperties: PropertyValues): void;
        disconnectedCallback(): void;
        handleCollapse: (e: MouseEvent) => void;
        recalculateNumberOfItems: () => void;
        render(): import("lit").TemplateResult<1>;
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
        level: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'note' | 'cosmic';
        size: 'small' | 'medium' | 'large';
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        iconSize: number;
        type: 'info' | 'success' | 'warning' | 'error' | 'primary' | 'transparent' | 'custom' | 'neutral';
        size: 'small' | 'medium' | 'large';
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        private readonly hasSlotController;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        colorFormat: 'hex' | 'rgb' | 'oklch';
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import type { CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    import ZincElement from "internal/zinc-element";
    import ZnChip from "components/chip/index";
    import ZnIcon from "components/icon/index";
    import ZnOption from "components/option/index";
    import ZnPopup from "components/popup/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/select
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
     * @dependency zn-option
     * @dependency zn-popup
     * @dependency zn-tag
     *
     * @slot - The listbox options. Must be `<zn-option>` elements. You can use `<zn-divider>` to group items visually.
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
            'zn-option': typeof ZnOption;
            'zn-popup': typeof ZnPopup;
            'zn-tag': typeof ZnChip;
        };
        protected readonly formControlController: FormControlController;
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
        /** @internal */
        private _fetchedOptions;
        /** @internal */
        private _fetchLoading;
        /** @internal */
        private _fetchError;
        /** @internal */
        private _fetchAbortController;
        /** The name of the select, submitted as a name/value pair with form data. */
        name: string;
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
         * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
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
        private handleOptionClick;
        private handleDefaultSlotChange;
        private handleTagRemove;
        private getAllOptions;
        getFirstOption(): ZnOption | null;
        private setCurrentOption;
        private setSelectedOptions;
        private toggleOptionSelection;
        private selectionChanged;
        protected get tags(): TemplateResult<1>[];
        private handleInvalid;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleDisabledChange(): void;
        handleSrcChange(): void;
        private _handleFetchError;
        /** Fetches options from the URL specified by the `src` property. */
        fetchOptions(): Promise<void>;
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
        provider: 'color' | 'currency' | 'country' | 'phone';
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
        distinct: string;
        conditional: string;
        protected readonly formControlController: FormControlController;
        private selectObserver?;
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
        protected render(): import("lit").TemplateResult<1>;
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
        maxOptionsVisible?: string;
    }
    export type QueryBuilderType = 'bool' | 'boolean' | 'date' | 'number';
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        border: boolean;
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
    }
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
     * @event zn-event-name - Emitted as an example.
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
        data: any;
        sortColumn: string;
        sortDirection: string;
        localSort: boolean;
        filter: string;
        search: string;
        wideColumn: string;
        key: string;
        headers: Record<string, HeaderConfig>;
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
        selectAllButton: ZnButton;
        private _initialLoad;
        private _lastTableContent;
        private resizeObserver;
        private itemsPerPage;
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
        requestParams: Record<string, any>;
        refresh(): void;
        render(): TemplateResult<1>;
        connectedCallback(): void;
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
        renderCell(data: Cell): TemplateResult;
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
        render(): import("lit").TemplateResult<1>;
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
        private _isLink;
        render(): import("lit").TemplateResult;
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
        render(): import("lit").TemplateResult<1>;
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
declare module "components/chart/chart.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/data-chart
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
    export default class ZnChart extends ZincElement {
        static styles: CSSResultGroup;
        type: 'area' | 'bar' | 'line';
        data: any[];
        categories: string | string[];
        xAxis: string;
        datapointSize: number;
        stacked: boolean;
        live: boolean;
        dataUrl: string;
        liveInterval: number;
        height: number;
        enableAnimations: boolean;
        yAxisAppend: string;
        private chart;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
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
    import { Chart } from "chart.js";
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/simple-chart
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
    export default class ZnSimpleChart extends ZincElement {
        static styles: CSSResultGroup;
        datasets: any[];
        labels: any[];
        myChart: Chart;
        constructor();
        firstUpdated(): void;
        render(): import("lit").TemplateResult<1>;
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
     * @slot example - An example slot.
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
        stacked: boolean;
        dropdown: never[];
        noPad: false;
        manualAddItems: boolean;
        isolated: boolean;
        masterId: string;
        storeKey: string;
        storeTtl: number;
        localStorage: boolean;
        private _preItems;
        private _postItems;
        private _appended;
        private _expanding;
        private _openedTabs;
        private resizeObserver;
        private _navItems;
        private _expandable;
        private _extendedMenu;
        private _navItemsGap;
        private _expandableMargin;
        private _totalItemWidth;
        protected _store: Store;
        appendItem(item: Element): void;
        connectedCallback(): void;
        handleResize: () => void;
        addItem(item: Element, persist?: boolean): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private _loadStoredTabs;
        private _saveTabToStorage;
        private handleClick;
        render(): import("lit").TemplateResult<1>;
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
        description: string;
        navigation: never[];
        fullWidth: boolean;
        previousPath: string;
        previousTarget: string;
        private navbar;
        connectedCallback(): void;
        disconnectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        handleAltPress: () => void;
        handleAltUp: () => void;
        updateNav(): void;
        render(): import("lit").TemplateResult<1>;
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
        private _handleTriggerKeyDown;
        render(): import("lit").TemplateResult<1>;
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
    import { type CSSResultGroup, type HTMLTemplateResult } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    import ZincElement from "internal/zinc-element";
    import ZnSelect from "components/select/index";
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
        value: string;
        name: string;
        placeholder: string;
        editText: string;
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
        input: ZnInput | ZnSelect;
        defaultValue: string;
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        firstUpdated(): Promise<void>;
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
        protected render(): import("lit").TemplateResult<1>;
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
        protected render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        _splitMax: number;
        primaryCaption: string;
        secondaryCaption: string;
        noPrefetch: boolean;
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
        render(): import("lit").TemplateResult<1>;
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
declare module "events/zn-sidebar-toggle" {
    export type ZnSidebarToggleEvent = CustomEvent<{
        element: Element;
        open: boolean;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-sidebar-toggle': ZnSidebarToggleEvent;
        }
    }
}
declare module "components/panel/panel.component" {
    import "events/zn-sidebar-toggle";
    import { type CSSResultGroup, type PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Panels are versatile containers that provide structure for organizing content with optional headers, footers, and sidebars.
     * @documentation https://zinc.style/components/panel
     * @status experimental
     * @since 1.0
     *
     * @slot - The panel's main content.
     * @slot actions - Actions displayed in the panel header (buttons, chips, etc).
     * @slot footer - Content displayed in the panel footer.
     * @slot side - Sidebar content displayed on the left or right side of the panel.
     *
     * @event zn-sidebar-toggle - Emitted when the sidebar is toggled. The event detail contains the panel element and the open state.
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
        description: string;
        tabbed: boolean;
        underlineHeader: boolean;
        cosmic: boolean;
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
        flushFooter: boolean;
        transparent: boolean;
        shadow: boolean;
        sidebarPosition: 'left' | 'right';
        sidebarTooltip: string;
        sidebarIcon: string;
        sidebarOpen: boolean;
        enableSidebarToggle: boolean;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        toggleSidebar(): void;
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
        resizing(): void;
        connectedCallback(): void;
        _handleMenu(e: any): void;
        menuClick(e: any): void;
        tableHead(): import("lit").TemplateResult<1> | undefined;
        tableBody(): import("lit").TemplateResult<1>;
        columnContent(col: any): any;
        render(): import("lit").TemplateResult<1>;
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
        protected _header: HTMLElement;
        connectedCallback(): void;
        render(): import("lit").TemplateResult<1>;
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
        private primaryFull;
        calculatePixels: boolean;
        preferSecondarySize: boolean;
        minimumPaneSize: number;
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
        localStorage: boolean;
        storeTtl: number;
        protected _store: Store;
        connectedCallback(): void;
        firstUpdated(changedProperties: any): void;
        applyStoredSize(): void;
        resize(e: any): void;
        setSize(primaryPanelPixels: number): void;
        _togglePane(e: any): void;
        _setFocusPane(idx: number): void;
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
        constructor();
        connectedCallback(): void;
        observerDom(): void;
        scrollBottom(): void;
        render(): import("lit").TemplateResult<1>;
        _expander(): import("lit").TemplateResult<1>;
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
     * @summary Short summary of the component's intended use.
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
        grow: boolean;
        padX: boolean;
        padY: boolean;
        noGap: boolean;
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
        render(): import("lit").TemplateResult<1>;
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
        diffText(): import("lit").TemplateResult<1> | null;
        render(): import("lit").TemplateResult<1>;
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
        private _footerResizeObserver?;
        connectedCallback(): void;
        disconnectedCallback(): void;
        render(): import("lit").TemplateResult<1>;
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
     * @cssproperty --zn-primary - The color of the progress bar fill.
     * @cssproperty --zn-text-heading - The color of the caption text.
     * @cssproperty --zn-text - The color of the progress percentage and description text.
     * @cssproperty --zn-spacing-x-small - The spacing between header/footer and the progress bar.
     */
    export default class ZnProgressBar extends ZincElement {
        static styles: CSSResultGroup;
        caption: string | undefined;
        description: string | undefined;
        value: number | undefined;
        showProgress: boolean | undefined;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
        getHeaders(): import("lit").TemplateResult<1>;
        getRows(): import("lit").TemplateResult<1>;
        getCaption(item: any): import("lit").TemplateResult<1>;
        getSubItems(item: any): import("lit").TemplateResult<1>;
        getSummary(): import("lit").TemplateResult<1>;
        private getMobileRows;
        getMobileSubItems(item: any): import("lit").TemplateResult<1>;
        getMobileCaption(item: any, extra: any): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import { type CSSResultGroup } from "lit";
    import ZincElement from "internal/zinc-element";
    export default class ZnEditorTool extends ZincElement {
        static styles: CSSResultGroup;
        uri: string;
        label: string;
        key: string;
        icon: string;
        handler: string;
        render(): import("lit").TemplateResult<1>;
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
        private _resizeObserver;
        private _resizeId;
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
        render(): import("lit").TemplateResult<1>;
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
        dialogEl: HTMLDialogElement;
        open: boolean;
        uri: string;
        private closeWatcher;
        private _editorId;
        set editorId(value: string);
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        setContent(content: string): void;
        handleOpenChange(): void;
        private addOpenListeners;
        private removeOpenListeners;
        private requestClose;
        private _getLoadingState;
        render(): import("lit").TemplateResult<1>;
    }
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
        private _lastDialogUri?;
        private _formatters;
        constructor(quill: Quill, options: {
            container: ToolbarComponent;
            handlers?: Record<string, (value?: any) => void>;
            config?: EditorFeatureConfig;
        });
        callFormat(key: string, value?: string | boolean | undefined): void;
        trigger(key: string): void;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
declare module "components/editor/modules/dialog/dialog" {
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
        private createComponent;
        isOpen(): boolean;
        close(): void;
    }
    export default Dialog;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        private resizeObserver;
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
        disconnectedCallback(): void;
        private handleBlur;
        private handleChange;
        private handleFocus;
        private handleInput;
        private handleInvalid;
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
        render(): import("lit").TemplateResult<1>;
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
declare module "components/editor/editor.component" {
    import { type CSSResultGroup, type PropertyValues } from 'lit';
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
        private quillElement;
        private _content;
        private _selectionRange;
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private _handleTextChange;
        private _getQuillKeyboardBindings;
        private _handleEditorChange;
        private _replaceTextAtSelection;
        private _insertTextAtSelection;
        private _closePopups;
        private _closeAiPanel;
        private _closeDialog;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        private _instance;
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
        protected updated(_changedProperties: PropertyValues): void;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import type { ZincFormControl } from "internal/zinc-element";
    import ZincElement from "internal/zinc-element";
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import type ZnButton from "components/button/index";
    /**
     * @summary File controls allow selecting an arbitrary number of files for uploading.
     * @documentation https://zinc.style/components/drag-upload
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-button
     * @dependency zn-icon
     *
     * @slot label - The file control's label. Alternatively, you can use the `label` attribute.
     * @slot help-text - Text that describes how to use the file control.
     *    Alternatively, you can use the `help-text` attribute.
     * @slot droparea-icon - Optional droparea icon to use instead of the default.
     *    Works best with `<zn-icon>`.
     * @slot trigger - Optional content to be used as trigger instead of the default content.
     *    Opening the file dialog on click and as well as drag and drop will work for this content.
     *    Following attributes will no longer work: *label*, *droparea*, *help-text*, *size*,
     *    *hide-value*. Also if using the disabled attribute, the disabled styling will not be
     *    applied and must be taken care of yourself.
     *
     * @event zn-blur - Emitted when the control loses focus.
     * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
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
     * @csspart droparea-icon - The container that wraps the icon for the drop zone.
     * @csspart droparea-value - The text for the drop zone.
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
        private readonly formControlController;
        private readonly hasSlotController;
        private readonly localize;
        private userIsDragging;
        input: HTMLInputElement;
        button: ZnButton;
        dropareaWrapper: HTMLDivElement;
        dropareaIcon: HTMLSpanElement;
        inputChosen: HTMLSpanElement;
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
        private renderFileValueWithDelete;
        private renderDroparea;
        private renderButton;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    /**
     * @summary Used for listing items in a description list. Caption on the right, content on the left.
     * @documentation https://zinc.style/components/item
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
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
        };
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        stacked: boolean;
        size: 'small' | 'medium' | 'large';
        editOnHover: boolean;
        icon: string;
        value: string;
        inline: boolean;
        grid: boolean;
        noPadding: boolean;
        alignEnd: boolean;
        alignCenter: boolean;
        connectedCallback(): void;
        protected updated(_changedProperties: PropertyValues): void;
        protected _hasContent(): boolean;
        protected _hasRequiredSlot(): boolean;
        render(): import("lit").TemplateResult<1>;
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
        size: 'content' | 'x-small' | 'small' | 'medium' | 'large';
        iconSize: number;
        noGap: boolean;
        noPadding: boolean;
        private _buttons;
        private _originalButtons;
        private resizeObserver;
        protected firstUpdated(_changedProperties: PropertyValues): Promise<void>;
        watchContainerMaxWidth(): void;
        connectedCallback(): void;
        disconnectedCallback(): void;
        handleResize: () => void;
        calculateVisibleButtons(): void;
        calculateMenuButtons(totalButtons: number, visibleButtons: number, buttons: CustomButtonWidths[]): void;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        private _countObserver?;
        private _colorObserver?;
        constructor();
        connectedCallback(): Promise<void>;
        disconnectedCallback(): void;
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
        render(): import("lit").TemplateResult<1>;
        protected renderDropdown(): import("lit").TemplateResult<1>;
        protected renderFill(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        type: 'success' | 'error' | 'warning' | 'info';
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import type { PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    interface TextRow {
        lines: string[];
        type: 'reply' | 'text';
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/content-block
     * @status experimental
     * @since 1.0
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
        private _textRows;
        private _footerObserver?;
        private _replaceDebounce;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _collapseContent;
        private _toggleText;
        private _toggleHtml;
        private _resizeIframe;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/settings-container
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
    export default class ZnSettingsContainer extends ZincElement {
        static styles: CSSResultGroup;
        filters: SettingsContainerFilter[];
        position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
        storeKey: string;
        noScroll: boolean;
        private _mutationObserver;
        private _updateFiltersScheduled;
        private _store;
        private _hiddenElements;
        connectedCallback(): void;
        disconnectedCallback(): void;
        private scheduleUpdateFilters;
        private handleContentSlotChange;
        private handleFiltersSlotChange;
        private recomputeFiltersFromSlot;
        private updateSingleFilter;
        updateFilters(): void;
        updateFilter(e: ZnChangeEvent): void;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
        private _isRevealed;
        private _isToggled;
        protected handleToggleReveal(): void;
        protected handleMouseEnter(): void;
        protected handleMouseLeave(): void;
        render(): import("lit").TemplateResult<1>;
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
        render(): import("lit").TemplateResult<1>;
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
    import ZnInlineEdit from "components/inline-edit/index";
    import ZnInput from "components/input/index";
    import ZnNavbar from "components/navbar/index";
    import type { PropertyValues } from 'lit';
    import type { ZincFormControl } from "internal/zinc-element";
    export default class ZnTranslations extends ZincElement implements ZincFormControl {
        static styles: import("lit").CSSResult;
        static dependencies: {
            'zn-navbar': typeof ZnNavbar;
            'zn-input': typeof ZnInput;
            'zn-inline-edit': typeof ZnInlineEdit;
        };
        private readonly formControlController;
        private readonly hasSlotController;
        name: string;
        value: string;
        label: string;
        disabled: boolean;
        required: boolean;
        flush: boolean;
        /** When true, hides the individual language navbar and defers language control to a parent zn-translation-group. */
        grouped: boolean;
        languages: Record<string, string>;
        values: Record<string, string>;
        private _activeLanguage;
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
        protected firstUpdated(): void;
        willUpdate(changedProperties: PropertyValues): void;
        private handleLanguageAdd;
        private handleNavbarClick;
        private handleValueUpdate;
        private updateValue;
        private handleKeyDown;
        private handleSubmit;
        private isRTLLanguage;
        render(): import("lit").TemplateResult<1>;
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
     * @summary A key item used within a key container to filter content.
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
        render(): import("lit").TemplateResult<1>;
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
     * @summary A container that manages key items and filters content based on active keys.
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
        render(): import("lit").TemplateResult<1>;
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
        protected render(): import("lit").TemplateResult<1>;
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
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected updated(changedProperties: PropertyValues): void;
        private getAllTranslations;
        /** Sync grouped state, languages, and active language to all children. */
        private syncChildren;
        private syncChildLanguages;
        private handleSlotChange;
        private switchLanguage;
        private handleLanguageAdd;
        render(): import("lit").TemplateResult<1>;
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
    export { default as TileProperty } from "components/tile-property/index";
    export { default as Chart } from "components/chart/index";
    export { default as SimpleChart } from "components/simple-chart/index";
    export { default as Header } from "components/header/index";
    export { default as Navbar } from "components/navbar/index";
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
    export { default as ZincElement } from "internal/zinc-element";
    export * from "utilities/on";
    export * from "utilities/query";
    export * from "utilities/lit-to-html";
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
