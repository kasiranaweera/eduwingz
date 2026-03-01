import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { Navigate } from "react-router-dom";

const ProtectedPage = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      dispatch(setAuthModalOpen(true));
    }
  }, [user, dispatch]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedPage;