import Reservation from "../models/reservation.mjs";
import Campsite from "../models/campsite.mjs";
import User from "../models/user.mjs";
/** *
 * Créer une nouvelle réservation
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function createReservation(req, res, next) {
  try {
    const { campsite, startDate, endDate, guests } = req.body;
    const status = "pending";
    const totalPrice = await calculerPrixTotal(campsite, startDate, endDate);
    const userDoc = await User.findOne({ email: req.user.email });
    const reservation = new Reservation({
      campsite,
      user: userDoc._id,
      startDate,
      endDate,
      guests,
      totalPrice,
      status,
    });
    await reservation.save();
    res.location(`/api/reservations/${reservation._id}`);

    res.status(201).json({
      // Il faut Récupèrer la réservation créée pour l'inclure dans la réponse parce que il y'a des champs qui sont calculés automatiquement (ex: totalPrice)
      // et qui ne sont pas dans la requête.
      data: reservation,
      message: "Réservation créée avec succès",
      status: 201,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/**
 * Recupérer les réservations de l'utilisateur connecté
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function getReservations(req, res, next) {
  try {
    let userDoc = await User.findOne({ email: req.user.email });
    let reservations = await Reservation.find({ user: userDoc._id });
    if (req.query.status) {
      let status = req.query.status;
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        const err = new Error(
          "Le champ status doit être une des valeurs suivantes : pending, confirmed, cancelled",
        );
        err.statusCode = 422;
        return next(err);
      }
      reservations = reservations.filter(
        (reservation) => reservation.status === status,
      );
    }
    res.status(200).json({
      data: reservations,
      message: "Réservations récupérées avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/** *
 * Recupérer une réservation par son ID
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function getReservationById(req, res, next) {
  try {
    if (!req.params.id) {
      const err = new Error("Le champ id est requis");
      err.statusCode = 400;
      return next(err);
    }
    // Vérification que l'id est un ObjectId valide
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      const err = new Error("Le champ id doit être un ObjectId valide");
      err.statusCode = 400;
      return next(err);
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      const err = new Error("Réservation non trouvée");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      data: reservation,
      message: "Réservation récupérée avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/** *
 * mettre à jour une réservation
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function updateReservation(req, res, next) {
  if (!req.params.id) {
    const err = new Error("Le champ id est requis");
    err.statusCode = 400;
    return next(err);
  }
  // Vérification que l'id est un ObjectId valide
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    const err = new Error("Le champ id doit être un ObjectId valide");
    err.statusCode = 422;
    return next(err);
  }
  // verifier que le user est propriétaire de la réservation  ou admin
  const userDoc = await User.findOne({ email: req.user.email });
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    const err = new Error("Réservation non trouvée");
    err.statusCode = 404;
    return next(err);
  }
  if (req.user.role !== "admin") {
    if (reservation.user.toString() !== userDoc._id.toString()) {
      const err = new Error(
        "Vous n'êtes pas autorisé à modifier cette réservation",
      );
      err.statusCode = 403;
      return next(err);
    } else {
      if (reservation.status !== "pending") {
        const err = new Error(
          "Vous ne pouvez pas modifier une réservation qui n'est pas en attente",
        );
        err.statusCode = 400;
        return next(err);
      }
    }
  }
  const { campsite, startDate, endDate, guests } = req.body;
  const totalPrice = await calculerPrixTotal(campsite, startDate, endDate);
  const reservationUpdate = await Reservation.findByIdAndUpdate(
    req.params.id,
    { campsite, startDate, endDate, guests, totalPrice },
    { new: true },
  );
  res.status(200).json({
    data: reservationUpdate,
    message: "Réservation mise à jour avec succès",
    status: 200,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
//il faut isoler la fonction de calcul du prix total dans un service pour éviter la
// duplication de code entre la création et la modification de réservation
/**
 *
 * @param {string} campsiteId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<number>}
 */
async function calculerPrixTotal(campsiteId, startDate, endDate) {
  const campsiteDoc = await Campsite.findById(campsiteId);
  const days = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
  );
  return campsiteDoc.pricePerNight * days;
}
/**
 * mettre à jour le status d'une réservation
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {Promise<void>}
 */
export async function updateReservationStatus(req, res, next) {
  if (!req.params.id) {
    const err = new Error("Le champ id est requis");
    err.statusCode = 400;
    return next(err);
  }
  // Vérification que l'id est un ObjectId valide
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    const err = new Error("Le champ id doit être un ObjectId valide");
    err.statusCode = 422;
    return next(err);
  }
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    const err = new Error("Réservation non trouvée");
    err.statusCode = 404;
    return next(err);
  }
  const status = req.body.status;
  if (!status) {
    const err = new Error("Le champ status est requis");
    err.statusCode = 400;
    return next(err);
  }
  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    const err = new Error(
      "Le champ status doit être une des valeurs suivantes : pending, confirmed, cancelled",
    );
    err.statusCode = 422;
    return next(err);
  }
  if (reservation.status === "cancelled") {
    const err = new Error(
      "Vous ne pouvez pas modifier une réservation annulée",
    );
    err.statusCode = 400;
    return next(err);
  }
  if (reservation.status === "confirmed" && status === "pending") {
    const err = new Error(
      "Vous ne povez pas mettre en attnte une réservation confirmée",
    );
    err.statusCode = 400;
    return next(err);
  }

  if (reservation.startDate <= new Date()) {
    const err = new Error(
      "Vous ne pouvez pas modifier le status d'une réservation qui a déjà commencé",
    );
    err.statusCode = 400;
    return next(err);
  }
  if (req.user.role !== "admin") {
    const userDoc = await User.findOne({ email: req.user.email });
    if (reservation.user.toString() !== userDoc._id.toString()) {
      const err = new Error(
        "Vous n'êtes pas autorisé à modifier le status de cette réservation",
      );
      err.statusCode = 403;
      return next(err);
    }
  }
  reservation.status = status;
  await reservation.save();
  res.status(200).json({
    data: reservation,
    message: "Status de la réservation mis à jour avec succès",
    status: 200,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
