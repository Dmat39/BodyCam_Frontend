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
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es";
import AddIcon from "@mui/icons-material/Add";
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
          socket.emit("getAllControlBodys", { page: currentPage, limit: 20 });
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
      fecha_entrega: dayjs(),
      hora_entrega: dayjs(),
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
      const fechaEntrega = values.fecha_entrega.format("YYYY-MM-DD");
      const horaEntrega = values.hora_entrega.format("HH:mm:ss");

      const numerosBodycamArray = values.numerosBodycam
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num);

      const datosEnvio = {
        ...values,
        numeros: numerosBodycamArray,
        fecha_entrega: fechaEntrega,
        hora_entrega: horaEntrega,
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
        <Box className="p-5">
          <Typography variant="h6" fontWeight="bold" className="text-center">
            Registrar Control de Bodycam
          </Typography>
          <form onSubmit={formik.handleSubmit} className="mt-4">
            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Números de Bodycam (separados por comas)"
                name="numerosBodycam"
                value={formik.values.numerosBodycam}
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(formik.errors.numerosBodycam)}
                helperText={formik.errors.numerosBodycam}
              />
              <TextField
                label="DNI"
                name="dni"
                value={formik.values.dni}
                onChange={formik.handleChange}
                onBlur={handleDniBlur}
                fullWidth
                error={Boolean(formik.errors.dni && formik.touched.dni)}
                helperText={formik.touched.dni && formik.errors.dni}
              />
              <TextField
                label="Nombres"
                name="nombres"
                {...formik.getFieldProps("nombres")}
                fullWidth
                error={Boolean(formik.errors.nombres && formik.touched.nombres)}
                helperText={formik.touched.nombres && formik.errors.nombres}
              />
              <TextField
                label="Apellidos"
                name="apellidos"
                {...formik.getFieldProps("apellidos")}
                fullWidth
                error={Boolean(formik.errors.apellidos && formik.touched.apellidos)}
                helperText={formik.touched.apellidos && formik.errors.apellidos}
              />

              {/* Select para Turno */}
              <FormControl
                fullWidth
                error={Boolean(formik.errors.turno && formik.touched.turno)}
              >
                <InputLabel id="turno-label">Turno</InputLabel>
                <Select
                  labelId="turno-label"
                  id="turno"
                  name="turno"
                  value={formik.values.turno}
                  onChange={formik.handleChange}
                  label="Turno"
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
              >
                <InputLabel id="jurisdiccion-label">Jurisdicción</InputLabel>
                <Select
                  labelId="jurisdiccion-label"
                  id="jurisdiccion"
                  name="jurisdiccion"
                  value={formik.values.jurisdiccion}
                  onChange={formik.handleChange}
                  label="Jurisdicción"
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
              />
              <TextField
                label="Unidad"
                name="unidad"
                {...formik.getFieldProps("unidad")}
                fullWidth
                error={Boolean(formik.errors.unidad && formik.touched.unidad)}
                helperText={formik.touched.unidad && formik.errors.unidad}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Fecha de Entrega"
                  value={formik.values.fecha_entrega}
                  onChange={(newValue) =>
                    formik.setFieldValue("fecha_entrega", newValue)
                  }
                  slots={{
                    textField: (params) => <TextField {...params} fullWidth />
                  }}
                />
                <TimePicker
                  label="Hora de Entrega"
                  value={formik.values.hora_entrega}
                  onChange={(newValue) =>
                    formik.setFieldValue("hora_entrega", newValue)
                  }
                  slots={{
                    textField: (params) => <TextField {...params} fullWidth />
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box className="flex justify-between pt-5">
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  );
};

export default AgregarControlBodycam;