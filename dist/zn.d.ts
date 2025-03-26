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
        handleThemeEventUpdate(e: CustomEvent): void;
        getDefaultTheme(): void;
    }
}
declare module "internal/zinc-element" {
    import { LitElement } from "lit";
    import { EventTypeDoesNotRequireDetail, EventTypeRequiresDetail, EventTypesWithoutRequiredDetail, EventTypesWithRequiredDetail, GetCustomEventType, ZincEventInit } from "internal/event";
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
        hostConnected(): void;
        hostDisconnected(): void;
        hostUpdated(): void;
        private attachForm;
        private detachForm;
        private handleFormData;
        private handleFormSubmit;
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
        getSlot(slotName: string): HTMLElement;
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
declare module "components/popup/popup.component" {
    import { CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
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
declare module "components/tooltip/tooltip.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
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
        handleOpenChange(): Promise<void>;
        handleOptionsChange(): Promise<void>;
        handleDisabledChange(): void;
        show(): Promise<void>;
        hide(): Promise<void>;
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
declare module "utilities/md5" {
    export function md5(string: string): string;
}
declare module "components/icon/icon.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    const colors: {
        "": string;
        primary: string;
        accent: string;
        info: string;
        warning: string;
        error: string;
        success: string;
        white: string;
        disabled: string;
    };
    type Color = keyof typeof colors;
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
        library: string;
        round: boolean;
        color: Color;
        gravatarOptions: string;
        connectedCallback(): void;
        ravatarOptions(): void;
        attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
        render(): import("lit").TemplateResult<1>;
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
declare module "components/button/button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import ZnTooltip from "components/tooltip/index";
    import ZnIcon from "components/icon/index";
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
        button: HTMLButtonElement;
        color: 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent' | 'star';
        size: 'content' | 'x-small' | 'small' | 'medium' | 'large';
        outline: boolean;
        disabled: boolean;
        grow: boolean;
        verticalAlign: 'start' | 'center' | 'end';
        content: string;
        icon: string;
        gaid: string;
        iconPosition: 'left' | 'right';
        iconSize: string;
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
        get validity(): ValidityState;
        get validationMessage(): string;
        firstUpdated(): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        private handleClick;
        private _isLink;
        private _isButton;
        protected render(): unknown;
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
    import { PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/absolute-container
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
declare module "components/accordion/accordion.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/accordion
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
    export default class ZnAccordion extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        summary: string;
        label: string;
        expanded: boolean;
        render(): import("lit").TemplateResult<1>;
        handleCollapse(e: any): void;
    }
}
declare module "components/accordion/index" {
    import ZnAccordion from "components/accordion/accordion.component";
    export * from "components/accordion/accordion.component";
    export default ZnAccordion;
    global {
        interface HTMLElementTagNameMap {
            'zn-accordion': ZnAccordion;
        }
    }
}
declare module "components/action-item/action-item.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/action-item
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
    export default class ZnActionItem extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        uri: string;
        protected render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/action-item/index" {
    import ZnActionItem from "components/action-item/action-item.component";
    export * from "components/action-item/action-item.component";
    export default ZnActionItem;
    global {
        interface HTMLElementTagNameMap {
            'zn-action-item': ZnActionItem;
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
        level: 'primary' | 'error' | 'info' | 'success' | 'warning';
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
declare module "components/avatar/avatar.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/avatar
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
    export default class ZnAvatar extends ZincElement {
        static styles: CSSResultGroup;
        avatar: string;
        getRandomColorCssVar(): string;
        protected firstUpdated(): void;
        render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/avatar/index" {
    import ZnAvatar from "components/avatar/avatar.component";
    export * from "components/avatar/avatar.component";
    export default ZnAvatar;
    global {
        interface HTMLElementTagNameMap {
            'zn-avatar': ZnAvatar;
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
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnButtonGroup extends ZincElement {
        static styles: CSSResultGroup;
        direction: 'horizontal' | 'vertical';
        grow: boolean;
        wrap: boolean;
        start: boolean;
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
        type: 'info' | 'success' | 'warning' | 'error' | 'primary' | 'transparent' | 'neutral';
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
declare module "components/collapsible/collapsible.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import { Store } from "internal/storage";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/collapsible
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
    export default class ZnCollapsible extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        open: boolean;
        defaultState: string;
        localStorage: Boolean;
        storeKey: string;
        storeTtl: number;
        protected _store: Store;
        connectedCallback(): void;
        toggle(): void;
        protected render(): unknown;
    }
}
declare module "components/collapsible/index" {
    import ZnCollapsible from "components/collapsible/collapsible.component";
    export * from "components/collapsible/collapsible.component";
    export default ZnCollapsible;
    global {
        interface HTMLElementTagNameMap {
            'zn-collapsible': ZnCollapsible;
        }
    }
}
declare module "components/copy-button/copy-button.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnTooltip from "components/tooltip/index";
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
declare module "components/data-table/data-table.component" {
    import { type CSSResultGroup, TemplateResult } from 'lit';
    import ZincElement from "internal/zinc-element";
    type TableData = {
        page: 1;
        per_page: 10;
        total: 100;
        total_pages: 10;
        data: any[];
    };
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/data-table
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
    export default class ZnDataTable extends ZincElement {
        static styles: CSSResultGroup;
        dataUri: string;
        sortColumn: string;
        sortDirection: string;
        wideColumn: string;
        key: string;
        headers: string;
        hiddenHeaders: string;
        private itemsPerPage;
        private page;
        private totalPages;
        private _rows;
        private _filteredRows;
        private numberOfRowsSelected;
        private selectedRows;
        private hasSlotController;
        private _uacTask;
        private _dataTask;
        render(): TemplateResult<1> | undefined;
        renderTable(data: TableData): TemplateResult<1>;
        getTableHeader(): TemplateResult<1>;
        getTableFooter(): TemplateResult<1>;
        goToFirstPage(): void;
        goToPreviousPage(): void;
        goToNextPage(): void;
        goToLastPage(): void;
        updateRowsPerPage(event: Event): void;
        selectAll(event: Event): void;
        private updateActionKeys;
        selectRow(): void;
        clearSelectedRows(): void;
        updateSort(key: string): () => void;
        renderData(value: any): any;
        private getTableSortIcon;
        private renderCellHeader;
        private renderCellBody;
        private getRows;
        private getSelectedKeys;
        private updateKeys;
        private updateModifyKeys;
        private updateDeleteKeys;
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
        gap: boolean;
        border: boolean;
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
        panel: HTMLElement;
        overlay: HTMLElement;
        /** The dialog's theme variant. */
        variant: 'default' | 'warning' | 'announcement';
        /** The dialog's size. */
        size: 'small' | 'medium' | 'large';
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
         * The dialog's trigger element. This is used to open the dialog when clicked. If you do not provide a trigger, you
         * will need to manually open the dialog using the `show()` method.
         */
        trigger: string;
        /** The Dialogs announcement text. */
        announcement: string;
        /** The Dialogs footer text. */
        footerText: string;
        dialog: ZnDialog;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        connectedCallback(): void;
        show(): void;
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
declare module "translations/en" {
    import { type Translation } from "utilities/localize";
    const translation: Translation;
    export default translation;
}
declare module "utilities/localize" {
    import type { Translation as DefaultTranslation } from '@shoelace-style/localize';
    import { LocalizeController as DefaultLocalizationController } from '@shoelace-style/localize';
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
declare module "components/menu-item/menu-item.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import ZnPopup from "components/popup/index";
    import ZnIcon from "components/icon/index";
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
        /** A unique value to store in the menu item. This can be used as a way to identify menu items when selected. */
        value: string;
        /** Draws the menu item in a loading state. */
        loading: boolean;
        /** Draws the menu item in a disabled state, preventing selection. */
        disabled: boolean;
        href: string;
        dataPath: string;
        target: '_self' | '_blank' | '_parent' | '_top' | string;
        dataTarget: 'modal' | 'slide' | string;
        rel: string;
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
declare module "components/menu/menu.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type ZnMenuItem from "components/menu-item/index";
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
        defaultSlot: HTMLSlotElement;
        actions: never[];
        connectedCallback(): void;
        private handleClick;
        private handleKeyDown;
        private handleMouseDown;
        private handleSlotChange;
        private isMenuItem;
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
        private handleConfirm;
        render(): import("lit").TemplateResult<1>;
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
declare module "events/zn-select" {
    import type ZnMenuItem from "components/menu-item/index";
    export type ZnSelectEvent = CustomEvent<{
        item: ZnMenuItem;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-select': ZnSelectEvent;
        }
    }
}
declare module "components/dropdown/dropdown.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    import type ZnPopup from "components/popup/index";
    import { ZnSelectEvent } from "events/zn-select";
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
        connectedCallback(): void;
        focusOnTrigger(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        disconnectedCallback(): void;
        private getMenu;
        private addOpenListeners;
        private removeOpenListeners;
        /** Events */
        handlePanelSelect: (event: ZnSelectEvent) => void;
        handleTriggerClick(): void;
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
        handleOpenChange(): Promise<void>;
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
declare module "components/defined-label/defined-label.component" {
    import { type CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/defined-label
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
    export default class ZnDefinedLabel extends ZincElement {
        static styles: CSSResultGroup;
        private readonly formControlController;
        input: HTMLInputElement;
        valueInput: HTMLInputElement;
        value: string;
        inputValue: string;
        name: string;
        title: string;
        disabled: boolean;
        predefinedLabels: never[];
        get validationMessage(): string;
        get validity(): ValidityState;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        handleValueChange(): Promise<void>;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private handleChange;
        private handleInput;
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
declare module "components/chat-message/clean-message" {
    export function cleanHTML(message: string): string;
}
declare module "components/chat-message/chat-message.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/chat-message
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
    export default class ZnChatMessage extends ZincElement {
        static styles: CSSResultGroup;
        sender: string;
        message: string;
        time: string;
        actionType: '' | 'connected.agent' | 'attachment.added' | 'multi.answer' | 'transfer' | 'ended' | "error" | 'message-sending' | 'customer.ended' | 'customer.connected' | 'customer.disconnected';
        customerInitiated: string;
        connectedCallback(): void;
        render(): import("lit").TemplateResult<1>;
        private _displayMessage;
        private _getSentTime;
        private _displayMultiAnswer;
        private _prepareMessageContent;
        private _getAuthor;
        private _getTime;
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
declare module "components/note/note.component" {
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
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnNote extends ZincElement {
        static styles: CSSResultGroup;
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
        caption: string;
        description: string;
        subCaption: string;
        subDescription: string;
        right: boolean;
        dataUri: string;
        dataTarget: string;
        centered: boolean;
        private menu;
        constructor();
        connectedCallback(): void;
        _handleActions(e: any): void;
        render(): import("lit").TemplateResult<1>;
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
declare module "components/list-tile/list-tile.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/list-tile
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
    export default class ZnListTile extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        caption: string;
        description: string;
        href: string;
        dataTarget: string;
        render(): import("lit").TemplateResult;
    }
}
declare module "components/list-tile/index" {
    import ZnListTile from "components/list-tile/list-tile.component";
    export * from "components/list-tile/list-tile.component";
    export default ZnListTile;
    global {
        interface HTMLElementTagNameMap {
            'zn-list-tile': ZnListTile;
        }
    }
}
declare module "components/list-tile-property/list-tile-property.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/list-tile-property
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
    export default class ZnListTileProperty extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        description: string;
        render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/list-tile-property/index" {
    import ZnListTileProperty from "components/list-tile-property/list-tile-property.component";
    export * from "components/list-tile-property/list-tile-property.component";
    export default ZnListTileProperty;
    global {
        interface HTMLElementTagNameMap {
            'zn-list-tile-property': ZnListTileProperty;
        }
    }
}
declare module "components/chart/html-legend-plugin" {
    export const htmlLegendPlugin: {
        id: string;
        afterUpdate(chart: any, _args: any, options: any): void;
    };
}
declare module "components/chart/chart.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/chart
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
        data: any[];
        labels: any[];
        type: string;
        constructor();
        static get properties(): {
            Test: {
                type: StringConstructor;
            };
            myChart: {
                type: ObjectConstructor;
            };
        };
        connectedCallback(): void;
        firstUpdated(): void;
        render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/chart/index" {
    import ZnChart from "components/chart/chart.component";
    export * from "components/chart/chart.component";
    export default ZnChart;
    global {
        interface HTMLElementTagNameMap {
            'zn-chart': ZnChart;
        }
    }
}
declare module "components/apex-chart/apex-chart.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/apex-chart
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
    export default class ZnApexChart extends ZincElement {
        static styles: CSSResultGroup;
        type: string;
        amount: string;
        static get properties(): {
            Test: {
                type: StringConstructor;
            };
            myChart: {
                type: ObjectConstructor;
            };
        };
        firstUpdated(): void;
        render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/apex-chart/index" {
    import ZnApexChart from "components/apex-chart/apex-chart.component";
    export * from "components/apex-chart/apex-chart.component";
    export default ZnApexChart;
    global {
        interface HTMLElementTagNameMap {
            'zn-apex-chart': ZnApexChart;
        }
    }
}
declare module "components/data-chart/data-chart.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
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
    export default class ZnDataChart extends ZincElement {
        static styles: CSSResultGroup;
        type: 'area' | 'bar' | 'line';
        data: any[];
        categories: string | string[];
        xAxis: string;
        datapointSize: number;
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
declare module "components/data-chart/index" {
    import ZnDataChart from "components/data-chart/data-chart.component";
    export * from "components/data-chart/data-chart.component";
    export default ZnDataChart;
    global {
        interface HTMLElementTagNameMap {
            'zn-data-chart': ZnDataChart;
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
    import type { PropertyValues } from 'lit';
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/navbar
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
    export default class ZnNavbar extends ZincElement {
        static styles: CSSResultGroup;
        navigation: never[];
        fullWidth: boolean;
        iconBar: boolean;
        hideOne: boolean;
        stacked: boolean;
        dropdown: never[];
        private _preItems;
        private _postItems;
        private _openedTabs;
        connectedCallback(): void;
        addItem(item: any): any;
        protected firstUpdated(_changedProperties: PropertyValues): void;
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
    import { type CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
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
        description: string;
        navigation: never[];
        breadcrumb: {
            path: string;
            title: string;
        }[];
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
        render(): TemplateResult<1>;
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
declare module "internal/default-value" {
    import type { ReactiveElement } from 'lit';
    export const defaultValue: (propertyName?: string) => (proto: ReactiveElement, key: string) => void;
}
declare module "components/input/input.component" {
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
    import ZnTooltip from "components/tooltip/index";
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
        private hasFocus;
        title: string;
        private __numberInput;
        private __dateInput;
        /**
         * The type of input. Works the same as native `<input>` element. But only a subset of types is supported. Defaults
         * to `text`
         */
        type: 'currency' | 'date' | 'datetime-local' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url';
        /** The name of the input, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the input, submitted as a name/value pair with form data. */
        value: any;
        /** The default value of the form control. Primarily used for resetting the form control. */
        defaultValue: string;
        /** The inputs size **/
        size: 'small' | 'medium' | 'large';
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
        private handleBlur;
        private handleChange;
        private handleClearClick;
        private handleFocus;
        private handleInput;
        private handleInvalid;
        private handleKeyDown;
        private handlePasswordToggle;
        handleDisabledChange(): void;
        handleStepChange(): void;
        handleValueChange(): Promise<void>;
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
        defaultSlot: HTMLSlotElement;
        current: boolean;
        selected: boolean;
        hasHover: boolean;
        /**
         * The option's value. When selected, the containing form control will receive this value. The value must be unique
         * from other options in the same group. Values may not contain spaces, as spaces are used as delimiters when listing
         * multiple values.
         */
        value: string;
        /** Draws the option in a disabled state, preventing selection. */
        disabled: boolean;
        connectedCallback(): void;
        private handleDefaultSlotChange;
        private handleMouseEnter;
        private handleMouseLeave;
        handleDisabledChange(): void;
        handleSelectedChange(): void;
        handleValueChange(): void;
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
declare module "components/select/select.component" {
    import { type CSSResultGroup, type TemplateResult } from 'lit';
    import { FormControlController } from "internal/form";
    import type { ZincFormControl } from "internal/zinc-element";
    import ZincElement from "internal/zinc-element";
    import ZnChip from "components/chip/index";
    import ZnIcon from "components/icon/index";
    import ZnPopup from "components/popup/index";
    import type ZnOption from "components/option/index";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/select
     * @status experimental
     * @since 1.0
     *
     * @dependency zn-icon
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
        private hasFocus;
        displayLabel: string;
        currentOption: ZnOption;
        selectedOptions: ZnOption[];
        private valueHasChanged;
        /** The name of the select, submitted as a name/value pair with form data. */
        name: string;
        private _value;
        get value(): string | string[];
        /**
         * The current value of the select, submitted as a name/value pair with form data. When `multiple` is enabled, the
         * value attribute will be a space-delimited list of values based on the options selected, and the value property will
         * be an array. **For this reason, values must not contain spaces.**
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
        /**
         * A function that customizes the tags to be rendered when multiple=true. The first argument is the option, the second
         * is the current tag's index.  The function should return either a Lit TemplateResult or a string containing trusted HTML of the symbol to render at
         * the specified value.
         */
        getTag: (option: ZnOption, index: number) => TemplateResult | string | HTMLElement;
        /** Gets the validity state object */
        get validity(): ValidityState;
        /** Gets the validation message */
        get validationMessage(): string;
        connectedCallback(): void;
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
        handleDisabledChange(): void;
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
declare module "components/inline-edit/inline-edit.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import ZnInput from "components/input/index";
    import ZnSelect from "components/select/index";
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
     * @slot - The default slot.
     * @slot example - An example slot.
     *
     * @csspart base - The component's base wrapper.
     *
     * @cssproperty --example - An example CSS custom property.
     */
    export default class ZnInlineEdit extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        private readonly formControlController;
        value: string;
        name: string;
        placeholder: string;
        editText: string;
        disabled: boolean;
        inline: boolean;
        padded: boolean;
        required: boolean;
        options: {
            [key: string]: string;
        };
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
        handleValueChange(): Promise<void>;
        escKeyHandler: (e: KeyboardEvent) => void;
        handleEditClick: (e: MouseEvent) => void;
        handleSubmitClick: (e: MouseEvent) => void;
        handleCancelClick: (e: MouseEvent) => void;
        handleBlur: () => void;
        handleInput: (e: Event) => void;
        protected render(): import("lit").TemplateResult<1>;
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
declare module "components/interaction-tile/interaction-tile.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    export enum InteractionType {
        chat = "chat",
        ticket = "ticket",
        voice = "voice",
        unknown = "unknown"
    }
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/interaction-tile
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
    export default class ZnInteractionTile extends ZincElement {
        static styles: CSSResultGroup;
        type: InteractionType;
        interactionStatus: string;
        status: string;
        caption: string;
        lastMessage: string;
        lastMessageCount: number;
        lastMessageTime: number;
        startTime: number;
        reservedUntil: number;
        brand: string;
        brandIcon: string;
        department: string;
        queue: string;
        acceptUri: string;
        private _updateInterval;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        protected _getInteractionColor(): "disabled" | "warning" | "error" | "primary";
        protected _getInteractionIcon(): import("lit").TemplateResult<1>;
        disconnectedCallback(): void;
        protected _getStartTime(): string;
        protected _getStatusBar(): import("lit").TemplateResult<1>;
        protected _getDepartmentAndQueue(): import("lit").TemplateResult<1>;
        protected _getWaitingResponseTime(): number;
        protected _startInterval(): void;
        protected _clearStartInterval(): void;
        protected _waitingResponseContent(): import("lit").TemplateResult<1> | undefined;
        protected render(): unknown;
        protected _getAcceptButton(): import("lit").TemplateResult<1>;
        protected _getInteractionAcceptIcon(): "chat" | "mail" | "call" | "support_agent";
        protected _getReservedHtml(): import("lit").TemplateResult<1> | undefined;
        protected _getBrandHtml(): import("lit").TemplateResult<1> | undefined;
        protected _maskCaption(str: string): string;
    }
}
declare module "components/interaction-tile/index" {
    import ZnInteractionTile from "components/interaction-tile/interaction-tile.component";
    export * from "components/interaction-tile/interaction-tile.component";
    export default ZnInteractionTile;
    global {
        interface HTMLElementTagNameMap {
            'zn-interaction-tile': ZnInteractionTile;
        }
    }
}
declare module "components/pagination/pagination.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/pagination
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
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/vertical-stepper
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
    export default class ZnVerticalStepper extends ZincElement {
        static styles: CSSResultGroup;
        last: boolean;
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
        private type;
        private upperLimit;
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
declare module "utilities/query" {
    export function deepQuerySelectorAll(selector: string, element: Element, stopSelector: string): Element[];
}
declare module "components/tabs/tabs.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
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
        private _panel;
        private _panels;
        private _tabs;
        private _actions;
        private _knownUri;
        masterId: string;
        defaultUri: string;
        _current: string;
        _split: any;
        _splitMin: number;
        primaryCaption: string;
        secondaryCaption: string;
        noPrefetch: boolean;
        localStorage: boolean;
        storeKey: string;
        storeTtl: number;
        padded: boolean;
        fullWidth: boolean;
        paddedRight: boolean;
        protected preload: boolean;
        protected _store: Store;
        protected _activeClicks: number;
        constructor();
        connectedCallback(): Promise<void>;
        _addPanel(panel: HTMLElement): void;
        _addTab(tab: HTMLElement): void;
        reRegisterTabs(): void;
        firstUpdated(_changedProperties: PropertyValues): void;
        _prepareTab(tabId: string): void;
        _uriToId(tabUri: string): string;
        _createUriPanel(tabEle: Element, tabUri: string, tabId: string): HTMLDivElement;
        _handleClick(event: PointerEvent): void;
        fetchUriTab(target: HTMLElement): void;
        clickTab(target: HTMLElement, refresh: boolean): void;
        getRefTab(target: HTMLElement): string | null;
        setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab?: any): void;
        _setTabEleActive(ele: any, active: boolean): void;
        selectTab(tabName: string, refresh: boolean): boolean;
        observerDom(): void;
        removeTabAndPanel(tabId: string): void;
        _registerTabs(): void;
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
declare module "components/panel/panel.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/panel
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
    export default class ZnPanel extends ZincElement {
        static styles: CSSResultGroup;
        private readonly hasSlotController;
        basis: number;
        caption: string;
        description: string;
        tabbed: boolean;
        flush: boolean;
        transparent: boolean;
        protected firstUpdated(_changedProperties: PropertyValues): void;
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
        render(): import("lit").TemplateResult<1>;
        tableHead(): import("lit").TemplateResult<1> | undefined;
        menuClick(e: any): void;
        tableBody(): import("lit").TemplateResult<1>;
        _handleMenu(e: any): void;
        columnContent(col: any): any;
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
declare module "components/sp/sp.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
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
        row: boolean;
        grow: boolean;
        padX: boolean;
        padY: boolean;
        noGap: boolean;
        flush: boolean;
        flushX: boolean;
        flushY: boolean;
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
    type OnEvent = Event & {
        selectedTarget: EventTarget;
    };
    interface OnEventListener {
        (evt: OnEvent): void;
    }
    export function on(delegate: EventTarget, eventName: string, targetSelector: string, callback: OnEventListener): () => void;
}
declare module "components/split-pane/split-pane.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    import { Store } from "internal/storage";
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
declare module "components/stepper/stepper.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/stepper
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
declare module "components/prop/prop.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/prop
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
    export default class ZnProp extends ZincElement {
        static styles: CSSResultGroup;
        caption: string;
        subCaption: string;
        icon: string;
        library: string;
        inline: boolean;
        colspan: number;
        protected render(): unknown;
    }
}
declare module "components/prop/index" {
    import ZnProp from "components/prop/prop.component";
    export * from "components/prop/prop.component";
    export default ZnProp;
    global {
        interface HTMLElementTagNameMap {
            'zn-prop': ZnProp;
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
        showChart: boolean;
        showDelta: boolean;
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
    import { type CSSResultGroup } from 'lit';
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
        constructor();
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
declare module "components/query-builder/query-builder.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import ZnSelect from "components/select/index";
    import ZnOption from "components/option/index";
    export type QueryBuilderData = Array<QueryBuilderItem>;
    export type QueryBuilderItem = {
        id: string;
        name: string;
        type?: 'bool' | 'boolean' | 'date' | 'number';
        options?: Object;
        operators: Array<QueryBuilderOperators>;
    };
    export type QueryBuilderOperators = 'eq' | 'neq' | 'before' | 'after' | 'in' | 'matchphrasepre' | 'nmatchphrasepre' | 'matchphrase' | 'nmatchphrase' | 'match' | 'nmatch' | 'starts' | 'nstarts' | 'wild' | 'nwild' | 'fuzzy' | 'nfuzzy' | 'gte' | 'gt' | 'lt' | 'lte';
    export type CreatedRule = {
        id: string;
        name: string;
        operator: string;
        value: string;
    };
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/query-builder
     * @status experimental
     * @since 1.0
     *
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
    export default class ZnQueryBuilder extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        static dependencies: {
            'zn-option': typeof ZnOption;
            'zn-select': typeof ZnSelect;
        };
        private _selectedRules;
        private _formController;
        container: HTMLDivElement;
        addRule: HTMLSelectElement;
        input: HTMLInputElement;
        filters: QueryBuilderData;
        name: string;
        value: PropertyKey;
        showValues: string[];
        get validationMessage(): string;
        get validity(): ValidityState;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        render(): import("lit").TemplateResult<1>;
        private _handleChange;
        private _addRule;
        private _updateOperatorValue;
        private _updateValue;
        private _updateDateValue;
        private updateInValue;
        private _changeRule;
        private _getRulePosition;
        private _removeRule;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        protected _getDateInput(uniqueId: string, value: string): HTMLDivElement | HTMLInputElement | ZnSelect;
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
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/progress-bar
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
        data: Object;
        private isMobile;
        private modifiedData;
        constructor();
        connectedCallback(): void;
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
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    export type CreatedRule = {
        id: string;
        name: string;
        value: string;
    };
    export type BulkActionData = Array<BulkActionItem>;
    export type BulkActionItem = {
        id: string;
        name: string;
        type?: 'bool' | 'boolean' | 'date' | 'number';
        options?: {
            [key: string]: string;
        };
    };
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/bulk-actions
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
    export default class ZnBulkActions extends ZincElement {
        static styles: CSSResultGroup;
        container: HTMLDivElement;
        addRule: HTMLSelectElement;
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
        private _updateValue;
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
declare module "components/editor/modules/dropdown-module" {
    import Quill from 'quill';
    type DropdownModuleOptions = {
        cannedResponses: DropdownModuleCannedResponse[];
        cannedResponsesUri: string;
    };
    type DropdownModuleCannedResponse = {
        title: string;
        content: string;
        command: string;
        labels?: string[];
    };
    export let dropdownOpen: boolean;
    class DropdownModule {
        private _quill;
        private _dropdown;
        private _cannedResponsesUri;
        private _command;
        private _commands;
        private _selectedIndex;
        private _commandElements;
        constructor(quill: Quill, options: DropdownModuleOptions);
        addEventListeners(): void;
        onTextChange(_: any, _oldDelta: any, source: any): void;
        openDropdown(): void;
        closeDropdown(): void;
        commandFilter(text: string): void;
        createDropdown(): HTMLDivElement;
        updateDropdownPosition(dropdown?: HTMLElement): void;
        addCommands(dropdown?: HTMLElement): void;
        moveCursor(index: number): void;
        updateSelectedCommand(): void;
        createCommandElement(command: DropdownModuleCannedResponse): HTMLDivElement;
        createTagElement(tag: string): HTMLDivElement;
        triggerCommand(command: DropdownModuleCannedResponse): void;
        private getDropdownContentFromUri;
    }
    export default DropdownModule;
}
declare module "components/editor/modules/attachment-module" {
    import Quill from 'quill';
    type AttachmentModuleOptions = {
        upload: (file: File) => Promise<{
            path: any;
            url: any;
            filename: any;
        }>;
        onFileUploaded?: (node: HTMLElement, { url }: {
            url: string;
        }) => void;
        attachmentInput?: HTMLInputElement;
    };
    export default class AttachmentModule {
        private _quill;
        private _options;
        private _fileHolder;
        constructor(quill: Quill, options: AttachmentModuleOptions);
        private _selectLocalImage;
        private _fileChanged;
        private _attachmentContainer;
        private _createAttachmentContainer;
        private _insertAttachment;
        private _updateAttachment;
        private _createAttachment;
        private _removeAttachment;
    }
}
declare module "components/editor/modules/time-tracking-module" {
    import Quill from 'quill';
    type TimeTrackingModuleOptions = {
        startTimeInput?: HTMLInputElement;
        openTimeInput?: HTMLInputElement;
    };
    export default class TimeTrackingModule {
        private _quill;
        private _options;
        private _startTime;
        private _openTime;
        constructor(quill: Quill, options: TimeTrackingModuleOptions);
        private _updateOpenTime;
        private _updateStartTime;
    }
}
declare module "components/editor/modules/drag-drop-module" {
    import Quill from 'quill';
    type DragAndDropModuleOptions = {
        onDrop: (file: File, options: object) => void;
        draggableContentTypePattern: string;
        draggables: [];
    };
    export default class DragAndDropModule {
        private _quill;
        private _options;
        private _container;
        private _draggables;
        constructor(quill: Quill, options: DragAndDropModuleOptions);
        nullReturner: () => null;
        handleDrop: (e: DragEvent) => void;
    }
    export const getFileDataUrl: (file: any) => Promise<unknown>;
}
declare module "components/editor/modules/image-resize-module/image-resize-module" {
    import Quill, { Module } from "quill";
    type ImageResizeModuleOptions = {
        overlayStyles?: Partial<CSSStyleDeclaration>;
    };
    class ImageResizeModule extends Module<ImageResizeModuleOptions> {
        static DEFAULTS: ImageResizeModuleOptions;
        private _focusedImage;
        private _overlay;
        constructor(quill: Quill, options: ImageResizeModuleOptions);
        handleClick: (e: MouseEvent) => void;
        handleScroll: (e: MouseEvent) => void;
        show: (image: HTMLImageElement) => void;
        hide: () => void;
        showOverlay: () => void;
        hideOverlay: () => void;
        repositionElements: () => void;
        setUserSelect: (value: string) => void;
        checkImage: (e: KeyboardEvent) => void;
    }
    export default ImageResizeModule;
}
declare module "components/editor/normalize-native" {
    export const normalizeNative: (nativeRange: any) => {
        start: {
            node: any;
            offset: any;
        };
        end: {
            node: any;
            offset: any;
        };
        native: any;
    } | null;
}
declare module "components/editor/editor.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
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
        name: string;
        value: string;
        interactionType: 'ticket' | 'chat';
        cannedResponses: Array<any>;
        cannedResponsesUri: string;
        uploadAttachmentUrl: string;
        private quillElement;
        get validity(): ValidityState;
        get validationMessage(): string;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        private _handleTextChange;
        private _updateIcons;
        private _getQuillKeyboardBindings;
        private _supplyPlaceholderDropdown;
        private _setupTitleAttributes;
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
declare module "components/toggle/toggle.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/toggle
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
declare module "components/textarea/textarea.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
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
declare module "components/checkbox/checkbox.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import ZnIcon from "components/icon/index";
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
     *  @slot selected-content - Use to nest rich content (like an input) inside a selected checkbox item. Use only with the contained style.
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
        /** The checkbox's help text. If you need to display HTML, use the `description` slot instead. */
        description: string;
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
declare module "components/color-select/color-select.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import { HasSlotController } from "internal/slot";
    import ZnPopup from "components/popup/index";
    import { FormControlController } from "internal/form";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/color-select
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
    export default class ZnColorSelect extends ZincElement implements ZincFormControl {
        static styles: CSSResultGroup;
        protected readonly hasSlotController: HasSlotController;
        protected readonly formControlController: FormControlController;
        private typeToSelectString;
        private typeToSelectTimeout;
        private closeWatcher;
        popup: ZnPopup;
        combobox: HTMLSlotElement;
        displayInput: HTMLSlotElement;
        valueInput: HTMLInputElement;
        listbox: HTMLSlotElement;
        name: string;
        private hasFocus;
        displayLabel: string;
        currentOption: HTMLElement;
        selectedOptions: HTMLElement[];
        value: string | string[];
        options: string[];
        label: string;
        helpText: string;
        placeholder: string;
        clearable: boolean;
        disabled: boolean;
        open: boolean;
        get validationMessage(): string;
        get validity(): ValidityState;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(_: string): void;
        private addOpenListeners;
        private removeOpenListeners;
        private handleLabelClick;
        private handleDocumentFocusIn;
        private handleDocumentKeyDown;
        private handleDocumentMouseDown;
        private handleComboboxKeyDown;
        private handleComboboxMouseDown;
        private handleInvalid;
        private handleOptionClick;
        private getAllOptions;
        private setCurrentOption;
        private setSelectedOptions;
        private selectionChanged;
        private getFirstOption;
        show(): Promise<void>;
        hide(): Promise<void>;
        handleDisabledChange(): void;
        handleValueChange(): void;
        handleOpenChange(): Promise<void>;
        disconnectedCallback(): void;
        protected render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/color-select/index" {
    import ZnColorSelect from "components/color-select/color-select.component";
    export * from "components/color-select/color-select.component";
    export default ZnColorSelect;
    global {
        interface HTMLElementTagNameMap {
            'zn-color-select': ZnColorSelect;
        }
    }
}
declare module "components/datepicker/datepicker.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/datepicker
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
    export default class ZnDatepicker extends ZincElement {
        static styles: CSSResultGroup;
        id: string;
        name: string;
        range: boolean;
        private _instance;
        _inputElement: HTMLInputElement;
        initialiseDatepicker(): Promise<void>;
        init(): Promise<void>;
        protected updated(_changedProperties: PropertyValues): void;
        render(): import("lit").TemplateResult<1>;
        private getOptions;
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
declare module "components/linked-select/linked-select.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
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
        options: any;
        linkedSelect: string;
        cacheKey: string;
        label: string;
        input: HTMLInputElement;
        private linkedSelectElement;
        private readonly formControlController;
        get validity(): ValidityState;
        get validationMessage(): string;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        disconnectedCallback(): void;
        checkValidity(): boolean;
        getForm(): HTMLFormElement | null;
        reportValidity(): boolean;
        setCustomValidity(message: string): void;
        handleLinkedSelectChange: (_: Event) => void;
        handleChange(e: Event): void;
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
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/radio
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
    export default class ZnRadio extends ZincElement {
        static styles: CSSResultGroup;
        checked: boolean;
        protected hasFocus: boolean;
        /** The radio's value. When selected, the radio group will receive this value. */
        value: string;
        /** Disables the radio. */
        disabled: boolean;
        label: string;
        size: string;
        constructor();
        connectedCallback(): void;
        private handleBlur;
        private handleClick;
        private handleFocus;
        private setInitialAttributes;
        handleCheckedChange(): void;
        handleDisabledChange(): void;
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
    export default class ZnRating extends ZincElement {
        static styles: CSSResultGroup;
        rating: HTMLElement;
        private hoverValue;
        private isHovering;
        label: string;
        value: number;
        max: number;
        precision: number;
        readonly: boolean;
        disabled: boolean;
        getSymbol: (value: number) => string;
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
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import { FormControlController } from "internal/form";
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
        /** The radio groups's help text. If you need to display HTML, use the `help-text` slot instead. */
        helpText: string;
        /** The name of the radio group, submitted as a name/value pair with form data. */
        name: string;
        /** The current value of the radio group, submitted as a name/value pair with form data. */
        value: string;
        /** The radio group's size. This size will be applied to all child radios */
        size: 'small' | 'medium' | 'large';
        /**
         * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
         * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
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
declare module "components/drag-upload/drag-upload.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/drag-upload
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
    export default class ZnDragUpload extends ZincElement {
        static styles: CSSResultGroup;
        text: string;
        types: string;
        size: string;
        private internals;
        private value;
        constructor();
        _updateInternals(): void;
        static get formAssociated(): boolean;
        getHumanTypes(): string;
        render(): import("lit").TemplateResult<1>;
        handleUpload(e: any): void;
    }
}
declare module "components/drag-upload/index" {
    import ZnDragUpload from "components/drag-upload/drag-upload.component";
    export * from "components/drag-upload/drag-upload.component";
    export default ZnDragUpload;
    global {
        interface HTMLElementTagNameMap {
            'zn-drag-upload': ZnDragUpload;
        }
    }
}
declare module "components/checkbox-group/checkbox-group.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement, { ZincFormControl } from "internal/zinc-element";
    import { FormControlController } from "internal/form";
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
declare module "components/confirm-content/confirm-content.component" {
    import { type CSSResultGroup, PropertyValues } from 'lit';
    import { Dialog } from "zinc";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/confirm-content
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
    export default class ZnConfirmContent extends Dialog {
        static get styles(): CSSResultGroup;
        caption: string;
        content: string;
        action: string;
        confirmText: string;
        cancelText: string;
        hideIcon: boolean;
        type: 'warning' | 'error' | 'success' | 'info';
        size: 'small' | 'medium' | 'large';
        private _hasVisibleInput;
        getIcon(): import("lit").TemplateResult<1>;
        connectedCallback(): void;
        protected firstUpdated(_changedProperties: PropertyValues): void;
        render(): import("lit").TemplateResult<1>;
        closeModal(): void;
        submitDialog(): void;
    }
}
declare module "components/confirm-content/index" {
    import ZnConfirmContent from "components/confirm-content/confirm-content.component";
    export * from "components/confirm-content/confirm-content.component";
    export default ZnConfirmContent;
    global {
        interface HTMLElementTagNameMap {
            'zn-confirm-content': ZnConfirmContent;
        }
    }
}
declare module "components/empty-dialog/empty-dialog.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
    * @summary Short summary of the component's intended use.
    * @documentation https://zinc.style/components/empty-dialog
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
    export default class ZnEmptyDialog extends ZincElement {
        static styles: CSSResultGroup;
        private readonly localize;
        /** An example attribute. */
        attr: string;
        handleExampleChange(): void;
        render(): import("lit").TemplateResult<1>;
    }
}
declare module "components/empty-dialog/index" {
    import ZnEmptyDialog from "components/empty-dialog/empty-dialog.component";
    export * from "components/empty-dialog/empty-dialog.component";
    export default ZnEmptyDialog;
    global {
        interface HTMLElementTagNameMap {
            'zn-empty-dialog': ZnEmptyDialog;
        }
    }
}
declare module "components/item/item.component" {
    import { type CSSResultGroup } from 'lit';
    import ZincElement from "internal/zinc-element";
    /**
     * @summary Short summary of the component's intended use.
     * @documentation https://zinc.style/components/description-item
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
    export default class ZnItem extends ZincElement {
        static styles: CSSResultGroup;
        private readonly localize;
        caption: string;
        stacked: boolean;
        size: 'small' | 'medium' | 'large';
        editOnHover: boolean;
        connectedCallback(): void;
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
declare module "events/zn-input" {
    export type ZnInputEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-input': ZnInputEvent;
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
declare module "events/events" {
    export type { ZnAfterHideEvent } from "events/zn-after-hide";
    export type { ZnAfterShowEvent } from "events/zn-after-show";
    export type { ZnHideEvent } from "events/zn-hide";
    export type { ZnBlurEvent } from "events/zn-blur";
    export type { ZnFocusEvent } from "events/zn-focus";
    export type { ZnInputEvent } from "events/zn-input";
    export type { ZnShowEvent } from "events/zn-show";
}
declare module "zinc" {
    export { default as Button } from "components/button/index";
    export { default as Icon } from "components/icon/index";
    export { default as AbsoluteContainer } from "components/absolute-container/index";
    export { default as Tooltip } from "components/tooltip/index";
    export { default as Popup } from "components/popup/index";
    export { default as Accordion } from "components/accordion/index";
    export { default as ActionItem } from "components/action-item/index";
    export { default as Alert } from "components/alert/index";
    export { default as Avatar } from "components/avatar/index";
    export { default as ButtonGroup } from "components/button-group/index";
    export { default as Chip } from "components/chip/index";
    export { default as Collapsible } from "components/collapsible/index";
    export { default as CopyButton } from "components/copy-button/index";
    export { default as DataTable } from "components/data-table/index";
    export { default as Cols } from "components/cols/index";
    export { default as ConfirmModal } from "components/confirm/index";
    export { default as Dialog } from "components/dialog/index";
    export { default as Dropdown } from "components/dropdown/index";
    export { default as Menu } from "components/menu/index";
    export { default as MenuItem } from "components/menu-item/index";
    export { default as DefinedLabel } from "components/defined-label/index";
    export { default as ChatMessage } from "components/chat-message/index";
    export { default as EmptyState } from "components/empty-state/index";
    export { default as Note } from "components/note/index";
    export { default as Tile } from "components/tile/index";
    export { default as ListTile } from "components/list-tile/index";
    export { default as ListTileProperty } from "components/list-tile-property/index";
    export { default as Chart } from "components/chart/index";
    export { default as ApexChart } from "components/apex-chart/index";
    export { default as DataChart } from "components/data-chart/index";
    export { default as SimpleChart } from "components/simple-chart/index";
    export { default as Header } from "components/header/index";
    export { default as Navbar } from "components/navbar/index";
    export { default as InlineEdit } from "components/inline-edit/index";
    export { default as InteractionTile } from "components/interaction-tile/index";
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
    export { default as Prop } from "components/prop/index";
    export { default as Stat } from "components/stat/index";
    export { default as ScrollContainer } from "components/scroll-container/index";
    export { default as QueryBuilder } from "components/query-builder/index";
    export { default as ProgressTile } from "components/progress-tile/index";
    export { default as ProgressBar } from "components/progress-bar/index";
    export { default as OrderTable } from "components/order-table/index";
    export { default as BulkActions } from "components/bulk-actions/index";
    export { default as Editor } from "components/editor/index";
    export { default as Toggle } from "components/toggle/index";
    export { default as Input } from "components/input/index";
    export { default as Select } from "components/select/index";
    export { default as Option } from "components/option/index";
    export { default as Textarea } from "components/textarea/index";
    export { default as Checkbox } from "components/checkbox/index";
    export { default as ColorSelect } from "components/color-select/index";
    export { default as Datepicker } from "components/datepicker/index";
    export { default as FormGroup } from "components/form-group/index";
    export { default as LinkedSelect } from "components/linked-select/index";
    export { default as Radio } from "components/radio/index";
    export { default as Rating } from "components/rating/index";
    export { default as RadioGroup } from "components/radio-group/index";
    export { default as DragUpload } from "components/drag-upload/index";
    export { default as CheckboxGroup } from "components/checkbox-group/index";
    export { default as ConfirmContent } from "components/confirm-content/index";
    export { default as EmptyDialog } from "components/empty-dialog/index";
    export { default as DescriptionItem } from "components/item/index";
    export * from "events/events";
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
declare module "events/zn-change" {
    export type ZnChangeEvent = CustomEvent<Record<PropertyKey, never>>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-change': ZnChangeEvent;
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
declare module "events/zn-submit" {
    export type ZnSubmitEvent = CustomEvent<{
        value: string;
        element: HTMLElement;
    }>;
    global {
        interface GlobalEventHandlersEventMap {
            'zn-submit': ZnSubmitEvent;
        }
    }
}
