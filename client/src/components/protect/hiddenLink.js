import {
  selectIsLoggedIn,
  selectUser,
} from "../../redux/features/auth/authSlice";

const { useSelector } = require("react-redux");

export const ShowOnLogin = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  if (isLoggedIn) {
    return <>{children}</>;
  }
  return null;
};

export const ShowOnLogout = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  if (!isLoggedIn) {
    return <>{children}</>;
  }
  return null;
};

export const AdminOnlyLink = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);

  if (isLoggedIn && user?.role === "admin") {
    return <>{children}</>;
  }
  return null;
};
