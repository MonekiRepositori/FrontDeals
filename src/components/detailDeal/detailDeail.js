import React, { useState, useEffect, useRef }from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';

import Button from '@mui/material/Button';

import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';

import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import TextareaAutosize from "@mui/material/TextareaAutosize"

import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, 
    Area, 
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
    BarChart as BarChartIcon, 
    Activity,
    Upload,
    FileText,
    Send,
    X,
    Save,
    AlertCircle, 
    ClipboardList, 
    FileUp, 
    CheckCircle2,
    BookCheck,
    Plus,
    TicketIcon,
    SquareX,
    CalendarIcon,
    Calendar,
    CheckCircle,
    Clock,
    MessageSquare,
    Edit,
    FileQuestion,
} from 'lucide-react';

import {
    readToLocalStorage,
    readIdDealToLocalStorage,
    removeIdDealToLocalStorage,
} from '../../apis/localStorage'; 

import {
    apiGetPlatform,
    apiGetAllStatusOperation,
    apiGetAllStatusTicket,

    apiGetOperationById,
    apiUpdateDealOperation,
    apiAddAndUpdateFilePdfDeal,

    apiAddTicket,
    apiGetTicketById,
    apiUpdateTicket,

    apiAddComment,
} from '../../apis/services';

import { toast, Toaster } from "react-hot-toast";
// import 'react-toastify/dist/ReactToastify.css'; 


