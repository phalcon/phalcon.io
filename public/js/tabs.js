// Tabs for every [role="tablist"] that has data-tabs. Without JavaScript,
// all panels stay visible. This script hides the panels of the tabs that are
// not selected, and switches the panels on click.
(() => {
    for (const list of document.querySelectorAll('[role="tablist"][data-tabs]')) {
        const tabs = [...list.querySelectorAll('[role="tab"]')];

        const select = (selected) => {
            for (const tab of tabs) {
                const active = tab === selected;
                const panel = document.getElementById(tab.getAttribute('aria-controls'));

                tab.setAttribute('aria-selected', String(active));

                if (panel) {
                    panel.hidden = !active;
                }
            }
        };

        select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0]);

        for (const tab of tabs) {
            tab.addEventListener('click', () => select(tab));
        }
    }
})();
