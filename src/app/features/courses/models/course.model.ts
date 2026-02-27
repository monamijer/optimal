export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: number; // in hours
    content: string;
    icon?: string; // Optional field for course icon
}