const DetailDeail = () => {

    /** Estado que contral la llama a los diferentes servicios 
    * esto se agrego para que solo se haga una llamada y evitar errores
    * de renderizado
    */
    const executedRef = useRef(false)

    /** Varibale donde se guardar la ruta para navegar entre pantallas */
    let navigate = useNavigate();
    /** Estado de loader */
    const [isLoader, setIsLoader] = useState(true);
    /** Estado que guarda y muestra error APi */
    const [error400, setError400] = useState(false);
    /** Estado que muestra la data de la operación y despues se ocapa */
    const [showInfo, setShowInfo] = useState(true);
    /** Estado para settea el valor de Deal por que ya se tiene ese valor y 
    *se va agregar al Detail Deal
    */ 
    const [deal, setDeal] = useState('');
    /** Estado donde que settea la data del detalle del Del */
    const [dataDetailOperatio, setDetailOperation] = useState({});
    /** Estado que guarda la data de la grafica */
    const [chartData, setChartData] = useState([]);
    /** Estado que guarda el tipo de Usuario registrado 
    * y asi poder validar que componentes y funcionalidades
    * puede realizar segun el tipo de Usuario Logeado
    */
    const [idRegister ,setIdRegister] = useState('');
    /** Estado que controla si se ve boton de guardar y/o actulizar docuementos se puede utilizar */
    const [
        isDisabledButtonAddAndUpdateFilePDF, 
        setIsDisabledButtonAddAndUpdateFilePDF
    ] = useState(true);

    /** Estados para guardar, y previsualizar PDF que se sube para agregar informacion del Lead */
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [isDisableFilePDF, setIsDisabledFilePDF] = useState(false);
    const [openModalPDF, setOpenModalPDF] = useState(false);
    const handleOpenModalPDF = () => setOpenModalPDF(true);
    const handleCloseModalPDF = () => setOpenModalPDF(false);
    /** Estado que almacena variable de PDF en base 64 */
    const [pdfFileBase64, setPdfFileBase64] = useState('');
    // ---------------- End estados para guardar, y previsualizar PDF ------------------
    /** Estado que guarda la data de archivo PDF que esta en Base64, que viene en el detalle del Deal */
    const [infoFilePDF, setInfoFilePDF] = useState(null);
    /** Estados para guardar, y previsualizar INVOICE que se sube para agregar informacion del Lead */
    const [fedFile, setfedFile] = useState(null);
    const [defUrl, setFedUrl] = useState('');
    const [isDisableFileFed, setIsDisabledFileFed] = useState(false);
    const [openModalFed, setOpenModalFed] = useState(false);
    const handleOpenModalFed = () => setOpenModalFed(true);
    const handleCloseModalFed = () => setOpenModalFed(false);

    /** Estado que almacena variable de PDF INVOICE en base 64 */
    const [pdfFedFileBase64, setPdfFedFileBase64] = useState('')
    /**---------------- End estados para guardar, y previsualizar INVOICE ------------------ */
    /** Eestado que guarda la data de archivo PDF INVOICE que esta en Base64, que viene en el detalle del Deal */
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

    /** Estado que almacena el id_estatusOperacion cuando se va a cambiar dicho 
    * estado para los procesos correspondientes 
    */
    const [idStatusOperation, setIdStatusOperation] = useState(0);

    /** Estado que alamacena el catalogo de estatus de un ticket
    * para poder actualizar lo y seguir con el flujo de trabajo 
    * segun las reglas de negocio
    */
    const [dataStatusTicket, setDataStatusTicket] = useState([]);

    /** Estado que alamacena el titulo del ticket que se va agregar
    * al detalle de una deal NOTA: solo se puede agregar un ticket 
    * a un deal y/o Operacions -->NO<-- puden ser N cantidad de tickets 
    * por deal 
    */
    const [commentTicket, setCommentTicket] = useState('');
    const [ 
        commentTicketDateStart, 
        setCommentTicketDateStart
    ] = useState (new Date().toISOString().split('T')[0]);

    const [
        commentTicketDateEnd, 
        setCommentTicketDateEnd
    ] = useState (null);

    /** Estado que alamacena es id estatus de un ticket cuando se da de alta ya 
    * que cuando se actualza se actualiza el dataObjet cunado se hace delgetById
    * del ticket cuando se ingresa al detalle de un Deal y/o Operacion
    */
    const [estatusTicket, setEstatusTicket] = useState('');

    const [commentAddTicket, setCommentAddTicket] = useState('');

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

    /** Esatdo boolean  que controla de tipo de operacion se 
     * va a realizar en un ticket agregar o editar
    */
    const [
        isDisabledComponentEditTicke, 
        setIsDisabledComponentEditTicke
    ] = useState(false);

    /** Estado que almacena la data dek usuario cuando este mismo 
    * agrega y/o actualiza un ticket ademas de agregar comentarios
    * a dicho ticket
    */
    const [dataUser, setDataUser] = useState({})
    const [dataUserTicket, setDataUserTicket] = useState('');

    const [
        isTemporarilyDisabled, 
        setIsTemporarilyDisabled
    ] = useState(false);
    
    /** Funcion para visualizar file PDF que se sube al momento de agregar el LEAD */
    const onHandleFilePDF = async (fileArg) => {
        const file = fileArg
    
        if (file && file.type === 'application/pdf' ) {
            setIsDisabledFilePDF(true);
            setPdfFile(file);
            const fileUrl = URL.createObjectURL(file)
            setPdfUrl(fileUrl)

            if (file) {
                try {
                    const base64String = await convertFileToBase64(file);
                    setPdfFileBase64(base64String);
                    setIsDisabledButtonAddAndUpdateFilePDF(false);
                    /** Aquí puedes guardar el string en tu estado o enviarlo a tu backend */
                } catch (error) {
                    console.error("Error al convertir el archivo a Base64:", error);
                }
            }
        }
    };

    /** Componente Modal que muestra una vista previa del docuemnto PDF */
    const onModalPreviewPDF = () => {
        return (
            <Dialog
                open={openModalPDF}
                handler={handleOpenModalPDF}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            vista previa Documento PDF:<br/>
                            {pdfFile ? pdfFile.name : ''}
                        </DialogTitle>
                        <X onClick={handleCloseModalPDF} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <iframe 
                                src={pdfUrl}
                                width='100%'
                                height='500px'
                                title='Vista previa del PDF'
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleCloseModalPDF();
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

    /** Funcion para visualizar file INVOICE que se sube al momento de agregar el LEAD */
    const onHandleFileDEF = async (fileArg) => {
        const file = fileArg

        if (file && file.type === 'application/pdf' ) {
            setIsDisabledFileFed(true);
            setfedFile(file);
            const fileUrl = URL.createObjectURL(file)
            setFedUrl(fileUrl)

            if (file) {
                try {
                    const base64String = await convertFileToBase64(file);
                    setPdfFedFileBase64(base64String);
                    setIsDisabledButtonAddAndUpdateFilePDF(false);
                    /** Aquí puedes guardar el string en tu estado o enviarlo a tu backend */
                } catch (error) {
                    console.error("Error al convertir el archivo a Base64:", error);
                }
            }
        }
    };

    /** Componente Modal que muestra una vista previa del docuemnto INVOICE */
    const onModalPreviewDEF = () => {
        return (
            <Dialog
                open={openModalFed}
                handler={handleOpenModalFed}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            vista previa Documento INVOICE:<br/>
                            {fedFile ? fedFile.name : ''}
                        </DialogTitle>
                        <X onClick={handleCloseModalFed} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <iframe 
                                src={defUrl}
                                width='100%'
                                height='550px'
                                title='Vista previa del PDF'
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleCloseModalFed();
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

    /** Funcion que crear el file PDF que se agrega a base 64 
    * para guardar en el detail Deal
    */
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
      
          // Evento que se ejecuta cuando el archivo ha sido leído
          reader.onload = () => {
            resolve(reader.result.split(',')[1]); // Extraemos solo la cadena Base64 sin el prefijo
          };
      
          // Evento que se ejecuta si hay un error
          reader.onerror = (error) => {
            reject(error);
          };
      
          // Leer el archivo como una URL de datos (base64)
          reader.readAsDataURL(file);
        });
    };

    /** Funcion que hace el llamado a API para carga data de las plataformas 
    * para sacar el ID de la plataforma que viene en la funcion
    * onGetOperationById que carga el detalle de un Deal
    */
    const onApiGetPlatform = async () => {
        try {
            const response = await apiGetPlatform();
            return response.data
        } catch (error) {
            console.error('error en pantalla Platform => ',error);
            setError400(true);
            setTimeout(() => {
                navigate('/operations')
            },2000)
            throw error;
        }
    };

    /** Funcion que manda a llamar el api de GetById del Deal para mostrar el detalle del mismo
    * para poder actulizar el Deal y subir los PDF para poder tener un Deal completo 
    */
    const onGetOperationById = async (idArg) => {
        try {
            setIsLoader(true);
            const response = await apiGetOperationById(idArg);
            setDetailOperation(response.data);

            if (
                response.data.document_Deal_PDF !== null && 
                response.data.document_Deal_PDF !== 'null'
            ) {
                let filePDFBase64 = response.data.document_Deal_PDF
                setInfoFilePDF(filePDFBase64);
                onApiGetStatusOperation();
            }

            let filePDFFedBase64 = response.data.documento_PDF_FED;
            setInfoFilePDFFed(filePDFFedBase64);

            let dataCharArg = [{
                date: response.data.fechaInicio.split('T')[0], 
                pesos: response.data.utilidad
            }]
            setChartData(dataCharArg)

            onApiGetStatusTicket();
            const localStorageDataUser = readToLocalStorage('user');
            setDataUser(localStorageDataUser);

            if (response.data.id_Ticket !== null && 
                response.data.id_Ticket !== 'null'
            ) {
                const idTicketArg = response.data.id_Ticket
                setIsDisabledComponentEditTicke(true);
                onGetTicketById(idTicketArg);
            } 
            setIsLoader(false);
        } catch (error) {
            console.error('error al ejecutar getByIDTicket pantalla => ',error)
            setError400(true);
            setTimeout(() => {
                navigate('/operations')
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

    /** Funcion que manda a traer el detalle de un Ticket asignado al 
    * Detalle de una de una Operacion y/o Deal 
    * esta se ejecuta despues de la validacion si el Detalle de la operacion 
    * tiene ya un Ticket asignado
    */
    const onGetTicketById = async (idArg) => {
        try {
            const response = await apiGetTicketById(idArg);
            const dataTickeyGetById = response.data
            if (
                Object.keys(dataTickeyGetById).length !== 0
            ) {
                setDataTicket(dataTickeyGetById);   
                setDataUserTicket(getInitials(dataTickeyGetById.nameUserTicket));
                if (dataTickeyGetById.closedDate !== null && 
                    (dataTickeyGetById.ticketStatusId === 3 ||  
                        dataTickeyGetById.ticketStatusId === 4)
                ) {
                    setIsTemporarilyDisabled(true);
                }
            }
            return response.data
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


    /** Componente Modal que muestra una vista de docuemnto PDF INVOICE
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
                            Documento PDF INVOICE Detail:
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

    /** Funcion que consumo el api Catalogo de plataforma para mandar el 
    * el ID de la plataforma segun el mobre de la misa que viene el **getById del Deal**
    */

    const onGetIdPlatform = async (apiCall, nameArg) => {
        try {
            const data = await apiCall();
            const result = data.find(item => item.platformName === nameArg)
            if (result) {
            return result.id_BankingPlatform;
            } else {
                console.error('No se encontró el nombre');
                return null;
            };
        } catch (error) {
            console.error('Error al obtener el ID:', error);
        }
    };


    /** Funcion que actuliza y/o agrega el numero de Deal cuando este se tiene 
    * por parte de la persona que los da de alta
    */
    const onUpdateOperationDeal = async (
        typeUpdate = null
    ) => {
        try {
            if (typeUpdate) {/**se valida que se tenga un tipo para actualizar  */
                /**Se lee la data del usuario regidtrado guardada en el  LocalStorage */
                const localStorageArg = readToLocalStorage('user');
                /**Se lee el ID de la operacion para ejecutar api getById  */
                const idDetailDeal = readIdDealToLocalStorage('idDeal');
                /**Se compara el nombre de la plataforma para enviar e ID de la platafomra cuando se actualiza un Deal */
                const idPlatformArg = await onGetIdPlatform(onApiGetPlatform, dataDetailOperatio.platformName);
                /**Se crear una variable global para crear una varible y enviar al servicio para actualizazr 
                * la informacion de un Deal que este caso solo es el numero de Deal y estatus del deal 
                */
                const buildBody = (moreData = {}) => ({
                    ...dataDetailOperatio,
                    platformId: idPlatformArg,
                    userRecordId: localStorageArg.userRecordId,
                    ...moreData
                });
                /**Se crea varible temporal para mandar a varibla globla y actualizar la
                * informacion del Deal
                */
                let body = {}
                /**Variable que almacen el ID del estatus de la opercion para actualizar dicho valor */
                let idStatusGetById = dataDetailOperatio.id_EstatusOperacion
                let idStatusFileNewState = idStatusOperation

                /**Se valida que tipo de valor se va actualizar en este caso es el ID del Deal */
                if (typeUpdate === 'updateDeal') {
                    /**Se envia parametro a actualizar a la variable global para consumir servicio que
                    * actualiza el ID del Deal en este caso 
                    */
                    body = buildBody({ deal: dataDetailOperatio.deal ?? deal }); 
                }
                
                /**Se valida que tipo de valor se va actualizar en este caso el el Estatusa de Deal */
                if (typeUpdate === 'updateStatus') {
                    /** Se valida que el valor de ID del estatus del Deal sea mayor a 0 para pode 
                     * seguir con la actualizacion del mismo
                     */
                    if (idStatusGetById > 0 || idStatusFileNewState > 0) {
                        if (idStatusGetById === 3 || idStatusFileNewState === 3 ) {
                            /**Se envia parametro a actualizar a la variable global para consumir servicio que
                            * actualiza el ID estatus del Deal en este caso
                            */
                            body = buildBody({ id_EstatusOperacion: dataDetailOperatio.id_EstatusOperacion ?? idStatusOperation }); 
                            /**Se valida que exista un Ticket creado para este detalle de Deal */
                            if (dataDetailOperatio.id_Ticket !== null) {
                                /** Se valida que el Estatus tenga los datos correctos para poder cerrarlo y enviar
                                * este Deal al tablero de Cancelados
                                */
                                if (dataTicket.closedDate === null && 
                                    (dataTicket.ticketStatusId === 1 || 
                                        dataTicket.ticketStatusId === 2  )
                                ) {
                                    /**Si el ticket no esta cerrado se envian los valores
                                    * correspondientes para que el ticket este cerrado ya que el usuario no lo 
                                    * hizo y se hace de manera interna
                                    */
                                    const today = new Date().toISOString();
                                    /**Se crean objeto que cierra la data de un ticket */
                                    const bodyTicket = {
                                        closeDate: today,
                                        id_StatusTicket: 4
                                    }
                                    /**Se cierra un ticket */
                                    const response = await apiUpdateTicket(
                                        dataTicket.id_Tickets, 
                                        bodyTicket,
                                    );  
                                    console.log('se cierra ticket --> ',response)
                                    navigate('/operations');
                                }
                                /**Si el ticket esta cerrado de manera correcta no se actualiza esta data
                                * y solo se actualiza es estatus del Deal a CANCELADO
                                */
                            }
                        } else {
                            /**Se actualiza el Estatus de la Operacion a Cancelado, no importa si el ticket esta 
                            *cerrado o incompelto ese se hace el if que esta dentro de esta validacion y/o ecepcion
                            *Ademas Se envia parametro a actualizar a la variable global para consumir servicio que
                            *actualiza el ID estatus del Deal en este caso
                            */
                            body = buildBody({ id_EstatusOperacion: dataDetailOperatio.id_EstatusOperacion ?? idStatusOperation });
                        }
                    }
                }

                /**Se consume Api que actualiza la data del detalle de un Deal */
                const response = await apiUpdateDealOperation(idDetailDeal, body);
            
                 if (response.status === 200 || 
                    response.status === '200'
                ) {
                    /**Se valida el tipo de status actualizado */
                    if (idStatusGetById === 3 || idStatusFileNewState === 3 ) { 
                        /**Se valida el tipo de usuario logerado para indicar a que pantalla se va rederigir */
                        if (localStorageArg.userRecordId === 1 || localStorageArg.userRecordId === 2) {
                            navigate('/operations-canceled')
                        } else {
                            navigate('/operations')
                        
                        }
                    } else {
                        /**si es ID estatus que se actualiza no es CANCELADO se queda el detalle del Deal */
                        toast.loading("Se actualizo la informacion del Deal REY FINAL", {
                            style: {
                                background: '#4BB543',// color verde para toaster
                                color: '#fff',
                            },
                        })
                        /**Se mandar a llamar el getById del deal para mostrsr los datos actualizados */
                        onGetOperationById(idDetailDeal);
                        setTimeout(() => {
                            setIsLoader(false)
                        },2000)
                    }
                }
            }
        } catch (error) {
            console.error('error al agregar y/o actulizar Deal => ',error)
            setError400(true);
            setTimeout(() => {
                setIsLoader(false);
                setError400(false);
                navigate('/operations')
            },2000)
            throw error;
        }
    };

    /** Funcion para agrega y actualizar archivos PDF's en el detalle de un Deal */
    const onAddAndUpdateFilePDFDealDetail = async () => {
        try {
            const localStorageArg = readToLocalStorage('user');
            const idDetailDeal = readIdDealToLocalStorage('idDeal')
            const body = {
                document_Deal_PDF: pdfFileBase64 || infoFilePDF,
                documento_PDF_FED: pdfFedFileBase64 || infoFilePDFFed,
                userRecordId: localStorageArg.userRecordId
            }
            const response = await apiAddAndUpdateFilePdfDeal(idDetailDeal, body);
                if (response.status === 200) {
                    toast.success("Se subio arvhivo PDF \n De manera exitosa", {
                        style: {
                            background: '#4BB543',// color verde para toaster
                            color: '#fff',
                        },
                    });
            }
            onGetOperationById(idDetailDeal);
            setTimeout(() => {
                setIsLoader(false)
            },2000)
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setIsLoader(false);
                setError400(false);
                navigate('/operations');
            },2000)
            throw error
        }
        
    };

    /** Funcion donde se rendeciza un mensaje informativo para poder subir archivos 
    * PDF's al detalle de un Deal 
    */
    const onMessageInformativo  = () => {
        return (
            <div className="grid md:grid-cols-2 w-full gap-6 mx-auto p-4">
                <div className="border rounded-lg border-blue-700 p-4">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div className="text-amber-500 font-medium ml-2 pt-2">
                        Acción Requerida
                    </div>
                    <div className="ml-7 pt-4">
                        Favor de registrar un Numero de Deal para poder subir la documentación requerida
                    </div>
                </div>
        
                <div className="grid gap-4 p-2">
                    <h3 className="font-semibold text-lg">Pasos a seguir:</h3>
                    <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                            <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="grid gap-1">
                            <p className="font-medium leading-none">1. Registrar Deal</p>
                            <p className="text-sm text-muted-foreground">
                            Complete el formulario de registro del Deal
                            </p>
                        </div>
                    </div>
            
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                            <FileUp className="h-4 w-4" />
                        </div>
                        <div className="grid gap-1">
                            <p className="font-medium leading-none">2. Subir Documentación</p>
                            <p className="text-sm text-muted-foreground">
                                Una vez registrado, podrá subir los documentos requeridos
                            </p>
                        </div>
                    </div>
            
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="grid gap-1">
                            <p className="font-medium leading-none">3. Confirmar Envío</p>
                            <p className="text-sm text-muted-foreground">
                                Verifique y confirme el envío de la documentación
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        );
    };    

    /** Funcion que Agrega toda la Data de un Ticket al detalle
    * de una Operacion y/o Deal del mismo 
    */
    const onAddTicketOperation = async () => {
        try {
            setIsLoader(true);
            const idDetailDeal = readIdDealToLocalStorage('idDeal');
            const localStorageDataUser = readToLocalStorage('user');
            const body = {
                descripcion: commentTicket,
                closeDate: commentTicketDateEnd === null 
                    ? null
                    : commentTicketDateEnd,
                ticketStatusId: estatusTicket,
                id_EstatusOperacion: dataDetailOperatio.id_EstatusOperacion,
                id_Operacion: idDetailDeal,
                nameUserTicket: localStorageDataUser.firstName +' '+ localStorageDataUser.lastNamePaternal
            }
            const response = await apiAddTicket(body)
            if (response.status === 201 || response.status === '201') {
                toast.success("Ticket Creado \n De manera exitosa", {
                    position: 'top-right',
                });
            }
            onGetOperationById(idDetailDeal);
            setTimeout(() => {
                setIsLoader(false);
            },1000)
            navigate('/detail-deal');
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/detail-deal');
            },2000)
            throw error
        }
    };

    /**Funcion que valida que el estatus dek Ticket
     * es el correcto para poder cerrar el mismo
     */
    const onValiationStatusTicket = (dataTicketArg) => {
        try {
            if ((dataTicketArg.ticketStatusId === 1 || 
                dataTicketArg.ticketStatusId === '1') ||
                (dataTicketArg.ticketStatusId === 2 || 
                    dataTicketArg.ticketStatusId === '2')
            ) {
                return false;
            } else {
                return true;
            }            
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/detail-deal');
            },2000)
            throw error
        }
    };

    /** Funcion que actualiza la data de un ticket que solo actualiza
    * El estatus de Ticket y la fecha de cierre del mismo Ticket 
    */
    const onUpdateDataTicket = async (dataTicketArg) => {
        try {
            /**Se manda a llamar el detalle de un ticket */
            let dataGetByIdTicket = await onGetTicketById(dataDetailOperatio.id_Ticket)
            /**Se lee el ID de la operacion para ejecutar api getById  */
            const idDetailDeal = readIdDealToLocalStorage('idDeal');
            /**Se compara la data que viend del getById de un ticket con los estados que vienen de su
            * componente se valida que se no han cambiando que se muestre el mensaje informativo
            * que no se han acualizado los datos del detalle de un Ticket
            */
            const mismaFecha = dataGetByIdTicket.closedDate === dataTicketArg.closedDate;
            const mismoStatus = dataGetByIdTicket.ticketStatusId === dataTicketArg.ticketStatusId;
            
            /**Se valida que los valores a actualizar de un ticket hayan cambiado o no 
            * para realizar los procesos correspondientes
            */
            if (mismaFecha && mismoStatus ) {
                /**Se muestra mensajainformativo para indicar que valores debe de actualizar el usaurio */
                toast.error("Actualiza fecha de cierre o estatus de ticket", {
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                })
                setTimeout(() => {
                    handleCloseModalAddTicket();
                    setIsLoader(true);
                    onGetOperationById(idDetailDeal);
                }, 3000); // Pequeño retraso para asegurar que el toast se muestre
            } else {
                /**Se asigna el valor del id de Ticket para poder Actualizar la data del mismo */
                const idArg = dataTicket.id_Tickets
                /**Se manda a lllamar a funcion que valida si idEstatus del ticket es el correcto
                * para poder cerrar dicho Ticket
                */
                const validateStatus = await onValiationStatusTicket(dataTicketArg);
                /**Se crea objeto que se envia al servicio que actualiza la data de un ticket */
                let body = {}
                /**Se valida que la fecha sea fierentes en su componente al detalle de un ticket 
                 * para validar y crear el objeto que envia para actualizar la data del ticket
                 */
                if (!mismaFecha) {
                    /**Se valida que es estatus del ticket sea el correcto para
                    * poder actualizar la data del mismo
                    */
                    if (validateStatus) {
                        handleCloseModalAddTicket();
                        setIsLoader(true);
                        /**Se crear el objeto que actualiza la data de un Ticket */
                        let bodyArg = {
                            closeDate: dataTicketArg.closedDate +'T00:00:00.000Z',
                            id_StatusTicket: parseInt(dataTicket.ticketStatusId)
                        }
                        /**Se asigna el objeto que se envia al servcio que actualiza la data del ticket */
                        body = bodyArg
                    } else {
                        /**Se muestra mensaje informativo del valor actualizado  */
                        toast.error("Actualiza es Estatus del Ticket para poder cerrar el Ticket", {
                            style: {
                                background: '#333',
                                color: '#fff',
                            },
                        })
                        /**SetTimeOut que cierra modal, activa loader, para mandar al llamar el
                         * el detalle de la operacion que a su ver carga del detalle de un ticket 
                         * si es que este existe 
                         */
                        onGetOperationById(idDetailDeal);
                        setTimeout(() => {
                            handleCloseModalAddTicket();
                            setIsLoader(true);
                        }, 3000);
                    }
                } else {
                    /**Se muestra mensaje informativo del valor actualizado  */
                    toast.loading("Se actualiza el estatus del ticket", {
                        style: {
                            background: '#4BB543',// color verde para toaster
                            color: '#fff',
                        },
                    })
                    /**SetTimeOut que cierra modal, activa loader, para mandar al llamar el
                    * el detalle de la operacion que a su ver carga del detalle de un ticket 
                    * si es que este existe 
                    */
                    onGetOperationById(idDetailDeal);
                    setTimeout(() => {
                        handleCloseModalAddTicket();
                        setIsLoader(true);
                        
                    },100)
                    /**Se crear el objeto que actualiza la data de un Ticket */
                    let bodyArg = {
                        closeDate: dataTicketArg.closedDate === null ? null : dataTicketArg.closedDate,
                        id_StatusTicket: dataTicket.ticketStatusId
                    }
                    /**Se asigna el objeto que se envia al servcio que actualiza la data del ticket */
                    body = bodyArg
                }
                /**Se crea valiable para validar que se tenga data para actualizar data del Ticket */
                let sendBody = Object.keys(body).length !== 0
                /**Se valida que el objeto a enviar tenga propiedades para
                * ejecutar servicio y actualziar data del Ticket
                */
                if (sendBody) {
                    /**Se ejecuta servcio que actualiza la data de un ticket */
                    const response = await apiUpdateTicket(
                        idArg, 
                        body,
                    );                 
                    if (response.status === 201 || response.status === '201') {
                        /**Se muestra mensaje informativo del valor actualizado  */
                        toast.success("Datos de Ticket \n Actualizados de manera exitosa", {
                            style: {
                                background: '#FFA500',
                                color: '#fff',
                                fontWeight: 'bold',
                            },
                        });
                    }
                     /**SetTimeOut que cierra modal, activa loader, para mandar al llamar el
                    * el detalle de la operacion que a su ver carga del detalle de un ticket 
                    * si es que este existe 
                    */
                    onGetOperationById(idDetailDeal);
                    setTimeout(() => {
                        setIsLoader(false);
                    },3000)
                }
            }
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/detail-deal');
            },2000)
            throw error
        }
    };


    /** Funcion que Agrega un comentario a un Ticket agregado previamente al detalle 
    * de una Operacion y/o Deal
    */
    const onAddCommentTicket = async (dataArg) => {
        try {
            setIsLoader(true);
            const idDetailDeal = readIdDealToLocalStorage('idDeal');
            const localStorageDataUser = readToLocalStorage('user');
            const body = {
                id_Ticket: dataArg.id_Tickets,
                comentario: commentAddTicket,
                nameUserComment: localStorageDataUser.firstName +' '+ localStorageDataUser.lastNamePaternal
            }
            const response = await apiAddComment(body);
            if (response.status === 201 || response.status === '201') {
                toast.success("Comentario agregado de manera exitosa", {
                    position: 'top-right',
                })
            }
            onGetOperationById(idDetailDeal);
            setTimeout(() => {
                setIsLoader(false);
            },1000);
            setCommentAddTicket('');
            
        } catch (error){
            setError400(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/detail-deal');
            },2000)
            throw error
        }
    };

    /** Es componente Modal Agrega y Editar un Ticket que se asigna a una operacion
    * solo se puede agregar un Ticket por operacion **NO** se puede agregar mas de un Ticket
    * a una operacion y o Deal
    */
    const onAddTicket = () => {
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
                            {isDisabledComponentEditTicke 
                                ? 'Detalle del Ticket'
                                : 'Crear Nuevo Ticket'
                            }
                            
                        </DialogTitle>
                        <div className="text-white text-sm">
                            {!isDisabledComponentEditTicke 
                                ? 'Complete los campos para crear un nuevo ticket de soporte.'
                                : null
                            }
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <TicketIcon className="h-4 w-4 mr-2 text-blue-600" />
                                <InputLabel htmlFor="comentario">
                                    Descripción
                                </InputLabel>
                            </div>
                            <div className="text-xs text-gray-500">
                                {!isDisabledComponentEditTicke 
                                    ? 'Proporcione detalles claros sobre el problema o solicitud.'
                                    : null
                                }    
                            </div>
                            <div className="border border-gray-300 rounded-md p-1">
                                <TextareaAutosize
                                    id="comentario"
                                    value={isDisabledComponentEditTicke 
                                        ? dataTicket.descripcion
                                        : commentTicket 
                                    }
                                    onChange={(e) => {
                                        setCommentTicket(e.target.value);
                                    }}
                                    disabled={isDisabledComponentEditTicke 
                                        ? true
                                        : false
                                    }
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
                                        value={isDisabledComponentEditTicke && dataTicket.createdDate 
                                            ? dataTicket.createdDate.split('T')[0]
                                            : commentTicketDateStart
                                        }
                                        disabled={true}
                                        onChange={(e) => {
                                            setCommentTicketDateStart(e.target.value);
                                        }}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                </div>
                            </div>

                            <div className="">
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    <InputLabel htmlFor="comentario" className='!text-sm'>
                                        Fecha de Cierre (Opcional)
                                    </InputLabel>
                                </div>
                                <div className="relative" style={{ display: 'block'}}>
                                    <Input
                                        id="fecha-cierre"
                                        type="date"
                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                        disabled={isDisabledComponentEditTicke && !isTemporarilyDisabled
                                            ? false
                                            : isTemporarilyDisabled 
                                                ? true
                                                : false
                                        }
                                        value={
                                        dataTicket.closedDate
                                            ? dataTicket.closedDate.split('T')[0]
                                            : ''
                                        }
                                        onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        const today = new Date().toISOString().split("T")[0];

                                        if (selectedDate >= today) {
                                            if (isDisabledComponentEditTicke && dataTicket.closedDate) {
                                                setCommentTicketDateEnd(e.target.value);
                                            } else {
                                                setDataTicket(prev => ({ ...prev, closedDate: e.target.value }));
                                            }
                                        } else {
                                            setCommentTicketDateEnd(null);
                                            e.target.value = '';
                                            toast.error("Selecciona una fecha igual o mayor al día de hoy");
                                        }
                                        }}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                </div>

                                {dataTicket.closedDate === null ? (  
                                    <div className="text-xs text-gray-500">
                                        Deje en blanco si el ticket sigue abierto.
                                    </div>
                                ) : null}
                               
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
                                    disabled={isDisabledComponentEditTicke && !isTemporarilyDisabled
                                            ? false
                                            : isTemporarilyDisabled 
                                                ? true
                                                : false
                                    }
                                    value={dataTicket 
                                        ? dataTicket.ticketStatusId 
                                        : estatusTicket
                                    }
                                    onChange={(e) => {
                                        let valueArg = Number(e.target.value)
                                        if (isDisabledComponentEditTicke && 
                                            dataTicket.ticketStatusId > 0
                                        ) {
                                            setDataTicket(prev => ({ ...prev, ticketStatusId: valueArg}))
                                           
                                        } else {
                                            setEstatusTicket(e.target.value);
                                        } 
                                    }}
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
                                        {Object.keys(dataUser).length !== 0 && (
                                            dataUser.firstName.charAt(0) + dataUser.lastNamePaternal.charAt(0)
                                        )}                      
                                    </div>
                                    <span className="font-medium">
                                        Usuario Actual
                                    </span>
                                </div>

                                <div className="flex items-center p-2 border rounded-md bg-gray-50 mb-1">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-[12px] font-semibold mr-2">
                                        {isDisabledComponentEditTicke && dataTicket.id_Tickets 
                                            ? Object.keys(dataTicket).length !== 0 && (
                                                dataUserTicket
                                                )
                                            : Object.keys(dataUser).length !== 0 && (
                                                dataUser.firstName.charAt(0) + dataUser.lastNamePaternal.charAt(0)
                                                )
                                        }
                                    </div>
                                    <span className="text-sm font-medium">
                                        {isDisabledComponentEditTicke && dataTicket.id_Tickets 
                                            ? Object.keys(dataTicket).length !== 0 && (
                                                dataTicket.nameUserTicket
                                                )
                                            : Object.keys(dataUser).length !== 0 && (
                                                dataUser.firstName +' ' + dataUser.lastNamePaternal
                                                )
                                        }
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {isDisabledComponentEditTicke 
                                        ? `El ticket fue dado de alta por: ${dataUserTicket}`
                                        : 'El ticket será asignado a tu usuario.'
                                    }
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
                                {isDisabledComponentEditTicke && !isTemporarilyDisabled
                                    ? onActionButtonticket() 
                                    : isTemporarilyDisabled 
                                        ? null 
                                        : onActionButtonticket()
                                }
                            </div>
                      </div>
                    </div>
                </DialogContent>
            </Dialog>
        ); 
    };

    /** Funcion que valida que los campos titulo del ticket
    * y estatus del ticket no sean vacios 
    * 
    */
    const onEmptyFileAddTicket = () => {
        // Verificar que los campos no estén vacíos
        if (!commentTicket.trim() || !estatusTicket.trim()) {
            toast.error("Favor completar campos requeridos", {
                position: 'top-center',
            })
            return false;
        }
        return true
    };

    /** Funcion que carga el boton para agregar y/o editar la informacion 
    * de un ticket cumpliendo las reglas de validacion 
    */
    const onActionButtonticket = () => {
        return (
            <Button 
                className="!bg-blue-600 !text-white hover:bg-blue-700 transition-colors"
                onClick={async () => {
                    if (isDisabledComponentEditTicke) {
                        onUpdateDataTicket(dataTicket);                                          
                    } else {
                        const validateFile = await onEmptyFileAddTicket()
                        if (validateFile) {
                            handleCloseModalAddTicket();
                            onAddTicketOperation();
                        }  
                    }
                }}
            >
                {isDisabledComponentEditTicke ? (
                    <>
                        <Edit className="w-4 h-4 mr-2 text-white" />
                        Editar Ticket
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Ticket
                    </>
                )}
                
            </Button>
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
                                    dataTicket.comments.length > 0 
                                        ?   dataTicket.comments.map((item) => {
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
                                        }) : (
                                            <CardContent className="p-8">
                                                <div className="flex flex-col items-center justify-center text-center space-y-4">
                                                    <div className="bg-blue-100 p-3 rounded-full">
                                                        <FileQuestion className="h-10 w-10 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-xl font-bold">
                                                        No hay actividad en este ticket
                                                    </h3>
                                                    <p className="text-muted-foreground text-base">
                                                        Este ticket aún no tiene comentarios o actividad. <br/>Sé el primero en agregar información.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        )
                                }   
                            </div>
                        </div> 
                        {dataTicket.ticketStatusId !== 3 && dataTicket.ticketStatusId !== 4 && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex gap-4 items-start">
                                    <div className="h-10 w-10 mt-1 flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-blue-600 font-semibold mr-2">
                                            {isDisabledComponentEditTicke && dataTicket.id_Tickets && (
                                                Object.keys(dataUser).length !== 0 && (
                                                    dataUser.firstName.charAt(0) + dataUser.lastNamePaternal.charAt(0)
                                                )
                                            )} 
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <TextareaAutosize
                                            placeholder="Escribe un comentario..."
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 !border rounded-md !border-solid shadow-sm h-10 w-full"
                                            value={commentAddTicket}
                                            onChange={(e) => {
                                                setCommentAddTicket(e.target.value);
                                            }}
                                            minRows={2}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button 
                                        className="!bg-blue-700 hover:bg-blue-800 !text-white transition-colors" 
                                        disabled={!commentAddTicket.trim()}
                                        style={{
                                            opacity: !commentAddTicket.trim()
                                                ? '0.5' 
                                                : '1'
                                        }}
                                        onClick={() => {
                                            onAddCommentTicket(dataTicket);
                                            handleCloseModalAddComment();
                                        }}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Agregar Comentario
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>  
        );
    };

    /** Function que recorre el nombre del usuario para mostrar las 
    * iniciales del mismo en el modal de Add y Edit Info del Tickey 
    */
    const getInitials = (name) => {
        return name
        .split(" ")
        .map((n) => n[0])
        .join("")
    }

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
  
    const data = [
        { semana: 'Semana 20', pesos: 3800, usd: 2300, utilidad: 2200 },
        { semana: 'Semana 21', pesos: 3000, usd: 1400, utilidad: 2100 },
        { semana: 'Semana 22', pesos: 2000, usd: 5400, utilidad: 2300 },
        { semana: 'Semana 23', pesos: 2800, usd: 3800, utilidad: 1900 },
        { semana: 'Semana 24', pesos: 1800, usd: 4600, utilidad: 2500 },
        { semana: 'Semana 25', pesos: 2400, usd: 3700, utilidad: 2600 },
        { semana: 'Semana 26', pesos: 3400, usd: 4200, utilidad: 1900 },
      ]
      
      const montoData = [
        { semana: 'Semana 20', monto: 4000 },
        { semana: 'Semana 21', monto: 3200 },
        { semana: 'Semana 22', monto: 2000 },
        { semana: 'Semana 23', monto: 2800 },
        { semana: 'Semana 24', monto: 1900 },
        { semana: 'Semana 25', monto: 2400 },
        { semana: 'Semana 26', monto: 3500 },
      ]
      
      const pieData = [
        { name: 'MXN', value: dataDetailOperatio.montoMXN }, // Asumiendo un tipo de cambio de 1 USD = 20 MXN
        { name: 'USD', value: dataDetailOperatio.montoUSD }, 
      ]
      const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']

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
        setIdRegister(localStorageArg.userRecordId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

  return (
    <>
        {error400 ? <Error400 /> :
            isLoader ? <Loader /> :
                <div className="flex h-screen bg-white">
                    <NavBar/>
                    <div className='flex-1 overflow-y-auto'>
                        <Head />
                        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
                            <Toaster 
                                position="top-center" 
                                toastOptions={{
                                    duration: 2000, // más tiempo de visibilidad
                                }}
                            />
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" className="!text-blue-600"
                                            onClick={() => {
                                                removeIdDealToLocalStorage('idDeal');
                                                navigate('/operations');
                                            }}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Regresar
                                        </Button>
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            Deal Overview Detail
                                        </h1>
                                    </div>
                                    
                                    {/* Se valida que en el detalle de la operacion se tenga ya registrado un id  */}
                                    <div>
                                        {(dataDetailOperatio.id_EstatusOperacion === 1 ||
                                            dataDetailOperatio.id_EstatusOperacion === 2) &&
                                                infoFilePDF !== null &&
                                                    dataDetailOperatio.id_Ticket === null ? (
                                                        <Button 
                                                            className="!bg-blue-600 !text-white !hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                                            onClick={() => handleOpenModalAddTicket()}
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
                                                                    <EyeOff className="h-5 w-5"/>
                                                                ) : (
                                                                    <Eye className="h-5 w-5"/>
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
                                                        {dataDetailOperatio.fechaInicio.split('T')[0]}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats Cards */}
                                {(idRegister === 1 || idRegister === 2 || idRegister === 3) && (
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 pb-4">
                                        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center"
                                                    style={{
                                                        opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                        transition: "opacity 0.5s ease", // Suaviza la transición
                                                        fontSize: "20px",
                                                    }}
                                                >
                                                    <div>
                                                        <p className="text-base text-blue-700">
                                                            Detalle Operaciones en Pesos MXN
                                                        </p>
                                                        <p className="text-2xl font-bold text-blue-900 pt-4">
                                                            {`$ ${onFormatCurrency(dataDetailOperatio.montoMXN)}`}
                                                        </p>
                                                    </div>
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-blue-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center"
                                                    style={{
                                                        opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                        transition: "opacity 0.5s ease", // Suaviza la transición
                                                        fontSize: "20px",
                                                    }}
                                                >
                                                    <div>
                                                        <p className="text-base text-blue-700">
                                                            Detalles Operación USD
                                                        </p>
                                                        <p className="text-2xl font-bold text-blue-900 pt-4">
                                                            {`USD ${formatNumber(dataDetailOperatio.montoUSD)}`} 
                                                        </p>
                                                    </div>
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-blue-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>                                      
                                        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center"
                                                    style={{
                                                        opacity: showInfo ? 0.1 : 1, // Cambia la opacidad dependiendo del estado
                                                        transition: "opacity 0.5s ease", // Suaviza la transición
                                                        fontSize: "20px",
                                                    }}
                                                >
                                                    <div>
                                                        <p className="text-base text-blue-700">
                                                            Detalle Utilidad Pesos MXN
                                                        </p>
                                                        <p className="text-2xl font-bold text-blue-900 pt-4">
                                                            {`$ ${onFormatCurrency(dataDetailOperatio.utilidad)}`}
                                                        </p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <TrendingUp className="w-5 h-5 text-blue-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                                
                                {/* seccion donde se da de Alta el numero del Deal asignado  para un Deal imcompleto */}
                                <div className="grid md:grid-cols-1 gap-6 pb-5">
                                    <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white">
                                        <div className="grid md:grid-cols-2 gap-6 space-y-2">
                                            <div className=''>
                                                <InputLabel htmlFor="deal">
                                                    Deal
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="deal"
                                                        placeholder="Ejemplo: 10010"
                                                        className="w-64 h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={dataDetailOperatio.deal ?? deal}
                                                        onChange={(e) => {
                                                            let valueDeal = e.target.value
                                                            dataDetailOperatio.deal !== undefined && 
                                                                dataDetailOperatio.deal !== null
                                                                    ? setDetailOperation(prev => ({ ...prev, deal: valueDeal }))
                                                                    : setDeal(valueDeal)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='pt-4'>
                                                <Button 
                                                    className="w-56 h-10 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                                                    onClick={() => {
                                                        setIsLoader(true);
                                                        onUpdateOperationDeal('updateDeal');
                                                    }}
                                                >
                                                    <Send className="mr-2 h-4 w-4" /> 
                                                    Registrar Deal
                                                </Button>
                                            </div>

                                        </div>

                                        <div className="flex justify-start items-center space-x-4 pt-7">
                                            {(dataDetailOperatio.deal !== '' &&
                                                infoFilePDF !== null)
                                            && (
                                                <>
                                                    <select
                                                        className="w-48 h-10 p-2 text-sm border rounded-lg  border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                                                        placeholder='BBVA'
                                                        value={
                                                            dataDetailOperatio.id_EstatusOperacion ?? idStatusOperation
                                                        }
                                                        onChange={(e) => {
                                                            let valueArg = Number(e.target.value)
                                                            if (dataDetailOperatio.id_EstatusOperacion) {
                                                                setDetailOperation(prev => ({ ...prev, id_EstatusOperacion: valueArg}));
                                                            } else {
                                                                setIdStatusOperation(valueArg);
                                                            }
                                                        }}
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

                                                    <div className="flex justify-start items-center space-x-4">
                                                        <Button 
                                                            className="w-full h-10 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                                                            onClick={() => {
                                                                setIsLoader(true);
                                                                onUpdateOperationDeal('updateStatus');
                                                            }}
                                                        >
                                                            <BookCheck className="mr-2 h-4 w-4" /> 
                                                            Actualizar Estatus Operacion
                                                        </Button>
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    </Card>
                                </div>

                                <div className="grid md:grid-cols-1 gap-6 pb-5">
                                    <Card className="bg-white">
                                        {dataDetailOperatio.deal === '' ? (
                                            onMessageInformativo()
                                        ) : (
                                        <>
                                            {/* seccion donde se guardar y actulizan los archivos PDF y PDF INVOICE en el detalle de un Deal */}
                                            <div className="space-y-4">
                                                <div className="grid md:grid-cols-2 gap-4 p-5">
                                                    <div className={`${infoFilePDF !== null ? 'h-96 gap-4' : 'h-40'} flex flex-row justify-start items-start p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all`}>
                                                        {/* seccion para cargar un PDF cuando este aun no se a subido al un Deal */}
                                                        <div className={`${infoFilePDF !== null ? 'hidden' : ''} w-1/2 flex flex-col h-[120px] justify-center items-start`}>
                                                            <div className="flex items-center gap-2 mb-2 pb-2">
                                                                <Upload className="h-5 w-5 text-purple-500" />
                                                                <InputLabel>
                                                                    Documento PDF
                                                                </InputLabel>
                                                            </div>

                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                className="cursor-pointer"
                                                                onChange={(e) => {
                                                                    setPdfFile(e.target.files?.[0])
                                                                    onHandleFilePDF(e.target.files?.[0])
                                                                }}
                                                            />
                                                        </div>
                                                        <div className={`${infoFilePDF !== null ? 'hidden' : ''} flex flex-row justify-end items-center w-1/2 h-[120px]`}>
                                                            {isDisableFilePDF && (
                                                                //<div className='flex flex-row w-full gap-4 justify-center pt-4'>
                                                                <div className='flex flex-col justify-center items-center gap-4 w-48'>
                                                                    <span className='text-base text-gray-400'>
                                                                        Archivo Seleccionado
                                                                    </span>
                                                                    <Button 
                                                                        className='!bg-blue-500 !text-white h-9'
                                                                        onClick={() => handleOpenModalPDF()}
                                                                    >
                                                                        <Eye className="h-5 w-5"/>
                                                                    </Button>   
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* seccion para Actualizar un PDF cuando este ya viene en el detalle de un Deal y se desea actulizar el mismo ademas de mostrar el archivo
                                                            PDF que ya viene desde la DB */}
                                                        {infoFilePDF !== null && (
                                                            <div className='w-full flex flex-col justify-center items-start'>
                                                                <div className='flex flex-row gap-2'>
                                                                    <div>
                                                                        <div className="flex flex-row items-center gap-2 mb-2 pb-2">
                                                                            {/* <Upload className="h-5 w-5 text-purple-500" /> */}
                                                                            <div className="left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                                                <Upload className="w-4 h-4 text-blue-600" />
                                                                            </div>
                                                                            <InputLabel>
                                                                                Documento PDF
                                                                            </InputLabel>
                                                                        </div>

                                                                        <input
                                                                            type="file"
                                                                            accept="application/pdf"
                                                                            className="cursor-pointer"
                                                                            onChange={(e) => {
                                                                                setPdfFile(e.target.files?.[0])
                                                                                onHandleFilePDF(e.target.files?.[0])
                                                                            }}
                                                                        />
                                                                    </div>    
                                                                    {isDisableFilePDF && (
                                                                        // <div className='flex flex-row w-full gap-2 justify-center pt-4'>
                                                                        <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                            <span className='text-base text-gray-400'>
                                                                                Archivo Seleccionado
                                                                            </span>
                                                                            <Button 
                                                                                className='!bg-blue-500 !text-white h-9'
                                                                                onClick={() => handleOpenModalPDF()}
                                                                            >
                                                                                <Eye className="h-5 w-5"/>
                                                                            </Button> 
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <br/><br/>
                                                                {/*archivo PDF que viene desde la DB */}

                                                                <div className='flex flex-row gap-2'>
                                                                    <div>
                                                                        <iframe
                                                                            src={`data:application/pdf;base64,${infoFilePDF}`}
                                                                            width="350px"
                                                                            height="230px"
                                                                            title="PDF Viewer"
                                                                        ></iframe>
                                                                    </div>
                                                                    {/* <div className='flex flex-row gap-2 items-center'> */}
                                                                    <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                        <span className='text-base text-gray-400'>
                                                                            Archivo Guardado
                                                                        </span>
                                                                        <Button 
                                                                            className='!bg-blue-500 !text-white h-9'
                                                                            onClick={() => handleOpenModalPDFDetail()}
                                                                        >
                                                                            <Eye className="h-5 w-5" />
                                                                        </Button> 
                                                                    </div>  
                                                                </div>
    
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* seccion para cargar un PDF INVOICE cuando este aun no se a subido al un Deal */}
                                                    <div className={`${infoFilePDFFed !== null ? 'h-96 gap-4' : 'h-40 gap-10'} flex flex-row items-start justify-start p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all`}>
                                                        <div className={`${infoFilePDFFed !== null ? 'hidden' : ''} w-1/2 flex flex-col h-[120px] justify-center items-start`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                                    <Upload className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <InputLabel>
                                                                    Documento INVOICE
                                                                </InputLabel>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                className="cursor-pointer"
                                                                onChange={(e) => {
                                                                    setfedFile(e.target.files?.[0]);
                                                                    onHandleFileDEF(e.target.files?.[0]);
                                                            
                                                                }}                                               
                                                            />
                                                        </div>
                                                        <div className={`${infoFilePDFFed !== null ? 'hidden' : ''} flex flex-row justify-end items-center w-1/2 h-[120px]`}>
                                                            {isDisableFileFed && ( 
                                                                // <div className='flex flex-row w-full gap-4 justify-center pt-4'>
                                                                <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                    <span className='text-base text-gray-400'>
                                                                        Archivo Seleccionado
                                                                    </span>
                                                                    <Button 
                                                                        className='!bg-blue-500 !text-white h-9'
                                                                        onClick={() => handleOpenModalFed()}
                                                                    >
                                                                        <Eye className="h-5 w-5"/>
                                                                    </Button>
                                                                </div>   
                                                            )}
                                                        </div>

                                                        {/* seccion para Actualizar un PDF INVOICE cuando este ya viene en el detalle de un Deal y se desea actulizar el mismo ademas de mostrar el archivo 
                                                            PDF que ya viene desde la DB */}
                                                        {infoFilePDFFed !== null && (
                                                            <div className='w-full flex flex-col justify-center items-start'>
                                                                <div className='flex flex-row gap-2'>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Upload className="h-5 w-5 text-orange-500" />
                                                                            <InputLabel>
                                                                                Documento INVOICE
                                                                            </InputLabel>
                                                                        </div>
                                                                        <input
                                                                            type="file"
                                                                            accept="application/pdf"
                                                                            className="cursor-pointer"
                                                                            onChange={(e) => {
                                                                                setfedFile(e.target.files?.[0]);
                                                                                onHandleFileDEF(e.target.files?.[0]);
                                                                        
                                                                            }}                                               
                                                                        />
                                                                    </div>

                                                                    {isDisableFileFed && (
                                                                        // <div className='flex flex-row w-full gap-2 justify-center pt-4'>
                                                                        <div className='flex flex-col justify-center items-center gap-2 w-48'>                                                        
                                                                            <span className='text-base text-gray-400'>
                                                                                Archivo Seleccionado
                                                                            </span>
                                                                            <Button 
                                                                                className='!bg-blue-500 !text-white h-9'
                                                                                onClick={() => handleOpenModalFed()}
                                                                            >
                                                                                <Eye className="h-5 w-5" />
                                                                            </Button> 
                                                                            
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <br/><br/>
                                                                {/*archivo PDF que viene desde la DB */}

                                                                <div className='flex flex-row gap-2'>
                                                                    <div>
                                                                        <iframe
                                                                            src={`data:application/pdf;base64,${infoFilePDFFed}`}
                                                                            width="350px"
                                                                            height="230px"
                                                                            title="PDF Viewer"
                                                                        ></iframe>
                                                                    </div>
                                                                    {/* <div className='flex flex-row gap-2 items-center'> */}
                                                                    <div className='flex flex-col justify-center items-center gap-2 w-48'>
                                                                        <span className='text-base text-gray-400'>
                                                                            Archivo Guardado
                                                                        </span>
                                                                        <Button 
                                                                            className='!bg-blue-500 !text-white h-9'
                                                                            onClick={() => handleOpenModalPDFedDetail()}
                                                                        >
                                                                            <Eye className="h-5 w-5" />
                                                                        </Button> 
                                                                    </div>  
                                                                </div>    
                                                            </div>    
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* // boton que ejecuta el api para guardar y/o actulizar documento PDF y  PDF INVOICE en el  Detalle de un Deal */}
                                            <div className="flex justify-end space-x-4 p-5">
                                                <Button 
                                                    className="bg-gradient-to-r w-96 wh-10 from-blue-600 to-blue-800 !text-white hover:from-blue-700 hover:to-blue-900"
                                                    style={{
                                                        opacity: isDisabledButtonAddAndUpdateFilePDF
                                                            ? '0.5' 
                                                            : '1'
                                                    }}
                                                    disabled={isDisabledButtonAddAndUpdateFilePDF}
                                                    onClick={() => {
                                                        setIsLoader(true);
                                                        onAddAndUpdateFilePDFDealDetail();
                                                    }}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {infoFilePDF === null || infoFilePDFFed === null
                                                        ? 'Subir Archivos PDF'
                                                        : 'Actualizar Archivos PDF'
                                                    } 
                                                </Button>
                                            </div>
                                            {/* seccion donde se guardar y actulizan los archivos PDF y PDF INVOICE en el detalle de un Deal */}
                                        </>
                                        )}
                                    </Card>
                                </div>

                                {/* Seccion donde se muestran el ticket y los comentarios de mismo ticket creado  */}
                                {isDisabledComponentEditTicke && (
                                    <div className="grid md:grid-cols-1 gap-6 pb-5">
                                        <Card className="bg-white p-0">
                                            <div className='p-4'>
                                                <div className="flex items-center">
                                                    <TicketIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                    Ticket
                                                </div>
                                            </div>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {Object.keys(dataTicket).length !== 0 && ( 
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
                                                                            {(dataTicket.closedDate !== null && isTemporarilyDisabled) && (
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
                                                                <div className="flex items-center space-x-0">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm" 
                                                                        className="p-0 h-auto"
                                                                        onClick={() => {
                                                                            handleOpenModalAddComment()
                                                                        }}
                                                                    >
                                                                        <span className="text-xs text-gray-500 ml-1">
                                                                            {dataTicket.comments.length > 0 
                                                                                ? (
                                                                                    <>
                                                                                        <div className='flex items-center justify-between w-full'>
                                                                                            <MessageSquare className="h-4 w-4 mr-2 text-blue-600 "/> 
                                                                                            <span className='text-gray-400'>
                                                                                                {dataTicket.comments.length}
                                                                                            </span>
                                                                                        </div>
                                                                                    </>
                                                                                    )
                                                                                : <Plus className="w-4 h-4 text-blue-600"/>
                                                                            } 
                                                                        </span>
                                                                    </Button>  
                                                                    {dataDetailOperatio.id_Ticketb !== null && (
                                                                        <Button
                                                                            onClick={() => {
                                                                                handleOpenModalAddTicket();
                                                                            }}
                                                                        >
                                                                            {dataTicket.length > 0 && !isTemporarilyDisabled ? (
                                                                                <Edit className="w-4 h-4 text-blue-600" />
                                                                            ) : isTemporarilyDisabled ? (
                                                                                <Eye className="w-4 h-4 text-blue-600" />
                                                                            ) : (
                                                                                <Edit className="w-4 h-4 text-blue-600" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

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
                                                                // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                                                            <Tooltip />
                                                            <Bar dataKey="pesos" fill="#f97316" name="Utilidad MXN" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Charts */}
                                <div className="grid md:grid-cols-2 gap-6" style={{ display: 'none' }}>
                                    <Card className="bg-white">
                                        <div className='flex flex-row p-4'>
                                            <BarChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                                            <InputLabel className="flex flex-row items-center">
                                                Gráfica de Pesos MXN, Monto en USD, Utilidad
                                            </InputLabel>
                                            
                                        </div>
                                        <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="semana" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '0.5rem'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="pesos" fill="#FF6384" name="Pesos MXN" />
                                                    <Bar dataKey="usd" fill="#36A2EB" name="USD" />
                                                    <Bar dataKey="utilidad" fill="#FFCE56" name="Utilidad" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white">
                                        <div className='flex flex-row p-4'>
                                            <Activity className="w-5 h-5 mr-2 text-green-500" />
                                            <InputLabel className="flex items-center">
                                                Gráfica de Monto $ CTE TC
                                            </InputLabel>
                                        </div>
                                        <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={montoData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="semana" />
                                                <YAxis />
                                                <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.5rem'
                                                }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="monto" 
                                                    stroke="#4BC0C0" 
                                                    fill="url(#colorMonto)" 
                                                />
                                                <defs>
                                                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4BC0C0" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#4BC0C0" stopOpacity={0}/>
                                                </linearGradient>
                                                </defs>
                                            </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white md:col-span-2">
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
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        }
        {onModalPreviewPDF()}
        {onModalPreviewDEF()}
        {/* //modales para ver el detalle de un PDF o un PDF INVOICE que vienen desde el Detail de un Deal */}
        {onModalViewPDFDetail()}
        {onModalViewPDFFedDetail()}
        {/* Modales paragregar ticket y ver y agregar comentatios ese ticket */}
        {onAddTicket()}
        {onListCommentTicket()}
    </>
  )
}

export default DetailDeail