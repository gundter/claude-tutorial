import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusBadge from './StatusBadge.vue';

describe('StatusBadge', () => {
  describe('labels', () => {
    it('should display "Pending" for pending status', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'pending' },
      });

      expect(wrapper.text()).toBe('Pending');
    });

    it('should display "In Progress" for in_progress status', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'in_progress' },
      });

      expect(wrapper.text()).toBe('In Progress');
    });

    it('should display "Completed" for completed status', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'completed' },
      });

      expect(wrapper.text()).toBe('Completed');
    });
  });

  describe('CSS classes', () => {
    it('should have base status-badge class', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'pending' },
      });

      expect(wrapper.find('span').classes()).toContain('status-badge');
    });

    it('should have status-badge--pending class for pending', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'pending' },
      });

      expect(wrapper.find('span').classes()).toContain('status-badge--pending');
    });

    it('should have status-badge--in_progress class for in_progress', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'in_progress' },
      });

      expect(wrapper.find('span').classes()).toContain('status-badge--in_progress');
    });

    it('should have status-badge--completed class for completed', () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'completed' },
      });

      expect(wrapper.find('span').classes()).toContain('status-badge--completed');
    });
  });

  describe('props reactivity', () => {
    it('should update label when status changes', async () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'pending' },
      });

      expect(wrapper.text()).toBe('Pending');

      await wrapper.setProps({ status: 'completed' });

      expect(wrapper.text()).toBe('Completed');
    });

    it('should update CSS class when status changes', async () => {
      const wrapper = mount(StatusBadge, {
        props: { status: 'pending' },
      });

      expect(wrapper.find('span').classes()).toContain('status-badge--pending');

      await wrapper.setProps({ status: 'in_progress' });

      expect(wrapper.find('span').classes()).toContain('status-badge--in_progress');
      expect(wrapper.find('span').classes()).not.toContain('status-badge--pending');
    });
  });
});
