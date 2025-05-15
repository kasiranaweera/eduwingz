import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton
  } from "@mui/material";
  import CloseIcon from '@mui/icons-material/Close';
  import { useFormik } from 'formik';
  import * as Yup from 'yup';
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };
  
  const TemplateModal = ({ open, onClose, onSubmit }) => {
    const formik = useFormik({
      initialValues: {
        role: '',
        content: '',
        action: '',
        examples: '',
        constraints: ''
      },
      validationSchema: Yup.object({
        role: Yup.string().required('Role is required'),
        content: Yup.string().required('Content is required'),
        action: Yup.string().required('Action is required'),
      }),
      onSubmit: (values) => {
        const templateMessage = `Role: ${values.role}\nContent: ${values.content}\nAction: ${values.action}\nExamples: ${values.examples}\nConstraints: ${values.constraints}`;
        onSubmit(templateMessage);
        onClose();
      }
    });
  
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="template-modal-title"
        aria-describedby="template-modal-description"
        sx={{borderRadius:5}}
      >
        <Box sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography id="template-modal-title" variant="h6" component="h2">
              Create Template Message
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box id="template-modal-description" sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
                placeholder="E.g., 'You are a helpful assistant'"
              />
              
              <TextField
                fullWidth
                label="Content"
                name="content"
                multiline
                rows={2}
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
                placeholder="Main content of your message"
              />
              
              <TextField
                fullWidth
                label="Action"
                name="action"
                value={formik.values.action}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.action && Boolean(formik.errors.action)}
                helperText={formik.touched.action && formik.errors.action}
                placeholder="What action should be taken?"
              />
              
              <TextField
                fullWidth
                label="Examples (optional)"
                name="examples"
                multiline
                rows={2}
                value={formik.values.examples}
                onChange={formik.handleChange}
                placeholder="Provide some examples if needed"
              />
              
              <TextField
                fullWidth
                label="Constraints/Formatting (optional)"
                name="constraints"
                multiline
                rows={2}
                value={formik.values.constraints}
                onChange={formik.handleChange}
                placeholder="Any specific formatting requirements?"
              />
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={formik.handleSubmit}
                disabled={!formik.isValid}
                sx={{borderRadius:100, color:'secondary.contrastText'}}
              >
                Send Now
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    );
  };
  
  export default TemplateModal;