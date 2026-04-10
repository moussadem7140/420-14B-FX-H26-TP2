/**
 * Middleware pour vérifier si un camping est actuellement réservé avant de permettre sa modification ou suppression
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
import Reservation from "../../models/reservation.mjs";
async function IsNotReserved(req, res, next) {
  const { id } = req.params;
  if (!id) {
    const err = new Error("ID de camping manquant");
    err.statusCode = 400;
    return next(err);
  }
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error("ID de camping invalide");
    err.statusCode = 422;
    return next(err);
  }
  const reservation = await Reservation.findOne({ campsite: id });
  if (reservation) {
    const err = new Error(
      "Ce camping est actuellement réservé et ne peut pas être modifié ou supprimé",
    );
    err.statusCode = 409;
    return next(err);
  }
  next();
}
export default IsNotReserved;
