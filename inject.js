addEventListener("load", () => {
	let initHasRun = false;
	let storeHasSubbed = false;

	async function applySavedStyle() {
		console.log("[conflux] applying style");

		const { stylesheet, monacoTheme } = JSON.parse(
			(await browser.storage.local.get([ "theme" ])).theme
		);

		if (!stylesheet || !monacoTheme)
			return console.warn("[conflux] no theme set");

		if (!initHasRun) {
			const style = document.createElement("style");
			style.id = "conflux-style";
			document.head.appendChild(style);


		document.getElementById("conflux-style").innerText = stylesheet;

		const isEditor = !!window.wrappedJSObject.monaco && !!window.wrappedJSObject.store;
		let xtermHasChanged = false;

		if (isEditor) {
			window.wrappedJSObject.monaco.editor.defineTheme("conflux", cloneInto({
				base: monacoTheme.base,
				colors: monacoTheme.colors,
				rules: monacoTheme.rules,
				inherit: true,
			}, window));

			window.wrappedJSObject.monaco.editor.setTheme("conflux");

			// this is terrible, but I can't find a better way to do it
			window.eval("store.subscribe(() => monaco.editor.setTheme('conflux'));");

			storeHasSubbed = true;
			console.log(monacoTheme.colors['editor.background'])
			if (!xtermHasChanged) {
			setTimeout(function() {
				window.eval(`
				let topButtons = document.querySelectorAll('*[style="align-items: center; display: flex; justify-content: space-between;"]');
				topButtons[0].click();
				let canvasConsole = document.getElementsByClassName('xterm-text-layer')[0];
				topButtons[1].click();
				setTimeout(function(){
						let canvasShell = document.getElementsByClassName('xterm-text-layer')[1];

						topButtons[0].click();

						let ctxConsole = canvasConsole.getContext("2d");
						let ctxShell = canvasShell.getContext("2d");

						ctxConsole.fillRectOriginal = ctxConsole.fillRect;
						ctxShell.fillRectOriginal = ctxShell.fillRect;

						console.log("${monacoTheme.colors['editor.background']}")

						ctxConsole.fillRect = function (...args) {
								ctxConsole.fillStyle = "${monacoTheme.colors['editor.background']}";
								ctxConsole.fillRectOriginal(...args)
						}

						ctxShell.fillRect = function (...args) {
								ctxShell.fillStyle = "${monacoTheme.colors['editor.background']}";
								ctxShell.fillRectOriginal(...args)
						}

				}, 500)
				`)
			}, 2000)
			xtermHasChanged = true;
			initHasRun = true;
		}
		}

	}
			}


	browser.runtime.onMessage.addListener((data) => {
		if (data === "refresh") {
			console.log("[conflux] refreshing style");
			applySavedStyle();
		} else if (data === "navigate") {
			console.log("[conflux] location change");
			storeHasSubbed = false;
			applySavedStyle();
		}
	});

	console.log("[conflux] content script loaded");

	applySavedStyle();
});
