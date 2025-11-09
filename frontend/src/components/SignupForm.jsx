import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Stack,
  TextField,
  Typography,
  Link,
  Button,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import userApi from "../api/modules/user.api";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { setUser } from "../redux/features/userSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import themeConfigs, { themeModes } from "../configs/theme.config";
import uiConfigs from "../configs/ui.config";


// const swal = require('sweetalert2')

const SignupForm = ({ switchAuthState }) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [isLoginRequest, setIsLoginRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const signinForm = useFormik({
    initialValues: {
      email: "",
      password: "",
      // firstname: "",
      // lastname: "",
      username: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      // firstame: Yup.string().required("username is required"),
      // lastname: Yup.string().required("username is required"),
      email: Yup.string().required("username is required"),
      password: Yup.string()
        .min(8, "password minimum 8 characters")
        .required("password is required"),
      username: Yup.string().required("displayName is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "confirmPassword not match")
        .min(8, "confirmPassword minimum 8 characters")
        .required("confirmPassword is required"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      console.log("asdasdasdasd", values);
      const { response, err } = await userApi.signup(values);
      setIsLoginRequest(false);

      if (response) {
        signinForm.resetForm();
        dispatch(setUser(response));
        dispatch(setAuthModalOpen(false));
        toast.success("Sign in success");
      }

      if (err) setErrorMessage(err.message);
    },
    // onSubmit: async values => {
    // setErrorMessage(undefined);
    // setIsLoginRequest(true);
    // console.log("Submitting values:", values);

    // const { response, err } = await userApi.signup(values);

    // console.log("Response:", response);
    // console.log("Error:", err);
    // setIsLoginRequest(false);

    // if (!response) {
    // navigate("/auth")
    // toast.error("Registration Successful, Login Now");

    // } else {
    //     console.log(response.status);
    //     console.log("there was a server issue");
    //     toast.error("There was a server issue");

    // }
    // if (response) {
    //   signinForm.resetForm();
    //   dispatch(setUser(response));
    //   dispatch(setAuthModalOpen(false));
    //   toast.success("Sign in success");
    // }

    // if (err) setErrorMessage(err.message);
    // }
  });

  return (
    <Box component="form" onSubmit={signinForm.handleSubmit}>
      <Box sx={{ textAlign: "center", marginBottom: 3 }}>
        <Typography sx={{ textAlign: "center", fontWeight: 500 }} variant="h4">
          Sign Up
        </Typography>
        <Typography
          sx={{ textAlign: "center", color: "inherit" }}
          variant="body2"
        >
          Unlock Your Knowledge, Ignite Your Fun!
        </Typography>
      </Box>
      <Stack spacing={2} sx={{ mb: 3, width:350 }}>
        {/* <Button
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          sx={{
            color: "inherit",
            borderColor: "inherit",
            "&:hover": { borderColor: "inherit" },
          }}
        >
          Sign in with Google
        </Button>
        <Divider sx={{ fontSize: "body2" }}>
          <Typography variant="caption">or Sign in with Email</Typography>
        </Divider> */}
        {/* <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          <TextField
            type="text"
            placeholder="John"
            name="firstname"
            label="First Name"
            fullWidth
            value={signinForm.values.firstname}
            onChange={signinForm.handleChange}
            // color="success"
            error={
              signinForm.touched.firstname &&
              signinForm.errors.firstname !== undefined
            }
            helperText={
              signinForm.touched.firstname && signinForm.errors.firstname
            }
            required
          />
          <TextField
            type="text"
            placeholder="Smith"
            name="lastname"
            label="Last Name"
            fullWidth
            value={signinForm.values.lastname}
            onChange={signinForm.handleChange}
            error={
              signinForm.touched.lastname &&
              signinForm.errors.lastname !== undefined
            }
            helperText={
              signinForm.touched.lastname && signinForm.errors.lastname
            }
            required
          />
        </Box> */}
        <TextField
          type="text"
          placeholder="john_smith"
          name="username"
          label="Username"
          fullWidth
          required
          value={signinForm.values.username}
          onChange={signinForm.handleChange}
          error={
            signinForm.touched.username &&
            signinForm.errors.username !== undefined
          }
          helperText={signinForm.touched.username && signinForm.errors.username}
        />
        <TextField
          type="email"
          placeholder="mail@example.com"
          name="email"
          label="Email"
          fullWidth
          required
          value={signinForm.values.email}
          onChange={signinForm.handleChange}
          error={
            signinForm.touched.email && signinForm.errors.email !== undefined
          }
          helperText={signinForm.touched.email && signinForm.errors.email}
        />
        <TextField
          type="password"
          placeholder="Min. 8 Characters"
          name="password"
          label="Password"
          required
          fullWidth
          value={signinForm.values.password}
          onChange={signinForm.handleChange}
          error={
            signinForm.touched.password &&
            signinForm.errors.password !== undefined
          }
          helperText={signinForm.touched.password && signinForm.errors.password}
        />
        <TextField
          type="password"
          placeholder="Retype your Password"
          label="Confirm Password"
          name="confirmPassword"
          required
          fullWidth
          value={signinForm.values.confirmPassword}
          onChange={signinForm.handleChange}
          error={
            signinForm.touched.confirmPassword &&
            signinForm.errors.confirmPassword !== undefined
          }
          helperText={
            signinForm.touched.confirmPassword &&
            signinForm.errors.confirmPassword
          }
        />
      </Stack>

      <LoadingButton
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        loading={isLoginRequest}
        sx={{
          background:uiConfigs.style.mainGradient.color,
          mt: 1,
          borderRadius:100,
          color:'secondary.contrastText'
        }}
      >
        create an account
      </LoadingButton>
      <Typography sx={{ marginTop: 1 }} variant="body2">
        If you have an account?{" "}
        <Link
          sx={{ cursor: "pointer", color: "primary.main" }}
          onClick={() => switchAuthState()}
          underline="none"
        >
          Login Now
        </Link>
      </Typography>

      {errorMessage && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error" variant="outlined">
            {errorMessage}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SignupForm;
