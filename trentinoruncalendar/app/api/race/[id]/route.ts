import RaceService from "../../../../lib/class/RaceService";
import { RaceServiceProps } from "../../../../lib/interfaces/IRaceService";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	if (!params.id) {
		return new Response(JSON.stringify(await RaceService.getAllRaces()), {
			status: 200,
		});
	}
	const raceService = new RaceService(params.id);
	const race = await raceService.getRaceById(params.id);
	return new Response(JSON.stringify(race), { status: 200 });
}
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	//TODO: Implement authentication and authorization checks
	if (!params.id) {
		return new Response(JSON.stringify({ error: "Id is required" }), {
			status: 400,
		});
	}
	const raceService = new RaceService(params.id);
	const deleted = await raceService.deleteRace();
	if (deleted) {
		return new Response(
			JSON.stringify({ message: "Gara eliminata con Successo" }),
			{
				status: 200,
			}
		);
	}
	return new Response(
		JSON.stringify({ error: "Errore nell'eliminazione della gara" }),
		{
			status: 500,
		}
	);
}
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const raceData: RaceServiceProps = await request.json();
	const raceDataWithId: RaceServiceProps = {
		id: params.id, // Use the id from the URL parameters
		...raceData,
	};
	// Ensure 'id' is present; it will be used to update
	const raceService = new RaceService(params.id);
	const updatedRace = await raceService.updateRace(raceDataWithId);
	if (updatedRace) {
		return new Response(JSON.stringify(updatedRace), { status: 200 });
	}
	return new Response(
		JSON.stringify({ error: "Errore nell'aggiornamento della gara" }),
		{
			status: 500,
		}
	);
}
