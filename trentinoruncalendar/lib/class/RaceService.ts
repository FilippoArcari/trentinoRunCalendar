import dbConnect from "../mongodb";
type RaceServiceProps = {
	id: string;
	idowner: string;
	title: string;
	description: string;
	length: number;
	data: Date;
	principalimage?: string;
	otherImage?: string[];
};

class RaceService {
	id: string;
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

	// Overload signatures
	constructor(id: string);
	constructor(props: RaceServiceProps);
	constructor(arg: string | RaceServiceProps) {
		if (typeof arg === "string") {
			// Construct from id only
			this.id = arg;
			this.idowner = "";
			this.description = "";
			this.title = "";
			this.length = 0;
			this.data = new Date();
			this.getRaceById(arg);
		} else {
			// Construct from full props
			this.id = "";
			this.idowner = arg.idowner;
			this.title = arg.title;
			this.description = arg.description;
			this.length = arg.length;
			this.data = arg.data;
			this.principalimage = arg.principalimage ?? "";
			this.otherImage = arg.otherImage ?? [];
		}
	}
	private async refreshRace(race: RaceServiceProps) {
		this.id = race.id;
		this.idowner = race.idowner;
		this.title = race.title;
		this.description = race.description;
		this.length = race.length;
		this.data = race.data;
		this.principalimage = race.principalimage ?? "";
		this.otherImage = race.otherImage ?? [];
	}
	async getRaceById(id: string) {
		const db = await dbConnect();
		const res = await db.collection("races").findOne({ id });
		this.refreshRace(res as RaceServiceProps);
	}
	async saveRace() {
		const db = await dbConnect();
		const raceData = {
			idowner: this.idowner,
			title: this.title,
			description: this.description,
			length: this.length,
			data: this.data,
			principalimage: this.principalimage,
			otherImage: this.otherImage,
			createdAt: this.createdAt || new Date(),
			longitude: this.longitude,
			latitude: this.latitude,
			typology: this.typology,
		};
		const result = await db.collection("races").insertOne(raceData);
		this.refreshRace(result as RaceServiceProps);
	}
	async updateRace() {
		const db = await dbConnect();
		const raceData = {
			idowner: this.idowner,
			title: this.title,
			description: this.description,
			length: this.length,
			data: this.data,
			principalimage: this.principalimage,
			otherImage: this.otherImage,
			createdAt: this.createdAt || new Date(),
			longitude: this.longitude,
			latitude: this.latitude,
			typology: this.typology,
		};
		const res = await db
			.collection("races")
			.updateOne({ id: this.id }, { $set: raceData });
		this.refreshRace(res as RaceServiceProps);
	}
	async deleteRace() {
		const db = await dbConnect();
		await db.collection("races").deleteOne({ id: this.id });
	}
	async getAllRaces() {
		const db = await dbConnect();
		const races = await db.collection("races").find({}).toArray();
		return races;
	}

	// Getters
	getId(): string {
		return this.id;
	}

	getIdOwner(): string {
		return this.idowner;
	}

	getTitle(): string {
		return this.title;
	}

	getDescription(): string {
		return this.description;
	}

	getLength(): number {
		return this.length;
	}

	getData(): Date {
		return this.data;
	}

	getPrincipalImage(): string | undefined {
		return this.principalimage;
	}

	getOtherImage(): string[] | undefined {
		return this.otherImage;
	}

	getCreatedAt(): Date | undefined {
		return this.createdAt;
	}

	getLongitude(): number | undefined {
		return this.longitude;
	}

	getLatitude(): number | undefined {
		return this.latitude;
	}

	getTypology(): string[] | undefined {
		return this.typology;
	}

	// Setters
	setId(id: string): void {
		this.id = id;
	}

	setIdOwner(idowner: string): void {
		this.idowner = idowner;
	}

	setTitle(title: string): void {
		this.title = title;
	}

	setDescription(description: string): void {
		this.description = description;
	}

	setLength(length: number): void {
		this.length = length;
	}

	setData(data: Date): void {
		this.data = data;
	}

	setPrincipalImage(principalimage: string | undefined): void {
		this.principalimage = principalimage;
	}

	setOtherImage(otherImage: string[] | undefined): void {
		this.otherImage = otherImage;
	}

	setCreatedAt(createdAt: Date | undefined): void {
		this.createdAt = createdAt;
	}

	setLongitude(longitude: number | undefined): void {
		this.longitude = longitude;
	}

	setLatitude(latitude: number | undefined): void {
		this.latitude = latitude;
	}

	setTypology(typology: string[] | undefined): void {
		this.typology = typology;
	}
}
export default RaceService;
