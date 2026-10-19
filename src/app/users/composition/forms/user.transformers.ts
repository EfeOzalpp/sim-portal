import { UserInput } from "@/actions/schemas";
import { parseUserLinks } from "@/actions/user-links";
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";
import { ROLES } from "@/constants/roles";

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
    role: user.role || ROLES.student,
    semesterIds,
    semesterCodes: user.semesters?.map((s: any) => formatSemesterCode(s.name)).filter(Boolean) || [],
  };
};

export const transformUserPayload = (formData: any) => {
  return {
    ...formData,
  };
};
