import addIcon from "@/theme/assets/add/add.svg";
import arrowUpIcon from "@/theme/assets/arrow/up.svg";
import arrowOutwardIcon from "@/theme/assets/arrow_outward/arrow_outward.svg";
import checkIcon from "@/theme/assets/check/check.svg";
import brushIcon from "@/theme/assets/color/brush.svg";
import closeIcon from "@/theme/assets/close/close.svg";
import dayIcon from "@/theme/assets/day/day.svg";
import deleteIcon from "@/theme/assets/delete/delete.svg";
import downloadIcon from "@/theme/assets/download/download.svg";
import editIcon from "@/theme/assets/edit/edit.svg";
import errorIcon from "@/theme/assets/error/error.svg";
import filterIcon from "@/theme/assets/filter/filter.svg";
import fiberTodayIcon from "@/theme/assets/fiber_today/fiber_today.svg";
import gridViewIcon from "@/theme/assets/grid_view/grid_view.svg";
import importIcon from "@/theme/assets/import/import.svg";
import infoIcon from "@/theme/assets/info/info.svg";
import listIcon from "@/theme/assets/list/list.svg";
import locationIcon from "@/theme/assets/location/location.svg";
import menuIcon from "@/theme/assets/menu/menu.svg";
import moreVerticalIcon from "@/theme/assets/more-vertical/more_vert.svg";
import personIcon from "@/theme/assets/person/person.svg";
import removeIcon from "@/theme/assets/remove/remove.svg";
import searchIcon from "@/theme/assets/search/search.svg";
import scheduleIcon from "@/theme/assets/schedule/schedule.svg";
import successIcon from "@/theme/assets/success/success.svg";
import textIcon from "@/theme/assets/text/text.svg";
import darkModeIcon from "@/theme/assets/theme-switch/dark_mode.svg";
import lightModeIcon from "@/theme/assets/theme-switch/light_mode.svg";
import unfoldLessIcon from "@/theme/assets/unfold_less/unfold_less.svg";
import unfoldMoreIcon from "@/theme/assets/unfold_more/unfold_more.svg";
import viewForwardIcon from "@/theme/assets/view/forward.svg";

export const iconAssets = {
	"add/add.svg": addIcon,
	"arrow/up.svg": arrowUpIcon,
	"arrow_outward/arrow_outward.svg": arrowOutwardIcon,
	"check/check.svg": checkIcon,
	"color/brush.svg": brushIcon,
	"close/close.svg": closeIcon,
	"day/day.svg": dayIcon,
	"delete/delete.svg": deleteIcon,
	"download/download.svg": downloadIcon,
	"edit/edit.svg": editIcon,
	"error/error.svg": errorIcon,
	"filter/filter.svg": filterIcon,
	"fiber_today/fiber_today.svg": fiberTodayIcon,
	"grid_view/grid_view.svg": gridViewIcon,
	"import/import.svg": importIcon,
	"info/info.svg": infoIcon,
	"list/list.svg": listIcon,
	"location/location.svg": locationIcon,
	"menu/menu.svg": menuIcon,
	"more-vertical/more_vert.svg": moreVerticalIcon,
	"person/person.svg": personIcon,
	"remove/remove.svg": removeIcon,
	"search/search.svg": searchIcon,
	"schedule/schedule.svg": scheduleIcon,
	"success/success.svg": successIcon,
	"text/text.svg": textIcon,
	"theme-switch/dark_mode.svg": darkModeIcon,
	"theme-switch/light_mode.svg": lightModeIcon,
	"unfold_less/unfold_less.svg": unfoldLessIcon,
	"unfold_more/unfold_more.svg": unfoldMoreIcon,
	"view/forward.svg": viewForwardIcon,
};

export type IconName = keyof typeof iconAssets;

export function resolveIconSrc(icon: IconName): string {
	const asset = iconAssets[icon];
	return typeof asset === "string" ? asset : asset.src;
}
