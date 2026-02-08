import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login since OTP system handles both login and registration
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Register;
