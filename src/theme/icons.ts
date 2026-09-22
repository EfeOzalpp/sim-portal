import addIcon from "@/theme/assets/add/add.svg";
import arrowUpIcon from "@/theme/assets/arrow/up.svg";
import checkIcon from "@/theme/assets/check/check.svg";
import brushIcon from "@/theme/assets/color/brush.svg";
import closeIcon from "@/theme/assets/close/close.svg";
import dayIcon from "@/theme/assets/day/day.svg";
import deleteIcon from "@/theme/assets/delete/delete.svg";
import downloadIcon from "@/theme/assets/download/download.svg";
import editIcon from "@/theme/assets/edit/edit.svg";
import errorIcon from "@/theme/assets/error/error.svg";
import filterIcon from "@/theme/assets/filter/filter.svg";
import gridViewIcon from "@/theme/assets/grid_view/grid_view.svg";
import importIcon from "@/theme/assets/import/import.svg";
import infoIcon from "@/theme/assets/info/info.svg";
import listIcon from "@/theme/assets/list/list.svg";
import locationIcon from "@/theme/assets/location/location.svg";
import personIcon from "@/theme/assets/person/person.svg";
import searchIcon from "@/theme/assets/search/search.svg";
import successIcon from "@/theme/assets/success/success.svg";
import viewForwardIcon from "@/theme/assets/view/forward.svg";

export const iconAssets = {
	"add/add.svg": addIcon,
	"arrow/up.svg": arrowUpIcon,
	"check/check.svg": checkIcon,
	"color/brush.svg": brushIcon,
	"close/close.svg": closeIcon,
	"day/day.svg": dayIcon,
	"delete/delete.svg": deleteIcon,
	"download/download.svg": downloadIcon,
	"edit/edit.svg": editIcon,
	"error/error.svg": errorIcon,
	"filter/filter.svg": filterIcon,
	"grid_view/grid_view.svg": gridViewIcon,
	"import/import.svg": importIcon,
	"info/info.svg": infoIcon,
	"list/list.svg": listIcon,
	"location/location.svg": locationIcon,
	"person/person.svg": personIcon,
	"search/search.svg": searchIcon,
	"success/success.svg": successIcon,
	"view/forward.svg": viewForwardIcon,
};

export type IconName = keyof typeof iconAssets;

export function resolveIconSrc(icon: IconName): string {
	const asset = iconAssets[icon];
	return typeof asset === "string" ? asset : asset.src;
}
