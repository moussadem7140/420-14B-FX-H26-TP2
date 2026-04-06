// • campsite (id, requis)
// • user (id, requis)
// • startDate (requis)
// • endDate (requis)
// • guests (nombre de personne sur le site, nombre positif supérieur à 0)
// • totalPrice (requis, nombre positif)
// • status (valeur permises : pending, confirmed, cancelled)
import Reservation from "../../models/reservation.mjs";
import Campsite from "../../models/campsite.mjs";
import User from "../../models/user.mjs";
async function verifierReservation(req, res, next) {
  const { campsite, startDate, endDate, guests } = req.body;
  // Vérification des champs requis
  if (!campsite || !startDate || !endDate || (!guests && guests !== 0)) {
    const err = new Error(
      "Les champs campsite, startDate, endDate, guests et totalPrice sont requis",
    );
    err.statusCode = 400;
    return next(err);
  }
  // Vérification des champs non vides
  if (
    campsite.trim() === "" ||
    startDate.toString().trim() === "" ||
    endDate.toString().trim() === "" ||
    guests.toString().trim() === ""
  ) {
    const err = new Error(
      "Les champs campsite, startDate, endDate, guests et totalPrice ne peuvent pas être vides",
    );
    err.statusCode = 422;
    return next(err);
  }
  // Vérification que guests est un nombre positif supérieur à 0
  if (guests <= 0) {
    const err = new Error(
      "Le champ guests doit être un nombre positif supérieur à 0",
    );
    err.statusCode = 422;
    return next(err);
  }
  // Vérification que startDate et endDate sont des dates valides
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const err = new Error(
      "Les champs startDate et endDate doivent être des dates valides",
    );
    err.statusCode = 422;
    return next(err);
  }
  // Vérification que startDate est antérieure à endDate
  if (start >= end) {
    const err = new Error(
      "Le champ startDate doit être antérieur au champ endDate",
    );
    err.statusCode = 422;
    return next(err);
  }
  //Campsite existe-t-il?
  const campsiteDoc = await Campsite.findById(campsite);
  if (!campsiteDoc) {
    const err = new Error("Le campsite spécifié n'existe pas");
    err.statusCode = 404;
    return next(err);
  }
  if (campsiteDoc.capacity < guests) {
    const err = new Error("Le nombre de voyageurs dépasse la capacité du site");
    err.statusCode = 400;
    return next(err);
  }
  //verifier que le site n'est pas déjà réservé pour les dates spécifiées et pour le cas de la modification de réservation,
  //  exclure la réservation en cours de la vérification de disponibilité
  if (!req.params.id) {
    const existingReservations = await Reservation.findOne({
      campsite: campsiteDoc._id,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      // _id: { $ne: req.params.id }, // Exclure la réservation en cours de la vérification
    });
    if (existingReservations) {
      const err = new Error(
        "Le site est déjà réservé pour les dates spécifiées",
      );
      err.statusCode = 400;
      return next(err);
    }
  }
  //verifier doublon de reservation pour le même user et le même campsite et les mêmes dates(pour  l'ajout de reservation et pour la modification de reservation)
  const userDoc = await User.findOne({ email: req.user.email });
  if (req.params.id) {
    const reservationId = req.params.id;
    const reservationDoc = await Reservation.findOne({
      user: userDoc._id,
      campsite: campsiteDoc._id,
      startDate: endDate,
      endDate: startDate,
      _id: { $ne: reservationId },
    });
    if (reservationDoc) {
      const err = new Error(
        "Vous avez déjà une réservation pour ce site et ces dates",
      );
      err.statusCode = 400;
      return next(err);
    }
  } else {
    const duplicateReservation = await Reservation.findOne({
      user: userDoc._id,
      campsite: campsiteDoc._id,
      startDate: endDate,
      endDate: startDate,
    });
    if (duplicateReservation) {
      const err = new Error(
        "Vous avez déjà une réservation pour ce site et ces dates",
      );
      err.statusCode = 400;
      return next(err);
    }
  }
  next();
}
export default verifierReservation;
