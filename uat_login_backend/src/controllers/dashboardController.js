export const getDashboard = (req, res) => {
  res.json({ message: `Bienvenido al dashboard, ${req.user.username}` });
};
