import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToggleSwitch } from '@/tools/RandomMusicStyleGenerator/RandomMusicStyleGenerator.uiComponents';
import { ToggleSwitch as BlenderToggleSwitch } from '../CreativeConceptBlender/CreativeConceptBlender';

const CASES = [
  ['RandomMusicStyleGenerator.ToggleSwitch', ToggleSwitch],
  ['CreativeConceptBlender.ToggleSwitch', BlenderToggleSwitch],
] as const;

describe.each(CASES)('%s', (_name, Switch) => {
  it('exposes an accessible switch role with its label', () => {
    render(<Switch id="toggle-era" label="Era Matrix" checked={false} onChange={() => {}} />);

    const sw = screen.getByRole('switch', { name: 'Era Matrix' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('tabindex', '0');
  });

  it('reflects the checked state in aria-checked', () => {
    render(<Switch id="toggle-era" label="Era Matrix" checked onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Era Matrix' })).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles on click', () => {
    const onChange = vi.fn();
    render(<Switch id="toggle-era" label="Era Matrix" checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Era Matrix' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles with the Enter key', () => {
    const onChange = vi.fn();
    render(<Switch id="toggle-era" label="Era Matrix" checked={false} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('switch', { name: 'Era Matrix' }), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles with the Space key without scrolling the page', () => {
    const onChange = vi.fn();
    render(<Switch id="toggle-era" label="Era Matrix" checked={false} onChange={onChange} />);

    const sw = screen.getByRole('switch', { name: 'Era Matrix' });
    const notPrevented = fireEvent.keyDown(sw, { key: ' ' });
    // fireEvent returns false when preventDefault() was called.
    expect(notPrevented).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('ignores unrelated keys', () => {
    const onChange = vi.fn();
    render(<Switch id="toggle-era" label="Era Matrix" checked={false} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('switch', { name: 'Era Matrix' }), { key: 'a' });
    expect(onChange).not.toHaveBeenCalled();
  });
});