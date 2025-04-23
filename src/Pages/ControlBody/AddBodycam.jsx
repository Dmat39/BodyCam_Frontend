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
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel
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

// Prefijos para el número de bodycam
const PREFIJOS_BODYCAM = ["SG", "fisca"];

// Opciones para la unidad
const OPCIONES_UNIDAD = [
  { value: "O-", label: "Orion" },
  { value: "H-", label: "Hermes" },
  { value: "DELTA", label: "DELTA" }
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

const obtenerTurnoActual = () => {
  const hora = new Date().getHours();
  if (hora >= 7 && hora < 15) return "MAÑANA";
  if (hora >= 15 && hora < 23) return "TARDE";
  return "NOCHE";
};

const AgregarControlBodycam = ({ currentPage = 1 }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [bodycams, setBodycams] = useState([
    {
      prefijo: "SG",
      numero: "",
      jurisdiccion: "",
      tipoUnidad: "O-",
      numeroUnidad: "",
      unidadCompleta: "O-"
    }
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
          setBodycams([{
            prefijo: "SG",
            numero: "",
            jurisdiccion: "",
            tipoUnidad: "O-",
            numeroUnidad: "",
            unidadCompleta: "O-"
          }]);
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
    setBodycams([{
      prefijo: "SG",
      numero: "",
      jurisdiccion: "",
      tipoUnidad: "O-",
      numeroUnidad: "",
      unidadCompleta: "O-"
    }]);
    setOpen(false);
    setShowHelp(false);
  };

  const formik = useFormik({
    initialValues: {
      nombres: "",
      apellidos: "",
      dni: "",
      turno: obtenerTurnoActual(),
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
        (bc) => !bc.numero || !bc.jurisdiccion || !bc.unidadCompleta
      );

      if (bodycamIncompleta) {
        errors.bodycams = "Todas las bodycams deben tener número, jurisdicción y unidad";
      }

      return errors;
    },
    onSubmit: (values) => {
      // Verificar si hay bodycams incompletas
      const bodycamIncompleta = bodycams.some(
        (bc) => !bc.numero || !bc.jurisdiccion || !bc.unidadCompleta
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
        const numeroCompleto = `${bodycam.prefijo}${bodycam.numero}`;

        const datosEnvio = {
          ...values,
          numeros: [numeroCompleto],
          jurisdiccion: bodycam.jurisdiccion,
          unidad: bodycam.unidadCompleta,
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

  // Manejar cambio de prefijo para bodycam
  const handlePrefijoCambio = (index, prefijo) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index].prefijo = prefijo;
    setBodycams(nuevasBodycams);
  };

  // Manejar cambio de número para bodycam
  const handleNumeroCambio = (index, numero) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index].numero = numero;
    setBodycams(nuevasBodycams);
  };

  // Manejar cambio de tipo de unidad
  const handleTipoUnidadCambio = (index, tipo) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index].tipoUnidad = tipo;

    // Si el tipo es DELTA, no se requiere número
    if (tipo === "DELTA") {
      nuevasBodycams[index].numeroUnidad = "";
      nuevasBodycams[index].unidadCompleta = "DELTA";
    } else {
      // Para O- y H-, actualizar la unidad completa
      nuevasBodycams[index].unidadCompleta = `${tipo}${nuevasBodycams[index].numeroUnidad}`;
    }

    setBodycams(nuevasBodycams);
  };

  // Manejar cambio de número de unidad
  const handleNumeroUnidadCambio = (index, numero) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index].numeroUnidad = numero;

    // No actualizar si es DELTA
    if (nuevasBodycams[index].tipoUnidad !== "DELTA") {
      nuevasBodycams[index].unidadCompleta = `${nuevasBodycams[index].tipoUnidad}${numero}`;
    }

    setBodycams(nuevasBodycams);
  };

  // Manejo de cambios en los campos de bodycam tradicionales
  const handleBodycamChange = (index, field, value) => {
    const nuevasBodycams = [...bodycams];
    nuevasBodycams[index][field] = value;
    setBodycams(nuevasBodycams);
  };

  // Agregar una nueva bodycam
  const agregarBodycam = () => {
    setBodycams([...bodycams, {
      prefijo: "SG",
      numero: "",
      jurisdiccion: "",
      tipoUnidad: "O-",
      numeroUnidad: "",
      unidadCompleta: "O-"
    }]);
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

      <CustomModal Open={open} setOpen={setOpen} handleClose={handleClose} onlyCloseFromButton={true}>
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
                      Ingrese los datos para cada bodycam. Seleccione el prefijo (SG o fisca) y agregue el número.
                      Para la unidad, seleccione el tipo (O-, H- o DELTA) y el número correspondiente cuando sea necesario.
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

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                      {/* Fila 1: Número y Jurisdicción */}
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Campo Número con prefijo */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ mb: 0.5, display: "block", fontWeight: "medium" }}>
                            Número
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControl size="small" sx={{ minWidth: "100px", mr: 1 }}>
                              <Select
                                value={bodycam.prefijo}
                                onChange={(e) => handlePrefijoCambio(index, e.target.value)}
                                sx={{
                                  fontSize: "0.875rem",
                                  height: "40px",
                                  "& .MuiSelect-select": {
                                    overflow: "visible"
                                  }
                                }}
                              >
                                {PREFIJOS_BODYCAM.map((prefijo) => (
                                  <MenuItem key={prefijo} value={prefijo}>
                                    {prefijo}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <TextField
                              placeholder="001"
                              value={bodycam.numero}
                              onChange={(e) => handleNumeroCambio(index, e.target.value)}
                              size="small"
                              fullWidth
                              error={!bodycam.numero && formik.touched.bodycams}
                              InputProps={{
                                style: { fontSize: "0.875rem" },
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <VideocamIcon color="primary" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Jurisdicción */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ mb: 0.5, display: "block", fontWeight: "medium" }}>
                            Jurisdicción
                          </Typography>
                          <FormControl
                            fullWidth
                            error={!bodycam.jurisdiccion && formik.touched.bodycams}
                            size="small"
                          >
                            <Select
                              value={bodycam.jurisdiccion}
                              onChange={(e) => handleBodycamChange(index, "jurisdiccion", e.target.value)}
                              sx={{ fontSize: "0.875rem", height: "40px" }}
                              displayEmpty
                              renderValue={(selected) => {
                                if (!selected) return <em>Seleccione jurisdicción</em>;
                                return selected;
                              }}
                            >
                              <MenuItem disabled value="">
                                <em>Seleccione jurisdicción</em>
                              </MenuItem>
                              {JURISDICCIONES.map((jurisdiccion) => (
                                <MenuItem key={`${index}-${jurisdiccion}`} value={jurisdiccion}>
                                  {jurisdiccion}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>

                      {/* Fila 2: Unidad */}
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: "block", fontWeight: "medium" }}>
                          Unidad
                        </Typography>
                        <Box sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2
                        }}>
                          {/* Opciones de radio buttons horizontales */}
                          <RadioGroup
                            row
                            value={bodycam.tipoUnidad}
                            onChange={(e) => handleTipoUnidadCambio(index, e.target.value)}
                            sx={{ flexWrap: "nowrap" }}
                          >
                            {OPCIONES_UNIDAD.map((opcion) => (
                              <FormControlLabel
                                key={opcion.value}
                                value={opcion.value}
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">{opcion.label}</Typography>}
                                sx={{ marginRight: 1 }}
                              />
                            ))}
                          </RadioGroup>

                          {/* Campo numérico para O- y H- */}
                          {(bodycam.tipoUnidad === "O-" || bodycam.tipoUnidad === "H-") && (
                            <TextField
                              placeholder="Número"
                              value={bodycam.numeroUnidad}
                              onChange={(e) => handleNumeroUnidadCambio(index, e.target.value)}
                              size="small"
                              sx={{ width: "120px", ml: 1 }}
                              error={bodycam.tipoUnidad !== "DELTA" && !bodycam.numeroUnidad && formik.touched.bodycams}
                              InputProps={{
                                style: { fontSize: "0.875rem" },
                              }}
                            />
                          )}
                        </Box>
                      </Box>
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