import { 
  React, 
  useEffect, 
  useState,
  useRef,
} from 'react';

import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Loader from '../loader/loader';
import Footer from '../footer/footer';
import Error400  from '../errorServices/error400';

import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';

/** Importacion de liberias para mostrar Drawer de filtros */
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

/** Liberias para descarga Deals en formato CSV */
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import { 
  apiGetAllOperation,
  apiGetPlatform,
} from '../../apis/services';

import Tooltip from '@mui/material/Tooltip';

import {
  saveIdDealToLocalStorage,
  removeIdDealToLocalStorage,
} from '../../apis/localStorage'

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Download,
  ClipboardList,
  Paintbrush,
  FilterIcon,
  SquareX,
  CopyCheck,
} from "lucide-react"

import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import { toast, Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';

const Operaciones = () => {

  const executedRef = useRef(false);

  let navigate = useNavigate();

  /** estado de loader */
  const [isLoader, setIsLoader] = useState(true);

  /** estado que guarda y muestra error APi */
  const [error400, setError400] = useState(false);

  /** Variable que guarda los nombres de las columnas del tablero de Operaciones */
  const headerTable =  [
    {
      id: 'radio',
      label: "#",
      minWidth: '50px'
    },
    {
      id: 'deal',
      label: "Deal",
      minWidth: '90px'
    }, 
    {
      id: 'status',
      label: "Status",
      minWidth: '90px'
    }, 
    {
      id: 'startDate',
      label: "Fecha Inicio", 
      minWidth: '170px'
    },
    {
      id: 'endDate',
      label: "Fecha Fin", 
      minWidth: '130px'
    },
    {
      id: 'nameUse',
      label: "Nombre del Cliente", 
      minWidth: '180px'
    },
    {
      id: 'beneficuary',
      label: "Beneficiario", 
      minWidth: '100px'
    },
    {
      id: 'amointUsd',
      label: "Monto", 
      minWidth: '150px'
    },
    {
      id: 'rateChange',
      label: "Tipo de Cambio", 
      minWidth: '170px'
    },
    {
      id: 'tcCustomer',
      label: "TC Cliente", 
      minWidth: '135px'
    },
    {
      id: 'amount',
      label: "Comisión", 
      minWidth: '100px'
    },
    {
      id: 'amountMxn',
      label: "Monto MXN $", 
      minWidth: '160px'
    },
    // {
    //   id: 'sendCommission',
    //   label: "Comisión Envio MXN $",
    //   minWidth: '220px'
    // },
    {
      id: 'platform',
      label: "Plataforma", 
      minWidth: '100px'
    },
    {
      id: 'amoutCteTc',
      label: "Monto CTE TC",
      minWidth: '160px'
    },
    {
      id: 'casque',
      label: "Casque",
      minWidth: '100px'
    },
    {
      id: 'commissionDollar',
      label: "Comisión $",
      minWidth: '175px'
    },
    {
      id: 'depCustomer',
      label: "Dep Cliente",
      minWidth: '145px'
    },
    {
      id: 'utility',
      label: "Utilidad",
      minWidth: '100px'
    },
    {
      id: 'sponsor',
      label: "Promotor", 
      minWidth: '100px'
    },
  ];

  /** estado para realizar busqueda */
  const [dateRange, setDateRange] = useState('1');
  const [platform, setPlatform] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [payDate, setPayDate] =  useState('');

  const initialStates = {
    dateRange: '1',
    platform: '0',
    searchTerm: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    payDate: ''
  };

  const [textFilter, setTextFilter] = useState([]);

  /** Estado que guarda el catalogo de Plataformas */
  const [dataPlatform, setDataPlatform] = useState([]);

  /** Estado que guarda la llamada api desde su servicio 
  * y este se va alcualizando segun los filtro aplicados 
  */
  const [dataDeals, setDataDeals] = useState([]);

  /** Estado que valida si el api de GetAllOperacion el arreglo 
  * viene vacio [] indicando que no hay Deal crados el dia en curso 
  */
  const [isEmptyArrayDeals, setIsEmptyDeals] = useState(false);

  /** Estado que cambia el estado de los componentes fecha inicio y fecha fin
  * para realizar la busqueda en toda el api segun los rango de fecha seleccionados
  */
  const [
    isVisbleFilterDateRanger, 
    setIsVisbleFilterDateRanger
  ] =  useState(true);

  /** Estado que guarda la data filtrada por rangos de Fecha 
  * y poder filtrar por rango de fecha seleccionado y ***NO*** por el rango 
  * de hoy, semana, quincena y mes
  * NOTA se elimino **setDatafilterDateRanger** para evirar error de 
  * variable sin utilizat
  */ 
  const [
    dataFilterDateRanger
  ] = useState([]);

  /**Estado booleano que controla el boton, datPicket para realizar busqueda
  * de Deal y sabes cuanto de va a pagar en ese dia selecciondo
  * NOTA: cuando este estado el true se Bloquea el Boton de busqueda 
  * por rango de fecha. Esto se hace para evitar error cuando se realizar 
  * una busqueda, dependiendo del filtro seleccionado
  */
  const [
    isVisibleFilterPayDate, 
    setIsVivisbleFilterPayDate
  ] = useState(true);

  /** Estado para guardar las filas seleccionadas */
  const [selectedRows, setSelectedRows] = useState([]);

  /** Estado que almacena de manera temporal los seleccionados
  * que se descartan despues que se seleccionaro y se deseleccionaron 
  */
  const [tempState, setTempState] = useState([]);

  /** Estado para pagina del tablero 
  * NOTA se elimino **setRowsPerPage** para evirar error de 
  * variable sin utilizar si despues se necesita cambiar este valor
  * en un select se necesita acupar esta varible en un futuro
  */
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10);

  /**Estado que controla el estado para mostrar
   * el modal de filtros del tablero de Operaciones y/o Deal
   */
  const [openDrawerFilter, setOpenDrawer] = useState(false);

  /** Funcion que manda a llamar el servico para carga la data en el tablero de operacion */
  const onGetAllOperations = async () => {
    try {
      const response = await apiGetAllOperation();
      return response
    } catch (error) {
      setError400(true);
      setTimeout(() => {
          navigate('/login')
      },2000)
      throw error;
    }
  };

  // api que carga el catalogo de Plataformas que viene desde su servicio
  const onGetlAllPlatform = async () => {
    try {
        const response = await apiGetPlatform();
        const newValue = {
          id_BankingPlatform: "",
          platformName: 'Selecciona una Plataforma'
        }
        response.data.unshift(newValue);
        if(response){
            setDataPlatform(response.data);
        }
    } catch (error) {
      throw error
    }
  };

  /** Constante para crear paginacion con result de data */
  const totalRecords = dataDeals.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage)

  /** Funcion para cambiar de pagina del tablero */
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /** Funcion que actuliza la data que se muestra en el tablero */
  const displayDeals = dataDeals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /** Funcion que carga la data de los Rows seleccionados para realizar la descargar 
  * de los row seleccioandos 
  */
  const handleRowSelection = async (rowId, dataArg) => {
    let updateRows = [...selectedRows]
    let dataDownload = [...tempState];
    if (selectedRows.includes(rowId)) {
      updateRows = selectedRows.filter(id => id !== rowId)
      dataDownload = dataDownload.filter(item => item.id !== rowId)
    } else {
      updateRows.push(rowId);
      if (!dataDownload.some(item => item.id === rowId)) {
        dataDownload.push(dataArg);
      }
    }
    setTempState(dataDownload);
    setSelectedRows(updateRows);
    /** se manda la data a esta funcion para que elimine la data del Row 
    * que se des-selecciono y solo se descargue los rows selecionados 
    */
    try {
      let result = onValidationDataFrame(updateRows, dataDownload);
      setTempState(result.dataFiltrada)
    } catch (error) {
      console.error('error al actualizar dataFramer => ',error);
      throw error;
    }
  };

  /**Funcion que selecciona todos los registros de la tabla 
  * para que se realicen la descarga masiva de todos los registros y no 
  * se este seleccionado uno por uno si lo que se quieres es descargar todos los 
  * registros que se muestrane en el tablero 
  */
  const handleSelectAllToggle = () => {
      const allIds = dataDeals.map(user => user.id_Operaciones);
      if (selectedRows.length === dataDeals.length) {
          // Deseleccionar todos
          setSelectedRows([]);
          setTempState([]);
      } else {
          // Seleccionar todos
          const allData = [...dataDeals];
          setSelectedRows(allIds);
          setTempState(allData);

          try {
              const result = onValidationDataFrame(allIds, allData);
              setTempState(result.dataFiltrada);
          } catch (error) {
              console.error("Error al validar todos los datos:", error);
          }
      }
  };

  /** Funcion que elimina dataRow que se des-selecciona del tabero del Deal
  * esta funcion se ejecuta para que solo de descargue la data seleccionada y coinsida
  * con el numero de id_Operacion seleccioandos 
  */
  const onValidationDataFrame = (idArg, dataFrameArg) => {
    /** Filtrar los elementos que coincidan con los IDs */
    const dataFiltrada = dataFrameArg.filter(item => idArg.includes(item.id_Operaciones)).map(item => {
    /** Formatear las fechas para que solo contengan la parte de la fecha */
    return {
        ...item,
        fechaCierre: item.fechaCierre.split('T')[0], /** Obtener solo la parte de la fecha */
        fechaInicio: item.fechaInicio.split('T')[0]  /** Obtener solo la parte de la fecha */
      };
    });
    /** Almacenar los elementos descartados en una variable temporal */
    const dataDescartada = dataFrameArg.filter(item => !idArg.includes(item.id_Operaciones));
    return { dataFiltrada, dataDescartada };
  };

  /** Funcion que crea la data en formato CSV para descargar los 
  * Deal seleccionados y poder consultar esa misma informacion 
  * agregada en el sistema 
  */
  const exportToCSV = (dataFrame) => {
    // Definir los campos que quieres exportar
    const fieldsToExport = [
      "deal",
      "fechaInicio",
      "fechaCierre",
      "nombreCliente",
      "beneficiario",
      "montoUSD",
      "tipoCambio",
      "tcCliente",
      "comision_Porcentaje",
      "promotor",
      "montoMXN",
      "comision_Por_Envio_Ahorro",
      "platformName",
      "mto_CTE_TC",
      "casque",
      "comision_Dolar",
      "dep_Cliente",
      "utilidad"
    ];

    /** Filtrar solo los campos necesarios 
    * para que cuando se descarga el archivo CSV 
    * tenga el mismo formato que se muestra en el 
    * Tablero de Operaciones 
    */
    const filteredDataFrame = dataFrame.map(row => {
      let filteredRow = {};
      fieldsToExport.forEach(field => {
        /** Valida campos de operaciones */
        let value = row[field];
          if (field === "montoMXN" ||
              field === "mto_CTE_TC" ||
              field === "casque" ||
              field === "comision_Dolar" ||
              field === "dep_Cliente" ||
              field === "utilidad"
          ) {
            value = onFormatCurrency((value).toFixed(2)); 
          } else if ( /** Valida campos de tipo de cambio */
            field === 'tipoCambio' ||
            field === 'tcCliente'
          ) {
            value = formatNumberExchangeRate(value);
          } else if ( /** Valida campo de monto */
            field === "montoUSD"
          ) {
            value = formatNumber(value);
          }
          filteredRow[field] = value;
      });
      return filteredRow;
    });

    const csvData = Papa.unparse(filteredDataFrame) 
    /** Agrega configuracion para que respeta la Acentos en el archivo a descargar */
    const bom = '\uFEFF';
    const csvWithBom = bom + csvData;
    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
    /**  Formate la Fecha en formato 2025-01-03 */
    const nowToday = new Date();
    const todayArg = nowToday.toISOString().split('T')[0];
    /** Formatear la hora en formato HH-MM-SS */
    const hours = nowToday.getHours().toString().padStart(2, '0');
    const minutes = nowToday.getMinutes().toString().padStart(2, '0');
    const seconds = nowToday.getSeconds().toString().padStart(2, '0');
    const timeArg = `${hours}-${minutes}-${seconds}`;

    const filename = `Deals_${todayArg}-${timeArg}.csv`;
    saveAs(blob, filename);

    setSelectedRows([]);
    setTempState([]);

    setTimeout(() => {
      setIsLoader(false);
    },2000)
  };

  /** Funcion para redireccionar al tablero de Deal-Deal y gaurda el id_Operaciones
  * que se selecciono el tablero de operacione (Row selecioando por el usuario)
  */
  const onRedirectDetailLeads = (idArg) => {
    if (idArg !== '' || idArg !== undefined) {
      saveIdDealToLocalStorage('idDeal', idArg);
      navigate('/detail-deal')
    }
  };

  /** variables y funcionalidad para truncar la longitud del nombre de usuario */
  const truncateLength = 15;
  const truncateLengthBeneficiary = 20;
  const truncateString = (str = '', length = '') => {
    if (str.length > length) {
      return str.substring(0, length) + '...';
    }
    return str;
  }

  /** Funcion que parcea la fecha que recibe dependiendo del tipo de
  * filtrado para realizar las operaciones correspondientes
  */
  const onFormatFecha = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); /** Mes en dos dígitos */
    const day = String(date.getDate()).padStart(2, '0'); /** Día en dos dígitos */
    return `${year}-${month}-${day}`;
  };

  /** Funcion para filtrar la data del tablero que viene del select de Rango de fecha 
  * y no viene de rango de fechas ya que esta esta en otra funcion esta funcion solo 
  * es valida para el select de Rango de Fecha 
  */
  const onFilterDeal = async (
    typeFilterArg,
    valueFilterArg = null,
  ) => {
      try {
        setIsLoader(true);
        let dataFilter = []
          if ( /** Filtra por rango de fecha Hoy */
            typeFilterArg === 'dateRanger' && 
            valueFilterArg === '1'
          ) {
            let dataDeals = await apiGetAllOperation();      
            let startDate = await onFormatFecha(new Date());
            const filtered = dataDeals.data.filter(op => 
              op.fechaInicio.split('T')[0] === startDate
            );
            /** Validacion si exiten datos con la fecha de hoy de no ser asi 
            * muestra mensaje informativo de lo contratio entra al Else 
            * y setea los valores a la variable global para carga la data en el tablero
            */
            if (filtered.length === 0) { 
              setIsEmptyDeals(true);
              setIsLoader(false);
            } else {
              dataFilter = filtered;
              setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
              setIsEmptyDeals(false);
              setIsLoader(false);
            }
          } else if (/** Filtra por rango de fecha Semana */
            typeFilterArg === 'dateRanger' && 
            valueFilterArg === '2') 
          { 
            let dataDeals = await apiGetAllOperation();
            const fechaInicio = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(fechaInicio.getDate() - 7)
            let startDate = await onFormatFecha(fechaInicio)
            let endDate = await onFormatFecha(sevenDaysAgo)
            
            let filtered = dataDeals.data.filter(item => {
              const itemDate = item.fechaInicio.split('T')[0];
              return itemDate >= endDate && itemDate <= startDate
            });

            dataFilter = filtered;
            setIsLoader(false);

            if (filtered.length === 0) { 
              setIsEmptyDeals(false);
            } else {
              setIsEmptyDeals(true);
              setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
            }
          } else if ( /** Filtra por rango de fecha Quincena */
            typeFilterArg === 'dateRanger' && 
            valueFilterArg === '3'
          ) {
            let dataDeals = await apiGetAllOperation();
            const fechaInicio = new Date();
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fechaInicio.getDate() - 14)
            let startDate = await onFormatFecha(fechaInicio)
            let endDate = await onFormatFecha(fourteenDaysAgo)

            let filtered = dataDeals.data.filter(item => {
              const itemDate = item.fechaInicio.split('T')[0];
              return itemDate >= endDate && itemDate <= startDate
            });

            dataFilter = filtered;
            setIsLoader(false);

            if (filtered.length === 0) { 
              setIsEmptyDeals(false);
              
            } else {
              setIsEmptyDeals(true);
              setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
            }
          } else if ( /** Filtrado por rango de fecha Mes */
            typeFilterArg === 'dateRanger' && 
            valueFilterArg === '4'
          ) {
            let dataDeals = await apiGetAllOperation();
            const fechaInicio = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(fechaInicio.getMonth() -1)
            let startDate = await onFormatFecha(fechaInicio);
            let endDate = await onFormatFecha(oneMonthAgo);
            let filtered = dataDeals.data.filter(item => {
              const itemDate = item.fechaInicio.split('T')[0];
              return itemDate >= endDate && itemDate <= startDate
            })

            dataFilter = filtered;
            setIsLoader(false);

            if (filtered.length === 0) { 
              setIsEmptyDeals(false);
              
            } else {
              setIsEmptyDeals(true);
              setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
            }
          } else if ( /** Filtra por Plataforma */
            typeFilterArg === 'platform' &&
            valueFilterArg !== ''
          ) {
            let filtered = dataDeals.filter(item => 
              item.platformName === valueFilterArg
            )

            dataFilter = filtered;
            setIsLoader(false);

            if (filtered.length === 0) { 
              setIsEmptyDeals(false); 
            } else {
              setIsEmptyDeals(true);
              setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
            }
          }  else if ( /** Filtra por campo de busqueda */
            typeFilterArg === 'searchTerm' &&
            (valueFilterArg !== '' || valueFilterArg !== undefined)
          ) {
            const queryLower = valueFilterArg.toString().toLowerCase();
            /** Filtrar el arreglo buscando coincidencias en los valores de cada objeto */
            let filtered = dataDeals.filter((item) => {
              /** Convertir cada valor del objeto a string y buscar coincidencias */
              return Object.values(item).some((value) =>
                value.toString().toLowerCase().includes(queryLower)
              );
            })
            dataFilter = filtered;
            setCurrentPage(1); /** despues de la busqueda la paginacion se va a la pagina 1 */
            setIsLoader(false)
          } else {
            return false
          };
          console.log('data Filter --> ',dataFilter)
        setDataDeals(dataFilter);
      } catch (error){
        setIsLoader(true);
        setTimeout(() => {
          setError400(false);
          setIsLoader(false);
          navigate('/login')
        },2000)
        throw error
      };
  };

  /** Variable que actualiza es estado del boton de BUSCAR POR FECHAS
  * y desactiva el select rango de fecha para evitar errores en la busqueda
  */
  const onToggleVisibility = () => {
    setIsVisbleFilterDateRanger((prevState) => !prevState);
  };

  /** Funcion que realizar la busqueda de Deal por Rango de Fechas
  * esta Funcion de activa con un boton de BUSCAR POR FECHAS:
  */
  const onFilterRangeDetail = async (
    valueDateStartArg,
    valueDateEndArg
  ) => {
    try {
      setIsLoader(true);
      const response = await onGetAllOperations();
      const filtered = response.data.filter(op => {
        const dateStar = new Date(op.fechaInicio).toISOString().split('T')[0];
        return dateStar >= valueDateStartArg && dateStar <= valueDateEndArg
      })
      setDataDeals(filtered);
      setIsLoader(false);

      if (filtered.length === 0) {;
        setIsEmptyDeals(false);
      } else {
        setIsEmptyDeals(true);
        setCurrentPage(1); /** despues de la busqueda la paginacion se va a 1 */
      }
      
    } catch (error) {
        setIsLoader(true);
        setTimeout(() => {
          setError400(false);
          setIsLoader(false);
          navigate('/login')
        },2000)
        throw error;
      };
  };

  /** Funcion para activivar el calendario para buscar por Fecha de pago
  * o Fecha Fin de un Deal
  */
  const onToggleVisibilityPayDate = () => {
    setIsVivisbleFilterPayDate((prevState) => !prevState)
  }

  /** Funcion que hace la busqueda por la Fecha Fin o la Fecha en la que
   * se tiene de pagar un Deal
   */
  const onPayDateFilter = async (valueArg) => {
    try {
      setIsLoader(true);
      const response = await onGetAllOperations();
      const payDateFilter = response.data.filter(op => {
        const datePayParse = new Date(op.fechaCierre).toISOString().split('T')[0];
        return datePayParse === valueArg
      });
      setDataDeals(payDateFilter);
      setIsLoader(false);

      if(payDateFilter.length === 0) {
        setIsEmptyDeals(false);
      } else {
        setIsEmptyDeals(true);
        setCurrentPage(1); /** despues de la busqueda la paginacion se va a 1 */
      }
    } catch (error) {
      setIsLoader(true);
        setTimeout(() => {
          setError400(false);
          setIsLoader(false);
          navigate('/login')
        },2000)
        throw error;
    }
  };
      
  /** Funcion para mostrar operaciones con 2 puntos decimales despues del punto a la derecha */
  const onFormatCurrency = (value) => {
    return (Number(value)/100).toLocaleString(
        'en-US', {minimumFractionDigits: 2, 
            maximumFractionDigits: 2
    })
  };

  /** Funicon que separa la cantidad del monto con comas respetando 
  * los decimales a la derecha del punto 
  */
  const formatNumber = (num) => {
    return num.toLocaleString(
      'en-US', 
      { minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
  };

  const formatStatus = (texto) => {
    // Verifica si el texto es "EnEjecucion"
    if (texto === "EnEjecucion") {
        return "En Ejecución";
    }
    // Si no es "EnEjecucion", devuelve el texto original
    return texto;
  }

  /** Funcion que agrega un singo de % cuando el alor ingresado es menor a 5.0
  * si es mayor a esta cantidad se agrega un singo de $ indiando que la mision de la
  * operacon fue por una comision directa
  */
  const formatCommission = (valor) => {
    /** Convertir a número por si viene como string */
    const num = parseFloat(valor);
    /** Verificar si es un número válido */
    if (isNaN(num)) {
      return valor; /** Retorna el valor original si no es un número */
    }
    /** Agregar $ o % según el valor */
    return num > 5.0 ? `$ ${formatNumber(valor)}` : `% ${valor}`;
  }

  /** Funcion que valida el tipo de cambio que si son 6 digitos completos
  * los separe de izquierda a derecha y qie despues de punto decimal 
  * agregue ceros si le hace falta pero como maximo 4 digitos despues del punto 
  */
  const formatNumberExchangeRate = (num) => {
    /** Convertir el número a cadena */
    let numeroStr = num.toString();
    /** Tomar los primeros 2 dígitos como parte entera */
    let parteEntera = numeroStr.slice(0, 2);
    /** Tomar los siguientes dígitos como parte decimal */
    /** Asegurar que la parte decimal tenga 4 dígitos, rellenando con ceros si es necesario */
    let parteDecimal = numeroStr.slice(2).padEnd(4, '0');
    /** Combinar las partes y devolver el resultado */
    return `${parteEntera}.${parteDecimal}`;
  }

  /** Componente Informativo que indica que no se tiene Deal Registrados el dia de hoy */
  const onMessagesInformativeDataEmpty = () => {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center border rounded-lg border-blue-700 h-96">
          <div className="rounded-full bg-blue-100 p-3 mb-2">
            <ClipboardList className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-2 pt-4">
            No hay operaciones registradas
          </h3>
          <p className="text-gray-500 text-center mb-8 w-full text-lg mt-2">
            No tienes operaciones registradas el día de hoy <br/>
            Registra una nueva operación para visualizarla en el tablero de Operaciones.
          </p>
          <Button 
            className="!bg-blue-600 hover:bg-blue-700 !text-white !text-lg"
            onClick={() => {
              navigate('/add-deal');
            }}  
          >
            Registrar nueva operación
          </Button>
        </CardContent>
      </Card>
    );
  };

  /** Componente Informativo que indica que los filtros seleccionados por el suaurio 
  * no arrogaron resultados y con este mensaje se le informa el estatus de busqueda
  */
  const onMessagesInformativeDataFilterEmpty = () => {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center border rounded-lg border-blue-700 h-96">
          <div className="mb-2 rounded-full bg-blue-100 p-3">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-3xl font-semibold text-gray-900">
            No se encontraron resultados
          </h3>
          <p className="mb-6 w-full text-gray-600 text-lg text-center">
            Con los filtros seleccionados no se obtuvieron resultados. <br/>
            Por favor, intente con otros criterios de búsqueda.
          </p>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2 !bg-blue-600 hover:bg-blue-700 !text-white !text-lg">
              <span
                onClick={() => {
                  onClearFilterDeal();
                }}
              >
                Limpiar filtros
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }; 

  /** Funcion que limpia los estados y boton de Buscar por fecha 
  * para empezar un flujo nuevo con los filtros 
  */
  const onClearFilterDeal = () => {
    const today = new Date().toISOString().split('T')[0]
    setIsLoader(true);
    setDateRange('1');
    setPlatform('0');
    setSearchTerm('');
    setIsVisbleFilterDateRanger(true);
    setIsVivisbleFilterPayDate(true); 
    setStartDate(today);
    setEndDate(today);
    setPayDate('');
    setTextFilter([]);
    onFilterDeal(
      'dateRanger',
      '1',
    );
  };

  /** Funcion para a abri Drawer de filtros */
  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && 
        (event.key === 'Tab' || 
          event.key === 'Shift')) 
    {
      return;
    }
    setOpenDrawer({ [anchor]: open });
  };

  /**Funcion que crea una lista que muestra el tipo de filtros
  * seleccionado por el usuario y motrar la cuando esta cumplas 
  * las validaciones correspondiente para su visualizacion
  */
  const onValidateFileFilter = () => {
    let typeFilter = []
    if (searchTerm !== initialStates.searchTerm) {
      typeFilter.push('Campos de busqueda');
    }
    if (dateRange !== initialStates.dateRange) {
      typeFilter.push('Rango de Fecha');
    }

    if (platform > initialStates.platform) {
      typeFilter.push('por Plataforma');
    }

    if (
      startDate !== initialStates.startDate || 
      endDate !== initialStates.endDate
    ) {
      typeFilter.push('por fecha registro Deal');
    }

    if (payDate !== initialStates.payDate) {
      typeFilter.push('por fecha de pago');
    }
    setTextFilter(typeFilter);
  };

  /** Ejecutar la validación cada vez que cambian los estados del filtro
  * para que se muestre el tipo de filtro seleccionado 
  */
  useEffect(() => {
    onValidateFileFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm, 
    dateRange, 
    platform, 
    startDate, 
    endDate, 
    payDate
  ]); /**Se ejecuta cuando estos de los filtros cambian
  * esto se hace para cargar el arreglo con el nombre del filtro seleccionado
  */

  /** UseEffect que mandar a llamar las fucniones y flujos correspondientes
  * para carga la data en el tablero de Operaciones
  */
  useEffect(() => {
    /** Validaion useRef para controlar las llamadas 
    * de los diferentes servicios que se necesitan para carga 
    * la data necesaria para la visualizacion de esta pantalla 
    * y que solo se ejecuten una vez estoy serivicio 
    * NOTA: eso se hace en Devp, pero ayuda mucho cuando este en
    * Prod el aplicativo SUMMA 
    */
    if (executedRef.current) return;
    executedRef.current = true;

    removeIdDealToLocalStorage('idDeal')
    onFilterDeal(
      'dateRanger',
      dateRange,
    );
    onGetlAllPlatform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <>
      {error400 ? <Error400 /> :
        isLoader ? <Loader /> :
        <>
          <div className="flex h-screen bg-white">
            <NavBar/>
            <div className='flex-1 overflow-y-auto'>
              <Head/>
              <div className="min-h-screen bg-gradient-to-br from-white-50 to-white-100 p-4">
                <Toaster />
                <Card className="h-auto mx-auto shadow-xl p-2">
                  <div className="pb-6 border-b border-gray-100">
                    <div className="flex flex-col sm:items-center sm:justify-between gap-4">
                      {/** Seccion donde se muestra botones */}
                      <div className='grid sm:grid-cols-1 md:grid-cols-1 gap-5 w-full pb-3'>
                        <h1 className="text-3xl font-bold text-gray-800">
                          Tablero Deal
                        </h1>
                      </div>

                      <div className='flex flex-row justify-between items-center w-full'>
                        <div className="flex-1">
                          {dataDeals.length !== 0 && (
                            <h3 className="text-left text-base font-bold text-gray-800">
                              Filtro por: {textFilter.join(", ")}
                            </h3>
                          )}
                        </div>
                        <div className='flex gap-4'>
                          {displayDeals.length > 0 && (
                            <>
                              <div  className="flex gap-4">
                                <Button
                                  className={`${displayDeals.length ? 'w-60' : 'w-52'} h-9 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300`}
                                  onClick={() => {
                                      handleSelectAllToggle()
                                  }}
                                >
                                  {selectedRows.length === displayDeals.length
                                      ? <SquareX  className="mr-2 h-5 w-5" />
                                      : <CopyCheck  className="mr-2 h-5 w-5" />
                                  }
                                  {selectedRows.length === displayDeals.length
                                      ? "Deseleccionar todos"
                                      : "Seleccionar todos"
                                  }
                                </Button>

                                <Button
                                  className="w-40 h-9 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                                  onClick={() => { 
                                    if (selectedRows.length === 0 && tempState.length === 0) {
                                      toast.error("No has seleccionado algun Deal \n Favor se seleccionar uno", {
                                        position: 'top-right',
                                      });
                                    } else {
                                      if (selectedRows.length === tempState.length) {
                                        setIsLoader(true);
                                        exportToCSV(tempState);
                                      }  
                                    }                       
                                  }}
                                >
                                  <Download className="mr-2 h-5 w-5" /> 
                                  Descargar
                                </Button>
                              </div>
                            </>
                          )}
                          <Tooltip title='Limpiar Filtros'> 
                            <Button
                              className='w-10 h-9 bg-gradient-to-r !border-2 !border-solid !border-blue-500 !text-blue-500'
                              onClick={() => {
                                onClearFilterDeal();
                              }}
                            >
                              <span className='icon-clear-filter'>
                                <Paintbrush/>
                              </span>
                            </Button>
                          </Tooltip>
                          <Button 
                            variant="outline" 
                            className="h-9 w-44 bg-gradient-to-r !border-2 !border-solid !border-blue-500 !text-blue-500"
                            key={'right'} 
                            onClick={toggleDrawer('right', true)}
                          >
                            <FilterIcon className="mr-2 h-4 w-4" /> 
                            Filtrar datos
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {['right'].map((anchor) => (
                    <Drawer
                      key={'right'}
                      anchor={'right'}
                      open={openDrawerFilter[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                      sx={{
                        '& .MuiDrawer-paper': {
                            width: 450, // Cambia este valor al ancho que desees
                        },
                      }}
                    >
                      <Box
                        role="presentation"
                      >
                        <div className="grid gap-4 py-4 p-4">
                          <div className="relative space-y-2 grid grid-cols-2 gap-4">
                            <InputLabel className="!text-xl mt-2 !font-bold">
                              Filtros
                            </InputLabel>
                            <SquareX onClick={toggleDrawer('right', false)} 
                              className="cursor-pointer text-gray-500 hover:text-gray-700 absolute right-0 top-0" 
                            />
                          </div>
                          <div className="space-y-2 pt-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                type="text"
                                placeholder="Buscar ..."
                                value={searchTerm}
                                disabled={isEmptyArrayDeals}
                                onChange={(e) => {
                                  if (dataFilterDateRanger) {
                                    setSearchTerm(e.target.value)
                                    onFilterDeal(
                                      'searchTerm',
                                      e.target.value
                                    )
                                  } else {
                                    setSearchTerm(e.target.value)
                                    onFilterDeal(
                                      'searchTerm',
                                      e.target.value
                                    )
                                    setDateRange('1');
                                    setSearchTerm('');
                                  }
                                }}
                                onBlur={(e) => {
                                  if (dataFilterDateRanger) {
                                    setSearchTerm(e.target.value)
                                    onFilterDeal(
                                      'searchTerm',
                                      e.target.value
                                    )
                                    if (e.target.value === '') {
                                      onFilterRangeDetail(
                                        startDate,
                                        endDate
                                      );
                                    }
                                  } else {
                                    setSearchTerm(e.target.value)
                                    onFilterDeal(
                                      'searchTerm',
                                      e.target.value
                                    )
                                    if (e.target.value === '') {
                                      setIsLoader(true);
                                      setDateRange('1');
                                      setPlatform('0');
                                      onFilterDeal(
                                        'dateRanger',
                                        '1',
                                      );
                                    }
                                  }
                                }}
                                className="w-full h-11 pl-9 pr-4 py-2 border border-b-4 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 "
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <InputLabel>
                              Rango de fecha
                            </InputLabel>
                            <select 
                              className="w-full h-11 p-2 mb-6 text-sm border rounded-lg  border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                              placeholder=''
                              disabled={
                                isVisbleFilterDateRanger 
                                  ? false 
                                  : true
                              }
                              value={dateRange}
                              onChange={(e) => {
                                setDateRange(e.target.value);
                                onFilterDeal(
                                  'dateRanger',
                                  e.target.value
                                )
                                setOpenDrawer({ right: false });                            
                              }}
                            >
                              {/* <option selected>Choose a country</option> */}
                              <option key="1" value="1">Hoy</option>
                              <option key="2" value="2">Semanal</option>
                              <option key="3" value="3">Quincenal</option>
                              <option key="4" value="4">Mensual</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <InputLabel>
                              Plataforma
                            </InputLabel>
                            <select 
                              className="w-full h-11 p-2 mb-6 text-sm border rounded-lg  border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                              placeholder=''
                              value={platform}
                              disabled={
                                dataDeals.length > 0
                                  ? false
                                  : true
                              }
                              onChange={(e) => {
                                console.log('se selecciono plataforma --->',e.target.value)
                                setPlatform(e.target.value);
                                onFilterDeal(
                                  'platform',
                                  e.target.value
                                );
                                setOpenDrawer({ right: false });
                              }}
                            >
                              {/* <option selected>Choose a platform</option> */}
                              {Array.isArray(dataPlatform) &&
                                dataPlatform.map((item) => {
                                  return (
                                    <option
                                      key={item.id_BankingPlatform}
                                      value={item.platformName}
                                    >
                                      {item.platformName}
                                    </option>
                                  )
                                })
                              };
                            </select>
                          </div>

                          <div className="w-full border-t border-blue-600"></div>

                          <Button 
                            className='h-9 !mt-2 bg-gradient-to-r !text-white from-blue-600 to-blue-800'
                            disabled={!isVisibleFilterPayDate}
                            onClick={() => {
                              onToggleVisibility();
                              if (!isVisbleFilterDateRanger) {
                                const today = new Date().toISOString().split('T')[0]
                                setPlatform('0');
                                setStartDate(today);
                                setEndDate(today);
                                setSearchTerm('');
                                onFilterDeal(
                                  'dateRanger',
                                  '1',
                                );
                              }
                            }}
                          >
                            Buscar por fechas
                          </Button>

                          <div className="space-y-2">
                            <div className="relative">
                              <InputLabel>
                                Fecha Inicio
                              </InputLabel>
                              <Input
                                id="startDate"
                                type='date'
                                placeholder="Ejemplo: 25/11/2024"
                                className="w-full h-11 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                value={startDate}
                                disabled={isVisbleFilterDateRanger}
                                onChange={(e) => {
                                  const today = new Date().toISOString().split('T')[0]
                                  if (e.target.value <= today) {
                                    setStartDate(e.target.value);
                                    onFilterRangeDetail(
                                      e.target.value,
                                      endDate
                                    );
                                  } else {
                                    setStartDate(today);
                                  }
                                  setOpenDrawer({ right: false });
                                }}
                              />
                                <div className="absolute left-3 -mt-10 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="relative">
                              <InputLabel>
                                Fecha Fin
                              </InputLabel>
                              <Input
                                id="endDate"
                                type='date'
                                placeholder="Ejemplo: 28/11/2024"
                                className="w-full h-11 pl-11 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                value={endDate}
                                disabled={isVisbleFilterDateRanger}
                                onChange={(e) => {
                                  const today = new Date().toISOString().split('T')[0]
                                  if (e.target.value <= today) {
                                    setEndDate(e.target.value)
                                    onFilterRangeDetail(
                                      startDate,
                                      e.target.value
                                    );
                                  } else {
                                    setEndDate(today)
                                  }
                                  setOpenDrawer({ right: false });
                                }}
                              />
                                <div className="absolute left-3 -mt-10 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                          </div>

                          <div className="w-full border-t border-blue-600"></div>
                          <Button 
                            className='h-9 !mt-2 bg-gradient-to-r !text-white from-blue-600 to-blue-800'
                            disabled={!isVisbleFilterDateRanger}
                            onClick={() => {
                              onToggleVisibilityPayDate();
                              if (!isVisibleFilterPayDate) {
                                const today = new Date().toISOString().split('T')[0]
                                setPlatform('0');
                                setStartDate(today);
                                setEndDate(today);
                                setSearchTerm('');
                                onFilterDeal(
                                  'dateRanger',
                                  '1',
                                );
                              }
                            }}
                          >
                            Buscar por fecha de pago
                          </Button>

                          <div className="space-y-2">
                            <div className="relative">
                              <InputLabel>
                                Fecha Pago
                              </InputLabel>
                              <Input
                                id="payDate"
                                type={isVisibleFilterPayDate ? "text" : "date"}
                                placeholder={`${new Date().toISOString().split('T')[0].split('-').reverse().join('/')}`}
                                className="w-full h-11 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                value={payDate}
                                disabled={isVisibleFilterPayDate}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setPayDate(value);
                                  onPayDateFilter(value);
                                  setOpenDrawer({ right: false });
                                }}
                              />
                                <div className="absolute left-3 -mt-10 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Drawer>
                  ))}

                  {/* // seccion donde se muestra el tablero */}
                  <div className="overflow-x-auto">
                    {dataDeals.length === 0 ? 
                      (isEmptyArrayDeals ? onMessagesInformativeDataEmpty()
                        :  onMessagesInformativeDataFilterEmpty())
                        : <>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                {headerTable.map((header) => (
                                  <th key={header.id} 
                                    className="px-8 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ minWidth: header.minWidth}}
                                  >
                                    <div className="flex items-center gap-1">
                                      {header.label}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Array.isArray(displayDeals) && 
                                displayDeals.map((user, index) => (
                                  <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    // className="hover:bg-blue-50/50 transition-colors"
                                    className={`hover:bg-blue-50/50 transition-colors ${
                                      selectedRows.includes(user.id_Operaciones) ? "bg-blue-100" : ""
                                    }`}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <input
                                        type="checkBox"
                                        checked={selectedRows.includes(user.id_Operaciones)}
                                        onChange={() => handleRowSelection(user.id_Operaciones, user)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.deal 
                                        ? user.deal 
                                        : 'En proceso...'
                                      }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatStatus(user.descriptionStatus)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.fechaInicio.split('T')[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.fechaCierre.split('T')[0]}
                                    </td>
                                    <td className="flex px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <div className='w-full flex items-center justify-between'>
                                        <div className='text-left'>
                                          <Tooltip title={user.nombreCliente}
                                            componentsProps={{
                                              tooltip: {
                                                sx: {
                                                  bgcolor: 'grey.900',
                                                  borderRadius: 1,
                                                  fontSize: '0.875rem',
                                                  whiteSpace: 'nowrap',
                                                  maxWidth: 'none',
                                                },
                                              },
                                            }}
                                          >
                                            <span>
                                              {truncateString(
                                                user.nombreCliente, 
                                                truncateLength
                                              )}
                                            </span>
                                          </Tooltip>
                                        </div>
                                        <div className='text-right'>
                                          <Button 
                                            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                            onClick={() => {
                                              onRedirectDetailLeads(user.id_Operaciones)
                                            }}
                                          >
                                            <Eye className="w-4 h-4 text-blue-600" />
                                          </Button>  
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <Tooltip
                                        title={user.beneficiario}
                                        componentsProps={{
                                          tooltip: {
                                            sx: {
                                              bgcolor: 'grey.900',
                                              borderRadius: 1,
                                              fontSize: '0.875rem',
                                              whiteSpace: 'nowrap',
                                              maxWidth: 'none',
                                            },
                                          },
                                        }}
                                      >
                                        <span>
                                          {truncateString(
                                            user.beneficiario, 
                                            truncateLengthBeneficiary
                                          )}
                                        </span>
                                      </Tooltip>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`${user.descriptionCurrency} ${formatNumber(user.montoUSD)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${formatNumberExchangeRate(user.tipoCambio)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${formatNumberExchangeRate(user.tcCliente)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`${formatCommission(user.comision_Porcentaje)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.montoMXN)}`}
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                      {`$ ${user.comision_Por_Envio_Ahorro}`}
                                    </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.platformName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.mto_CTE_TC)}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.casque)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.comision_Dolar)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.dep_Cliente)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {`$ ${onFormatCurrency(user.utilidad)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {user.promotor}
                                    </td>
                                  </motion.tr>
                              ))}
                            </tbody>
                          </table>
                          </>
                    }
                  </div>
                  {/* // seccion donde va el paginador del tablero */}
                  {/* isEmptyArrayDeals */}
                  {dataDeals.length !== 0 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Mostrando {(currentPage - 1) * rowsPerPage + 1} -
                          {Math.min(currentPage * rowsPerPage, totalRecords)} de {totalRecords} resultados
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {(() => {
                              const maxVisiblePages = 10;
                              let startPage, endPage;
                              
                              if (totalPages <= maxVisiblePages) {
                                // Mostrar todas las páginas
                                startPage = 1;
                                endPage = totalPages;
                              } else {
                                // Calcular el rango de páginas visibles
                                const half = Math.floor(maxVisiblePages / 2);
                                
                                if (currentPage <= half) {
                                  startPage = 1;
                                  endPage = maxVisiblePages;
                                } else if (currentPage + half >= totalPages) {
                                  startPage = totalPages - maxVisiblePages + 1;
                                  endPage = totalPages;
                                } else {
                                  startPage = currentPage - half;
                                  endPage = currentPage + half - (maxVisiblePages % 2 === 0 ? 1 : 0);
                                }
                              }
                              
                              return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                                <button
                                  key={page}
                                  className={`px-3 py-1 rounded-lg transition-colors ${
                                    currentPage === page
                                      ? "bg-blue-600 text-white"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              ));
                            })()}
                          </div>
                          
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>  
              <Footer />
            </div>
          </div>  
        </>
      }
    </>
  )
}

export default Operaciones;
