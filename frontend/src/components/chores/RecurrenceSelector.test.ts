import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecurrenceSelector from './RecurrenceSelector.vue';
import type { RecurrenceInput } from '@/types';

describe('RecurrenceSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should NOT emit on mount with null modelValue', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      // Advance timers to trigger initialization
      vi.runAllTimers();
      await flushPromises();

      // Should not have emitted anything on mount
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('should NOT emit on mount with existing modelValue', async () => {
      const existingValue: RecurrenceInput = {
        type: 'weekly',
        interval: 1,
        byWeekDay: ['MO', 'WE', 'FR'],
        byMonthDay: null,
        bySetPos: null,
        endType: 'never',
        endDate: null,
        endAfterOccurrences: null,
      };

      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: existingValue },
      });

      // Advance timers to trigger initialization
      vi.runAllTimers();
      await flushPromises();

      // Should not have emitted anything on mount
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('should initialize form fields from modelValue', async () => {
      const existingValue: RecurrenceInput = {
        type: 'monthly',
        interval: 2,
        byWeekDay: null,
        byMonthDay: [15],
        bySetPos: null,
        endType: 'after',
        endDate: null,
        endAfterOccurrences: 5,
      };

      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: existingValue },
      });

      vi.runAllTimers();
      await flushPromises();

      const typeSelect = wrapper.find('.type-select');
      expect((typeSelect.element as HTMLSelectElement).value).toBe('monthly');

      const intervalInput = wrapper.find('.interval-input');
      expect((intervalInput.element as HTMLInputElement).value).toBe('2');
    });
  });

  describe('user interactions emit correctly', () => {
    it('should emit after changing recurrence type', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      // Wait for initialization
      vi.runAllTimers();
      await flushPromises();

      // Change recurrence type
      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('daily');

      // Should emit after user interaction
      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeDefined();
      expect(emitted!.length).toBeGreaterThanOrEqual(1);

      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.type).toBe('daily');
    });

    it('should emit after changing interval', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const intervalInput = wrapper.find('.interval-input');
      await intervalInput.setValue(3);

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeDefined();

      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.interval).toBe(3);
    });

    it('should emit after toggling weekday for weekly recurrence', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      // Ensure it's set to weekly (default)
      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('weekly');

      // Clear previous emits
      const emitsBefore = wrapper.emitted('update:modelValue')?.length || 0;

      // Toggle Monday
      const dayButtons = wrapper.findAll('.day-button');
      await dayButtons[0].trigger('click'); // Monday

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted!.length).toBeGreaterThan(emitsBefore);

      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.byWeekDay).toContain('MO');
    });

    it('should emit after changing end type', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      // Find and click the "after" radio button
      const radioInputs = wrapper.findAll('input[type="radio"]');
      const afterRadio = radioInputs.find(
        r => (r.element as HTMLInputElement).value === 'after'
      );
      await afterRadio!.setValue(true);

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeDefined();

      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.endType).toBe('after');
    });
  });

  describe('weekly recurrence', () => {
    it('should show day buttons for weekly type', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      // Set to weekly
      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('weekly');

      const dayButtons = wrapper.findAll('.day-button');
      expect(dayButtons).toHaveLength(7);
    });

    it('should toggle day selection on click', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const dayButtons = wrapper.findAll('.day-button');
      const mondayButton = dayButtons[0];

      // Initially not selected
      expect(mondayButton.classes()).not.toContain('day-button--selected');

      // Click to select
      await mondayButton.trigger('click');
      expect(mondayButton.classes()).toContain('day-button--selected');

      // Click to deselect
      await mondayButton.trigger('click');
      expect(mondayButton.classes()).not.toContain('day-button--selected');
    });

    it('should allow multiple day selection', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const dayButtons = wrapper.findAll('.day-button');

      // Select Mon, Wed, Fri
      await dayButtons[0].trigger('click'); // Mon
      await dayButtons[2].trigger('click'); // Wed
      await dayButtons[4].trigger('click'); // Fri

      expect(dayButtons[0].classes()).toContain('day-button--selected');
      expect(dayButtons[2].classes()).toContain('day-button--selected');
      expect(dayButtons[4].classes()).toContain('day-button--selected');

      const emitted = wrapper.emitted('update:modelValue');
      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.byWeekDay).toEqual(['MO', 'WE', 'FR']);
    });
  });

  describe('monthly recurrence', () => {
    it('should show monthly options for monthly type', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('monthly');

      // Should have day input and weekday position selects
      expect(wrapper.find('.day-input').exists()).toBe(true);
      expect(wrapper.find('.position-select').exists()).toBe(true);
    });

    it('should emit byMonthDay for date-based monthly', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('monthly');

      // Set specific day of month
      const dayInput = wrapper.find('.day-input');
      await dayInput.setValue(15);

      const emitted = wrapper.emitted('update:modelValue');
      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.byMonthDay).toEqual([15]);
    });
  });

  describe('end options', () => {
    it('should enable date input when end type is date', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const radioInputs = wrapper.findAll('input[type="radio"]');
      const dateRadio = radioInputs.find(
        r => (r.element as HTMLInputElement).value === 'date'
      );
      await dateRadio!.setValue(true);

      const dateInput = wrapper.find('.date-input');
      expect((dateInput.element as HTMLInputElement).disabled).toBe(false);
    });

    it('should enable count input when end type is after', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const radioInputs = wrapper.findAll('input[type="radio"]');
      const afterRadio = radioInputs.find(
        r => (r.element as HTMLInputElement).value === 'after'
      );
      await afterRadio!.setValue(true);

      const countInput = wrapper.find('.count-input');
      expect((countInput.element as HTMLInputElement).disabled).toBe(false);
    });

    it('should include endAfterOccurrences in emit when end type is after', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      // Set end type to after
      const radioInputs = wrapper.findAll('input[type="radio"]');
      const afterRadio = radioInputs.find(
        r => (r.element as HTMLInputElement).value === 'after'
      );
      await afterRadio!.setValue(true);

      // Set count
      const countInput = wrapper.find('.count-input');
      await countInput.setValue(5);

      const emitted = wrapper.emitted('update:modelValue');
      const lastEmit = emitted![emitted!.length - 1][0] as RecurrenceInput;
      expect(lastEmit.endAfterOccurrences).toBe(5);
    });
  });

  describe('interval label', () => {
    it('should show singular label for interval 1', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('daily');

      // Interval is 1 by default, should show "day" not "days"
      expect(wrapper.text()).toContain('day');
    });

    it('should show plural label for interval > 1', async () => {
      const wrapper = mount(RecurrenceSelector, {
        props: { modelValue: null },
      });

      vi.runAllTimers();
      await flushPromises();

      const typeSelect = wrapper.find('.type-select');
      await typeSelect.setValue('daily');

      const intervalInput = wrapper.find('.interval-input');
      await intervalInput.setValue(2);

      expect(wrapper.text()).toContain('days');
    });
  });
});
