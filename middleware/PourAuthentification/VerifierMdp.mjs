/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
function verifyPassword(req, res, next) {
  const { newPassword } = req.body;
  if (!newPassword) {
    const err = new Error("Le nouveau mot de passe est requis");
    err.statusCode = 400;
    return next(err);
  }
  if (newPassword.trim() === "") {
    const err = new Error("Le nouveau mot de passe ne peut pas être vide");
    err.statusCode = 422;
    return next(err);
  }
  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(newPassword)
  ) {
    const err = new Error(
      "Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    );
    err.statusCode = 422;
    return next(err);
  }
  next();
}
export default verifyPassword;
