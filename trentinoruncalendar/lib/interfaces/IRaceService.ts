export interface RaceServiceProps {
    id?: string;
	idowner: string;
	title: string;
	description: string;
	length: number;
	data: Date;
	principalimage?: string;
	otherImage?: string[];
	createdAt?: Date;
	longitude?: number;
	latitude?: number;
	typology?: string[];
}
