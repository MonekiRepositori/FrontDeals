import React, { useEffect, useState, useRef } from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Footer from '../footer/footer';
import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';
import { useNavigate } from 'react-router-dom';

import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import {
    readToLocalStorage,
    readIdDealToLocalStorage,
    removeIdDealToLocalStorage,
} from '../../apis/localStorage'; 


import {
    apiGetAllStatusOperation,
    apiGetAllStatusTicket,
    apiGetOperationById,
    apiGetTicketById,
} from '../../apis/services';

import { 
    BarChart, 
    Bar, 
    PieChart,
    Pie,
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
  } from 'recharts'

import { 
    Eye, 
    EyeOff, 
    Trash2, 
    Download, 
    ArrowLeft, 
    TrendingUp, 
    DollarSign, 
    PieChart as PieChartIcon, 
    Activity,
    FileText,
    X,
    AlertCircle, 
    Plus,
    TicketIcon,
    SquareX,
    CalendarIcon,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileWarning,
    Edit,
} from 'lucide-react';


import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import TextareaAutosize from "@mui/material/TextareaAutosize"

const DetailDealCanceled = () => {

    /** Estado que contral la llama a los diferentes servicios 
    * esto se agrego para que solo se haga una llamada y evitar errores
    * de renderizado
    */
    const executedRef = useRef(false);

    /** Varibale donde se guardar la ruta para navegar entre pantallas */
    let navigate = useNavigate();

    /** estado de loader */
    const [isLoader, setIsLoader] = useState(true);
    const [error400, setError400] = useState(false);

    /** Estado que muestra la data de la operación y despues se ocapa */
    const [showInfo, setShowInfo] = useState(true)

    const [deal, setDeal] = useState('');
    /** Estado donde que settea la data del detalle del Del */
    const [dataDetailOperatio, setDetailOperation] = useState({});

    /** Estado que guarda la data de la grafica */
    const [chartData, setChartData] = useState([]);

    const [pieData, setPieData] = useState([])

    /** Estado que guarda el tipo de Usuario registrado 
    * y asi poder validar que componentes y funcionalidades
    * puede realizar segun el tipo de Usuario Logeado
    */
    const [idRegister ,setIdRegister] = useState('');
    
    /** Estado que guarda la data de archivo PDF que esta en Base64, que viene en el detalle del Deal */
    const [infoFilePDF, setInfoFilePDF] = useState(null);
    /** Eestado que guarda la data de archivo PDF FED que esta en Base64, que viene en el detalle del Deal */
    const [infoFilePDFFed, setInfoFilePDFFed] = useState(null);
    /** Estados que controlan el modal para ver un PDF que viene desde el Detail de un Deal */
    const [openModalPDFDetail, setOpenModalPDFDetail] = useState(false);
    const handleOpenModalPDFDetail = () => setOpenModalPDFDetail(true);
    const handleCloseModalPDFDetail = () => setOpenModalPDFDetail(false);
    /** Estados que controlan el modal para ver un PDF que viene desde el Detail de un Deal */
    const [openModalPDFFedDetail, setOpenModalPDFFedDetail] = useState(false);
    const handleOpenModalPDFedDetail = () => setOpenModalPDFFedDetail(true);
    const handleCloseModalPDFFedDetail = () => setOpenModalPDFFedDetail(false);

    /** Estado que alamacena el llamado a la API de estatus de operaciones
    * para modificar es estatus del Deal que se este revisando 
    */
    const [dataStatusOperation, setDataStatusOperation] = useState([]);

    /** Estado que almacena la data del usuario cuando este mismo 
    * agrega y/o actualiza un ticket ademas de agregar comentarios
    * a dicho ticket
    */
    const [dataUser, setDataUser] = useState({})

    const [dataUserTicket, setDataUserTicket] = useState('');

    /** Estado que alamacena el catalogo de estatus de un ticket
    * para poder actualizar lo y seguir con el flujo de trabajo 
    * segun las reglas de negocio
    */
    const [dataStatusTicket, setDataStatusTicket] = useState([]);

    /** Esatdo que alamcena la data de un ticket 
    * despues de validar que en el servicio onGetOperationById
    * exista un id_Ticket para asi poder consumir el servicio que 
    * carga los datos de un ticket
    */
    const [dataTicket, setDataTicket] = useState([]);

    /** Estados que controlan la vista del modal donde Agrega y Edita
    * la informacion de unTicket 
    */
    const [isOpenModalAddTicket, setIsOpenModalAddTicket] = useState(false);
    const handleOpenModalAddTicket = () => setIsOpenModalAddTicket(true);
    const handleCloseModalAddTicket = () => setIsOpenModalAddTicket(false);

    /** Estados que controlan la vista del modal donde se visualizan
    * los comentarios agregados a un ticket
    */
    const [isOpenModalAddComment, setIsOpenModalAddComment] = useState(false);
    const handleOpenModalAddComment = () => setIsOpenModalAddComment(true);
    const handleCloseModalAddComment = () => setIsOpenModalAddComment(false);

    /** Funcion que manda a llamar el api de GetById del Deal para mostrar el detalle del mismo
    * para poder actulizar el Deal y subir los PDF para poder tener un Deal completo 
    */
    const onGetOperationById = async (idArg) => {
        try {
            const response = await apiGetOperationById(idArg);
            const dataGetById = response.data
            setDetailOperation(dataGetById);

            const pdfDeal = dataGetById.document_Deal_PDF
            if (pdfDeal && 
                (pdfDeal !== null || 
                    pdfDeal !== 'null') 
            ) {
                let filePDFBase64 = pdfDeal
                setInfoFilePDF(filePDFBase64);
                await onApiGetStatusOperation();
            }

            const pdfFED = dataGetById.documento_PDF_FED;
            if (pdfFED && 
                (pdfFED !== null || 
                    pdfFED !== 'null')
            ) {
                let filePDFFedBase64 = pdfFED
                setInfoFilePDFFed(filePDFFedBase64);
            }
            
            if (dataGetById.fechaInicio && 
                dataGetById.utilidad !== undefined
            ) {
                setChartData([{
                    date: dataGetById.fechaInicio.split('T')[0], 
                    pesos: dataGetById.utilidad
                }]);
            }

            if (dataGetById.montoMXN !== undefined &&
                dataGetById.montoUSD !== undefined
            ) {
                setPieData([
                    { name: 'MXN', value: dataGetById.montoMXN },
                    { name: 'USD', value: dataGetById.montoUSD }
                ]);
            }

            const userData = readToLocalStorage('user');
            if (userData ) {
                setDataUser(userData);
            }

            if (dataGetById.id_Ticket && 
                (dataGetById.id_Ticket !== null && 
                    dataGetById.id_Ticket !== 'null')
            ) {
                const idTicketArg = dataGetById.id_Ticket
                await onApiGetStatusTicket();
                await onGetTicketById(idTicketArg);

            } 
            setIsLoader(false);
        } catch (error) {
            console.error('error al ejecutar getByIDTicket pantalla => ',error)
            setError400(true);
            setTimeout(() => {
                navigate('/operations-canceled')
            },2000)
            throw error;
        }
    };

    /** Funcion que carga el catalogo del Estatus de un Ticket 
    * para agregar y editar el Estatus de un Ticket
    */
    const onApiGetStatusTicket = async () => {
        try {
            const response = await apiGetAllStatusTicket();
            const newValue = {
                id_EstatusTicket: "",
                description: 'Selecciona Estatus Ticket'
            }
            response.data.unshift(newValue);
            if (response) {
                setDataStatusTicket(response.data);
            }
        } catch (error) {
            console.error('error catalogo StatusTicket => ',error);
            setError400(true);
            setTimeout(() => {
                navigate('/operations-canceled')
            },2000)
            throw error;
        }
    };

    /** Funcion que manda a traer el detalle de un Ticket asignado al 
    * Detalle de una de una Operacion y/o Deal 
    * esta se ejecuta despues de la validacion si el Detalle de la operacion 
    * tiene ya un Ticket asignado
    */
    const onGetTicketById = async (idArg) => {
        try {
            const response = await apiGetTicketById(idArg);
            if (
                Object.keys(response.data).length !== 0
            ) {
                setDataTicket(response.data);   
                setDataUserTicket(getInitials(response.data.nameUserTicket));
            }
            
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/detail-deal');
            },2000)
            throw error;
        }
    };

    /** Funcion que hace el llamdo al API de Estatus de una operacion 
    * para que el usuario puede actualizar el estatus de una operacion 
    * para los procesos que sean necesarios
    */
    const onApiGetStatusOperation = async () => {
        try {
            const response = await apiGetAllStatusOperation();
            const newValue = {
                id_EstatusOperacion: "",
                description: 'Selecciona Estatus Operación'
                }
                response.data.unshift(newValue);
            if(response){
                setDataStatusOperation(response.data);
            }
        } catch (error) {
            console.error('error catalogo StatusOperation => ',error);
            setError400(true);
            setTimeout(() => {
                navigate('/operations')
            },2000)
            throw error;
        }
    };

    /** Componente Modal que muestra una vista de docuemnto PDF 
    * que viene desde la base en el detale del Deal
    */
    const onModalViewPDFDetail = () => {
        return (
            <Dialog
                open={openModalPDFDetail}
                handler={handleOpenModalPDFDetail}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Documento PDF Detail:
                        </DialogTitle>
                        <X onClick={handleCloseModalPDFDetail} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <iframe 
                                src={`data:application/pdf;base64,${infoFilePDF}`}
                                width='100%'
                                height='500px'
                                title='Vista previa del PDF'
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleCloseModalPDFDetail();
                                }}
                                className="!bg-blue-50 hover:!bg-blue-100 !text-blue-700 font-bold py-2 px-4"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>    
        );
    };

    /** Componente Modal que muestra una vista de docuemnto PDF FED
    * que viene desde la base en el detale del Deal
    */
    const onModalViewPDFFedDetail = () => {
        return (
            <Dialog
                open={openModalPDFFedDetail}
                handler={handleOpenModalPDFedDetail}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Documento PDF FEd Detail:
                        </DialogTitle>
                        <X 
                            onClick={handleCloseModalPDFFedDetail} 
                            className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" 
                        />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <iframe 
                                src={`data:application/pdf;base64,${infoFilePDFFed}`}
                                width='100%'
                                height='500px'
                                title='Vista previa del PDF'
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleCloseModalPDFFedDetail();
                                }}
                                className="!bg-blue-50 hover:!bg-blue-100 !text-blue-700 font-bold py-2 px-4"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>    
        );
    };

    /** Funcion que muestras mensaje informativo cuando un 
    * el detalle de un deal no tiene un ticket creado
    */
    const onMessageInformativoEmptyTicket = () => {
        return (
            <div className="w-full bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-amber-800">
                            Operación sin ticket
                        </h3>
                        <div className="mt-2 text-base text-amber-700">
                            <p>
                                No se ha encontrado ningún ticket asociado a esta operación. 
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /** Es componente Modal Agrega y Editar un Ticket que se asigna a una operacion
    * solo se puede agregar un Ticket por operacion **NO** se puede agregar mas de un Ticket
    * a una operacion y o Deal
    */
    const onDetailTikcetCanceled = () => {
        return (
            <Dialog 
                open={isOpenModalAddTicket} 
                handler={handleOpenModalAddTicket}
            >
                <DialogContent className="sm:max-w-[550px] overflow-hidden bg-white !p-0">
                    <div className="bg-blue-700 p-4 text-white relative shadow-xl h-28">
                        <SquareX 
                            onClick={handleCloseModalAddTicket} 
                            className="cursor-pointer text-white hover:text-gray-300 absolute right-4 top-4" // Cambiado: mejor posicionamiento
                        />
                        <DialogTitle className="text-xl !font-bold">
                            <p>Detalle del Ticket</p>
                        </DialogTitle>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <TicketIcon className="h-4 w-4 mr-2 text-blue-600" />
                                <InputLabel htmlFor="comentario">
                                    Descripción
                                </InputLabel>
                            </div>
                            <div className="border border-gray-300 rounded-md p-1">
                                <TextareaAutosize
                                    id="comentario"
                                    value={dataTicket.descripcion }
                                    disabled={true}
                                    placeholder="Describa el problema o solicitud"
                                    className="w-full resize-none rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 p-3"
                                    minRows={3}
                                />
                            </div>
                        </div>
                        {/* Seccion de fecha de creacion y ciere de ticket */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-6">
                            <div className="">
                                <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                                    <InputLabel htmlFor="comentario" className='!text-sm'>
                                        Fecha de creación
                                    </InputLabel>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="fecha-inico"
                                        type="date"
                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                        value={dataTicket?.createdDate 
                                            ? dataTicket.createdDate.split('T')[0] 
                                            : new Date().toISOString().split('T')[0]
                                        }
                                        disabled={true}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                </div>
                            </div>

                            <div className="">
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    <InputLabel htmlFor="comentario" className='!text-sm'>
                                        Fecha de Cierre
                                    </InputLabel>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="fecha-inico"
                                        type="date"
                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                        disabled={true}
                                        value={dataTicket?.closedDate
                                            ? dataTicket.closedDate.split('T')[0]
                                            : new Date().toISOString().split('T')[0]
                                        }
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                </div> 
                            </div>
                        </div>
                        {/* Seccion de estatus de tikect y suario asignado a ticket */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="pt-2">
                                <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                    Estatus
                                </div>
                                <select 
                                    className="w-full h-10 p-2 mb-6 text-sm border rounded-lg  border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                                    placeholder=''
                                    disabled={true}
                                    value={dataTicket.ticketStatusId}
                                >
                                    {/* <option selected>Choose a Status Ticket</option> */}
                                    {Array.isArray(dataStatusTicket) &&
                                        dataStatusTicket.map((item) => {
                                            return (
                                                <option
                                                    key={item.id_StatusTicket}
                                                    value={item.id_StatusTicket}
                                                >
                                                    {item.description}
                                                </option>
                                            )
                                    })}
                                </select>
                            </div>

                            <div className="">
                                <div className="text-sm flex items-center mb-2">
                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-semibold mr-2">
                                        {Object.keys(dataUser).length > 0 && (
                                            dataUser.firstName.charAt(0) + dataUser.lastNamePaternal.charAt(0)
                                        )}                      
                                    </div>
                                    <span className="font-medium">
                                        Usuario Actual
                                    </span>
                                </div>

                                <div className="flex items-center p-2 border rounded-md bg-gray-50 mb-1">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-[12px] font-semibold mr-2">
                                        {Object.keys(dataUser).length > 0 && (
                                            dataUser.firstName.charAt(0) + dataUser.lastNamePaternal.charAt(0)
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {Object.keys(dataUser) && (
                                            dataUser.firstName +' ' + dataUser.lastNamePaternal
                                        )}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {`El ticket fue dado de alta por: ${dataUserTicket}`}
                                </div>
                            </div>
                        </div>                
                        {/* seccion de botones de accion cerrar modal y agregar ticket */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpenModalAddTicket(false)}
                                    className="hover:bg-gray-100 transition-colors !text-black bg-gray-300 mb-1 !border rounded-md !border-solid"
                                >
                                    Cerrar
                                </Button> 
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    /** Funcion que muestra la lista de comentarios que tiene un ticket asignado 
    * se pude ver dicha lista ya garegar comentatios Validar 
    */
    const onDataTicketInformation = () => {
        return (
            <Card key={dataTicket.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        <div className="h-15 w-15">
                            <div className="text-sm flex items-center mt-4">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white text-[15px] font-semibold mr-2">  
                                    1
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-medium">
                                    Estatus del Ticket {dataTicket.id}
                                </h3>
                                <div 
                                    className={`p-2 text-sm rounded-full w-24 text-center  
                                        ${getStatusColor(dataTicket.statusTickets[0].descripcion)}
                                    `}   
                                >
                                    {dataTicket.statusTickets[0].descripcion}
                                </div>
                            </div>
                            <p className='text-sm text-gray-700'>
                                {`El Ticket fue dado de alta por: ${dataTicket.nameUserTicket}`}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                {`Titulo del Ticket: ${dataTicket.descripcion}`}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                    Creado: 
                                    &nbsp;{formatDate(dataTicket.createdDate)}
                                </span>
                                {dataTicket.closedDate && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        <span>
                                            Cerrado: 
                                            &nbsp;{formatDate(dataTicket.closedDate)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center space-x-0" style={{ display: 'block'}}>
                        <Button
                            variant="ghost"
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => {
                                handleOpenModalAddComment()
                            }}
                        >
                            <span className="text-xs text-gray-500 ml-1">
                                {dataTicket.comments.length > 0 &&
                                    <Eye className="w-4 h-4 text-blue-600"/>
                                } 
                            </span>
                        </Button>  
                        {dataDetailOperatio.id_Ticketb !== null && (
                            <Button
                                onClick={() => {
                                    handleOpenModalAddTicket();
                                }}
                            >
                                <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    /** Este componente Modal muestra la lista de los comentarios ademas de agregar 
    * un comentario cuando aun no se tiene agregado algun comentario 
    */
    const onListCommentTicket = () => {
        return (
            <Dialog 
                open={isOpenModalAddComment} 
                onOpenChange={isOpenModalAddComment}
            >
                <DialogContent className="sm:max-w-[550px] !p-0 overflow-hidden bg-white shadow-xl border-0">
                    <div className="bg-blue-700 p-4 text-white relative shadow-xl h-20">
                        <SquareX 
                            onClick={handleCloseModalAddComment} 
                            className="cursor-pointer text-white hover:text-gray-300 absolute right-4 top-4"
                        />
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            Ticket: {dataTicket.descripcion}
                        </DialogTitle>
                    </div>
                    <div className="p-0">
                        <div className="h-60 w-full overflow-y-auto">
                            <div className="px-6 py-4">
                                {dataTicket && Array.isArray(dataTicket?.comments) && 
                                    dataTicket.comments.length > 0 &&
                                        dataTicket.comments.map((item) => {
                                            return (
                                                <div key={item.id_Comentario} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-600 font-semibold mr-2">
                                                            {getInitials(item.nameUserComment)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-medium text-sm">
                                                                {item.nameUserComment}
                                                            </h4>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(item.fechaComentario)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">
                                                            {item.comentario}
                                                        </p>
                                                    </div>
                                                </div> 
                                            )
                                        })
                                }
                            </div>
                        </div> 
                        <div className="pb-4 pr-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end mt-4">
                                <Button 
                                    className="hover:bg-gray-100 transition-colors !text-black bg-gray-300 mb-1 !border rounded-md !border-solid"
                                    onClick={() => {
                                        handleCloseModalAddComment();
                                    }}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>  
        );
    };

    /** Function que carga el Color del Estatus de un Ticket
    * y muestra un color segun sea el Estatus del Ticket
    */
    const getStatusColor = (status) => {
        switch (status) {
        case "Abierto":
            return "bg-red-100 text-red-800 hover:bg-red-100"
        case "En Proceso":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        case "Resuelto":
            return "bg-green-100 text-green-800 hover:bg-green-100"
        case "Cerrado":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100"
        default:
            return null;
        }
    };

    /** Function que formate la fecha guardad en la base de datos 
    * y la carga con la region de México
    */
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = date.getDate();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    /** Function que recorre el nombre del usuario para mostrar las 
    * iniciales del mismo en el modal de Add y Edit Info del Tickey 
    */
    const getInitials = (name) => {
        return name
        .split(" ")
        .map((n) => n[0])
        .join("")
    };

    /** Funcion para mostrar operaciones con 2 puntos decimales despues del punto a la derecha */
    const onFormatCurrency = (value) => {
        return (Number(value)/100).toLocaleString(
            'en-US', {minimumFractionDigits: 2, 
                maximumFractionDigits: 2
        });
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

    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']

    /** TimeOut que controla cuando se sivualiza el detalel de la operacion */
    setTimeout(() => {
        setShowInfo(true)
    }, 5000)

    /** Fucnion que valida que venga un idDeal para consumir api GetById 
    * y muestre el detalle del Deal seleccionado en el tablero de Operaciones
    */
    useEffect(() => {
        /**Agrega validacion para evitar el llamado se los servicios 
        * dos veces y evitar hacer mas de 1 llamada a los diferentes
        * serviciso que traen la data de esta pantalla
        */
        if (executedRef.current) return;
        executedRef.current = true;

        /**se extrae el id de Deal y/o Operacion para mandar a llamar
        * los servicios que muestran la data del detalle de una deal
        * Cancelado
        */
        const idDetailDeal = readIdDealToLocalStorage('idDeal')
        if (idDetailDeal) {
            onGetOperationById(idDetailDeal);
        }
        /** se lee la data del usaurio logeado desde el localStorage
        * para validar tipo de componentes a mostrar
        */
        const localStorageArg = readToLocalStorage('user');
        setIdRegister(localStorageArg.userRecordId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    return (
        <>
            {error400 ? <Error400 /> :
                isLoader ? <Loader /> :
                <div className="flex h-screen bg-white">
                    <div className="flex-shrink-0">
                        <div className="h-full sticky top-0">
                            <NavBar />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                        <Head />
                        <div className="flex-1 overflow-y-auto">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
                            {/* <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full"> */}
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <Button variant="ghost" className="!text-blue-600"
                                                onClick={() => {
                                                    removeIdDealToLocalStorage('idDeal');
                                                    navigate('/operations-canceled');
                                                }}
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Regresar
                                            </Button>
                                            <h1 className="text-2xl font-bold text-gray-800">
                                                <span>
                                                    Detalle de la operación Cancelada
                                                </span>
                                            </h1>
                                        </div>

                                        {/* Se valida que en el detalle de la operacion se tenga ya registrado un id  */}
                                        <div style={{ display: 'none'}}>
                                            {(dataDetailOperatio.id_EstatusOperacion === 1 ||
                                                dataDetailOperatio.id_EstatusOperacion === 2) &&
                                                    infoFilePDF !== null &&
                                                        dataDetailOperatio.id_Ticket === null ? (
                                                            <Button 
                                                                className="!bg-blue-600 !text-white !hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                                                //onClick={() => handleOpenModalAddTicket()}
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Nuevo Ticket
                                                            </Button>
                                                        ) : null
                                            }  
                                        </div>

                                        {(idRegister === 1 || idRegister === 2 || idRegister === 3) && (
                                            <div className="flex gap-2" style={{ display: 'none' }}>
                                                <Button variant="outline" className="!bg-white !text-red-600 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar
                                                </Button>
                                                <Button variant="outline" className="!bg-white">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Descargar
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cliente Info */}
                                    <Card className="mb-6 bg-gradient-to-r">
                                        <CardContent className="p-6 bg-blue-600 text-white">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-100">
                                                        Cliente
                                                    </p>
                                                    <h2 className="text-3xl font-bold">
                                                        {dataDetailOperatio.nombreCliente}                                                  
                                                    </h2>
                                                </div>                                           
                                                <div className={`grid gap-8 
                                                    ${(idRegister === 1 || idRegister === 2 || idRegister === 3) 
                                                        ? 'grid-cols-2' 
                                                        : 'grid-cols-1'}`}
                                                >
                                                    {(idRegister === 1 || idRegister === 2 || idRegister === 3) && (
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-100">
                                                                Total General
                                                            </p>
                                                            <div className='flex flex-row'>
                                                                <p className="text-2xl font-bold"
                                                                    style={{
                                                                        opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                                        transition: "opacity 0.5s ease", // Suaviza la transición
                                                                        fontSize: "20px",
                                                                    }}
                                                                >
                                                                    <span>
                                                                        {onFormatCurrency(dataDetailOperatio.montoMXN + dataDetailOperatio.utilidad)}
                                                                    </span>
                                                                </p>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="hover:bg-transparent text-gray-400 hover:text-gray-600"
                                                                    onClick={() => setShowInfo(!showInfo)}
                                                                >
                                                                    {showInfo ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-100">
                                                            Fecha de inicio de Operación 
                                                        </p>
                                                        <p className="text-2xl font-bold">
                                                            {dataDetailOperatio?.fechaInicio.split('T')[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Stats Cards */}
                                    {(idRegister === 1 || idRegister === 2 || idRegister === 3) && (
                                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                                            <Card className="bg-white p-4">
                                                <div className="flex flex-row items-center justify-between pb-2">
                                                    <InputLabel className="text-sm font-medium text-gray-500">
                                                        Monto en pesos MXN
                                                    </InputLabel>
                                                    <DollarSign className="w-13 h-13 text-green-500"/>
                                                </div>
                                                <CardContent>
                                                    <div className="text-2xl font-bold"
                                                        style={{
                                                            opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                            transition: "opacity 0.5s ease", // Suaviza la transición
                                                            fontSize: "20px",
                                                        }}
                                                    >
                                                        <span>
                                                            {`$ ${onFormatCurrency(dataDetailOperatio.montoMXN)}`}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-white p-4">
                                                <div className="flex flex-row items-center justify-between pb-2">
                                                    <InputLabel className="text-sm font-medium text-gray-500">
                                                        Detalle en USD
                                                    </InputLabel>
                                                    <Activity className="w-6 h-6 text-purple-500" />
                                                </div>
                                                <CardContent>
                                                    <div className="text-2xl font-bold"
                                                        style={{
                                                            opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                            transition: "opacity 0.5s ease", // Suaviza la transición
                                                            fontSize: "20px",
                                                        }}
                                                    >
                                                        <span>
                                                            {`USD ${formatNumber(dataDetailOperatio.montoUSD)}`} 
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-white p-4">
                                                <div className="flex flex-row items-center justify-between pb-2">
                                                    <InputLabel className="text-sm font-medium text-gray-500">
                                                        Utilidad
                                                    </InputLabel>
                                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <CardContent>
                                                    <div className="text-2xl font-bold"
                                                        style={{
                                                            opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                            transition: "opacity 0.5s ease", // Suaviza la transición
                                                            fontSize: "20px",
                                                        }}
                                                    >
                                                        <span>
                                                            {`$ ${onFormatCurrency(dataDetailOperatio.utilidad)}`}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* seccion donde se da de Alta el numero del Deal asignado  para un Deal imcompleto */}
                                    <div className="grid grid-cols-1 gap-6 pb-5">
                                        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white">
                                            {/* <div className="grid md:grid-cols-2 gap-6 space-y-2"> */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* <div className='pt-10 pl-2'> */}
                                                <div className='flex items-center'>
                                                    <p className='text-base font-bold text-gray-800'>
                                                        Numero de Deal registrado
                                                    </p>
                                                </div>
                                                <div className='w-full'>
                                                    <InputLabel htmlFor="deal">
                                                        Deal
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Input
                                                            id="deal"
                                                            placeholder="Ejemplo: 10010"
                                                            // className="w-64 h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                            className="w-full md:w-64 h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                            disabled={true}
                                                            value={dataDetailOperatio.deal 
                                                                ? dataDetailOperatio.deal 
                                                                : deal
                                                            }
                                                            onChange={(e) => {
                                                                if (dataDetailOperatio.deal) {
                                                                    setDetailOperation(prev => ({ ...prev, deal: e.target.value }));
                                                                } else {
                                                                    setDeal(e.target.value)
                                                                }
                                                            
                                                            }}
                                                        />
                                                        <FileText className="absolute left-3 top-2.5 h-5 w-5 text-yellow-500" />
                                                    </div>
                                                </div>    
                                            </div>
    
                                            {/* <div className="flex justify-start items-center space-x-4 pt-7"> */}
                                            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 md:pt-0">
                                                {/* <div className='pr-6'> */}
                                                <div className='flex items-center'>
                                                    <p className='text-base font-bold text-gray-800'>
                                                        Estatus del Deal
                                                    </p>
                                                </div>
                                                <select
                                                    // className="w-48 h-10 p-2 text-sm border rounded-lg border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                                                    className="w-full md:w-48 h-10 p-2 text-sm border rounded-lg border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                                                    disabled={true}
                                                    value={dataDetailOperatio.id_EstatusOperacion}
                                                >
                                                    {Array.isArray(dataStatusOperation) &&
                                                        dataStatusOperation.map((item) => {
                                                            return (
                                                                <option
                                                                    key={item.id_EstatusOperacion}
                                                                    value={item.id_EstatusOperacion}
                                                                >
                                                                    {item.description}
                                                                </option>
                                                            )
                                                    })}
                                                </select>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Seccion donde se visualizan los archivos PDF's que se agregaron al detallde de un DEAL */}
                                    <div className="grid grid-cols-1 gap-6 pb-6" style={{ display: 'block'}}>
                                        <Card className="bg-white">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 p-5">
                                                    {/* <div className='flex flex-row justify-start items-start h-96 gap-2 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all'> */}
                                                    <div className='flex flex-col md:flex-row justify-start items-center md:items-start h-auto md:h-96 gap-4 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all'>  
                                                        <div className='w-full flex flex-col justify-center items-start'>
                                                            {/*archivo PDF que viene desde la DB */}
                                                            {/* <div className='flex flex-row gap-2'> */}
                                                            <div className='flex flex-col md:flex-row gap-4 w-full'>
                                                                <div className='w-full md:w-auto'>
                                                                    <iframe
                                                                        src={`data:application/pdf;base64,${infoFilePDF}`}
                                                                        // width="350px"
                                                                        // height="350px"
                                                                        className="w-full h-96 md:h-80 md:w-80"
                                                                        title="PDF Viewer"
                                                                    ></iframe>
                                                                </div>
                                                                <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                    <InputLabel htmlFor="preview-file pt-2 pb-2">
                                                                        Archivo Guardado
                                                                    </InputLabel>
                                                                    <Button 
                                                                        className='!bg-blue-500 !text-white h-9 w-full md:w-auto'
                                                                        onClick={() => handleOpenModalPDFDetail()}
                                                                    >
                                                                        <Eye className="h-5 w-5" />
                                                                    </Button> 
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {infoFilePDFFed === null ? (
                                                        <div className='flex justify-center items-center p-2'>
                                                            <div className="!border-amber-500 text-amber-800 border-2 rounded-lg p-4 w-full">
                                                                <div className="flex items-center gap-2">
                                                                    <FileWarning className="h-6 w-6" />
                                                                    <span>
                                                                        Documento PDF No Agregado
                                                                    </span>
                                                                </div>
                                                                <div className='pt-4 text-sm'>
                                                                    El documento PDF no se agrego a esta Operacion Cancelada.<br/>
                                                                    Solo se agrego el primer documento para poder actualizar es estatus de esta Operacion.                                                                     
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        //<div className='flex flex-row justify-start items-start h-96 gap-2 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all'>
                                                        <div className='flex flex-col md:flex-row justify-start items-center md:items-start h-auto md:h-96 gap-4 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all'>    
                                                            {/* <div className='w-full flex flex-col justify-center items-start'> */}
                                                            <div className='w-full flex flex-col justify-center items-center'>                                                                  
                                                                {/*archivo PDF que viene desde la DB */}
                                                                {/* <div className='flex flex-row gap-2'>  */}
                                                                <div className='flex flex-col md:flex-row gap-4 w-full'>                                                                  
                                                                    <div className='w-full md:w-auto'>
                                                                        <iframe
                                                                            src={`data:application/pdf;base64,${infoFilePDFFed}`}
                                                                            // width="350px"
                                                                            // height="350px"
                                                                            className="w-full h-96 md:h-80 md:w-80"
                                                                            title="PDF Viewer"
                                                                        ></iframe>
                                                                    </div>
                                                                    <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                        <InputLabel htmlFor="preview-file pt-2 pb-2">
                                                                            Archivo Guardado
                                                                        </InputLabel>
                                                                        <Button 
                                                                            className='!bg-blue-500 !text-white h-9'
                                                                            onClick={() => handleOpenModalPDFedDetail()}
                                                                        >
                                                                            <Eye className="h-5 w-5"/>
                                                                        </Button> 
                                                                    </div>   
                                                                </div>
                                                            </div>  
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="grid md:grid-cols-1 gap-6 pb-5">
                                        <div className="container mx-auto">
                                            <Card className="bg-white ">
                                                <div className='p-4'>
                                                    {Object.keys(dataTicket).length === 0 
                                                        ? onMessageInformativoEmptyTicket() : (
                                                            onDataTicketInformation()
                                                        )}                                  
                                                </div>
                                            </Card>
                                        </div>
                                    </div>

                                    {(idRegister === 1 || idRegister === 2 || idRegister === 3) && (
                                        <div className="grid md:grid-cols-2 gap-6">                                 
                                            <Card className="bg-white">
                                                <div className='flex flex-row p-4'>
                                                    <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                                                    <InputLabel className="flex items-center">
                                                        Distribución MXN vs USD
                                                    </InputLabel>
                                                </div>
                                                <CardContent>
                                                    <div className="h-[400px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={pieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={false}
                                                                    outerRadius={150}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    label={({ name, percent }) => {
                                                                        // Muestra siempre ambas etiquetas aunque el porcentaje sea muy pequeño
                                                                        return `${name} ${(percent * 100).toFixed(percent < 0.01 ? 2 : 0)}%`;
                                                                    }}
                                                                >
                                                                    {pieData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{ 
                                                                        backgroundColor: 'white',
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: '0.5rem'
                                                                    }}
                                                                />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>
    
                                            <Card className="bg-white">
                                                <div className='flex flex-row p-4'>
                                                    <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
                                                    <InputLabel className="flex items-center">
                                                        Utilidad MXN
                                                    </InputLabel>
                                                </div>
                                                <CardContent>
                                                    <div className="h-[400px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={chartData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <Tooltip 
                                                                    formatter={(value) => onFormatCurrency(value)} 
                                                                    labelFormatter={(label) => `Fecha: ${label}`}
                                                                />
                                                                <Bar dataKey="pesos" fill="#f97316" name="Utilidad MXN" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
    
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                </div>
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
            }
            {/* //modales para ver el detalle de un PDF o un PDF FED que vienen desde el Detail de un Deal */}
            {onModalViewPDFDetail()}
            {onModalViewPDFFedDetail()}
            {/* Modales paragregar ticket y ver y agregar comentatios ese ticket */}
            {onDetailTikcetCanceled()}
            {onListCommentTicket()}
        </>
    );
}
//**new  data */
export default DetailDealCanceled;
