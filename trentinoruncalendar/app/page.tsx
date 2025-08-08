"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
	FiHeart,
	FiSearch,
	FiPlus,
	FiTrash2,
	FiEdit,
	FiX,
} from "react-icons/fi";

type Race = {
	_id: string;
	idowner: string;
	title: string;
	description?: string;
	length: number;
	data: string; // ISO date
	principalimage?: string;
	otherImage?: string[];
	typology?: string;
	latitude?: number;
	longitude?: number;
	createdAt?: string;
	comments?: { userId: string; content: string; date: string }[];
	likes?: { userId: string; date: string }[];
};

const API_BASE = "/api/race";

export default function Home() {
	const { data: session } = useSession();

	const [races, setRaces] = useState<Race[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [typologyFilter, setTypologyFilter] = useState<string>("all");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [form, setForm] = useState<Partial<Race>>({});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchRaces();
	}, []);

	async function fetchRaces() {
		setLoading(true);
		try {
			const res = await fetch(API_BASE); // GET /api/race
			if (!res.ok) throw new Error("Failed to fetch races");
			const data: Race[] = await res.json();
			if (!Array.isArray(data)) {
				setError("Invalid response format");
				return;
			}
			// sort by date ascending
			data.sort(
				(a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
			);
			setRaces(data);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Unknown error");
		} finally {
			setLoading(false);
		}
	}

	// Filtered races computed client-side
	const filteredRaces = races.filter((r) => {
		const q = search.trim().toLowerCase();
		const matchSearch =
			!q ||
			r.title.toLowerCase().includes(q) ||
			(r.description || "").toLowerCase().includes(q);
		const matchTypology =
			typologyFilter === "all" || r.typology === typologyFilter;
		return matchSearch && matchTypology;
	});

	// Determine current user identifier used in likes/comments (change if you store a different id)
	const currentUserId = session?.user?.email || session?.user?.name || "guest";

	// Toggle like (optimistic update)
	async function toggleLike(race: Race) {
		if (!session) {
			signIn();
			return;
		}
		const already = race.likes?.some((l) => l.userId === currentUserId);
		// optimistic
		const updated = races.map((r) =>
			r._id === race._id
				? {
						...r,
						likes: already
							? (r.likes || []).filter((l) => l.userId !== currentUserId)
							: [
									...(r.likes || []),
									{ userId: currentUserId, date: new Date().toISOString() },
							  ],
				  }
				: r
		);
		setRaces(updated);

		// send to API (PUT). The backend should accept partial updates or merge likes server-side.
		try {
			const res = await fetch(`${API_BASE}/${race._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					// send only the changed field; adapt server to merge
					likes: updated.find((r) => r._id === race._id)?.likes,
				}),
			});
			if (!res.ok) {
				throw new Error("Failed to update like");
			}
			// optionally refresh from server to be safe
			// await fetchRaces();
		} catch (err) {
			console.error(err);
			// rollback on error
			setRaces(races);
			setError("Could not update like. Try again.");
		}
	}

	// Add comment
	async function addComment(raceId: string, text: string) {
		if (!session) {
			signIn();
			return;
		}
		if (!text.trim()) return;
		const comment = {
			userId: currentUserId,
			content: text.trim(),
			date: new Date().toISOString(),
		};
		// optimistic
		const updated = races.map((r) =>
			r._id === raceId
				? { ...r, comments: [...(r.comments || []), comment] }
				: r
		);
		setRaces(updated);

		try {
			const res = await fetch(`${API_BASE}/${raceId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					comments: updated.find((r) => r._id === raceId)?.comments,
				}),
			});
			if (!res.ok) throw new Error("Failed to post comment");
		} catch (err) {
			console.error(err);
			setRaces(races); // rollback
			setError("Could not add comment. Try again.");
		}
	}

	// Create new race
	async function createRace(e?: React.FormEvent) {
		e?.preventDefault();
		if (!session) {
			signIn();
			return;
		}

		// minimal validation
		if (!form.title || !form.length || !form.data) {
			setError("Please fill title, length and date.");
			return;
		}

		const payload: Partial<Race> = {
			...form,
			idowner: currentUserId, // adapt if you use real user id
			principalimage: form.principalimage || "",
			otherImage: form.otherImage || [],
			comments: [],
			likes: [],
		};

		try {
			const res = await fetch(API_BASE, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed to create race");
			const created: Race = await res.json();
			setRaces((prev) =>
				[created, ...prev].sort(
					(a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
				)
			);
			setShowCreateModal(false);
			setForm({});
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Error creating race");
		}
	}

	// Delete race (only owner)
	async function deleteRace(race: Race) {
		if (!session) {
			signIn();
			return;
		}
		const confirmDelete = confirm("Sei sicuro di voler eliminare questa gara?");
		if (!confirmDelete) return;

		const prev = [...races];
		setRaces((r) => r.filter((x) => x._id !== race._id));

		try {
			const res = await fetch(`${API_BASE}/${race._id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Delete failed");
		} catch (err) {
			console.error(err);
			setRaces(prev);
			setError("Could not delete race.");
		}
	}

	// Basic edit: opens modal with form prefilled
	function openEdit(r: Race) {
		setForm(r);
		setShowCreateModal(true);
	}

	// Save edit (PUT)
	async function saveEdit(e?: React.FormEvent) {
		e?.preventDefault();
		if (!form._id) return createRace();
		try {
			const res = await fetch(`${API_BASE}/${form._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) throw new Error("Update failed");
			const updated: Race = await res.json();
			setRaces((prev) =>
				prev.map((r) => (r._id === updated._id ? updated : r))
			);
			setShowCreateModal(false);
			setForm({});
		} catch (err) {
			console.error(err);
			setError("Could not update race.");
		}
	}

	// list of typologies (you can adapt to your enums)
	const typologies = Array.from(
		new Set(races.map((r) => r.typology).filter(Boolean))
	) as string[];

	return (
		<div className='max-w-6xl mx-auto p-6'>
			<header className='flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-semibold'>
					Trentino Alto Adige — Races Calendar
				</h1>
				<div className='flex items-center gap-3'>
					{session ? (
						<>
							<span className='text-sm'>
								Ciao, {session.user?.name || session.user?.email}
							</span>
							<button
								onClick={() => signOut()}
								className='px-3 py-1 rounded-md border hover:bg-gray-50'>
								Esci
							</button>
						</>
					) : (
						<button
							onClick={() => signIn("google")}
							className='px-3 py-1 rounded-md border hover:bg-gray-50 flex items-center gap-2'>
							<FiPlus /> Accedi
						</button>
					)}	
				</div>
			</header>

			<section className='mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div className='flex items-center gap-2 w-full sm:w-2/3'>
					<div className='relative w-full'>
						<FiSearch className='absolute left-3 top-3 text-gray-400' />
						<input
							className='pl-10 pr-4 py-2 border w-full rounded-md'
							placeholder='Search title or description...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<select
						value={typologyFilter}
						onChange={(e) => setTypologyFilter(e.target.value)}
						className='py-2 px-3 border rounded-md'>
						<option value='all'>All typologies</option>
						{typologies.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>

				<div className='flex items-center gap-3'>
					<button
						onClick={() => setShowCreateModal(true)}
						className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md'>
						<FiPlus /> Add race
					</button>

					<button
						onClick={fetchRaces}
						className='px-3 py-2 rounded-md border hover:bg-gray-50'>
						Refresh
					</button>
				</div>
			</section>

			{error && <div className='text-red-600 mb-4'>{error}</div>}

			<main>
				{loading ? (
					<div>Loading...</div>
				) : filteredRaces.length === 0 ? (
					<div>No races found.</div>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{filteredRaces.map((race) => (
							<article
								key={race._id}
								className='border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col'>
								<div className='h-48 bg-gray-100 overflow-hidden'>
									{race.principalimage ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={race.principalimage}
											alt={race.title}
											className='w-full h-full object-cover'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-gray-400'>
											No image
										</div>
									)}
								</div>

								<div className='p-4 flex-1 flex flex-col'>
									<div className='flex justify-between items-start'>
										<h2 className='text-lg font-semibold'>{race.title}</h2>
										<div className='text-sm text-gray-500'>
											{new Date(race.data).toLocaleDateString()}
										</div>
									</div>

									<p className='text-sm text-gray-700 my-2 line-clamp-3'>
										{race.description}
									</p>

									<div className='mt-auto flex items-center justify-between gap-3'>
										<div className='flex items-center gap-3'>
											<button
												onClick={() => toggleLike(race)}
												className='flex items-center gap-2'
												aria-label='like'>
												<FiHeart />
												<span className='text-sm'>
													{race.likes?.length || 0}
												</span>
											</button>

											<div className='text-sm px-2 py-1 bg-gray-100 rounded-md'>
												{race.length} km
											</div>

											{race.typology && (
												<div className='text-xs px-2 py-1 bg-gray-50 rounded-md border text-gray-600'>
													{race.typology}
												</div>
											)}
										</div>

										<div className='flex items-center gap-2'>
											{/* Owner actions */}
											{session && race.idowner === currentUserId && (
												<>
													<button
														onClick={() => openEdit(race)}
														className='px-2 py-1 rounded hover:bg-gray-100'>
														<FiEdit />
													</button>
													<button
														onClick={() => deleteRace(race)}
														className='px-2 py-1 rounded hover:bg-red-50 text-red-600'>
														<FiTrash2 />
													</button>
												</>
											)}
										</div>
									</div>

									{/* Comments */}
									<CommentsSection
										race={race}
										currentUserId={currentUserId}
										addComment={addComment}
									/>
								</div>
							</article>
						))}
					</div>
				)}
			</main>

			{/* Create / Edit Modal */}
			{showCreateModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
					<div className='bg-white rounded-lg max-w-2xl w-full p-6 relative'>
						<button
							onClick={() => {
								setShowCreateModal(false);
								setForm({});
							}}
							className='absolute top-3 right-3 p-1 rounded hover:bg-gray-100'>
							<FiX />
						</button>

						<h3 className='text-xl font-semibold mb-4'>
							{form._id ? "Edit Race" : "Create Race"}
						</h3>

						<form
							onSubmit={form._id ? saveEdit : createRace}
							className='space-y-3'>
							<div>
								<label className='text-sm block mb-1'>Title</label>
								<input
									className='w-full border px-3 py-2 rounded'
									value={form.title || ""}
									onChange={(e) =>
										setForm((f) => ({ ...f, title: e.target.value }))
									}
									required
								/>
							</div>

							<div>
								<label className='text-sm block mb-1'>Description</label>
								<textarea
									className='w-full border px-3 py-2 rounded'
									value={form.description || ""}
									onChange={(e) =>
										setForm((f) => ({ ...f, description: e.target.value }))
									}
								/>
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
								<div>
									<label className='text-sm block mb-1'>Length (km)</label>
									<input
										type='number'
										step='0.1'
										className='w-full border px-3 py-2 rounded'
										value={form.length ?? ""}
										onChange={(e) =>
											setForm((f) => ({ ...f, length: Number(e.target.value) }))
										}
										required
									/>
								</div>

								<div>
									<label className='text-sm block mb-1'>Date</label>
									<input
										type='date'
										className='w-full border px-3 py-2 rounded'
										value={
											form.data
												? new Date(form.data).toISOString().slice(0, 10)
												: ""
										}
										onChange={(e) => {
											const iso = new Date(e.target.value).toISOString();
											setForm((f) => ({ ...f, data: iso }));
										}}
										required
									/>
								</div>

								<div>
									<label className='text-sm block mb-1'>Typology</label>
									<input
										className='w-full border px-3 py-2 rounded'
										value={form.typology || ""}
										onChange={(e) =>
											setForm((f) => ({ ...f, typology: e.target.value }))
										}
									/>
								</div>
							</div>

							<div>
								<label className='text-sm block mb-1'>
									Principal image (URL)
								</label>
								<input
									className='w-full border px-3 py-2 rounded'
									value={form.principalimage || ""}
									onChange={(e) =>
										setForm((f) => ({ ...f, principalimage: e.target.value }))
									}
								/>
							</div>

							<div className='flex items-center gap-2 justify-end'>
								<button
									type='button'
									onClick={() => {
										setShowCreateModal(false);
										setForm({});
									}}
									className='px-3 py-2 rounded border'>
									Cancel
								</button>
								<button
									type='submit'
									className='px-4 py-2 bg-blue-600 text-white rounded'>
									{form._id ? "Save changes" : "Create race"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

/* ------------------------------
   Comments subcomponent
   ------------------------------ */
function CommentsSection({
	race,
	currentUserId,
	addComment,
}: {
	race: Race;
	currentUserId: string;
	addComment: (raceId: string, text: string) => void;
}) {
	const [text, setText] = useState("");
	return (
		<div className='mt-3'>
			<div className='text-sm font-medium mb-2'>
				Comments ({race.comments?.length || 0})
			</div>
			<div className='space-y-2 max-h-36 overflow-auto mb-2'>
				{race.comments?.length ? (
					race.comments.map((c, idx) => (
						<div key={idx} className='text-sm bg-gray-50 p-2 rounded'>
							<div className='text-xs text-gray-500'>
								{c.userId} • {new Date(c.date).toLocaleString()}
							</div>
							<div>{c.content}</div>
						</div>
					))
				) : (
					<div className='text-xs text-gray-400'>No comments yet.</div>
				)}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					addComment(race._id, text);
					setText("");
				}}
				className='flex gap-2'>
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder='Write a comment...'
					className='flex-1 border px-3 py-2 rounded'
				/>
				<button
					type='submit'
					className='px-3 py-2 bg-blue-600 text-white rounded'>
					Send
				</button>
			</form>
		</div>
	);
}
