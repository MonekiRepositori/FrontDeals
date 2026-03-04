import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Footer from '../footer/footer';
import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';

import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import { motion } from "framer-motion";

/** Liberias para descarga Deals en formato CSV */
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import { toast, Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from '@mui/material/Tooltip';

import {
    Download,
    SquareX,
    CopyCheck ,
    ChevronRight,
    ChevronLeft,
    Eye,
} from "lucide-react"

import {
    apiGetAllOperationCanceled,
    apiGetCatalogCurrencies,
    apiGetPlatform,
} from '../../apis/services';

import {
  saveIdDealToLocalStorage,
  removeIdDealToLocalStorage,
} from '../../apis/localStorage';


const OperacionesCanceled = () => {

    const executedRef = useRef(false);

    let navigate = useNavigate();

    /** estado de loader */
    const [isLoader, setIsLoader] = useState(true);
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
            label: "Fecha Iinicio", 
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
            id: 'sponsor',
            label: "Promotor", 
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
        }
    ];

    /** Estado que guarda la data del tablero de las operaciones canceladas */
    const [
        dataDealsCalceled, 
        setDataDealsCanceled
    ] = useState([]);

    /** Estado para pagina del tablero 
     * NOTA se elimino **setRowsPerPage** para evirar error de 
     * variable sin utilizar si despues se necesita cambiar este valor
     * en un select se necesita acupar esta varible en un futuro
     */
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10);

    /** Estado para guardar las filas seleccionadas */
    const [selectedRows, setSelectedRows] = useState([]);

    /** Estado que almacena de manera temporal los seleccionados
     * que se descartan despues que se seleccionaro y se deseleccionaron 
     */
    const [tempState, setTempState] = useState([]);

    /** Funcion que manda a llamar el api de cancelados
    * y so setea a su estado 
    */
    const onGetAllOperationsCanceled = async () => {
        try {
            const response = await apiGetAllOperationCanceled();
            /**Se manda a llamar los catalogos de tipo de divisa y plataforma
             * para mapear el id que se regresa en cada deal y asi poder regresar 
             * la descripcion de cada catalogo
             */
            const responseCurrency = await apiGetCatalogCurrencies();
            const responsePlatform = await apiGetPlatform();

            /**Se valida que los llamada api tenga dato y no vengan null o vacios */
            if (response && 
                responseCurrency && 
                responsePlatform 
            ) {
                /**Se mapea el id de cada deal para estrar la descripcion de cada catalogo */
                const operacionesCanceled = response.data.map(op => {
                    const divisa = responseCurrency.data.find(d => 
                        d.id_Divisas === op.id_Divisas
                    );
                    const platform = responsePlatform.data.find(p => 
                        p.id_BankingPlatform === op.id_Plataforma
                    );
                    /**Se crea agrega la descripcion de cada id mapeado
                     * desde su respectivos catalogos tipo divisas y plataforma
                     */
                    return {
                        ...op,
                        descripcionDivisa: divisa ? divisa.description : 'Sin Divisa',
                        platformName: platform ? platform.platformName : 'Sin Plataforma'
                    };
                });
                /**Seteea data mapeada al estado donde se guardar todo los deal Cancelados */
                setDataDealsCanceled(operacionesCanceled);
                setIsLoader(false);
            }
        } catch (error) {
            setError400(true);
                setTimeout(() => {
                    navigate('/login');
                    setIsLoader(false);
            },2000);
            throw error;
        }
    };

    /** Funcion para redireccionar al tablero de Deal-Deal y gaurda el id_Operaciones
    * que se selecciono el tablero de operacione (Row selecioando por el usuario)
    */
    const onRedirectDetailLeads = (idArg) => {
        if (idArg !== '' || idArg !== undefined) {
            saveIdDealToLocalStorage('idDeal', idArg);
            navigate('/detail-deal-canceled')
        }
    };

    /** Constante para crear paginacion con result de data */
    const totalRecords = dataDealsCalceled.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage)

    /** Funcion para cambiar de pagina del tablero */
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    /** Funcion que actuliza la data que se muestra en el tablero */
    const displayDealsCanceled = dataDealsCalceled.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

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
    
        const filename = `Deals_Cancelados_${todayArg}-${timeArg}.csv`;
        saveAs(blob, filename);
    
        setSelectedRows([]);
        setTempState([]);
    
        setTimeout(() => {
          setIsLoader(false);
        },2000)
    };

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
        const allIds = dataDealsCalceled.map(user => user.id_Operaciones);
        if (selectedRows.length === dataDealsCalceled.length) {
            // Deseleccionar todos
            setSelectedRows([]);
            setTempState([]);
        } else {
            // Seleccionar todos
            const allData = [...dataDealsCalceled];
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

    /** variables y funcionalidad para truncar la longitud del nombre de usuario */
    const truncateLength = 15;
    const truncateLengthBeneficiary = 20;
    const truncateString = (str = '', length = '') => {
        if (str.length > length) {
            return str.substring(0, length) + '...';
        }
        return str; 
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
    };

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
    };

    /** Funcion para mostrar operaciones con 2 puntos decimales despues del punto a la derecha */
    const onFormatCurrency = (value) => {
        return (Number(value)/100).toLocaleString(
            'en-US', {minimumFractionDigits: 2, 
                maximumFractionDigits: 2
        });
    };

    /** UseEffect que mandar a llamar las fucniones y flujos correspondientes
    * para carga la data en el tablero de Operaciones Canceladas
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
        onGetAllOperationsCanceled();
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
                                    <div className="flex items-center justify-between mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            Tablero Deals Cancelados 
                                        </h1>
                                        <div className='pr-4'>
                                            {dataDealsCalceled.length > 0 && (
                                                <>
                                                    <div  className="flex gap-4">
                                                        <Button
                                                            className={`${displayDealsCanceled.length ? 'w-60' : 'w-52'} h-9 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300`}
                                                            onClick={() => {
                                                                handleSelectAllToggle()
                                                            }}
                                                        >
                                                            {selectedRows.length === displayDealsCanceled.length
                                                                ? <SquareX  className="mr-2 h-5 w-5" />
                                                                : <CopyCheck  className="mr-2 h-5 w-5" />
                                                            }
                                                            {selectedRows.length === displayDealsCanceled.length
                                                                ? "Deseleccionar todos"
                                                                : "Seleccionar todos"
                                                            }
                                                        </Button>

                                                        <Button
                                                            className="w-40 h-9 bg-gradient-to-r !text-white from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 transition-all duration-300"
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
                                        </div>
                                    </div>
                                
                                    <CardContent className="p-6">
                                        <div className="overflow-x-auto">
                                            {dataDealsCalceled.length > 0 && (
                                                <>
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
                                                            {Array.isArray(displayDealsCanceled) &&
                                                                displayDealsCanceled.map((user, index) => 
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
                                                                        {user.estatusDescripcion}
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
                                                                            {`${user.descripcionDivisa} ${formatNumber(user.montoUSD)}`}
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
                                                                            {user.promotor}
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
                                                                            {`$ ${onFormatCurrency(user.mto_CTE_TC)}`}
                                                                        </td>
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
                                                                </motion.tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </> 
                                            )}
                                        </div>
                                    </CardContent>

                                    {displayDealsCanceled.length !== 0 && (
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
    );
}

export default OperacionesCanceled;
