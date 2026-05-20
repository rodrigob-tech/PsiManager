import jwt from "jsonwebtoken";

export function generateUserToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      type: "user"
    },
    process.env.USER_JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}