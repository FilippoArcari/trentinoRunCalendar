import mongoose from "mongoose";
import { interest } from "./enums";

const RaceSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: () => new mongoose.Types.ObjectId().toString(),
		unique: true,
	},
	idowner: {
		type: String,
		ref: "User", // Reference to User schema
		required: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		default: "",
		trim: true,
	},
	length: {
		type: Number,
		required: true, // e.g., in km or meters
	},
	data: {
		type: Date,
		required: true,
	},
	principalimage: {
		type: String, // URL
		default: "",
	},
	otherImage: {
		type: [String], // Array of additional image URLs
		default: [],
	},
    typology: {
        type: String,
        enum: Object.keys(interest),
    },
    latitude: { 
        type: Number,
    },
    longitude: {
        type: Number,
    },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	comments: [
		{
			userId: { type: String, ref: "User", required: true },
			content: { type: String, required: true },
			date: { type: Date, default: Date.now },
		},
	],
	likes: [
		{
			userId: { type: String, ref: "User", required: true },
			date: { type: Date, default: Date.now },
		},
	],
});

export default mongoose.models.Race || mongoose.model("Race", RaceSchema);
