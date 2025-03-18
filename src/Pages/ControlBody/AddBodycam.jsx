import React, { useState, useEffect } from "react";
import CustomModal from "../../Components/Modal/CustomModal";
import {
  Button,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useFormik } from "formik";
import CustomSwal, { swalError } from "../../helpers/swalConfig";
import { socket } from "../../Components/Socket/socket";

dayjs.locale("es");

// Opciones para los menús desplegables
const TURNOS = ["MAÑANA", "TARDE", "NOCHE"];
const JURISDICCIONES = [
  "Zona norte",
  "Zona sur",
  "Zona centro",
  "Zona alta",
  "Zona baja",
  "Zona libre",
  "Zarate",
  "Caja de Agua",
  "La Huayrona",
  "Canto Rey",
  "Santa Elizabeth",
  "Bayovar",
  "10 de Octubre",
  "Mariscal Caceres",
];

// Cargar variables desde el .env
const API_URL = import.meta.env.VITE_TAREAJE_API_URL;
const API_KEY = import.meta.env.VITE_TAREAJE_API_KEY;

// Función para obtener datos del empleado por DNI
async function fetchEmpleadoData(dni) {
  const url = `${API_URL}${dni}`;
  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener datos del empleado");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const AgregarControlBodycam = ({ currentPage = 1 }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  useEffect(() => {
    // Escuchar la respuesta del evento ControlBodys
    const handleControlBodysResponse = (response) => {
      if (response.status === 200) {
        // Mostrar la confirmación después de cerrar el modal
        setTimeout(() => {
          CustomSwal.fire(
            "Registrado",
            "El control de bodycam ha sido registrado correctamente.",
            "success"
          );
          // Limpiar el formulario
          formik.resetForm();
          // Actualizar la lista usando la página actual
          socket.emit("getAllControlBodys", {
            page: currentPage,
            limit: 20,
            ordenarPor: "createdAt",
            orden: "DESC"
          });
          setIsSubmitting(false);
        }, 100);
      } else {
        // Si hay error, reabrir el modal para que el usuario corrija
        setIsSubmitting(false);
        setOpen(true);
        swalError(response.message || "Error desconocido");
      }
    };

    socket.on("ControlBodys", handleControlBodysResponse);

    // Cleanup function
    return () => {
      socket.off("ControlBodys", handleControlBodysResponse);
    };
  }, [currentPage]);

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
    setShowHelp(false);
  };

  const formik = useFormik({
    initialValues: {
      numerosBodycam: "",
      nombres: "",
      apellidos: "",
      dni: "",
      turno: "",
      jurisdiccion: "",
      funcion: "",
      unidad: "",
    },
    validate: (values) => {
      const errors = {};
      const camposRequeridos = [
        "numerosBodycam",
        "nombres",
        "apellidos",
        "dni",
        "turno",
        "jurisdiccion",
        "funcion",
        "unidad",
      ];
      camposRequeridos.forEach((campo) => {
        if (!values[campo]) {
          errors[campo] = "Campo requerido";
        }
      });
      if (values.dni && !/^\d+$/.test(values.dni)) {
        errors.dni = "El DNI debe contener solo números";
      }
      return errors;
    },
    onSubmit: (values) => {
      // Obtener fecha y hora actual exacta
      const currentDateTime = dayjs();
      const fechaEntrega = currentDateTime.format("YYYY-MM-DD");
      const horaEntrega = currentDateTime.format("HH:mm:ss");

      const numerosBodycamArray = values.numerosBodycam
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num);

      const datosEnvio = {
        ...values,
        numeros: numerosBodycamArray,
        fecha_entrega: fechaEntrega,
        hora_entrega: horaEntrega,
        status: "EN CAMPO",
      };

      setIsSubmitting(true);
      setOpen(false);

      // Emitir evento sin callback
      socket.emit("createControlBody", datosEnvio);
    },
  });

  // Esta función se llamará cuando el usuario termine de escribir o pierda el foco en el DNI
  const handleDniBlur = async (e) => {
    formik.handleBlur(e);
    const dniIngresado = e.target.value.trim();

    if (/^\d+$/.test(dniIngresado)) {
      const data = await fetchEmpleadoData(dniIngresado);
      if (data) {
        // Ajusta según la estructura devuelta
        formik.setFieldValue("nombres", data.nombres || "");
        formik.setFieldValue("apellidos", data.apellidos || "");
        formik.setFieldValue("funcion", data.funcion || "");
      } else {
        console.error("No se pudo obtener datos del empleado");
      }
    }
  };

  return (
    <>
      <Tooltip title="Registrar Control de Bodycam" placement="top" arrow>
        <IconButton aria-label="add" onClick={() => setOpen(true)} color="primary">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose}>
        {/* Contenido del modal sin márgenes/padding externos */}
        <Box sx={{
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#fff",
          boxShadow: 3,
          borderRadius: 0,
          overflow: "hidden",
        }}>
          {/* Header verde que ocupa todo el ancho */}
          <Box sx={{
            p: 2,
            backgroundColor: "#1b5e20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
          }}>
            <VideocamIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" fontWeight="bold" textAlign="center" color="#fff">
              Registrar Control de Bodycam
            </Typography>
          </Box>

          {/* Contenido del formulario */}
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1b5e20" }}>
                    Números de Bodycam
                  </Typography>
                  <Tooltip title="Mostrar ayuda">
                    <IconButton size="small" onClick={toggleHelp}>
                      <HelpIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {showHelp && (
                  <Box sx={{
                    backgroundColor: "#f1f8e9",
                    p: 1,
                    borderRadius: 1,
                    mb: 1,
                    border: "1px dashed #4caf50"
                  }}>
                    <Typography variant="caption">
                      Ingrese los códigos de bodycam separados por comas. Por ejemplo:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                      <Chip label="SG001" color="success" variant="outlined" size="small" />
                      <Chip label="SG002" color="success" variant="outlined" size="small" />
                      <Chip label="SG003" color="success" variant="outlined" size="small" />
                    </Box>
                    <Typography variant="caption" sx={{ mt: 0.5, fontStyle: "italic" }}>
                      Ejemplo: SG001, SG002, SG003
                    </Typography>
                  </Box>
                )}

                <TextField
                  name="numerosBodycam"
                  placeholder="Ej: SG001, SG002, SG003"
                  value={formik.values.numerosBodycam}
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(formik.errors.numerosBodycam)}
                  helperText={formik.errors.numerosBodycam}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                    startAdornment: (
                      <InputAdornment position="start">
                        <VideocamIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#4caf50",
                      },
                      "&:hover fieldset": {
                        borderColor: "#2e7d32",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2e7d32",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <TextField
                  label="DNI"
                  name="dni"
                  value={formik.values.dni}
                  onChange={formik.handleChange}
                  onBlur={handleDniBlur}
                  fullWidth
                  error={Boolean(formik.errors.dni && formik.touched.dni)}
                  helperText={formik.touched.dni && formik.errors.dni}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                  InputLabelProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                />

                <TextField
                  label="Nombres"
                  name="nombres"
                  {...formik.getFieldProps("nombres")}
                  fullWidth
                  error={Boolean(formik.errors.nombres && formik.touched.nombres)}
                  helperText={formik.touched.nombres && formik.errors.nombres}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                  InputLabelProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                />

                <TextField
                  label="Apellidos"
                  name="apellidos"
                  {...formik.getFieldProps("apellidos")}
                  fullWidth
                  error={Boolean(formik.errors.apellidos && formik.touched.apellidos)}
                  helperText={formik.touched.apellidos && formik.errors.apellidos}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                  InputLabelProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                />

                {/* Select para Turno */}
                <FormControl
                  fullWidth
                  error={Boolean(formik.errors.turno && formik.touched.turno)}
                  size="small"
                >
                  <InputLabel id="turno-label" sx={{ fontSize: "0.875rem" }}>Turno</InputLabel>
                  <Select
                    labelId="turno-label"
                    id="turno"
                    name="turno"
                    value={formik.values.turno}
                    onChange={formik.handleChange}
                    label="Turno"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {TURNOS.map((turno) => (
                      <MenuItem key={turno} value={turno}>
                        {turno}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.turno && formik.errors.turno && (
                    <FormHelperText>{formik.errors.turno}</FormHelperText>
                  )}
                </FormControl>

                {/* Select para Jurisdicción */}
                <FormControl
                  fullWidth
                  error={Boolean(formik.errors.jurisdiccion && formik.touched.jurisdiccion)}
                  size="small"
                >
                  <InputLabel id="jurisdiccion-label" sx={{ fontSize: "0.875rem" }}>Jurisdicción</InputLabel>
                  <Select
                    labelId="jurisdiccion-label"
                    id="jurisdiccion"
                    name="jurisdiccion"
                    value={formik.values.jurisdiccion}
                    onChange={formik.handleChange}
                    label="Jurisdicción"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {JURISDICCIONES.map((jurisdiccion) => (
                      <MenuItem key={jurisdiccion} value={jurisdiccion}>
                        {jurisdiccion}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.jurisdiccion && formik.errors.jurisdiccion && (
                    <FormHelperText>{formik.errors.jurisdiccion}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  label="Función"
                  name="funcion"
                  {...formik.getFieldProps("funcion")}
                  fullWidth
                  error={Boolean(formik.errors.funcion && formik.touched.funcion)}
                  helperText={formik.touched.funcion && formik.errors.funcion}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                  InputLabelProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                />

                <TextField
                  label="Unidad"
                  name="unidad"
                  {...formik.getFieldProps("unidad")}
                  fullWidth
                  error={Boolean(formik.errors.unidad && formik.touched.unidad)}
                  helperText={formik.touched.unidad && formik.errors.unidad}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                  InputLabelProps={{
                    style: { fontSize: "0.875rem" },
                  }}
                />
              </Box>

              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                pt: 2
              }}>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                    px: 3,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: "bold"
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                    px: 3,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    backgroundColor: "#2e7d32",
                    "&:hover": {
                      backgroundColor: "#1b5e20",
                    }
                  }}
                >
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </CustomModal>
    </>
  );
};

export default AgregarControlBodycam;