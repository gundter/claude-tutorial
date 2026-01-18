import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CalendarHeader from './CalendarHeader.vue';

describe('CalendarHeader', () => {
  describe('rendering', () => {
    it('should display the month label', () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      expect(wrapper.find('h2').text()).toBe('January 2026');
    });

    it('should render navigation buttons', () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      const buttons = wrapper.findAll('button');
      expect(buttons).toHaveLength(4); // prev, today, next, add
    });

    it('should show correct button labels', () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      const buttons = wrapper.findAll('button');
      expect(buttons[0].text()).toContain('Prev');
      expect(buttons[1].text()).toBe('Today');
      expect(buttons[2].text()).toContain('Next');
      expect(buttons[3].text()).toContain('Add Chore');
    });
  });

  describe('events', () => {
    it('should emit prev when prev button is clicked', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      await wrapper.findAll('button')[0].trigger('click');

      expect(wrapper.emitted('prev')).toHaveLength(1);
    });

    it('should emit today when today button is clicked', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      await wrapper.findAll('button')[1].trigger('click');

      expect(wrapper.emitted('today')).toHaveLength(1);
    });

    it('should emit next when next button is clicked', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      await wrapper.findAll('button')[2].trigger('click');

      expect(wrapper.emitted('next')).toHaveLength(1);
    });

    it('should emit add when add chore button is clicked', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      await wrapper.findAll('button')[3].trigger('click');

      expect(wrapper.emitted('add')).toHaveLength(1);
    });

    it('should emit multiple events for multiple clicks', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      const prevButton = wrapper.findAll('button')[0];
      await prevButton.trigger('click');
      await prevButton.trigger('click');
      await prevButton.trigger('click');

      expect(wrapper.emitted('prev')).toHaveLength(3);
    });
  });

  describe('props reactivity', () => {
    it('should update month label when prop changes', async () => {
      const wrapper = mount(CalendarHeader, {
        props: { monthLabel: 'January 2026' },
      });

      expect(wrapper.find('h2').text()).toBe('January 2026');

      await wrapper.setProps({ monthLabel: 'February 2026' });

      expect(wrapper.find('h2').text()).toBe('February 2026');
    });
  });
});
