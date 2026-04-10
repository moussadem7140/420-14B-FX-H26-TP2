import User from "../models/user.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {Promise<void>}
 */
export async function CreateUser(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const userbd = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });
    await userbd.save();
    let user = userbd.toObject();
    delete user.password;
    delete user.__v;
    res.location(`/api/auth/profile`);
    res.status(201).json({
      data: { user },
      message: "Utilisateur créé avec succès",
      status: 201,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @return {Promise<void>}
 */
export async function ConnectUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const userbd = await User.findOne({ email }).select("+password");
    if (!userbd || !(await bcrypt.compare(password, userbd.password))) {
      const err = new Error("Email ou mot de passe incorrect");
      err.statusCode = 401;
      throw err;
    }
    const user = userbd.toObject();
    delete user.password;
    delete user.__v;

    // Création d'un jeton JWT
    const token = jwt.sign(
      {
        firstName: userbd.firstName,
        lastName: userbd.lastName,
        email: userbd.email,
        role: userbd.role,
        phone: userbd.phone ?? "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      data: { user, token },
      message: "Utilisateur connecté avec succès",
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @return {Promise<void>}
 */
export async function getProfile(req, res, next) {
  try {
    const userbd = await User.findOne({ email: req.user.email });
    const data = userbd.toObject();
    delete data.password;
    delete data.__v;

    res.status(200).json({
      data,
      message: "Profil utilisateur récupéré avec succès",
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
/** *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @return {Promise<void>}
 *  */

export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, role, phone } = req.body;
    const userbd = await User.findOneAndUpdate(
      { email: req.user.email },
      { firstName, lastName, role, phone },
      { new: true },
    );
    const data = userbd.toObject();
    delete data.password;
    delete data.__v;

    res.status(200).json({
      data,
      message: "Profil utilisateur mis à jour avec succès",
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @return {Promise<void>}
 */
export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userbd = await User.findOne({ email: req.user.email }).select(
      "+password",
    );
    console.log(req.user.email);
    if (!(await bcrypt.compare(currentPassword, userbd.password))) {
      const err = new Error("Mot de passe actuel incorrect");
      err.statusCode = 401;
      throw err;
    }
    let passwordHash = await bcrypt.hash(newPassword, 12);
    await userbd.updateOne({ password: passwordHash });
    let data = userbd.toObject();
    delete data.password;
    delete data.__v;
    res.status(200).json({
      data,
      message: "Mot de passe mis à jour avec succès",
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
