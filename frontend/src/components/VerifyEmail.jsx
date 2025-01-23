import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timer to navigate to /login after 5 seconds (5000ms)
    const timer = setTimeout(() => {
      navigate.push("/login"); // Navigate to /login route
    }, 5000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>Please check your email for a verification link.</p>
    </div>
  );
};

export default VerifyEmail;
