async function setSelectedTheme(theme) {
	await browser.storage.local.set({
		theme: JSON.stringify(theme),
	});
}

async function getSelectedTheme() {
	const { theme } = await browser.storage.local.get("theme");
	return theme ? JSON.parse(theme) : null;
}

async function reloadThemeInTabs() {
	const tabs = await browser.tabs.query({
		url: "*://*.replit.com/*",
	});

	for (const tab of tabs)
		browser.tabs.sendMessage(tab.id, "refresh");
}

async function selectTheme(theme) {
	document.getElementById("update-theme-name").innerText = theme.name;
	document.getElementById("update-confirm").onclick = async () => {
		await setSelectedTheme(theme);
		reloadThemeInTabs();

		const old = document.getElementById("current-header").nextElementSibling;
		old.parentNode.replaceChild(createCard(theme, false), old);

		document.getElementById("update-popup").classList.add("hidden");
	};
	document.getElementById("update-popup").classList.remove("hidden");
}

function createCard(theme, selectable = true) {
	const title = document.createElement("b");
	title.innerText = theme.name;

	const author = document.createElement("i");
	author.innerText = "by " + theme.author;

	const topRow = document.createElement("span");
	topRow.appendChild(title);
	topRow.appendChild(document.createTextNode(" "));
	topRow.appendChild(author);

	const description = document.createElement("span");
	description.innerText = theme.description;
	
	const card = document.createElement("div");
	card.classList.add("card");
	card.appendChild(topRow);
	card.appendChild(document.createElement("br"));
	card.appendChild(description);
	card.style.background = theme.background;
	card.style.color = theme.foreground;

	if (selectable) {
		card.style.cursor = "pointer";

		card.addEventListener("click", () => selectTheme(theme));
	}

	return card;
}

for (const button of Array.from(document.getElementsByClassName("modal-cancel"))) {
	let modal = button;
	while (true) {
		modal = modal.parentElement;
		if (modal.classList.contains("modal")) break;
	}

	button.onclick = () => modal.classList.add("hidden");
}

document.getElementById("upload").onclick = () => {
	document.getElementById("upload-input").value = null;
	document.getElementById("upload-confirm").onclick = async () => {
		const file = document.getElementById("upload-input").files[0];
		if (!file) return;

		const theme = JSON.parse(await file.text());

		document.getElementById("findbyid-popup").classList.add("hidden");

		selectTheme(theme);
	};
	document.getElementById("upload-popup").classList.remove("hidden");
};

document.getElementById("findbyid").onclick = () => {
	document.getElementById("findbyid-input").value = "";
	document.getElementById("findbyid-confirm").onclick = async () => {
		const input = document.getElementById("findbyid-input");
		if (!input.checkValidity()) return;

		const theme = await getThemeById(input.value);
		if (theme === null) return;

		document.getElementById("findbyid-popup").classList.add("hidden");

		selectTheme(theme);
	};
	document.getElementById("findbyid-popup").classList.remove("hidden");
};

let allThemes = null;

getSelectedTheme().then((theme) => {
	// this right here is why rust is so much better. rust best lang :crab:
	let card = null;
	if (theme === null) {
		card = document.createElement("p");
		card.innerText = "No theme selected.";
	} else {
		card = createCard(theme, false);
	}

	const loader = document.getElementById("current-loader");
	loader.parentNode.replaceChild(card, loader);
});

getPopularThemes().then((themes) => {
	let list = null;
	if (themes === null) {
		list = document.createElement("p");
		list.innerText = "Failed to fetch themes.";
	} else {
		list = document.createElement("div");
		list.classList.add("list");
		for (const theme of themes.slice(0, 5))
			list.appendChild(createCard(theme));
	}

	const loader = document.getElementById("popular-loader");
	loader.parentNode.replaceChild(list, loader);
});

getAllThemes().then((themes) => {
	let list = null;
	if (themes === null) {
		list = document.createElement("p");
		list.innerText = "Failed to fetch themes.";
	} else {
		allThemes = themes;

		list = document.createElement("div");
		list.classList.add("list");
		for (const theme of themes)
			list.appendChild(createCard(theme));
	}

	const loader = document.getElementById("all-loader");
	loader.parentNode.replaceChild(list, loader);
});
