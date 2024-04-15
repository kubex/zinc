import Quill from 'quill';

type DropdownModuleOptions = {
  cannedResponses: DropdownModuleCannedResponse[];
}

type DropdownModuleCannedResponse = {
  title: string
  content: string;
  commmand: string;
  labels?: string[];
}

class DropdownModule
{
  private _quill: Quill;
  private _dropdown: HTMLElement;
  private _dropdownOpen: boolean = false;
  private _command: string = '';
  private _commands: any = [];
  private _selectedIndex = 0;
  private _commandElements: HTMLElement[] = [];

  constructor(quill, options: DropdownModuleOptions)
  {
    this._quill = quill;
    if(options.cannedResponses)
    {
      this._commands = options.cannedResponses;
    }

    if(this._commands.length > 0)
    {
      quill.on(Quill.events.TEXT_CHANGE, this.onTextChange.bind(this));
      this._dropdown = this.createDropdown();
      this.addEventListeners();
      this.addCommands();
    }
  }

  addEventListeners()
  {
    this._quill.keyboard.addBinding({ key: 'ArrowDown' }, (range, context) =>
    {
      if(this._dropdownOpen)
      {
        this.moveCursor(1);
      }
    });

    this._quill.keyboard.addBinding({ key: 'ArrowUp' }, (range, context) =>
    {
      if(this._dropdownOpen)
      {
        this.moveCursor(-1);
      }
    });

    // add enter key binding
    document.addEventListener('keydown', (e) =>
    {
      if(e.key === 'Enter' && this._dropdownOpen)
      {
        e.preventDefault();
        e.stopImmediatePropagation();

        // trigger the command based on the selected index and if filters are applied
        const commandElement = this._commandElements[this._selectedIndex];
        const commandName = commandElement.getAttribute('data-command');

        console.log('Selected index', this._selectedIndex);
        console.log('Command Element', commandElement);
        console.log('Command Name', commandName);

        const command = this._commands.find(command => command.title === commandName);
        this.triggerCommand(command);
      }
    });
  }

  onTextChange(_: any, oldDelta: any, source: any)
  {
    if(source === Quill.sources.USER)
    {
      // if the user has typed a forward slash, we will show the dropdown until they type
      // a space or a new line. The dropdown will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index;
      let char = text.charAt(index - 1);

      if(index === 0)
      {
        char = text.charAt(index);
      }

      // if there's no character before the forward slash, we will open the dropdown
      if(char === '/' && !this._dropdownOpen &&
        (text.charAt(index - 2) === ' '
          || text.charAt(index - 2) === '\n'
          || text.charAt(index - 2) === ''
          || text.charAt(index - 2) === undefined
          || index === 0
        ))
      {
        this.openDropdown();
      }

      // if the user has typed a space or a new line, we will close the dropdown. and the dropdown
      // is open
      if(this._dropdownOpen && (char === ' ' || char === '\n'))
      {
        this._selectedIndex = 0;
        this.closeDropdown();
      }

      // if the dropdown is open, we will filter the commands based on the text that the user has typed
      // after the forward slash
      if(this._dropdownOpen)
      {
        this.commandFilter(text);
        this.updateDropdownPosition();
      }


      // if the user clicks away from the dropdown, we will close the dropdown
      document.addEventListener('click', (e) =>
      {
        if(this._dropdownOpen && e.target !== this._dropdown)
        {
          this.closeDropdown();
        }
      });
    }
  }

  openDropdown()
  {
    this._dropdownOpen = true;
    this.updateDropdownPosition();
    this._selectedIndex = 0;
    this.updateSelectedCommand();

    // add to the document out of shadow dom
    this._quill.container.ownerDocument.body.appendChild(this._dropdown);
  }

  closeDropdown()
  {
    this._dropdownOpen = false;
    this._selectedIndex = 0;

    this._quill.container.ownerDocument.body.removeChild(this._dropdown);
  }

