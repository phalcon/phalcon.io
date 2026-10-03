// Google Analytics 4. The measurement id comes from the data-ga-id attribute
// of this script tag, so that the page has no inline script (see the CSP in
// _headers).
(() => {
    const id = document.currentScript?.dataset.gaId;

    if (!id) {
        return;
    }

    window.dataLayer = window.dataLayer || [];

    function gtag() {
        window.dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', id);
})();
