function getMainColors(stylesheet) {
	const background = stylesheet.match(/--background-default:\s*([^;]+);/);
	const foreground = stylesheet.match(/--foreground-default:\s*([^;]+);/);

	if (background === null || foreground === null) return {
		background: "#ffffff",
		foreground: "#000000",
	};

	return {
		background: background[1].replace("!important", "").trim(),
		foreground: foreground[1].replace("!important", "").trim(),
	};
}

function parseCssColor(string) {
	string = string.replace("!important", "").trim();

	// this isn't very good, but it'll do
	if (string.startsWith("#") && string.length <= 5) {
		const d3hex = parseInt(string.slice(1, 4), 16);
		return [
			((d3hex & 0xf00) >> 8) * 0x11,
			((d3hex & 0x0f0) >> 4) * 0x11,
			(d3hex & 0x00f) * 0x11,
		];
	} else if (string.startsWith("#") && string.length >= 7) {
		const d6hex = parseInt(string.slice(1, 7), 16);
		return [
			(d6hex & 0xff0000) >> 16,
			(d6hex & 0x00ff00) >> 8,
			d6hex & 0x0000ff,
		];
	} else if (string.startsWith("rgb(")) {
		return string.slice(4, string.indexOf(")"))
			.split(",")
			.map((part) => parseInt(part.trim(), 10))
			.slice(0, 3);
	} else {
		return [ 0, 0, 0 ]; // ¯\_(ツ)_/¯
	}
}

function getMonacoTheme({ foreground, background }) {
	const [ bgr, bgg, bgb ] = parseCssColor(background);
	const backgroundLum = 0.299 * bgr + 0.587 * bgg + 0.114 * bgb;

	const hd = (value) => Math.round(value).toString(16).padStart(2, "0");

	const mult = backgroundLum > 127 ? 0.75 : 1.35;
	const selection = "#" + hd(bgr * mult) + hd(bgg * mult) + hd(bgb * mult);

	return {
		base: backgroundLum > 127 ? "vs" : "vs-dark",
		colors: {
			"editor.background": background,
			"editor.selectionBackground": selection,
			"editorCursor.foreground": foreground,
		},
		rules: [
			{ token: "", foreground },
		],
	};
}

function parseRawTheme(data) {
	const { foreground, background } = getMainColors(data.stylesheet);

	return {
		name: data.name,
		author: data.author.name,
		description: data.description,
		foreground, background,
		stylesheet: data.stylesheet,
		monacoTheme: data.monacoTheme || getMonacoTheme({
			foreground, background,
		}),
	};
}
