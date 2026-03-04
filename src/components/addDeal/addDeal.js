import React, { useEffect, useState } from 'react'
import NavBar from '../navBar/navBar'
import Head from '../head/head';
import Footer from '../footer/footer';

import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import { toast, Toaster } from "react-hot-toast";

import {
    Calendar,
    Upload,
    DollarSign,
    Percent,
    FileText,
    Send,
    User,
    UserCircle,
    X,
} from "lucide-react"

import Error400  from '../errorServices/error400';
import Loader from '../loader/loader';

import {
    useNavigate
} from 'react-router-dom';

import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion';

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import {
    apiGetPlatform,
    apiAddOperations,
    apiGetCatalogCurrencies
} from '../../apis/services';

import {
    readToLocalStorage,
} from '../../apis/localStorage'

const AddDeal = () => {

    /**Variable que se utiliza para realizar la navegacion y/o redireccionamiento 
    entre pantatalas de aplicativo SUMMA segun el proceso realizado */
    let navigate = useNavigate();

    /**Estado que almacenan el valor de Loader y Error de api */
    const [isLoader, setIsLoader] = useState(false);
    const [error400, setError400] = useState(false);

    /**Estados principales para agregar Deal */
    const [deal, setDeal] = useState('');
    const [nameUser, setNameUser] = useState('');
    const [beneficiary, setBeneficiary] = useState('');
    /**Estado que guarda la fecha incial o con la que se registra
     * un Deal y/u operacion
     */
    const [dateStartDeal, setDateStartDeal] = useState(
        new Date().toISOString().split('T')[0]
    );
    /**Estado que guarda la fecha fin o la fecha en la que finaliza la 
    * el Deal y/u operacion NOTA: igual sirve como indicativo de fecha de pago
    */
    const [dateEndDeal, setDateEndDeal] = useState(
        new Date().toISOString().split('T')[0]
    );
    /**Estado que almacena el nombre del promotor que envio esta oepracion */
    const [sponsor, setSponsor] = useState('');
    /**Esatdo que almacena el nombre de la plataforma seleecionad por el usuario
    * del catalogo de plataformas
    */
    const [platform, setPlatform] = useState('');

    /** estados principales que realizan operaciones para llenar demas campos */
    /**estado que alamcena el Id del select de Divisas */
    const [currencyAmount ,setCurrencyAmount] = useState('');
    /**Estado que alamacena el monto de la operacion
    * NOTA: este variable se declaro con este nombre por que se penso en un inicio 
    * que solo se iba a trabaajr con la divisa USD
    */
    const [amountUsd, setAmountUsd] = useState('');
    /**Esatdo que guarda el tipo de cambio que se le va a dar a la operacion */
    const [exchangeRate, setExchangeRate] = useState('');
    /**Estado que guarda el tipo de cambio que se le va a ofrecer al usaurio 
     * al registrar este Deal y/u Operacion
     */
    const [exchangeRateClient, setExchangeRateClient] = useState('');

    /**Estado que alacena la comision por porcentaje% que el usuario se ahorra 
     * por utilizar nuestro servicio NOTA: este campo se comento ya que se espera
     * que ese valor sea para los cliente finales en futuro
     */
    const [commissionPercentage, setCommisonPercentage] = useState('');

    /**Estado booleano que controla el tipo de comision que se le va agregar
    * cuando se registrar este Deal y/u Operacion
    */
    const [isCommissionCheck, setIsCommisonCheck] = useState(false);

    /**Estado que almacena el catalogo de Plataformas que se registraron
    * previamente en el tablero de plataformas
    */
    const [dataPlatform, setDataPlatform] = useState();
    /**Estado que almacena el catalogo de divisas */
    const [dataCurrency, setDataCurrency] = useState([]);

    /** estados que reciven valores de los cuatro campos principales del DEAL y/u operacion
     * Despues de realizar las validaciones y operaciones correspondientes para
     * mostrar estos datos en sus diferentes componentes Inputs y el usuario 
     * valide esta informacion y registre este Deal y/u operacion
    */
   /**Esatdo de guarda el monto en MXN $ */
    const [amountMXN, setAmountMXN] = useState('');
    /**Estado que guardar el porcentaje que el usuario se ahorro por utilizar nuestro servicios
    * NOTA: Este estado y componente se comento por que es para los usuarios finales
    * ya que esto esta pensado para que los cliente entre a esta aplicacion
    */
    const [commissionRemittance, setCommissionRemittance] = useState('');
    /**Esatdo que almacena el montoCTE del tipo de Cambio del cliente */
    const [amountCteTc, setAmountCteTc] = useState('');
    /**Estado que almacena el casque del Deal y/u Operacion */
    const [casque, setCasque] = useState('');
    /**Esatdo que almace la comision por la operacion realizada */
    const [commissionDollar, setCommissionDollar] = useState('');
    /**Esatdo que almacena del Deposito del Cliente */
    const [depCustomer, setDepCustomer] = useState('');
    /**Estado que almacena la  */
    const [utility, setUtility] = useState('');

    /*****************************IMPORTANTE**************************************/
    /**Estados que almacena los valores de los PDF's, estados modales para agregar los
    * archivos a este Deal y/u Operacion 
    * NOTA: todos estos estados no se ocupan ya que estos arcivos se suben en el 
    * detalle de un Deal y/u operacion
    */
    /** estados para guardar, y previsualizar PDF que se sube para agregar informacion del Lead */
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [isDisableFilePDF, setIsDisabledFilePDF] = useState(false);
    const [openModalPDF, setOpenModalPDF] = useState(false);
    const handleOpenModalPDF = () => setOpenModalPDF(true);
    const handleCloseModalPDF = () => setOpenModalPDF(false);
    /** estado que almacena variable de PDF en base 64 */
    const [, setPdfFileBase64] = useState('');
    /** ---------------- End estados para guardar, y previsualizar PDF ------------------ */

    /** estados para guardar, y previsualizar INVOICE que se sube para agregar informacion del Lead */
    const [fedFile, setfedFile] = useState(null);
    const [defUrl, setFedUrl] = useState('');
    const [isDisableFileFed, setIsDisabledFileFed] = useState(false);
    const [openModalFed, setOpenModalFed] = useState(false);
    const handleOpenModalFed = () => setOpenModalFed(true);
    const handleCloseModalFed = () => setOpenModalFed(false);
    /** estado que almacena variable de PDF INVOICE en base 64 */
    const [, setPdfFedFileBase64] = useState('')
    /** ---------------- End estados para guardar, y previsualizar INVOICE ------------------ */
     /**Estados que almacena los valores de los PDF's, estados modales para agregar los
    * archivos a este Deal y/u Operacion 
    * NOTA: todos estos estados no se ocupan ya que estos arcivos se suben en el 
    * detalle de un Deal y/u operacion
    *****************************IMPORTANTE**************************************
    */

    /** estado de habilita campos de operaciones depues de pasar
    * la validacion onValidateFile para seguir con el flujo
    // */
    const [
        isDisableFileOperation,
        setIsDisableFileOperation,
    ] = useState(true);
    //*** se cambio a false por true */

    /** estados settean los estados que abren y cierran modal Para confirmar
    * los datos al Agregar y/o dar de Alta una Operacion y/o Deal
    */
    const [
        openOperationConfirmation,
        setOpenOperationConfirmation
    ] = useState(false);
    const onOpenOperationConfirmation = () => setOpenOperationConfirmation(true);
    const onCloseOperationConfirmation = () => setOpenOperationConfirmation(false);

    /** Estado que controla cuando el boton de agregar si se visualiza para agregar
    * un Deal y/o Operacions despues que se se realizan todos los demas procesos
    * y validaciones
    */
    const [
        isViewableButtonAdd,
        setIsViewableButtonAdd
    ] = useState(false);

    /** Estado que controla el comportamiento del boton Agregar Deal y/o Operacion
    * para que no se le de Click varias veces y este mande error
    * cuando se este consuminedo el servicio de login
    */
    const [
        isDisableButtonAddDeal,
        setIsDisableButtonAddDeal
        ] = useState(false);

    /** Estado que controla el contador para validar
    * que agregue un 0 a la operacion y poder seguir con el proceso
    */
    const [contadorValue, setContadorValue] = useState(0);
    /** Esatdo que valida que todos los campos de las operaciones tengan valor
    * y se continue con el proceso de mostrar el modal para
    * agregar una Operacion y/o Deal
    */
    const [isValidateOpertion, setIsValidateOperation] = useState(false);

    /**Funcion para visualizar file PDF que se sube al momento de agregar el LEAD*/
    const onHandleFilePDF = async (fileArg) => {
        const file = fileArg
        if (file && file.type === 'application/pdf' ) {
            setIsDisabledFilePDF(true);
            setPdfFile(file);
            const fileUrl = URL.createObjectURL(file)
            setPdfUrl(fileUrl)

            if (file) {
                try {
                  const base64String = await onConvertFileToBase64(file);
                  setPdfFileBase64(base64String);
                  /** Aquí puedes guardar el string en tu estado o enviarlo a tu backend */
                } catch (error) {
                  throw error
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
                            vista previa Dcoumento PDF:<br/>
                            {pdfFile ? pdfFile.name : ''}
                        </DialogTitle>
                        <X onClick={handleCloseModalPDF} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <iframe
                                src={pdfUrl}
                                width='100%'
                                height='550px'
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
                  const base64String = await onConvertFileToBase64(file);
                  setPdfFedFileBase64(base64String);
                  /** Aquí puedes guardar el string en tu estado o enviarlo a tu backend */
                } catch (error) {
                  throw error
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
                            vista previa Dcoumento INVOICE:<br/>
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

    /** Funcion que convierte el archivo PDF seleccioando en **base64** para que
     * se guarde en la base de datos con este tipo para seguridad de los archivos que se
     * suben a cada operacion
     */
    const onConvertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result.split(',')[1]); /** Extraemos solo la cadena Base64 sin el prefijo */
          };

          /** Evento que se ejecuta si hay un error */
          reader.onerror = (error) => {
            reject(error);
          };

          /** Leer el archivo como una URL de datos (base64) */
          reader.readAsDataURL(file);
        });
    };

    /** Funcion que manda a llamar el sevicio de plataformas y cargar lo en el select */
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

    /** Funcion que manda a llamar el sevicio de plataformas y cargar lo en el select */
    const onGetlAllCurrency = async () => {
        try {
            const response = await apiGetCatalogCurrencies();
            if(response){
                setDataCurrency(response.data);
            }
        } catch (error) {
            throw error;
        }
    };

    /**Este useEffect  ejecuta los servicios (Catalogo de Plataformas y Tipo de Divisas) 
    * que carga la data de los catalogos que se necesitan para agregar y/o registrar un deal 
    */
    useEffect(() => {
        onGetlAllPlatform();
        onGetlAllCurrency();
    }, []);


    /** Funcion que valida que los campos
    * Nombre del Cliente, Beneficiario, Fecha Inico, Fecha Fin, Promotor y Plataforma
    * no esten vacios para seguir con el flujo
    */
    const onValidateFile = () => {
        try {
            let statusValidate = false;
            if (nameUser === '' ||
                beneficiary === '' ||
                sponsor === '' ||
                platform === ''
            ) {
                toast.error("Los campos estan vacios.", {
                    position: 'top-right',
                });
                statusValidate = false;
            } else {
                statusValidate =  true
            }

            return statusValidate
        } catch (error) {
            throw error
        }
    };
    
    /** Funcion javascript que valida los campos donde solo se permite ingresar
    * texto y o palabras y no permite agregar numeros 
    */
    const handleValidateText = (e, setValue) => {
        const value = e.target.value;
        const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; /** Solo letras y espacios */
        if (onlyLettersRegex.test(value) || value === "") {
            setValue(value);
        }
    };

    /** Funcion javascript que valida que en campo MONTO solo se ingresen 
    * valores numercos y no letras para comtinuar con el proceso de las 
    * operaciones necesarias para registrar un DEAL
    */
    const handleInputNumerChange = (e, setValue) => {
        const value = e.target.value; 
        const regex =/^[0-9.,]*$/ /** Solo permite numeros */
        if (regex.test(value) || value === "") {
            setValue(value);
        }
    };

    /** Funcion javascript que valida los campos Tipo de cambio y TP Cliente 
    * que solo permita numero y que respete esta estrcutura 21.4590
    * ademad que despues del punto decimal solo se puedam agregar 4 numero 
    * como parte decimal
    */
    const handleInputChange = (e, setValue) => {
        let value = e.target.value.replace(/[^0-9.]/g, ''); // Permitir solo números y punto
        const regex = /^\d+(\.\d{0,4})?$/;
        if (value === '' || (regex.test(value) && value.length <= 7)) {
            setValue(value);
        }
    };

    /** Funcion para mostrar operaciones con 2 puntos decimales despues del punto a la derecha */
    const onFormatCurrency = (value) => {
        return Number(value).toLocaleString(
            'en-US', {minimumFractionDigits: 2,
                maximumFractionDigits: 2
        })
    };

    const negativeNumber = (valor)  => {
        const numero = typeof valor === 'string'
            ? Number(valor.replace(/[^0-9.-]+/g, ''))
            : valor;
        return !isNaN(numero) && numero < 0;
    };

    /** Funcion que valida si los 4 primeros campos tiene data para que se realizan
    * las operaciones para agregar un ***LEAD***
    */
    const onHanleInputBlur = (filed, value) => {
        if (filed === amountUsd) {
            setAmountUsd(value);
        }
        if (filed === exchangeRate) {
            setExchangeRate(value);
        }
        if (filed === exchangeRateClient) {
            setExchangeRateClient(value);
        }

        if (filed === commissionPercentage) {
            setCommisonPercentage(value)
        }

        /** Valida que los 3 campos principales de la operacion tengan informacion
        * para realizar las operaciones y llenar campos consecuentes de la operacion
        */
        setContadorValue((prev) => prev + 1);
        const isValid =
            amountUsd > 0.00 &&
            exchangeRate > 0.0000 &&
            exchangeRateClient > 0.0000

        const isValidCommission =
            typeof commissionPercentage === 'string' &&
            commissionPercentage.trim() !== ''
        /** Se hace la operacion para setear valor
        * a los campos siguintes:
        * MontoMXN, Comision envio de ahorro,Monto CTE Cleinte
        * Casque, Comisnon por envio de dolar, Dep del Cliente y utilidad
        */

        /** Se valida que los campos Monto-USD, Tipo de cambio, tipo de cambio cliente y comisión por porcentraje
        * sean mayor a 0 para realizar operaciones de la transaccion al Agregar y/o dal de Alta un DEAL
        */
        if (isValid && isValidCommission) {
            /** Operacion que setea el valor al campo Monto MXN */
            let amountMXN = (amountUsd*exchangeRate);
            setAmountMXN(onFormatCurrency(amountMXN));
            /** Operacion que setera el valor de Comision por envio de ahorro */
            let commissionRemittance = (exchangeRateClient*40);
            setCommissionRemittance(commissionRemittance);
            /** operacion para setear el valor de Monto $CTE TC */
            let amountCteTc = (amountUsd*exchangeRateClient)
            setAmountCteTc(onFormatCurrency(amountCteTc));
            /** Realizacion y validacion de operaciones para tener el resultado de la operacion
            * y no esperar a que se setie los datos ya que esto impide realizar las demas operaciones
            * por cuestiones de sincronizacion ****** !NOTA:¡ Este paso es importante ******
            */
            let amountMXNArg = (amountUsd*exchangeRate)
            const isValidMXN = amountMXNArg > 0.00
            let amountCteTcArg = (amountUsd*exchangeRateClient)
            const isValidCteTc = amountCteTcArg > 0.00

            if (isValidMXN && isValidCteTc) {
                /** Operacion para setear el valor del Casque */
                let casqueArg = (amountCteTcArg-amountMXNArg);
                setCasque(onFormatCurrency(casqueArg));
                /** Operacion para obtener la comosion por Operacion */
                /** Operacion para obtener la comosion por Operacion cuando es por porcentaje */
                if(!isCommissionCheck) {
                    let commissionDollarArg = (amountCteTcArg*commissionPercentage);
                    setCommissionDollar(onFormatCurrency(commissionDollarArg/100));
                    /** Operacion para obtener Dep Cliente */
                    let depCustomerArg = (onFormatCurrency(amountCteTcArg+(commissionDollarArg/100)))
                    setDepCustomer(depCustomerArg);
                    /** Operacion para obtener la utilidad */
                    let utilityArg = casqueArg + (commissionDollarArg/100)
                    setUtility(onFormatCurrency(utilityArg));
                } else {/** Operacion para obtener la comosion por Operacion cuando es comision directa */
                    setCommissionDollar(onFormatCurrency(commissionPercentage));
                    /** Operacion para obtener Dep Cliente */
                    let depCustomerArg = onFormatCurrency(amountCteTcArg + parseFloat(commissionPercentage))
                    setDepCustomer(depCustomerArg);
                    /** Operacion para obtener la utilidad */
                    let utilityArg = casqueArg + parseFloat(commissionPercentage)
                    setUtility(onFormatCurrency(utilityArg));
                }
            }
            setIsValidateOperation(true);
            return true
        } else {
            return false
        }
    };

    /** Funcion que valida que los primero 3 campos de la operaicon
    * su estado haya cambiando y se pueda recibir 0 en el campo de
    * comisión
    */
    const handleInputClick = (valueArg) => {
        if (
            isValidateOpertion &&
            valueArg &&
            contadorValue >= 3
        ) {
            setTimeout(() => {
                onOpenOperationConfirmation();
            },1000)
        }
    };

    /** Funcion que le quita el punto a tipo de cambio para que se
    * envie al servicio como numero y se guarde de manera correcta
    * en la base de datos
    */
    const convertToDecimal = (valueArg) => {
        /** Aseguramos que los valores son strings y los convertimos a un formato numérico */
        const parseNumber = parseInt(valueArg.replace('.', ''), 10); /** Convertimos a entero y dividimos para obtener el decimal */
        return parseNumber.toFixed(4)
    };

    /** Funcion que convierte el dato de tipo string en numero
    * para que se guarde de manera correcta en la base de datos
    */
    const toNumber = (valueArg) => {
        const num = parseFloat(valueArg);
        return isNaN(num) ? 1.0 : num;
    };

    /** Funcion que guarda un nuevo Deal y lo muestra en el tablero de Operaciones
    * se trar el userRecordId que se guarado en LocalStorage
    */
    const onAddDeal = async () => {
        try {
            setIsLoader(true);
            /** Variable que accede a los datos del usuario guardados en el LocalStorage
            * de la aplicacion para obtener el ID del usuario logeado
            */
            const idUserArg = readToLocalStorage('user');
            /** Validacion del select de divisas cuando el usuario no a seleccinado una divisa
            * se setea por default el 1 ya que este valor concide con el api de divisas si el usuario 
            * seleeciona otro valor este valor cambia en el estado 
            */
            const isValidCurrency =
            typeof currencyAmount === 'string' &&
            currencyAmount.trim() !== ''
            /** Creacion de elemento JSON para el consumo del servicio AddDeal */
            const body = {
                nombreCliente: nameUser,
                beneficiario: beneficiary,
                fechaInicio: dateStartDeal,
                fechaCierre: dateEndDeal,
                promotor: `${sponsor}-${idUserArg.username}/${idUserArg.firstName}-${idUserArg.lastNamePaternal}`,
                platformId: platform,
                montoUSD: toNumber(amountUsd),
                tipoCambio: parseInt(convertToDecimal(exchangeRate)),
                tcCliente: parseInt(convertToDecimal(exchangeRateClient)),
                comision_Porcentaje: toNumber(commissionPercentage),
                montoMXN: parseInt(amountMXN.replace(/[,.]/g, ''),10),
                comision_Por_Envio_Ahorro: commissionRemittance,
                mto_CTE_TC: parseInt(amountCteTc.replace(/[,.]/g, ''),10),
                casque: parseInt(casque.replace(/[,.]/g, ''),10),
                comision_Dolar: parseInt(commissionDollar.replace(/[,.]/g, ''),10),
                dep_Cliente: parseInt(depCustomer.replace(/[,.]/g, ''),10),
                utilidad: parseInt(utility.replace(/[,.]/g, ''),10),
                id_Divisas: isValidCurrency !== true 
                    ? 1 
                    : parseInt(currencyAmount),
                id_EstatusOperacion: 1,
                userRecordId: idUserArg.userRecordId
            }
            /** Consumo de servico AddDeal */
            const response = await apiAddOperations(body);
            /** Validacion de servicio AddDeal y muestra mensaje informativo 
            * si la operacion de registro con exito
            */
            if (response.status === 201 || response.status === '201') {
                toast.success("Deal registrado \n De manera exitosa", {
                    style: {
                        background: '#4BB543',// color verde para toaster
                        color: '#fff',
                    },
                });
            }

            setTimeout(() => {
                navigate('/operations');
            },2000) 
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                setIsDisableButtonAddDeal(false);
                setError400(false);
                setIsLoader(false);
                navigate('/operations');
            },2000)
            throw error
        }
    };

    /** Componete modal para Agregar un Deal al tablero de Operaciones */
    const onModalOperationConfirmation = () => {
        return (
            <Dialog
                open={openOperationConfirmation}
                onOpenChange={onCloseOperationConfirmation}
            >
                <AnimatePresence>
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModalFed}
                            className="fixed inset-0 bg-black/15 backdrop-blur-sm z-50"
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ 
                                scale: 0.8, 
                                opacity: 0, y: 20 
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: { type: "spring", duration: 0.5 },
                            }}
                            exit={{
                                scale: 0.8,
                                opacity: 0,
                                y: 20,
                                transition: { duration: 0.3 },
                            }}
                            className="relative z-50
                                    w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700
                                    p-6 border border-slate-700"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                            <motion.h2
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
                            >
                                Agregar Deal
                            </motion.h2>
                            <Button
                                variant="ghost"
                                onClick={handleCloseModalFed}
                                className="rounded-full p-2 hover:bg-slate-700/50 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </Button>
                            </div>

                            {/* Content */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-6"
                            >
                            {/* Alert Box */}
                            <div
                                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-6
                                            border border-indigo-500/20 backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-30"/>
                                <div className="relative">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Revisa tus datos antes de continuar
                                </h3>
                                <p className="text-slate-300">
                                    Ya que se guardará el Deal con los datos registrados en este formulario
                                </p>
                                </div>
                            </div>

                            {/* Animated Lines */}
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
                                />
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <Button
                                    onClick={() => {
                                        onCloseOperationConfirmation();
                                        setIsViewableButtonAdd(true);
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500
                                            hover:from-indigo-600 hover:to-cyan-600 !text-white rounded-lg
                                        transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                                >
                                    Cerrar
                                </Button>
                            </div>
                            </motion.div>
                        </motion.div>
                    </>
                </AnimatePresence>
            </Dialog>
        )
    };

    return (
        <>
            {error400 ? <Error400 /> :
                isLoader ? <Loader /> :
                    <div className="flex h-screen bg-white">
                        <NavBar/>
                        <div className='flex-1 overflow-y-auto'>
                            <Head/>
                            <div className="min-h-screen bg-gradient-to-br from-white-50 to-white-100 p-4">
                                <Card className="h-full mx-auto shadow-xl">
                                    {/* max-w-6xl */}
                                    {/* Este componente se inyecta en el Render para que sea visible al momento en el 
                                    que se manda a llamar para informa le al usuario el resultado del proceso que este realzaindo */}
                                    <Toaster 
                                        position="top-right" 
                                        toastOptions={{
                                            duration: 2000, // más tiempo de visibilidad
                                        }}
                                    />
                                    <div className='relative border-b bg-gradient-to-tr from-blue-700 to-blue-900 h-16'>
                                        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100 mb-6 text-center pt-4">
                                            Registro de Datos y Documentos
                                        </h2>
                                    </div>
                                    <CardContent className="">
                                        {/* seccion donde se ingresa Deal, Nombre del cliente y Beneficiario */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            {/* Se comento esta campo por que cuando se da de alta un Deal no tenemos
                                            aun un  Deal asigando y por eso ya no se envia  */}
                                            <div className="space-y-2" style={{ display: 'none'}}>
                                                <InputLabel htmlFor="deal">
                                                    Deal
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="deal"
                                                        placeholder="Ejemplo: 10010"
                                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={deal}
                                                        type='text'
                                                        onChange={(e) => {
                                                            setDeal(e.target.value)
                                                        }}
                                                    />
                                                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-yellow-500" />
                                                </div>
                                            </div>
                                            {/* Campo y/o Componente en donde se alamcena el nombre del cliente con el que 
                                            se va a registar este Deal y/o Operacion */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="cliente">
                                                    Nombre del Cliente
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="cliente"
                                                        placeholder="Ejemplo: Carlos"
                                                        className="w-full  h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={nameUser}
                                                        onChange={(e) => {
                                                            handleValidateText(e, setNameUser)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <UserCircle className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                                        
                                            {/* Campo y/o Componente en donde se alamcena el nombre del 
                                            beneficiario de este Deal y/o Operacion */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="beneficiario">
                                                    Beneficiario
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="beneficiario"
                                                        placeholder="Ejemplo: Ismael"
                                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={beneficiary}
                                                        onChange={(e) => {
                                                            handleValidateText(e, setBeneficiary)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <br/>

                                        {/* seccion donde se ingresa las fecha de la operacion */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            {/* Campo y/o Componente de Tipo Fecha que almacena la fecha inicio o la fecha
                                            en la que se esta resgistrando este Deal y/u Operacion */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="fecha-inicio">
                                                    Fecha Inicio
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="fecha-inico"
                                                        type="date"
                                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={dateStartDeal}
                                                        onChange={(e) => {
                                                            setDateStartDeal(e.target.value)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Campo y/o Componente de Tipo Fecha que almacena la fecha fin
                                            o la fecha en la que se tiene que pagar este Dela y/u Operacion*/}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="fecha-inico">
                                                    Fecha Fin
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="fecha-fin"
                                                        type="date"
                                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={dateEndDeal}
                                                        onChange={(e) => {
                                                            setDateEndDeal(e.target.value)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <br/>

                                        {/* seccion donde se cargan datos del Promotor y plataforma */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            {/* Campo y/o Componente en donde de guarda el 
                                            nombre del Promotor que envia este deal para registrar lo */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="promotor">
                                                    Promotor
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="promotor"
                                                        placeholder="Ejemplo: Brenda"
                                                        className="w-full h-12 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
                                                        value={sponsor}
                                                        onChange={(e) => {
                                                            handleValidateText(e, setSponsor)
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Campo y/o Componente Select que carga la data de las plataformas 
                                            previamente registardas en el tablero de Plataformad */}
                                            <div className="space-y-2">
                                                <InputLabel>
                                                    Plataforma
                                                </InputLabel>
                                                <select
                                                    className="w-full h-12 p-2 mb-6 text-sm border rounded-lg  border-gray-400 border-b-4 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-blue-400"
                                                    placeholder='BBVA'
                                                    value={platform}
                                                    onChange={(e) => {
                                                        setPlatform(e.target.value)
                                                    }}
                                                    onBlur={async (e) => {
                                                        let value = e.target.value
                                                        const validate =  await onValidateFile()
                                                        if (value !== 0 && validate) {
                                                            setIsDisableFileOperation(false);

                                                        };
                                                    }}
                                                >
                                                    {Array.isArray(dataPlatform) &&
                                                    dataPlatform.map((item) => {
                                                        return (
                                                            <option
                                                                key={item.id_BankingPlatform}
                                                                value={item.id_BankingPlatform}
                                                            >
                                                                {item.platformName}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        {/* secccion donde se carga archivos PDF's */}
                                        {/* se comento esta seccion donde de suben los PDF's de un Deal ya que cuando damos de alta un
                                            Deal aun no contamos con esos documentos por eso ya no se muestra esta sección */}
                                        <div className="mt-8 space-y-4" style={{ display: 'none'}}>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {/* Componete que agrega un Archivo PDF a un Deal y/u operacion
                                                cuando ya se cuenta con dicho docuemnto */}
                                                <div className="flex flex-col items-start justify-center h-40 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all">
                                                    <div className="flex items-center gap-2 mb-2">
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
                                                    <br/>
                                                    {isDisableFilePDF ?
                                                        <Button
                                                            className='!bg-blue-500 !text-white'
                                                            onClick={() => handleOpenModalPDF()}
                                                        >
                                                            Vista previa
                                                        </Button>
                                                    : ''}
                                                </div>
                                            {/* Componete que agrega un Archivo PDF para el cliente de un Deal y/u operacion
                                                cuando ya se cuenta con dicho docuemnto */}
                                                <div className="flex flex-col items-start justify-center h-40 p-4 border-2 border-dashed rounded-lg hover:border-blue-400 transition-all">
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
                                                            setfedFile(e.target.files?.[0])
                                                            onHandleFileDEF(e.target.files?.[0])
                                                        }}
                                                    />
                                                    <br />
                                                    {isDisableFileFed ?
                                                        <Button
                                                            className='!bg-blue-500 !text-white'
                                                            onClick={() => handleOpenModalFed()}
                                                        >
                                                            Vista previa
                                                        </Button>
                                                    : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <br/>

                                        <div className="w-full border-t border-blue-600 my-4"></div>
                                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                            {/* Campo Monto en donde se incluye select de divisas */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="monto-usd" className="block text-gray-700">
                                                    Monto
                                                </InputLabel>
                                                <div className="flex items-center border rounded-lg border-b-4 border-gray-400 hover:border-blue-400 overflow-hidden h-12">
                                                    <select
                                                        className="h-12 px-3 bg-gray-100 text-gray-700 border-r border-gray-300 focus:outline-none"
                                                        value={currencyAmount}
                                                        disabled={isDisableFileOperation}
                                                        onChange={(e) => {
                                                            setCurrencyAmount(e.target.value)
                                                        }}
                                                    >
                                                        {Array.isArray(dataCurrency) &&
                                                        dataCurrency.map((item) => {
                                                            return (
                                                                <option
                                                                    key={item.id_Divisas}
                                                                    value={item.id_Divisas}
                                                                >
                                                                    {item.description}
                                                                </option>
                                                            )
                                                        })}
                                                    </select>
                                                    <div className="relative flex-1">
                                                        <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <Input
                                                            id="monto-usd"
                                                            type="text"
                                                            placeholder="Ejemplo: 999,655.00"
                                                            className="w-full h-12 pl-10 pr-4 text-gray-700 focus:outline-none"
                                                            disabled={isDisableFileOperation}
                                                            value={amountUsd}
                                                            onChange={(e) => {
                                                                handleInputNumerChange(e, setAmountUsd);
                                                            }}
                                                            onBlur={() => {
                                                                onHanleInputBlur(
                                                                    "amountUsd", 
                                                                    amountUsd
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Campo tipo de cambio de la operacion */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="tipo-cambio">
                                                    Tipo de Cambio
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="tipo-cambio"
                                                        placeholder="Ejemplo: 20.27"
                                                        className="w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400 hover:border-blue-400"
                                                        disabled={isDisableFileOperation}
                                                        value={exchangeRate}
                                                        onChange={(e) => {
                                                            handleInputChange(e, setExchangeRate)
                                                        }}
                                                        onBlur={() => {
                                                            onHanleInputBlur(
                                                                'exchangeRate',
                                                                exchangeRate
                                                            )
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Campo tipo de cambio Cleinte Nota: este es el tipo de cmabio 
                                            que se le va a dar el cliente */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="tp-cliente">
                                                    TP Cliente
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="tp-cliente"
                                                        placeholder="Ejemplo: 20.32"
                                                        className="w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400 hover:border-blue-400"
                                                        disabled={isDisableFileOperation}
                                                        value={exchangeRateClient}
                                                        onChange={(e) => {
                                                            handleInputChange(e, setExchangeRateClient)
                                                        }}
                                                        onBlur={() => {
                                                            onHanleInputBlur(
                                                                'exchangeRateClient',
                                                                exchangeRateClient
                                                            )
                                                        }}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Campo de Tipo Toggle en donde el usuario seleciona el tipo de comision 
                                            que va a tener esta operacion NOTA: por defecta esta seleccionada 
                                            comison por porcentaje %, si no la cambia el deal se registra con este tipo de comosion */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="comision-porcentaje">
                                                    Tipo de Comisión
                                                </InputLabel>
                                                <div className="flex items-center justify-center space-x-4 pt-2">
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <span className="text-base font-medium !text-gray-900 dark:text-gray-300 pr-5">
                                                            Comisión %
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            value=""
                                                            className="sr-only peer"
                                                            disabled={isDisableFileOperation}
                                                            checked={isCommissionCheck}
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                setIsCommisonCheck(isChecked);
                                                                setCommisonPercentage('');
                                                                setCommissionDollar('');
                                                            }}
                                                            onBlur={() => {
                                                                onHanleInputBlur(
                                                                    'isCommissionCheck',
                                                                    isCommissionCheck
                                                                )
                                                            }}
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-gray-300 rounded-full peer dark:bg-blue-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                                        <span className="text-base font-medium !text-gray-900 dark:text-gray-300 pl-5">
                                                            Comisión $
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <br/>

                                        {/* primera seccion donde se muestra los datos de la operacion Monto MXN
                                        Comision Envio Ahorro, Monto CTE TC y Casque */}
                                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                            {/* Campo Comison del deal y/o Operacion que puder ser por % o comosion directa 
                                            ose en pesos MXN$ */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="comision-porcentaje">
                                                    {isCommissionCheck
                                                        ? 'Comisión directa'
                                                        : 'Comisión por Porcentaje'
                                                    }
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="comison-porcentaje"
                                                        placeholder="Ejemplo: 0.500"
                                                        className="w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400 hover:border-blue-400"
                                                        disabled={isDisableFileOperation}
                                                        value={commissionPercentage}
                                                        onChange={(e) => {
                                                            setCommisonPercentage(e.target.value)
                                                        }}
                                                        onBlur={() => {
                                                            onHanleInputBlur(
                                                                'commissionPercentage',
                                                                commissionPercentage
                                                            )
                                                        }}
                                                        onClick={() => {
                                                            handleInputClick(true);
                                                        }}
                                                    />
                                                    {isCommissionCheck ? 
                                                        <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        : <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                            <Percent className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                    }
                                                </div>
                                            </div>

                                            {/* Campo Monto MXN */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="monto-usd">
                                                    Monto MXN $
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="monto-mxn"
                                                        placeholder="Ejemplo: 18,953,787.23"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400
                                                            ${negativeNumber(amountMXN) 
                                                                ? 'border-red-600' 
                                                                : ''}`
                                                        }
                                                        disabled
                                                        value={amountMXN}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* este componente se comenta ya que el usuario no le ve importancia
                                                esta campo Ismael dice que en futuro es para el cliente final
                                                Comosion por envio de Ahorro
                                            */}
                                            <div className="space-y-2" style={{ display: 'none'}}>
                                                <InputLabel htmlFor="comision-ahorro">
                                                    Comisión por envio de Ahorro
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="comision-ahorro"
                                                        placeholder="Ejemplo: 812.80"
                                                        className="w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400"
                                                        disabled
                                                        value={commissionRemittance}
                                                    />
                                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                                </div>
                                            </div>

    	                                    {/* Campo Monto CTE Tipo de Cambio */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="monto-cte-tc">
                                                    Monto $CTE TC
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="monto-cte-tc"
                                                        placeholder="Ejemplo: 19,000,541.12"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400
                                                            ${negativeNumber(amountCteTc) 
                                                                ? 'border-red-600' 
                                                                : ''}`
                                                        }
                                                        disabled
                                                        value={amountCteTc}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campo Casque */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="casque">
                                                    Casque
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="casque"
                                                        placeholder="Ejemplo: 43,753.12"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400
                                                            ${negativeNumber(casque) 
                                                                ? 'border-red-600' 
                                                                : ''} `
                                                        }
                                                        disabled
                                                        value={casque}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <br/>

                                        {/* Campo Comision por OPeracion */}
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="comision-dolar">
                                                    Comisión por Operación
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="comision-dolar"
                                                        placeholder="Ejemplo: 85,002.71"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400
                                                            ${negativeNumber(commissionDollar) 
                                                                ? 'border-red-600' 
                                                                : ''}`
                                                        }
                                                        disabled
                                                        value={commissionDollar}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campo Deposito Cliente */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="dep-cliente">
                                                    DEP Cliente
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="dep-cliente"
                                                        placeholder="Ejemplo: 19,095,543.83"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400 
                                                            ${negativeNumber(depCustomer) 
                                                                ? 'border-red-600' 
                                                                : depCustomer 
                                                                    ? 'border-green-500' 
                                                                    : ''}`
                                                        }
                                                        disabled
                                                        value={depCustomer}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campo de Utilidades */}
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="utilidad">
                                                    Utilidad
                                                </InputLabel>
                                                <div className="relative">
                                                    <Input
                                                        id="utilidad"
                                                        placeholder="Ejemplo: 141,756.12"
                                                        className={`w-full h-12 pl-10 border rounded-lg border-b-4 border-gray-400 
                                                            ${negativeNumber(utility) 
                                                                ? 'border-red-600' 
                                                                : ''} `
                                                        }
                                                        disabled
                                                        value={utility}
                                                    />
                                                    <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Boton para guardar un Deal y/u Ooperación este boton se habilita despues de que los campos
                                        en este Fomrmulario este validando y se cumplan las validaciones necesarias para que se puedar 
                                        realizar el registro  */}
                                        <div className="flex justify-end space-x-4 pt-6">
                                            {isViewableButtonAdd && (
                                                <Button
                                                    className="w-full h-10 bg-gradient-to-r !text-white from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                                                    //disabled={isViewableButtonAdd}
                                                    disabled={isDisableButtonAddDeal}
                                                    onClick={() => {
                                                        setIsDisableButtonAddDeal(true);
                                                        onAddDeal();
                                                    }}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Registrar Deal
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Footer />
                        </div>
                    </div>
            }
            {onModalOperationConfirmation()}
            {onModalPreviewDEF()}
            {onModalPreviewPDF()}
        </>
    )
}

export default AddDeal;