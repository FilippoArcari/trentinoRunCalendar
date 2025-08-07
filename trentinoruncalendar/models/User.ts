import { interest } from "./enums";
import mongoose from "mongoose";

const User = new mongoose.Schema({
	_id: {
		type: String,
		default: () => new mongoose.Types.ObjectId().toString(),
		unique: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
	},
	interests: {
		type: [String],
		enum: Object.keys(interest),
		default: [],
	},
});

export default mongoose.models.User || mongoose.model("User", User);
