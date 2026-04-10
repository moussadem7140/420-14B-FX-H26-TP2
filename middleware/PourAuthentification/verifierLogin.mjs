/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function verifierLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error("les champs email et mot de passe sont requis");
    err.statusCode = 400;
    return next(err);
  }
  if (email.trim() === "" || password.trim() === "") {
    const err = new Error(
      "les champs email et mot de passe ne peuvent pas être vides",
    );
    err.statusCode = 422;
    return next(err);
  }
  //   if (!/^\S+@\S+\.\S+$/.test(email)) {
  //     const err = new Error("L'email n'est pas valide");
  //     err.statusCode = 422;
  //     return next(err);
  //   }
  //   if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
  //     const err = new Error(
  //       "Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
  //     );
  //     err.statusCode = 422;
  //     return next(err);
  //   }
  //   const userExists = await User.findOne({ email });
  //   if (!userExists) {
  //     const err = new Error("Cet email n'existe pas");
  //     err.statusCode = 404;
  //     return next(err);
  //   }
  next();
}
