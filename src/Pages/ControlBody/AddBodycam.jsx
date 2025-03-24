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
  Stack,
  Divider
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import VideocamIcon from "@mui/icons-material/Videocam";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const [bodycams, setBodycams] = useState([
    { numero: "", jurisdiccion: "", unidad: "" }
  ]);

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
          setBodycams([{ numero: "", jurisdiccion: "", unidad: "" }]);
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
    setBodycams([{ numero: "", jurisdiccion: "", unidad: "" }]);
    setOpen(false);
    setShowHelp(false);
  };

  const formik = useFormik({
    initialValues: {
      nombres: "",
      apellidos: "",
      dni: "",
      turno: "",
      funcion: "",
    },
    validate: (values) => {
      const errors = {};
      const camposRequeridos = [
        "nombres",
        "apellidos",
        "dni",
        "turno",
        "funcion",
      ];
      
      camposRequeridos.forEach((campo) => {
        if (!values[campo]) {
          errors[campo] = "Campo requerido";
        }
      });
      
      if (values.dni && !/^\d+$/.test(values.dni)) {
        errors.dni = "El DNI debe contener solo números";
      }
      
      // Validar que haya al menos una bodycam con datos completos
      const bodycamIncompleta = bodycams.some(
        (bc) => !bc.numero || !bc.jurisdiccion || !bc.unidad
      );
      
      if (bodycamIncompleta) {
        errors.bodycams = "Todas las bodycams deben tener número, jurisdicción y unidad";
      }
      
      return errors;
    },
    onSubmit: (values) => {
      // Verificar si hay bodycams incompletas
      const bodycamIncompleta = bodycams.some(
        (bc) => !bc.numero || !bc.jurisdiccion || !bc.unidad
      );
      
      if (bodycamIncompleta) {
        CustomSwal.fire(
          "Error",
          "Todas las bodycams deben tener número, jurisdicción y unidad",
          "error"
        );
        return;
      }

      // Obtener fecha y hora actual exacta
      const currentDateTime = dayjs();
      const fechaEntrega = currentDateTime.format("YYYY-MM-DD");
      const horaEntrega = currentDateTime.format("HH:mm:ss");

      // Crear un array para almacenar todas las solicitudes
      const solicitudes = [];

      // Por cada bodycam, crear una solicitud separada
      bodycams.forEach((bodycam) => {
        const datosEnvio = {
          ...values,
          numeros: [bodycam.numero.trim()],
          jurisdiccion: bodycam.jurisdiccion,
          unidad: bodycam.unidad,
          fecha_entrega: fechaEntrega,
          hora_entrega: horaEntrega,
          status: "EN CAMPO",
        };
        solicitudes.push(datosEnvio);
      });

      setIsSubmitting(true);
      setOpen(false);

      // Emitir eventos para cada bodycam
      solicitudes.forEach((solicitud) => {
        socket.emit("createControlBody", solicitud);
      });
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

  // Manejo de cambios en los campos de bodycam
  const handleBodycamChange = (index, field, value) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index][field] = value;
    setBodycams(nuevasBodycams);
  };

  // Agregar una nueva bodycam
  const agregarBodycam = () => {
    setBodycams([...bodycams, { numero: "", jurisdiccion: "", unidad: "" }]);
  };

  // Eliminar una bodycam
  const eliminarBodycam = (index) => {
    if (bodycams.length > 1) {
      const nuevasBodycams = bodycams.filter((_, i) => i !== index);
      setBodycams(nuevasBodycams);
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
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh" // Limitar la altura máxima al 85% de la altura de la ventana
        }}>
          {/* Header verde que ocupa todo el ancho - siempre visible */}
          <Box sx={{
            p: 2,
            backgroundColor: "#1b5e20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexShrink: 0 // Evitar que el encabezado se encoja
          }}>
            <VideocamIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" fontWeight="bold" textAlign="center" color="#fff">
              Registrar Control de Bodycam
            </Typography>
          </Box>

          {/* Contenido del formulario - área scrollable */}
          <Box sx={{ 
            p: 3, 
            overflow: "auto", // Habilitar el scroll
            flexGrow: 1 // Permitir que este contenedor crezca y se encoja
          }}>
            <form onSubmit={formik.handleSubmit}>
              {/* Campos de datos personales */}
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
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Sección de bodycams */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1b5e20" }}>
                      Bodycams
                    </Typography>
                    <Tooltip title="Mostrar ayuda">
                      <IconButton size="small" onClick={toggleHelp}>
                        <HelpIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={agregarBodycam}
                    startIcon={<AddIcon />}
                    sx={{ 
                      textTransform: "none",
                      fontSize: "0.75rem"
                    }}
                  >
                    Agregar bodycam
                  </Button>
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
                      Ingrese los datos para cada bodycam. Puede agregar múltiples bodycams usando el botón "Agregar bodycam".
                    </Typography>
                  </Box>
                )}

                {bodycams.map((bodycam, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      border: "1px solid #e0e0e0", 
                      p: 2, 
                      borderRadius: 1, 
                      mb: 2,
                      backgroundColor: "#f9f9f9"
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Bodycam #{index + 1}
                      </Typography>
                      {bodycams.length > 1 && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => eliminarBodycam(index)}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1 }}>
                      <TextField
                        label="Número"
                        placeholder="Ej: SG001"
                        value={bodycam.numero}
                        onChange={(e) => handleBodycamChange(index, "numero", e.target.value)}
                        fullWidth
                        error={!bodycam.numero && formik.touched.bodycams}
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
                        InputLabelProps={{
                          style: { fontSize: "0.875rem" },
                        }}
                      />

                      <FormControl
                        fullWidth
                        error={!bodycam.jurisdiccion && formik.touched.bodycams}
                        size="small"
                      >
                        <InputLabel id={`jurisdiccion-label-${index}`} sx={{ fontSize: "0.875rem" }}>
                          Jurisdicción
                        </InputLabel>
                        <Select
                          labelId={`jurisdiccion-label-${index}`}
                          value={bodycam.jurisdiccion}
                          onChange={(e) => handleBodycamChange(index, "jurisdiccion", e.target.value)}
                          label="Jurisdicción"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {JURISDICCIONES.map((jurisdiccion) => (
                            <MenuItem key={`${index}-${jurisdiccion}`} value={jurisdiccion}>
                              {jurisdiccion}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        label="Unidad"
                        value={bodycam.unidad}
                        onChange={(e) => handleBodycamChange(index, "unidad", e.target.value)}
                        fullWidth
                        error={!bodycam.unidad && formik.touched.bodycams}
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
                  </Box>
                ))}

                {formik.errors.bodycams && formik.touched.bodycams && (
                  <Typography color="error" variant="caption" sx={{ mt: -1, display: "block" }}>
                    {formik.errors.bodycams}
                  </Typography>
                )}
              </Box>
            </form>
          </Box>

          {/* Botones de acción - siempre visibles al final */}
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 3,
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f9f9f9",
            flexShrink: 0 // Evitar que los botones se encojan
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
              onClick={formik.handleSubmit}
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
        </Box>
      </CustomModal>
    </>
  );
};

export default AgregarControlBodycam;