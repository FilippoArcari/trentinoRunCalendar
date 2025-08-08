import UserService from "../../../../lib/class/UserService";
import { UserServiceProps } from "../../../../lib/interfaces/IUserService";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const userId = params.id;
	const userService = new UserService(userId);
	await userService.getUserById(userId);
	return new Response(JSON.stringify(userService), { status: 200 });
}
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const userId = params.id;
	const userService = new UserService(userId);
	await userService.getUserById(userId);
	const userData: UserServiceProps = await request.json();
	await userService.updateUser(userData);
	return new Response(JSON.stringify(userService), { status: 200 });
}
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const userId = params.id;

	const userService = new UserService(userId);
	await userService.getUserById(userId);
	await userService.deleteUser();
	return new Response(
		JSON.stringify({ message: "User deleted successfully" }),
		{ status: 200 }
	);
}
