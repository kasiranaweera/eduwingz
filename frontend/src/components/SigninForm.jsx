import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Stack, TextField, Typography, Divider, FormControlLabel, Checkbox } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
// import userApi from "../../api/modules/user.api";
import { setUser } from "../redux/features/userSlice";
import GoogleIcon from '@mui/icons-material/Google';
import { Link } from 'react-router-dom'
import { useState } from "react";
// import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';

// const swal = require('sweetalert2')

const SigninForm = ({ switchAuthState }) => {
  // const dispatch = useDispatch();

  const navigate = useNavigate();

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
    // validationSchema: Yup.object({
    //   email: Yup.string()
    //     .min(8, "username minimum 8 characters")
    //     .required("username is required"),
    //   password: Yup.string()
    //     .min(8, "password minimum 8 characters")
    //     .required("password is required")
    // }),
    // onSubmit: async values => {
    //   setErrorMessage(undefined);
    //   setIsLoginRequest(true);
    //   const { response, err } = await userApi.signin(values);
    //   setIsLoginRequest(false);

    //   console.log("Response:", response);
    //       console.log("Error:", err);

    //   console.log("Access:", jwtDecode(response.access));
    //   console.log("Refresh:", jwtDecode(response.refresh));


    //   if (response) {
    //     console.log("Logged In");
    //     setAuthTokens(response)
    //     setUser(jwtDecode(response.access))
    //     Cookies.set('access_token', response.access);
    //     Cookies.set('refresh_token', response.refresh);
    //     navigate("/")
    //     toast.success("Sign in success");

    //   } else {
    //     console.log(response.status);
    //     console.log("there was a server issue");
    //     toast.error("Username or password does not exist");

    //   }


    //   // if (response.status===200) {
    //   //   signinForm.resetForm();
    //   //   dispatch(setUser(response));
    //   //   dispatch(setAuthModalOpen(false));
    //   //   toast.success("Sign in success");
    //   // }

    //   if (err) setErrorMessage(err.message);
    // }
  });

  return (
    <Box component="form" onSubmit={signinForm.handleSubmit}>
      <Box sx={{ textAlign: "center", marginBottom: "3rem", mt: 3 }}>
        <Typography sx={{ textAlign: 'center', fontWeight: 500 }} variant="h4">Sign In</Typography>
        <Typography sx={{ textAlign: 'center', color: 'inherit' }} variant="body2">Unlock Your Knowledge, Ignite Your Fun!</Typography>
      </Box>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Button variant="outlined" size="large" startIcon={<GoogleIcon />} sx={{ color: 'inherit', borderColor: 'inherit', '&:hover': { borderColor: 'inherit' } }}>Sign in with Google</Button>
        <Divider sx={{ fontSize: 'body2' }}><Typography variant="caption">or Sign in with Email</Typography></Divider>
        <TextField
          type="text"
          placeholder="mail@example.com"
          name="email"
          label="Email"
          fullWidth
          value={signinForm.values.email}
          onChange={signinForm.handleChange}
          color="success"
          error={signinForm.touched.email && signinForm.errors.email !== undefined}
          helperText={signinForm.touched.email && signinForm.errors.email}
          required
        />
        <TextField
          type="password"
          placeholder="Min. 8 Characters"
          name="password"
          label="Password"
          fullWidth
          value={signinForm.values.password}
          onChange={signinForm.handleChange}
          color="success"
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
        sx={{ marginTop: 4 }}
        loading={isLoginRequest}
      >
        sign in
      </LoadingButton>
      <Typography sx={{ marginTop: 1 }} variant="body2">Not registered yet? <Link onClick={() => switchAuthState()} underline="none" sx={{ cursor: 'pointer' }}>Create an Account</Link></Typography>

      {errorMessage && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error" variant="outlined" >{errorMessage}</Alert>
        </Box>
      )}
    </Box>

  );
};

export default SigninForm;