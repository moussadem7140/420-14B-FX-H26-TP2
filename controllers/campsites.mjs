import Campsite from "../models/campsite.mjs";
import Reservation from "../models/reservation.mjs";
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {Promise<void>}
 */
export async function createCampsite(req, res, next) {
  try {
    const {
      name,
      location,
      type,
      pricePerNight,
      maxVehicleLength,
      capacity,
      amenities,
      description,
    } = req.body;
    const data = new Campsite({
      name,
      location,
      type,
      pricePerNight,
      maxVehicleLength,
      capacity,
      amenities,
      description,
    });
    await data.save();
    res.location(`/api/campsites/${data._id}`);
    res.status(201).json({
      data,
      message: "Camping créé avec succès",
      status: 201,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function getAllCampsites(req, res, next) {
  try {
    let campsites = await Campsite.find();
    const { type } = req.query;
    if (type) {
      const validTypes = [
        "tente",
        "rv",
        "chalet",
        "glamping",
        "arrière-pays",
        "autre",
      ];

      if (!validTypes.includes(type)) {
        const err = new Error(
          "Le paramètre type doit être l'un des suivants : tente, rv, chalet, glamping, arrière-pays, autre",
        );
        err.statusCode = 422;
        return next(err);
      }

      campsites = campsites.filter((campsite) => campsite.type === type);
    }

    res.status(200).json({
      data: campsites,
      message: "Campings récupérés avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function getCampsiteById(req, res, next) {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error("ID de camping invalide");
      err.statusCode = 400;
      return next(err);
    }
    const campsite = await Campsite.findById(req.params.id);
    if (!campsite) {
      const err = new Error("Camping non trouvé");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      data: campsite,
      message: "Camping récupéré avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function getAvailableCampsites(req, res, next) {
  try {
    const { startDate, endDate, type, vehicleLength, guests } = req.query;

    // 1) Vérifier que les dates sont présentes
    if (!startDate || !endDate) {
      const err = new Error("Les paramètres startDate et endDate sont requis");
      err.statusCode = 400;
      return next(err);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2) Vérifier que les dates sont valides
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const err = new Error(
        "Les paramètres startDate et endDate doivent être des dates valides",
      );
      err.statusCode = 422;
      return next(err);
    }

    if (start >= end) {
      const err = new Error(
        "La date de début doit être strictement avant la date de fin",
      );
      err.statusCode = 422;
      return next(err);
    }

    // 3) Réservations qui chevauchent la plage
    const reservations = await Reservation.find({
      endDate: { $gt: start },
      startDate: { $lt: end },
    });

    // 4) Liste des campsites indisponibles
    const unavailableCampsiteIds = new Set(
      reservations.map((reservation) => reservation.campsite.toString()),
    );

    // 5) Tous les campsites sauf les indisponibles
    let campsites = await Campsite.find();

    campsites = campsites.filter(
      (campsite) => !unavailableCampsiteIds.has(campsite._id.toString()),
    );

    // 6) Filtre type si fourni
    if (type !== undefined) {
      const validTypes = [
        "tente",
        "rv",
        "chalet",
        "glamping",
        "arrière-pays",
        "autre",
      ];

      if (!validTypes.includes(type)) {
        const err = new Error(
          "Le paramètre type doit être l'un des suivants : tente, rv, chalet, glamping, arrière-pays, autre",
        );
        err.statusCode = 422;
        return next(err);
      }

      campsites = campsites.filter((campsite) => campsite.type === type);
    }

    // 7) Filtre vehicleLength si fourni
    if (vehicleLength !== undefined) {
      const vehicleLengthNumber = Number(vehicleLength);

      if (isNaN(vehicleLengthNumber) || vehicleLengthNumber <= 0) {
        const err = new Error(
          "Le paramètre vehicleLength doit être un nombre strictement positif",
        );
        err.statusCode = 422;
        return next(err);
      }

      campsites = campsites.filter((campsite) => {
        // si le campsite n'a pas de maxVehicleLength, on le laisse passer
        if (
          campsite.maxVehicleLength === undefined ||
          campsite.maxVehicleLength === null
        ) {
          return true;
        }

        return campsite.maxVehicleLength >= vehicleLengthNumber;
      });
    }

    // 8) Filtre guests si fourni
    if (guests !== undefined) {
      const guestsNumber = Number(guests);

      if (isNaN(guestsNumber) || guestsNumber <= 0) {
        const err = new Error(
          "Le paramètre guests doit être un nombre strictement positif",
        );
        err.statusCode = 422;
        return next(err);
      }

      campsites = campsites.filter(
        (campsite) => campsite.capacity >= guestsNumber,
      );
    }

    // 9) Réponse finale
    res.status(200).json({
      data: campsites,
      message: "Campsites disponibles récupérés avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
export async function updateCampsite(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      type,
      pricePerNight,
      maxVehicleLength,
      capacity,
      amenities,
      description,
    } = req.body;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error("ID de camping invalide");
      err.statusCode = 400;
      return next(err);
    }
    const campsite = await Campsite.findByIdAndUpdate(
      id,
      {
        name,
        location,
        type,
        pricePerNight,
        maxVehicleLength,
        capacity,
        amenities,
        description,
      },
      { new: true },
    );
    if (!campsite) {
      const err = new Error("Camping non trouvé");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      data: campsite,
      message: "Camping mis à jour avec succès",
      status: 200,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}
/** *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Promise<void>}
 */
export async function deleteCampsite(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      const err = new Error(
        "Accès refusé : vous n'avez pas les permissions nécessaires pour supprimer un camping",
      );
      err.statusCode = 403;
      return next(err);
    }
    const campsite = await Campsite.findByIdAndDelete(id);
    // if (!campsite) {
    //   const err = new Error("Camping non trouvé");
    //   err.statusCode = 404;
    //   return next(err);
    // }
    res.status(204);
    res.send();
  } catch (err) {
    next(err);
  }
}
