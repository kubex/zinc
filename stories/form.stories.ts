import {html} from 'lit-html';

export default {
  title: 'Pages/Form',
};

export const Default = () =>
  html`
    <style>
      body {
        overflow: auto;
      }
    </style>

    <app-container id="dest"></app-container>

    <div id="source" style="display: none">
      <zn-header max-width caption="Welcome Back, Mark!" navigation='[{"title": "Transactions", "path": "#", "default":true},
            {"title": "Payments", "active":true, "path": "#"},
            {"title": "Refunds", "path": "#"}]'>
      </zn-header>

      <zn-page caption="Customer Details">
        <form>
          <div>
            <label>Select</label>
            <select name="select">
              <option value="selection_1">selection 1</option>
              <option value="selection_2">selection 2</option>
              <option value="selection_3">selection 3</option>
            </select>
          </div>
          <div>
            <label>Search</label>
            <div class="input--with-icon">
              <zn-icon src="search" size="16" library="mis"></zn-icon>
              <input name="search" type="search"/>
            </div>
          </div>
          <div>
            <br><br>
            <h1 class="text-title">Field Set</h1>
            <fieldset>
              <legend>Personalia:</legend>
              <div>
                <label>First name:</label>
                <input type="text" name="fname" value="John">
              </div>
              <div>
                <label>Last name:</label>
                <input type="text" name="lname" value="Doe">
              </div>
              <input type="submit" value="Submit">
            </fieldset>
          </div>

          <div>
            <br><br>
            <h1 class="text-title">Data list</h1>
            <input list="browsers">
            <datalist id="browsers">
              <option value="Internet Explorer">
              <option value="Firefox">
              <option value="Chrome">
              <option value="Opera">
              <option value="Safari">
            </datalist>
          </div>

          <div>
            <br><br>
            <h1 class="text-title">Input Elements</h1>
            <div>
              <label>Button</label>
              <input name="button" type="button" value="this is a button"/>
            </div>
            <div>
              <label>Text</label>
              <input name="text" type="text" placeholder="enter text here"/>
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email"/>
            </div>
            <div>
              <label>Number</label>
              <input name="number" type="number" max="10" min="1"/>
            </div>
            <div>
              <label>Date</label>
              <input name="date" type="date"/>
            </div>
            <div>
              <label>Url</label>
              <input name="url" type="url"/>
            </div>
            <div>
              <label>Color</label>
              <input name="color" type="color"/>
            </div>
            <div>
              <label>File</label>
              <input name="file" type="file"/>
            </div>
            <div>
              <label>Image</label>
              <input name="image" type="image" alt="Image Alt"/>
            </div>
            <div>
              <label>Password</label>
              <input name="password" type="password"/>
            </div>
            <div>
              <label>Range</label>
              <input name="range" type="range"/>
            </div>
            <div>
              <label>Tel</label>
              <input name="tel" type="tel"/>
            </div>
            <div>
              <label>DateTime - Local</label>
              <input name="datetime-local" type="datetime-local"/>
            </div>
            <div>
              <label>Month</label>
              <input name="month" type="month"/>
            </div>
            <div>
              <label>Week</label>
              <input name="week" type="week"/>
            </div>
            <div>
              <label>Time</label>
              <input name="time" type="time"/>
            </div>
            <div>
              <label>Search</label>
              <input name="search" type="search"/>
            </div>
          </div>
          <div>
            <br><br>
            <h1 class="text-title">Select Elements</h1>
            <div>
              <label>Radio</label>
              <input name="radio" type="radio" value="yes"/> yes
              <input name="radio" type="radio" value="no"/>Whatever
            </div>
            <div>
              <label>Checkbox</label>
              <input name="checkbox" type="checkbox" value="yes"/> yes
              <input name="checkbox" type="checkbox" value="no"/>no
            </div>
            <div>
              <label>Select</label>
              <select name="select[]" multiple>
                <option value="selection_1">selection 1</option>
                <option value="selection_2">selection 2</option>
                <option value="selection_3">selection 3</option>
              </select>
            </div>
          </div>
          <div>
            <br><br>
            <h1 class="text-title">Long Input Element</h1>
            <label>Text Area</label>
            <textarea name="textarea" col="5" rows="6">If you really need to input super long text.</textarea>
          </div>
          <div>
            <br><br>
            <h1 class="text-title">Action Element</h1>
            <button type="submit">Save</button>
            <button type="button">Cancel</button>
          </div>

        </form>
      </zn-page>
    </div>

    <script src="../dist/zn.js" type="text/javascript"></script>
    <script>
      setTimeout(() =>
      {
        const dest = document.getElementById('dest');
        const source = document.getElementById('source');
        dest.innerHTML = source.innerHTML;
      }, 100);
    </script>
  `;