  commandFilter(text: string)
  {
    this._command = text.split('/')[text.split('/').length - 1].trim();

    // split command by commas, and remove any whitespace, anything before a comma is a label
    const labels = this._command.split(',').map(label => label.trim());
    const filteredText = labels[labels.length - 1];

    // Remove existing commands
    this._commandElements.forEach(element =>
    {
      this._dropdown.removeChild(element);
    });

    const filteredCommands: DropdownModuleCannedResponse[] = [];

    // filter the commands based on the labels if they exist, else filter based on the text
    if(labels.length > 1)
    {
      this._commands.forEach(command =>
      {
        if(command.labels)
        {
          labels.forEach(label =>
          {
            if(command.labels.includes(label))
            {
              filteredCommands.push(command);
            }
          });
        }
      });
    }
    else
    {
      filteredCommands.push(...this._commands);
    }

    const filteredTextCommands: DropdownModuleCannedResponse[] = [];

    // filter the commands based on the text
    filteredCommands.forEach(command =>
    {
      if(command.title.toLowerCase().includes(filteredText.toLowerCase()) && !filteredTextCommands.includes(command))
      {
        filteredTextCommands.push(command);
      }

      if(command.labels)
      {
        command.labels.forEach(label =>
        {
          console.log('Label', label);
          console.log('Filtered Text', filteredText);
          console.log('match', label.toLowerCase().includes(filteredText.toLowerCase()));
          // dedupe
          if(label.toLowerCase().includes(filteredText.toLowerCase()) && !filteredTextCommands.includes(command))
          {
            filteredTextCommands.push(command);
          }
        });
      }
    });


    this._commandElements = filteredTextCommands.filter(command =>
    {
      return command.title.toLowerCase().includes(filteredText.toLowerCase());
    }).map(command =>
    {
      return this.createCommandElement(command);
    });

    // add the filtered commands to the dropdown
    this._commandElements.forEach(element =>
    {
      this._dropdown.appendChild(element);
    });

    if(filteredCommands.length !== 0)
    {
      this.moveCursor(0);
      this.updateSelectedCommand();
    }
  }

  createDropdown()
  {
    const dropdown = document.createElement('div');
    dropdown.classList.add('canned-responses-dropdown');
    dropdown.style.position = 'absolute';
    dropdown.style.backgroundColor = 'rgb(var(--zn-panel))';
    dropdown.style.border = '1px solid rgb(var(--zn-border-color))';
    dropdown.style.zIndex = '1000';
    dropdown.style.minHeight = '150px';
    dropdown.style.overflow = 'auto';
    dropdown.style.padding = '10px 0';
    dropdown.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    dropdown.style.borderRadius = '5px';

    return dropdown;
  }

  updateDropdownPosition(dropdown: HTMLElement = this._dropdown)
  {
    const editorBounds = this._quill.container.getBoundingClientRect();

    // position bottom of the dropdown at the top of the editor
    const top = (editorBounds.top + this._quill.container.scrollTop) - dropdown.offsetHeight;

    // dropdown should be full width of the editor
    const left = editorBounds.left;
    const right = editorBounds.right;
    const width = editorBounds.width;

    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';
    dropdown.style.right = right + 'px';
    dropdown.style.width = width + 'px';
    dropdown.style.maxHeight = '200px';
  }

  addCommands(dropdown: HTMLElement = this._dropdown)
  {
    const header = document.createElement('div');
    header.style.padding = '5px 10px 10px';
    header.style.color = 'rgb(var(--zn-text-heading))';
    header.style.borderBottom = '1px solid rgb(var(--zn-border-color))';

    header.textContent = 'Canned Responses';
    dropdown.appendChild(header);

    this._commands.forEach(command =>
    {
      this._commandElements.push(this.createCommandElement(command));
    });

    this._commandElements.forEach(element =>
    {
      dropdown.appendChild(element);
    });
  }

