import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, saveUser } from '../services/authSerivce.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // store hashed password instead of plaintext
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save will throw an error if email or username already exists
    const userId = await saveUser(username, email, hashedPassword);

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) throw new ApiError(401, 'Invalid email or password');

    // provide user with token for protected routes (wallet routes)
    const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h'
    });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    next(err);
  }
};
