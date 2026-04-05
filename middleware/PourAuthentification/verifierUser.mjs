import bcrypt from "bcrypt";
import User from "../models/user.mjs";
export async function verifierUser(req, res, next) {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    const err = new Error(
      " les champs nom, prenom, email et mot de passe sont requis",
    );
    err.statusCode = 400;
    return next(err);
  }
  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    const err = new Error(
      "les champs nom, prenom, email et mot de passe ne peuvent pas être vides",
    );
    err.statusCode = 422;
    return next(err);
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    const err = new Error("L'email n'est pas valide");
    err.statusCode = 422;
    return next(err);
  }
  const userExists = await User.findOne({ email });
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
    const err = new Error(
      "Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    );
    err.statusCode = 422;
    return next(err);
  }
  if (userExists) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 409;
    return next(err);
  }
  req.body.password = await bcrypt.hash(password, 12);
  next();
}
