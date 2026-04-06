//name (requis)
// • location (requis)
// • type (requis, valeurs premises "tente", "rv", "chalet", "glamping", "arrière-pays", "autre")
// • pricePerNight (requis, nombre positif supérieur à 0)
// • maxVehicleLength (nombre positif supérieur à 0, requis si type = rv)
// • capacity (requis, nombre positif supérieur à 0 et requis)
// • amenities (optionnel)
// • description (optionnel)
import Campsite from "../../models/campsite.mjs";
async function verifierCampsite(req, res, next) {
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
  if (req.user.role !== "admin") {
    const err = new Error(
      "Accès refusé : vous n'avez pas les permissions nécessaires pour créer un camping",
    );
    err.statusCode = 403;
    return next(err);
  }

  // Vérification des champs requis
  if (!name || !location || !type || !pricePerNight || !capacity) {
    if (capacity === 0 || pricePerNight === 0) {
      const err = new Error(
        "Les champs name, location, type, pricePerNight et capacity sont requis et doivent être supérieurs à 0",
      );
      err.statusCode = 422;
      return next(err);
    }
    const err = new Error(
      "Les champs name, location, type, pricePerNight et capacity sont requis",
    );
    err.statusCode = 400;
    return next(err);
  }
  if (type === "rv" && !maxVehicleLength) {
    if (maxVehicleLength === 0) {
      const err = new Error(
        "Le champ maxVehicleLength est requis pour les campings de type rv et doit être supérieur à 0",
      );
      err.statusCode = 422;
      return next(err);
    }
    const err = new Error(
      "Le champ maxVehicleLength est requis pour les campings de type rv",
    );
    err.statusCode = 400;
    return next(err);
  }
  // Vérification des champs non vides
  if (
    name.trim() === "" ||
    location.trim() === "" ||
    type.trim() === "" ||
    pricePerNight.toString().trim() === "" ||
    capacity.toString().trim() === ""
  ) {
    const err = new Error(
      "Les champs name, location, type, pricePerNight et capacity ne peuvent pas être vides",
    );
    err.statusCode = 422;
    return next(err);
  }
  //verification champs positifs
  if (
    pricePerNight <= 0 ||
    capacity <= 0 ||
    (maxVehicleLength && maxVehicleLength <= 0)
  ) {
    const err = new Error(
      "Les champs pricePerNight, capacity et maxVehicleLength doivent être des nombres positifs supérieurs à 0",
    );
    err.statusCode = 422;
    return next(err);
  }
  // Vérification du type
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
      "Le champ type doit être l'une des valeurs suivantes : tente, rv, chalet, glamping, arrière-pays, autre",
    );
    err.statusCode = 422;
    return next(err);
  }
  const validAmenities = [
    "électricité",
    "eau",
    "égout",
    "feu de camp",
    "table de pique-nique",
    "abri",
    "wifi",
    "douche",
    "toilettes",
  ];
  if (amenities) {
    for (let amenity of amenities) {
      if (!validAmenities.includes(amenity)) {
        const err = new Error(
          "Les équipements doivent être parmi les suivants : électricité, eau, égout, feu de camp, table de pique-nique, abri, wifi, douche, toilettes",
        );
        err.statusCode = 422;
        return next(err);
      }
    }
  }
  //verification duplication par nom et par location
  //Dabns le cas d'une mise à jour, on doit exclure le camping en cours de la vérification de duplication
  if (req.params.id) {
    if (
      await Campsite.findOne({ name, location, _id: { $ne: req.params.id } })
    ) {
      const err = new Error(
        "Un camping avec ce nom et cette location existe déjà, veuillez choisir un nom ou une location différentess",
      );
      err.statusCode = 409;
      return next(err);
    }
  } else {
    if (await Campsite.findOne({ name, location })) {
      const err = new Error(
        "Un camping avec ce nom et cette location existe déjà, veuillez choisir un nom ou une location différentes",
      );
      err.statusCode = 409;
      return next(err);
    }
  }

  next();
}
export default verifierCampsite;
