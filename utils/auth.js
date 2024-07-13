import Cookies from "js-cookie";

export const isAuthenticated = () => {
  const token = Cookies.get("token");
  return !!token;
};

export const isAuthenticatedServerSide = (context) => {
  const { req } = context;
  const token = req.cookies.token;
  return !!token;
};
