import UserService from "../../../lib/class/UserService";
import { UserServiceProps } from "../../../lib/interfaces/IUserService";

export async function POST(request: Request) {
	const userData: UserServiceProps = await request.json();
	const userService = new UserService(userData);
	const result = await userService.saveUser();
	return new Response(JSON.stringify(result), { status: 201 });
}
