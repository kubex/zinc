class BemComponent {
  protected selector: string;
  protected element: HTMLElement;

  protected addElement(element: HTMLElement, c: string) {
    element.classList.add(this.selector + '__' + c);
    return this;
  }

  protected removeElement(element: HTMLElement, c: string) {
    element.classList.remove(this.selector + '__' + c);
    return this;
  }

  protected hasElement(element: HTMLElement, c: string): boolean {
    return element.classList.contains(this.selector + '__' + c);
  }

  protected addModifier(element: HTMLElement, c: string) {
    element.classList.add(this.selector + '--' + c);
    return this;
  }

  protected removeModifier(element: HTMLElement, c: string) {
    element.classList.remove(this.selector + '--' + c);
    return this;
  }

  protected hasModifier(element: HTMLElement, c: string): boolean {
    return element.classList.contains(this.selector + '--' + c);
  }
}

type SimplePromptData = {
  centered: boolean,
  type: string,
  content: string,
  title: string,
  actions: SimplePromptDataActions[]
}

type SimplePromptDataActions = {
  title: string,
  type: string
}

class SimplePrompt extends BemComponent {
  protected selector: string = 'zn-simpleprompt';
  private static triggerPrompts: Map<HTMLElement, SimplePrompt> = new Map<HTMLElement, SimplePrompt>();
  private trigger: HTMLElement;
  private data?: SimplePromptData = null;
  private isShowing: boolean = false;

  constructor(data: SimplePromptData, trigger: HTMLElement) {
    super();
    // create instance of prompt
    this.data = data;
    this.trigger = trigger;
    this.element = this.createPrompt();
    this.element.setAttribute('zn-prompt-id', trigger.getAttribute('zn-prompt-id'));
  }

  /**
   * Show a prompt
   * @private
   */
  private show() {
    if (this.isShowing || this.hasModifier(document.body, 'visible')) {
      return; // Already showing a/the prompt
    }
    this.isShowing = true;
    this.addModifier(document.body, 'visible');
    document.body.appendChild(this.element);
    return this;
  }

  /**
   * Hide Prompt
   * @private
   */
  private remove() {
    if (!this.isShowing) {
      return; // Prompt isn't showing, nothing to hide
    }
    this.isShowing = false;
    this.removeModifier(document.body, 'visible')
    document.body.removeChild(this.element);
    return this;
  }

  /**
   * Create the Prompt
   * @private
   */
  private createPrompt(): HTMLElement {
    const isCentered = this.data.centered;

    const bgElement = document.createElement('div');
    this.addElement(bgElement, 'bg')

    const wrapperElement = document.createElement('div');
    this.addElement(wrapperElement, 'wrapper');
    bgElement.appendChild(wrapperElement);

    bgElement.addEventListener('click', (e) => {
      if (e.target === bgElement || e.target === wrapperElement) this.remove();
    });

    const containerElement = document.createElement('div');
    this.addElement(containerElement, 'container');
    if (!isCentered) {
      this.addElement(containerElement, 'container--lg');
    }
    wrapperElement.appendChild(containerElement);

    const wrap = document.createElement('div');
    containerElement.appendChild(wrap);


    const icon = document.createElement('div');
    this.addElement(icon, 'icon');
    this.addElement(icon, 'icon--' + this.data.type)
    let iconSize = 24;
    if (isCentered) {
      iconSize = 32;
    }
    let iconIco;
    switch (this.data.type) {
      case 'info':
        iconIco = 'question_mark';
        break;
      case 'warning':
        iconIco = 'report';
        break;
      case 'danger':
        iconIco = 'close';
        break;
      case 'success':
      default:
        iconIco = 'check';
    }

    icon.innerHTML = `<zn-icon src="${iconIco}" size="${iconSize}" library="mio"></zn-icon>`;


    const contentContainer = document.createElement('div');
    this.addElement(contentContainer, 'content');

    if (isCentered) { // if the container is centered
      wrap.appendChild(icon);
      wrap.appendChild(contentContainer);
    } else {
      const wrapInner = document.createElement('div');
      this.addElement(wrapInner, 'wrap');
      wrapInner.appendChild(icon);
      wrapInner.appendChild(contentContainer);
      wrap.appendChild(wrapInner);
    }

    if (this.data.title) {
      const title = document.createElement('div');
      title.innerText = this.data.title;
      this.addElement(title, 'title');
      contentContainer.appendChild(title);
    }

    if (this.data.content) {
      const description = document.createElement('div');
      description.innerText = this.data.content;
      this.addElement(description, 'description');
      contentContainer.appendChild(description);
    }

    const actions = this.data.actions;

    if (actions.length > 0) {
      const actionsElement = document.createElement('div');
      this.addElement(actionsElement, 'actions');
      wrap.appendChild(actionsElement);

      // if we have more than 1 action change how we render them
      if (actions.length > 1) {
        this.addElement(actionsElement, 'actions--multi');
        this.addElement(actionsElement, 'actions--2');
      }

      if (isCentered) { // if the container is centered
        this.addElement(actionsElement, 'actions--centered');
      }

      actions.forEach((action, index) => {
        const actionElement = document.createElement('a');
        this.addElement(actionElement, 'actions__action')
        this.addElement(actionElement, 'actions__action--' + action.type)
        actionElement.innerHTML = action.title;

        actionsElement.appendChild(actionElement);
      });
    }

    return bgElement;
  }

  /**
   * Find any triggers on the page and add Event listeners to them (create/load prompts on click)
   */
  static init() {
    console.log('init prompt');
    const triggers = document.querySelectorAll('[zn-prompt]');
    triggers.forEach((trigger: HTMLElement) => {
      console.log('triggers');
      const id = idGenerator();
      const promptData = this.promptData(trigger);

      if (trigger.hasAttribute('zn-prompt-id') || promptData === null) {
        return; // Already Initialised or doesn't have data
      }

      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', () => {
        if (this.triggerPrompts.has(trigger)) {
          this.triggerPrompts.get(trigger).show();
        } else {
          const prompt = new SimplePrompt(promptData, trigger);
          this.triggerPrompts.set(trigger, prompt);
          prompt.show();
        }
      });
      trigger.setAttribute('zn-prompt-id', id);
    });
  }

  /**
   * Get PromptData which will be used for constructing the prompt
   *
   * @param trigger
   */
  static promptData(trigger: HTMLElement) {
    try {
      return JSON.parse(trigger.getAttribute('zn-prompt'));
    } catch (e) {
      return null;
    }
  }
}

export function idGenerator() {
  const S4 = () => ((((1 + Math.random()) * 0x10000) | 0)).toString(16).substring(1);
  return `${S4()}`;
}


// On click of button -> (Build if it doesn't exist) Get Prompt for instances and return show();

SimplePrompt.init();

export default SimplePrompt;
