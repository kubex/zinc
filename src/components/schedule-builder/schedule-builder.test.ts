import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type {ScheduleValue} from './schedule-builder.component';
import type ZnScheduleBuilder from './schedule-builder.component';

const parseSchedule = (value: string): ScheduleValue => JSON.parse(value) as ScheduleValue;

const scheduleValue = JSON.stringify({
  days: {
    mon: [{start: '08:00', end: '18:00'}],
    tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
  },
  exceptions: []
});

describe('<zn-schedule-builder>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    expect(el).to.exist;
  });

  it('should expose an empty schedule by default', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    expect(el.schedule.days.mon).to.deep.equal([]);
    expect(el.schedule.exceptions).to.deep.equal([]);
  });

  it('should parse a JSON value into the schedule', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder value="${scheduleValue}"></zn-schedule-builder>`);

    expect(el.getDay('mon')).to.deep.equal([{start: '08:00', end: '18:00'}]);
    expect(el.getDay('sun')).to.deep.equal([]);
  });

  it('should accept the shorthand range syntax', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder value='{"mon":["09:00-17:00"]}'></zn-schedule-builder>`);

    expect(el.getDay('mon')).to.deep.equal([{start: '09:00', end: '17:00'}]);
  });

  it('should serialise assignments back into the value', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    el.setDay('tue', [{start: '10:00', end: '12:00'}]);
    await el.updateComplete;

    expect(parseSchedule(el.value).days.tue).to.deep.equal([{start: '10:00', end: '12:00'}]);
  });

  it('should merge overlapping and touching ranges', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    el.setDay('wed', [{start: '13:00', end: '18:00'}, {start: '08:00', end: '13:00'}]);
    await el.updateComplete;

    expect(el.getDay('wed')).to.deep.equal([{start: '08:00', end: '18:00'}]);
  });

  it('should drop invalid ranges', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    el.setDay('thu', [{start: '18:00', end: '09:00'}, {start: 'nope', end: '10:00'}]);
    await el.updateComplete;

    expect(el.getDay('thu')).to.deep.equal([]);
  });

  it('should emit zn-change when the schedule changes', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder></zn-schedule-builder>`);

    let changed = false;
    el.addEventListener('zn-change', () => (changed = true));

    el.setDay('fri', [{start: '09:00', end: '17:00'}]);
    await el.updateComplete;

    expect(changed).to.be.true;
  });

  it('should render the list view when view is form', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder view="form" value="${scheduleValue}"></zn-schedule-builder>`);

    expect(el.shadowRoot?.querySelector('.list')).to.exist;
    expect(el.shadowRoot?.querySelector('.calendar')).to.not.exist;
  });

  it('should render the calendar view by default', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder value="${scheduleValue}"></zn-schedule-builder>`);

    expect(el.shadowRoot?.querySelector('.calendar')).to.exist;
    expect(el.shadowRoot?.querySelectorAll('.calendar__col').length).to.equal(7);
  });

  it('should shade hours a weekday exception removes', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder value='{
        "days": {"fri": ["08:00-18:00"]},
        "exceptions": [{"label": "Summer Fridays", "days": ["fri"], "ranges": ["08:00-16:00"]}]
      }'></zn-schedule-builder>`);

    const friday = el.shadowRoot?.querySelectorAll('.calendar__col')[4];
    expect(friday?.querySelectorAll('.calendar__slot--open').length).to.be.greaterThan(0);
    expect(friday?.querySelectorAll('.calendar__slot--reduced').length).to.equal(4); // 16:00–18:00
  });

  it('should not shade the weekly grid for a one-off dated exception', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder value='{
        "days": {"mon": ["08:00-18:00"]},
        "exceptions": [{"label": "Offsite", "date": "2026-09-14", "ranges": ["08:00-13:00"]}]
      }'></zn-schedule-builder>`);

    expect(el.shadowRoot?.querySelectorAll('.calendar__slot--reduced').length).to.equal(0);
  });

  describe('timezones', () => {
    it('should not convert anything when no timezone is configured', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder value='{"mon":["09:00-17:00"]}'></zn-schedule-builder>`);

      expect(el.displayedDays.mon).to.deep.equal([{start: '09:00', end: '17:00'}]);
      expect(parseSchedule(el.value).timezone).to.be.undefined;
    });

    it('should default to storing in UTC once a timezone is in play', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone value='{"mon":["09:00-17:00"]}'></zn-schedule-builder>`);

      expect(parseSchedule(el.value).timezone).to.equal('UTC');
    });

    it('should show stored hours in the display timezone without changing the value', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder
          display-timezone="Europe/London"
          reference-date="2026-07-15"
          value='{"timezone":"UTC","days":{"mon":["09:00-17:00"]}}'></zn-schedule-builder>`);

      // London is UTC+1 in July.
      expect(el.displayedDays.mon).to.deep.equal([{start: '10:00', end: '18:00'}]);
      expect(el.getDay('mon')).to.deep.equal([{start: '09:00', end: '17:00'}]);
    });

    it('should follow daylight saving via the reference date', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder
          display-timezone="Europe/London"
          reference-date="2026-01-15"
          value='{"timezone":"UTC","days":{"mon":["09:00-17:00"]}}'></zn-schedule-builder>`);

      // London is UTC+0 in January.
      expect(el.displayedDays.mon).to.deep.equal([{start: '09:00', end: '17:00'}]);
    });

    it('should roll hours onto the next day when the offset pushes them past midnight', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder
          display-timezone="Asia/Tokyo"
          value='{"timezone":"UTC","days":{"mon":["23:00-24:00"]}}'></zn-schedule-builder>`);

      expect(el.displayedDays.mon).to.deep.equal([]);
      expect(el.displayedDays.tue).to.deep.equal([{start: '08:00', end: '09:00'}]);
    });

    it('should wrap Sunday hours around to Monday', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder
          display-timezone="Asia/Tokyo"
          value='{"timezone":"UTC","days":{"sun":["20:00-22:00"]}}'></zn-schedule-builder>`);

      expect(el.displayedDays.mon).to.deep.equal([{start: '05:00', end: '07:00'}]);
      expect(el.displayedDays.sun).to.deep.equal([]);
    });

    it('should convert edits made in the display timezone back to UTC', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder display-timezone="Asia/Tokyo" save-timezone="UTC"></zn-schedule-builder>`);

      el.setDisplayDay('tue', [{start: '09:00', end: '17:00'}]);
      await el.updateComplete;

      expect(el.getDay('tue')).to.deep.equal([{start: '00:00', end: '08:00'}]);
      expect(el.displayedDays.tue).to.deep.equal([{start: '09:00', end: '17:00'}]);
    });

    it('should convert incoming data expressed in another timezone', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder
          save-timezone="UTC"
          reference-date="2026-07-15"
          value='{"timezone":"Europe/London","days":{"mon":["09:00-17:00"]}}'></zn-schedule-builder>`);

      expect(el.getDay('mon')).to.deep.equal([{start: '08:00', end: '16:00'}]);
      expect(parseSchedule(el.value).timezone).to.equal('UTC');
    });

    it('should adopt the value timezone when none is configured', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder value='{"timezone":"Europe/London","days":{"mon":["09:00-17:00"]}}'></zn-schedule-builder>`);

      expect(el.getDay('mon')).to.deep.equal([{start: '09:00', end: '17:00'}]);
      expect(parseSchedule(el.value).timezone).to.equal('Europe/London');
    });

    it('should render the timezone picker only when asked', async () => {
      const without: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder></zn-schedule-builder>`);
      expect(without.shadowRoot?.querySelector('zn-select')).to.not.exist;

      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone display-timezone="Europe/London"></zn-schedule-builder>`);
      const select = el.shadowRoot?.querySelector('zn-select');

      expect(select).to.exist;
      expect(el.shadowRoot?.querySelectorAll('zn-option').length).to.be.greaterThan(1);
    });

    const optionValues = (el: ZnScheduleBuilder) =>
      [...(el.shadowRoot?.querySelectorAll('zn-option') ?? [])].map(option => option.getAttribute('value') ?? '');

    it('should expand the named timezone sets', async () => {
      const offsets: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="offsets"></zn-schedule-builder>`);
      const common: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="common"></zn-schedule-builder>`);
      const all: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="all"></zn-schedule-builder>`);

      expect(optionValues(offsets).length).to.be.greaterThan(20);
      expect(optionValues(common).length).to.be.greaterThan(optionValues(offsets).length);
      expect(optionValues(all).length).to.be.greaterThan(optionValues(common).length);
      expect(optionValues(common)).to.include('Asia/Kathmandu');
      expect(optionValues(offsets)).to.not.include('Asia/Kathmandu');
    });

    it('should cover every offset in the offsets set from the common set', async () => {
      const offsets: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="offsets"></zn-schedule-builder>`);
      const common: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="common"></zn-schedule-builder>`);

      const offsetsOf = (zones: string[]) => new Set(zones.flatMap(zone =>
        ['2026-01-15T12:00:00Z', '2026-07-15T12:00:00Z'].map(when => {
          const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: zone, hour12: false,
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }).formatToParts(new Date(when));
          const read = (type: string) => Number(parts.find(part => part.type === type)?.value);
          const utc = Date.UTC(read('year'), read('month') - 1, read('day'), read('hour') % 24, read('minute'));
          return Math.round((utc - new Date(when).getTime()) / 60000);
        })));

      const covered = offsetsOf(optionValues(common));
      [...offsetsOf(optionValues(offsets))].forEach(offset => expect(covered).to.include(offset));
    });

    it('should offer the English-speaking set under friendly names', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="en" display-timezone="Europe/London"></zn-schedule-builder>`);

      expect(optionValues(el)).to.include.members([
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Australia/Sydney'
      ]);

      const labels = [...(el.shadowRoot?.querySelectorAll('zn-option') ?? [])].map(o => o.textContent?.trim() ?? '');
      expect(labels.some(label => label.startsWith('US Eastern ('))).to.be.true;
      expect(labels.some(label => label.startsWith('US Mountain ('))).to.be.true;
      expect(labels.some(label => label.startsWith('UK ('))).to.be.true;
      expect(labels.some(label => label.startsWith('Australia ('))).to.be.true;
    });

    it('should keep the friendly label when a set is combined with plain zones', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone
                             timezones="en America/New_York Asia/Tokyo"
                             display-timezone="Europe/London"></zn-schedule-builder>`);

      const newYork = [...(el.shadowRoot?.querySelectorAll('zn-option') ?? [])]
        .filter(option => option.getAttribute('value') === 'America/New_York');

      expect(newYork).to.have.lengthOf(1);
      expect(newYork[0].textContent?.trim()).to.match(/^US Eastern \(/);
    });

    it('should mix named sets with explicit zones', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone timezones="UTC Europe/London Asia/Tokyo"></zn-schedule-builder>`);

      // The viewer's own zone is always added so the current selection is never unreachable.
      expect(optionValues(el)).to.include.members(['UTC', 'Europe/London', 'Asia/Tokyo']);
      expect(optionValues(el).length).to.be.lessThan(10);
    });

    it('should not emit zn-change when only the display timezone changes', async () => {
      const el: ZnScheduleBuilder = await fixture(html`
        <zn-schedule-builder show-timezone value='{"mon":["09:00-17:00"]}'></zn-schedule-builder>`);

      const before = el.value;
      let changed = false;
      el.addEventListener('zn-change', () => (changed = true));

      el.displayTimezone = 'Asia/Tokyo';
      await el.updateComplete;

      expect(changed).to.be.false;
      expect(el.value).to.equal(before);
    });
  });

  it('should be invalid when required and empty', async () => {
    const el: ZnScheduleBuilder = await fixture(html`
      <zn-schedule-builder required></zn-schedule-builder>`);

    expect(el.checkValidity()).to.be.false;

    el.setDay('mon', [{start: '09:00', end: '17:00'}]);
    await el.updateComplete;

    expect(el.checkValidity()).to.be.true;
  });

  it('should submit the schedule as JSON with the form', async () => {
    const form: HTMLFormElement = await fixture(html`
      <form>
        <zn-schedule-builder name="hours" value="${scheduleValue}"></zn-schedule-builder>
      </form>`);

    const data = new FormData(form);
    expect(parseSchedule(String(data.get('hours'))).days.mon).to.deep.equal([{start: '08:00', end: '18:00'}]);
  });
});
