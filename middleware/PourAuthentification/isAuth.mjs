import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import e from "express";
dotenv.config();

/** Vérifie si la requête a un token JWT valide */
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
const isAuth = (req, res, next) => {
  // Récupère le jeton depuis l'en-tête Authorization de la requête
  const authHeader = req.get("Authorization");

  // Vérifie si l'en-tête Authorization est présent
  if (!authHeader) {
    const err = new Error("Token d'authentification manquant");
    err.statusCode = 401;
    return next(err);
  }

  // Récupère le jeton JWT
  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    // Vérifie le jeton et récupére les données associées
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Ajoute les données associées à l'objet de requête pour utilisation ultérieure
    req.user = decodedToken;
    console.log("req.user", req.user);
    next();
  } catch (err) {
    err.statusCode = 401;
    return next(err);
  }
};

export default isAuth;
