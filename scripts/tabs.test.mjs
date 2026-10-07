import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/js/tabs.js', import.meta.url), 'utf8');

/** A tab list with `count` tabs and panels, as the pages render it. Only the parts that tabs.js uses. */
function fakeTabs(count, selected = 0) {
    const panels = new Map();
    const tabs = Array.from({ length: count }, (_, i) => {
        const attributes = { 'aria-controls': `panel-${i}`, 'aria-selected': String(i === selected) };
        const listeners = {};

        panels.set(`panel-${i}`, { hidden: false });

        return {
            addEventListener: (type, listener) => (listeners[type] = listener),
            click: () => listeners.click?.(),
            getAttribute: (name) => attributes[name] ?? null,
            setAttribute: (name, value) => (attributes[name] = String(value)),
            tabIndex: 0,
        };
    });
    const list = { querySelectorAll: () => tabs };
    const document = {
        getElementById: (id) => panels.get(id) ?? null,
        querySelectorAll: () => [list],
    };

    vm.runInNewContext(source, { document });

    return { panels, tabs };
}

test('after the script runs, only the panel of the selected tab shows', () => {
    const { panels } = fakeTabs(3, 1);

    assert.deepEqual([...panels.values()].map((panel) => panel.hidden), [true, false, true]);
});

test('a click selects the tab and shows its panel', () => {
    const { panels, tabs } = fakeTabs(2);

    tabs[1].click();

    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[0].getAttribute('aria-selected'), 'false');
    assert.deepEqual([...panels.values()].map((panel) => panel.hidden), [true, false]);
});

test('every tab stays in the keyboard tab order', () => {
    // There are no arrow-key handlers, so a tab with tabIndex -1 cannot be reached from the keyboard.
    const { tabs } = fakeTabs(3);

    assert.ok(tabs.every((tab) => tab.tabIndex !== -1));
});
