import { getAuthUser } from "../../lib/auth";
import { UserModel } from "../../lib/db";

export const me = async (req: Request) => {
  try {
    const authData = await getAuthUser(req);

    const user = await UserModel.findById(authData.userId);

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "user not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          _id: user._id,
          name: user.username,
          email: user.email,
          role: user.role,
        },
      })
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { status: 401 }
    );
  }
};
