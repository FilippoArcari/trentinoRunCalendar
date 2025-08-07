import dbConnect from "../mongodb";

interface UserServiceProps {
	id: string;
	name: string;
	mail: string;
	interests: string[];
}

class UserService {
	id: string;
	name: string;
	mail: string;
	interests: string[];

	constructor(arg: string | UserServiceProps) {
		if (typeof arg === "string") {
			// Construct from id only
			this.id = arg;
			this.name = "";
			this.mail = "";
			this.interests = [];
			this.getUserById(arg);
		} else {
			// Construct from full props
			this.id = arg.id;
			this.name = arg.name;
			this.mail = arg.mail;
			this.interests = arg.interests || [];
		}
	}
	private async refreshUser(user: UserServiceProps) {
		this.id = user.id;
		this.name = user.name;
		this.mail = user.mail;
		this.interests = user.interests || [];
	}

	async getUserById(id: string) {
		const db = await dbConnect();
		const res = await db.collection("users").findOne({ _id: id });
		this.refreshUser(res as UserServiceProps);
	}

	// Getters
	getId(): string {
		return this.id;
	}

	getName(): string {
		return this.name;
	}

	getMail(): string {
		return this.mail;
	}

	getInterests(): string[] {
		return this.interests;
	}

	// Setters
	setId(id: string): void {
		this.id = id;
	}

	setName(name: string): void {
		this.name = name;
	}

	setMail(mail: string): void {
		this.mail = mail;
	}

	setInterests(interests: string[]): void {
		this.interests = interests;
	}
}

export default UserService;
