const API_BASE = "https://api.reflux.repl.co";

async function getThemeById(id) {
	const res = await fetch(API_BASE + `/theme/${ id }`);
	if (res.ok) {
		return parseRawTheme(await res.json());
	} else {
		return null;
	}
}

async function getAllThemes() {
	const res = await fetch(API_BASE + "/theme/all");
	if (res.ok) {
		return (await res.json()).map((theme) => parseRawTheme(theme));
	} else {
		return null;
	}
}

async function getPopularThemes() {
	const res = await fetch(API_BASE + "/theme/feed/popular");
	if (res.ok) {
		return (await res.json()).map((theme) => parseRawTheme(theme));
	} else {
		return null;
	}
}
