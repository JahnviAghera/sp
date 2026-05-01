const authService = require('../services/auth.service');
const logger = require('../config/logger');

const register = async (req, res, next) => {
  try {
    const userData = await authService.registerUser(req.body);
    res.status(201).json({
      status: 'success',
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await authService.loginUser(email, password);
    res.status(200).json({
      status: 'success',
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
