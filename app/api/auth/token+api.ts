import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
} from "@/constants";
import * as jose from "jose";

export async function POST(request: Request) {
  const body = await request.json();
  const code = body.code as string;
  const platform = (body.platform as string) || "native"; // Default to native if not specified

  if (!code) {
    return Response.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    }),
  });

  const data = await response.json();

  if (!data.id_token) {
    return Response.json(
      { error: "Id token wasn't recieved" },
      { status: 400 }
    );
  }

  // We have the id_token, now we need to get the access token and refresh token
  const userInfo = jose.decodeJwt(data.id_token) as object;

  const { exp, ...userInfoWithoutExp } = userInfo as any;

  // User id
  const sub = (userInfo as { sub: string }).sub;

  // Current tumestamp in seconds
  const issuedAt = Math.floor(Date.now() / 1000);

  // Create access token (short-lived)
  const accessToken = await new jose.SignJWT(userInfoWithoutExp)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  if (platform === "web") {
    return Response.json({
      access_token: accessToken,
    });

    // return Response.json({ access_token: accessToken, refresh_token: refreshToken, });
  }
}
