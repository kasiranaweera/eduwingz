import { LoadingButton } from "@mui/lab";
import { Alert, Box, Stack, TextField, Typography, FormControlLabel, Checkbox, Link} from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import userApi from "../api/modules/user.api";
import { setUser } from "../redux/features/userSlice";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import uiConfig from "../configs/ui.config";

// const swal = require('sweetalert2')

const SigninForm = ({ switchAuthState }) => {
  const dispatch = useDispatch();

  // const [authTokens, setAuthTokens] = useState(() =>
  //   localStorage.getItem("authTokens")
  //     ? JSON.parse(localStorage.getItem("authTokens"))
  //     : null
  // );

  // const [users, setUsers] = useState(() =>
  //   localStorage.getItem("authTokens")
  //     ? jwtDecode(localStorage.getItem("authTokens"))
  //     : null
  // );

  const [isLoginRequest, setIsLoginRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const signinForm = useFormik({
    initialValues: {
      password: "",
      email: ""
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .min(8, "username minimum 8 characters")
        .required("username is required"),
      password: Yup.string()
        .min(8, "password minimum 8 characters")
        .required("password is required")
    }),
    onSubmit: async values => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      const { response, err } = await userApi.signin(values);
      setIsLoginRequest(false);

      console.log("📋 [SigninForm] Response:", response);
      console.log("📋 [SigninForm] Error:", err);

      if (response) {
        console.log("✅ [SigninForm] Login successful, response keys:", Object.keys(response));
        signinForm.resetForm();
        
        // Check if response has access token
        if (!response.access) {
          console.error("❌ [SigninForm] No access token in response");
          toast.error("Invalid login response - missing access token");
          return;
        }
        
        const decodedToken = jwtDecode(response.access);
        const userObject = {
          username: decodedToken.username,
          email: decodedToken.email,
          id: decodedToken.user_id,
          token: response.access
        };
        console.log("👤 [SigninForm] User object created:", userObject)
        dispatch(setUser(userObject));
        dispatch(setAuthModalOpen(false));
        toast.success("Sign in success");
      } else {
        console.warn("⚠️ [SigninForm] No response object");
        toast.error("Username or password does not exist");
      }

      if (err) {
        console.error("❌ [SigninForm] Error details:", err);
        setErrorMessage(err?.message || err?.detail || "An error occurred during login");
      }
    }

  });

  return (
    <Box component="form" onSubmit={signinForm.handleSubmit} sx={{width:'100%'}}>
      <Box sx={{ textAlign: "center", marginBottom: "3rem", mt: 3 }}>
        <Typography sx={{ textAlign: 'center', fontWeight: 500 }} variant="h4">Sign In</Typography>
        <Typography sx={{ textAlign: 'center', color: 'inherit' }} variant="body2">Unlock Your Knowledge, Ignite Your Fun!</Typography>
      </Box>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* <Button variant="outlined" size="large" startIcon={<GoogleIcon />} sx={{ color: 'inherit', borderColor: 'inherit', '&:hover': { borderColor: 'inherit' } }}>Sign in with Google</Button> */}
        {/* <Divider sx={{ fontSize: 'body2' }}><Typography variant="caption">or Sign in with Email</Typography></Divider> */}
        <TextField
          type="text"
          placeholder="mail@example.com"
          name="email"
          label="Email"
          fullWidth
          value={signinForm.values.email}
          onChange={signinForm.handleChange}
          error={signinForm.touched.email && signinForm.errors.email !== undefined}
          helperText={signinForm.touched.email && signinForm.errors.email}
          sx={{}}
          required
        />
        <TextField
          type="password"
          placeholder="Min. 8 Characters"
          name="password"
          label="Password"
          sx={{color:'primary.main'}}
          fullWidth
          value={signinForm.values.password}
          onChange={signinForm.handleChange}
          error={signinForm.touched.password && signinForm.errors.password !== undefined}
          helperText={signinForm.touched.password && signinForm.errors.password}
          required
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body1">Remember me</Typography>} />
          <Typography variant="body1"><Link sx={{ cursor: 'pointer' }} underline="none">Forget password?</Link></Typography>
        </Box>
      </Stack>

      <LoadingButton
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        sx={{
          background:uiConfig.style.mainGradient.color,
          mt: 4,
          borderRadius:100,
          color:'secondary.contrastText'
        }}
        loading={isLoginRequest}
      >
        sign in
      </LoadingButton>
      <Typography sx={{ marginTop: 1,  }} variant="body2">Not registered yet? <Link onClick={() => switchAuthState()} sx={{ cursor: 'pointer', color: 'primary.main' }} underline="none">Create New Account</Link></Typography>

      {errorMessage && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error" variant="outlined" >{errorMessage}</Alert>
        </Box>
      )}
    </Box>

  );
};

export default SigninForm;