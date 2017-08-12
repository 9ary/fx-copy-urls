browser.commands.onCommand.addListener((command) => {
    switch (command) {
    case "copy-url":
        browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
            const tab = tabs[0];
            copyToClipboardWithHelper(tab, tab.url);
        }, (error) => {
            console.error("Error: " + error);
        });
        break;

    case "copy-all-urls":
        browser.tabs.query({currentWindow: true}).then((tabs) => {
            var curTab = null;
            var urls = [];

            for (const t of tabs) {
                if (t.active)
                    curTab = t;
                urls.push(t.url);
            }

            copyToClipboardWithHelper(curTab, urls.join("\n"));
        }, (error) => {
            console.error("Error: " + error);
        });
        break;

    default:
        console.log("Unknown command: " + command);
    }
});

// https://github.com/mdn/webextensions-examples/tree/master/context-menu-copy-link-with-types
function copyToClipboardWithHelper(tab, text) {
            const code = "copyToClipboard(" + JSON.stringify(text) + ");";

            browser.tabs.executeScript({
                code: "typeof copyToClipboard === 'function';",
            }).then((results) => {
                // The content script's last expression will be true if the function
                // has been defined. If this is not the case, then we need to run
                // clipboard-helper.js to define function copyToClipboard.
                if (!results || results[0] !== true) {
                    return browser.tabs.executeScript(tab.id, {
                        file: "clipboard.js",
                    });
                }
            }).then(() => {
                return browser.tabs.executeScript(tab.id, {
                    code,
                });
            }).catch((error) => {
                // This could happen if the extension is not allowed to run code in
                // the page, for example if the tab is a privileged page.
                console.error("Failed to copy text: " + error);
            });
}
