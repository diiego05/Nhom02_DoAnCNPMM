import { type PropsWithChildren } from "react";
import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export type AuthGuardProps = PropsWithChildren & {};
const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <div>{children}</div>;
};
export default AuthGuard;
