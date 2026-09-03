import { UserInput } from "@/actions/schemas";
import { parseUserLinks } from "@/actions/user-links";

function formatSemesterCode(name?: string | null) {
  if (!name) return "";

  const code = name.match(/^(SP|FA)\d{2}$/i);
  if (code) return name.toUpperCase();

  const namedSemester = name.match(/^(Spring|Fall)\s+(\d{4})$/i);
  if (namedSemester) {
    const term = namedSemester[1].toLowerCase() === "spring" ? "SP" : "FA";
    return `${term}${namedSemester[2].slice(-2)}`;
  }

  return name;
}

export const transformUserFromAPI = (user: any): UserInput | null => {
  if (!user) return null;
  const semesterIds = user.semesters?.map((s: any) => s.id) || [];

  return {
    id: user.id,
    name: user.name,
    pronouns: user.pronouns || "",
    image: user.image || "/face.jpg",
    email: user.email,
    link: user.link || "",
    links: parseUserLinks(user.link),
    about: user.about || "",
    role: user.role || "STUDENT",
    semesterIds,
    semesterCodes: user.semesters?.map((s: any) => formatSemesterCode(s.name)).filter(Boolean) || [],
  };
};

export const transformUserPayload = (formData: any) => {
  return {
    ...formData,
  };
};
