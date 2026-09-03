export function parseUserLinks(value?: string | null): string[] {
	if (!value) {
		return [""];
	}

	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) {
			const links = parsed.filter((item): item is string => typeof item === "string");
			return links.length > 0 ? links : [""];
		}
	} catch {
		return [value];
	}

	return [value];
}

export function serializeUserLinks(value?: string[] | string | null) {
	const links = Array.isArray(value)
		? value.map((link) => link.trim()).filter(Boolean)
		: value?.trim()
			? [value.trim()]
			: [];

	if (links.length === 0) {
		return "";
	}

	return JSON.stringify(links);
}

export function getDisplayUserLinks(value?: string | null) {
	return parseUserLinks(value).map((link) => link.trim()).filter(Boolean);
}

export function getUserLinkHref(value: string) {
	if (/^https?:\/\//i.test(value)) {
		return value;
	}

	if (/^www\./i.test(value)) {
		return `https://${value}`;
	}

	return null;
}
