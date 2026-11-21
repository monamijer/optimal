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
    //instructor: string;
    ///duration: number; // in hours
    //content: string;

}
