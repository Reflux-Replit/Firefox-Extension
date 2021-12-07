browser.webNavigation.onHistoryStateUpdated.addListener(
	({ tabId }) => browser.tabs.sendMessage(tabId, "navigate"),
	{
		url: [
			{ hostEquals: "replit.com" },
		],
	},
);
