function verifierUserUpdate(req, res, next) {
  const { firstName, lastName, role, phone } = req.body;
  if (!firstName || !lastName || !role || !phone) {
    const err = new Error(
      "les champs nom, prénom, rôle et téléphone sont requis",
    );
    err.statusCode = 400;
    return next(err);
  }
  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    role.trim() === "" ||
    phone.trim() === ""
  ) {
    const err = new Error(
      "les champs nom, prénom, rôle et téléphone ne peuvent pas être vides",
    );
    err.statusCode = 422;
    return next(err);
  }
  next();
}
export default verifierUserUpdate;
