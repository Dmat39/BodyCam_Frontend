import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const CustomSwal = withReactContent(Swal.mixin({
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  icon: 'info',
}));

export default CustomSwal;


export const swalError = (obj) => {

  CustomSwal.fire({
    icon: 'error',
    html: `
      <h2 class="text-2xl font-bold mb-3">${obj.data ? obj.message : 'Se encontraron los siguientes errores'}</h2>
      ${obj.data
        ? obj.data.map((item) => `<p class="text-base mb-3 px-6">${item}</p>`).join('')
        :
        obj.errores ?
        obj.errores.map((item) => `<p class="text-base mb-3 px-6">${item}</p>`).join('')
        : `<p class="text-base mb-3">${obj.message || obj.error || obj}</p>`
      }
    `,
  });
}
