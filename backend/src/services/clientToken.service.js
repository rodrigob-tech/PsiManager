import jwt from "jsonwebtoken";

export function generateClientToken(client) {
  return jwt.sign(
    {
      clientId: client.id,
      email: client.email,
      type: "client"
    },
    process.env.CLIENT_JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}