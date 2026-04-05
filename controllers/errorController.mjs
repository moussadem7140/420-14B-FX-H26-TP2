export const get404 = (req, res) => {
  console.log("404");
  res.status(404).json({ message: "ressource non trouvée", statusCode: 404 });
};

export const getErrors = (err, req, res, next) => {
  console.log("err", err);

  // Si l'erreur est de type CastError, c'est qu'on a tenté de convertir un id invalide
  if (err.kind === "ObjectId" && err.name === "CastError") {
    err.statusCode = 404;
    err.message = `L'id n'existe pas: ${err.message}`;
  }

  // Si l'erreur est de type ValidationError, c'est qu'on a tenté de créer une ressource invalide
  if (err.name === "ValidationError") {
    err.message = `Erreur de validation: ${err.message}`;
    err.statusCode = 400;
  }

  if (!err.statusCode) err.statusCode = 500;

  res.status(err.statusCode).json({
    status: err.statusCode,
    error: err.name,
    message: err.message,
    path: req.url,
    timestamp: "2024-03-04T12:50:30.987Z",
  });
};
