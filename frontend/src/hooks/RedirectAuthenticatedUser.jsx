import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

export default RedirectAuthenticatedUser;