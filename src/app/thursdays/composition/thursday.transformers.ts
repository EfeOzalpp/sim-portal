import dayjs from "dayjs";
import { normalizeThursdayName } from "@/helpers";

/**
 * Transform form data (from React Hook Form) into API payload
 * Used before sending to backend
 */
export function transformThursdayPayload(formData: any) {
  return {
    name: formData.name,
    date: formData.date ? (dayjs.isDayjs(formData.date) ? formData.date.toISOString() : dayjs(formData.date).toISOString()) : null,
    semesterId: formData.semesterId,
    productions: (formData.productions || []).map((production: any) => ({
      id: production.id,
      name: production.name,
      location: production.location,
      producers: production.producers || [],
      presentations: (production.presentations || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        presenters: p.presenters || [],
      })),
    })),
  };
}

/**
 * Transform API response into form shape (React Hook Form)
 * Used when loading existing data for edit
 */
export function transformThursdayFromAPI(apiData: any) {
  if (!apiData) {
    return {
      name: "",
      date: null,
      semesterId: null,
      productions: [],
    };
  }

  return {
    name: normalizeThursdayName(apiData.name),
    date: apiData.date ? dayjs(apiData.date) : null,
    semesterId: apiData.semester_id || null,
    productions: (apiData.productions || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      producers: (p.producers || []).map((prod: any) => prod.id),
      presentations: (p.presentations || []).map((pres: any) => ({
        id: pres.id,
        name: pres.name,
        presenters: (pres.presenters || []).map((pr: any) => pr.id),
      })),
    })),
  };
}
