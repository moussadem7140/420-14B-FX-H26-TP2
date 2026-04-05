import User from "../models/user.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

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
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
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
