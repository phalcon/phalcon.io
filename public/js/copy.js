// Copy-to-clipboard for every [data-copy] button. Where navigator.clipboard
// is not available (a preview on plain HTTP), it uses a hidden textarea.
(() => {
    async function copyText(text) {
        if (window.isSecureContext && navigator.clipboard) {
            await navigator.clipboard.writeText(text);

            return;
        }

        const area = document.createElement('textarea');

        area.value = text;
        area.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    }

    document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-copy]');

        if (!button) {
            return;
        }

        try {
            await copyText(button.dataset.copy ?? '');

            const original = button.textContent;

            button.textContent = 'copied ✓';
            setTimeout(() => (button.textContent = original), 1500);
        } catch {
            // The clipboard is not available. Keep the button as it is.
        }
    });
})();
