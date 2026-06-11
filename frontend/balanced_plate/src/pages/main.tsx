import { Navigate } from "react-router-dom";

// Catch-all page — redirects to landing
export default function Main() {
  return <Navigate to="/" replace />;
}