import { AccessLevel } from "../../../models/accessLevel";

export interface Course {
    id: string;
    title: string;
    description: string;
    icon?: string;
    accessLevel: AccessLevel;
    tags?: string[];
    category?: string;
    /** Markdown files of the course, in reading order (from the generated catalogue). */
    chapters?: string[];
    /** Translated title and description per language (the base text is English). */
    i18n?: Record<string, { title?: string; description?: string }>;
    /** Chapter files that have a translation, per language: `a.md` -> `a.<lang>.md`. */
    langs?: Record<string, string[]>;
    //instructor: string;
    ///duration: number; // in hours
    //content: string;

}
