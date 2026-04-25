import { AccessLevel } from "../../../models/accessLevel";

export interface Course {
    id: string;
    title: string;
    description: string;
    icon?: string;
    accessLevel: AccessLevel;
    tag?: string[];
    //instructor: string;
    ///duration: number; // in hours
    //content: string;

}
