import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	image: z.string().optional(),
	pronouns: z.string().optional(),
	link: z.string().optional(),
	links: z.array(z.string()).optional().default([]),
	about: z.string().optional(),
	role: z.enum(["STUDENT", "STAFF", "ADMIN"]).default("STUDENT"),
	semesterIds: z.array(z.string()).optional().default([]),
	semesterCodes: z.array(z.string()).optional().default([]),
});

export type UserInput = z.infer<typeof UserSchema>;

export type BasicUser = {
	id: string;
	name: string;
	image: string;
};

export const SemesterSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Semester name is required"),
	dates: z.array(z.string()).optional(),
	users: z.array(z.string()).optional(), // array of user IDs
});

export type SemesterInput = z.infer<typeof SemesterSchema>;

export const ThursdaySchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Day name is required"),
	date: z.date().or(z.string()),
	semester_id: z.string().optional(),
});

export type ThursdayInput = z.infer<typeof ThursdaySchema>;

export const PresentationSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Presentation name is required"),
	about: z.string().optional(),
	production_id: z.string().optional(),
	presenters: z.array(z.string()).optional(),
});

export type PresentationInput = z.infer<typeof PresentationSchema>;

export const ProductionSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Production name is required"),
	location: z.string().min(1, "Location is required"),
	thursday_id: z.string().optional(),
	producers: z.array(z.string()).optional(),
	presentations: z.array(PresentationSchema).optional(),
});

export type ProductionInput = z.infer<typeof ProductionSchema>;

export const FilterSchema = z.object({
	semesterId: z.union([z.string(), z.array(z.string())]).optional(),
	user: z.union([z.string(), z.array(z.string())]).optional(),
	thursdays: z.union([z.string(), z.array(z.string())]).optional(),
	semester: z.union([z.string(), z.array(z.string())]).optional(), // Legacy name support
});

export type FilterInputValues = z.infer<typeof FilterSchema>;
