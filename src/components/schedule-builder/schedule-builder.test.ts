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
