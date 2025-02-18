function updateDarkMode(darkMode) {
    if (!darkMode && navigator.userAgent.indexOf('median') < 0) {
        darkMode = (document.cookie.match(/^(?:.*;)?\s*darkMode\s*=\s*([^;]+)(?:.*)?$/) || [,"auto"])[1];
    }

    if (typeof median !== "undefined") {
        median.screen.setColorScheme(darkMode);
    } else {
        document.documentElement.setAttribute("data-color-scheme-option", darkMode);
    }

    if (darkMode !== "light" && darkMode !== "dark") {
        darkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("color-scheme", darkMode);
}

updateDarkMode();

function median_library_ready() {
    updateDarkMode();
}

if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        const darkMode = document.documentElement.getAttribute("data-color-scheme-option");
        if (darkMode === "light") {
            console.log("Light mode and detected mode switch.");
            document.documentElement.setAttribute("color-scheme", "light");
        } else if (darkMode === "dark") {
            console.log("Dark mode and detected mode switch.");
            document.documentElement.setAttribute("color-scheme", "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            console.log("Auto mode and detected switch to Dark Mode.");
            document.documentElement.setAttribute("color-scheme", "dark");
        } else {
            console.log("Auto mode and detected switch to Light Mode.");
            document.documentElement.setAttribute("color-scheme", "light");
        }
    });
}

document.addEventListener("click", function (event) {
        if (event.target.matches("#dark-mode-button")) {
            event.preventDefault();
            document.cookie = "darkMode=dark";
            updateDarkMode("dark");
        } else if (event.target.matches("#light-mode-button")) {
            event.preventDefault();
            document.cookie = "darkMode=light";
            updateDarkMode("light");
        } else if (event.target.matches("#auto-mode-button")) {
            event.preventDefault();
            document.cookie = "darkMode=auto";
            updateDarkMode("auto");
        }
    },
    false
);