  moveCursor(index: number)
  {
    this._selectedIndex += index;

    // if index is greater than number of commands, we will set the index to 0
    if(this._selectedIndex >= this._commands.length)
    {
      this._selectedIndex = 0;
    }

    // if index is less than 0, we will set the index to the last command
    if(this._selectedIndex < 0)
    {
      this._selectedIndex = this._commands.length - 1;
    }

    this.updateSelectedCommand();
    this.updateDropdownPosition();
  }

  updateSelectedCommand()
  {
    this._commandElements[this._selectedIndex].style.backgroundColor = 'rgb(var(--zn-body))';

    // un style all the other commands
    this._commandElements.forEach((element, i) =>
    {
      if(i !== this._selectedIndex)
      {
        element.style.backgroundColor = 'white';
      }
    });

  }

  createCommandElement(command: DropdownModuleCannedResponse)
  {
    const commandWrapper = document.createElement('div');
    commandWrapper.setAttribute('data-command', command.title);
    commandWrapper.style.padding = '10px 20px';
    commandWrapper.style.cursor = 'pointer';
    commandWrapper.style.borderBottom = '1px solid rgb(var(--zn-border-color))';
    commandWrapper.style.display = 'flex';
    commandWrapper.style.alignItems = 'center';
    commandWrapper.style.gap = '10px';


    const commandLeft = document.createElement('div');
    commandLeft.style.width = '50%';
    commandLeft.style.flexBasis = '50%';
    commandWrapper.appendChild(commandLeft);

    const commandCommand = document.createElement('div');
    commandCommand.textContent = '/' + (command.commmand ? command.commmand :
      command.title.toLowerCase().replace(' ', '-'));
    commandCommand.style.color = 'rgb(var(--zn-text-heading))';
    commandLeft.appendChild(commandCommand);

    const commandLabels = document.createElement('div');
    commandLabels.style.display = 'flex';
    commandLabels.style.gap = '5px';
    commandLabels.style.flexWrap = 'wrap';
    commandLabels.style.paddingTop = '5px';
    for(const label of command.labels || [])
    {
      const tag = this.createTagElement(label);
      commandLabels.appendChild(tag);
    }
    commandLeft.appendChild(commandLabels);

    const commandRight = document.createElement('div');
    commandLeft.style.width = '50%';
    commandLeft.style.flexBasis = '50%';
    commandWrapper.appendChild(commandRight);

    const commandTitle = document.createElement('div');
    commandTitle.textContent = command.title;
    commandRight.appendChild(commandTitle);

    const commandSnippet = document.createElement('div');
    commandSnippet.textContent = command.content.length > 50 ? command.content.substring(0, 50) + '...' : command.content;
    commandRight.appendChild(commandSnippet);

    commandWrapper.addEventListener('click', (e) =>
    {
      this._quill.focus();
      this.triggerCommand(command);
    });

    return commandWrapper;
  }

  createTagElement(tag: string)
  {
    const tagElement = document.createElement('div');
    tagElement.textContent = '# ' + tag;

    tagElement.style.backgroundColor = 'rgb(var(--zn-shadow))';
    tagElement.style.color = 'rgb(var(--zn-text-body));';
    tagElement.style.padding = '5px';
    tagElement.style.borderRadius = '5px';
    tagElement.style.fontSize = '12px';
    tagElement.style.fontWeight = 'bold';


    return tagElement;
  }

  triggerCommand(command: DropdownModuleCannedResponse)
  {
    this.closeDropdown();

    // Delete the forward slash and the command from the text
    const index = this._quill.getSelection()?.index;
    const text = this._quill.getText();
    const commandIndex = text.lastIndexOf('/', index);
    const commandLength = index - commandIndex;

    this._quill.deleteText(commandIndex, commandLength);

    // insert the command content
    this._quill.insertText(this._quill.getSelection()?.index, command.content);

    // add a space after the command
    this._quill.insertText(this._quill.getSelection()?.index, ' ');

    // update the quill editor
    this._quill.update();
  }
}

export default DropdownModule;
