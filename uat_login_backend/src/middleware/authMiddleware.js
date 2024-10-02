import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "../services/authService.js";

export const verifyUserToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const [accessToken, refreshToken] = authHeader.split(" ")[1].split("|");

  if (!accessToken) {
    console.log("No access token found");
    return res.sendStatus(401);
  }

  try {
    console.debug("MIDDLEWARE, Verificando token de acceso...");
    const decoded = await verifyAccessToken(accessToken);
    console.log("Decoded user from access token:", decoded);
    req.user = decoded;

    next();
  } catch (err) {
    console.log("MIDDLEWARE, Error al validar el token de acceso");
    // Verificar si el token de acceso ha expirado y si hay un token de refresco disponible

    //! Extrae el token de refresco de las cookies. EN DESARROLLO
    const refreshTokenFromCookies = req.cookies.refreshToken;
    if (!refreshTokenFromCookies) {
      console.log("MIDDLEWARE, No refresh token provided From cookies");
      // return res.sendStatus(403);
    } else {
      console.log("MIDDLEWARE, Refresh token provided From cookies");
    }

    if (err.name === "TokenExpiredError" && refreshToken) {
      console.log("MIDDLEWARE, Token de acceso ¡EXPIRADO!, verificando token de refresco...");
      try {
        const decodedRefresh = await verifyRefreshToken(refreshToken);
        console.debug("MIDDLEWARE, Token de refresco verificado");
        console.log("MIDDLEWARE, Decoded user from refresh token:", decodedRefresh);
        const newToken = generateAccessToken({
          username: decodedRefresh.username,
          email: decodedRefresh.email,
          picture: decodedRefresh.picture,
          matricula: decodedRefresh.matricula,
        });

        res.setHeader("Authorization", `Bearer ${newToken}`);
        req.user = decodedRefresh;
        next();
      } catch (refreshError) {
        console.log("MIDDLEWARE, Error al validar el token de refresco: ", refreshError);
        return res.sendStatus(403);
      }
    } else {
      console.log("MIDDLEWARE, Token de refresco no disponible");
      return res.sendStatus(403);
    }
  }
};
