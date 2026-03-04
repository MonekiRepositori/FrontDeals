import React, { useEffect, useState, useRef} from 'react';
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Loader from '../loader/loader';
import Footer from '../footer/footer';
import Error400  from '../errorServices/error400';
import {
    apiGetAllOperation,
    apiGetPlatform,
} from '../../apis/services'

import { useNavigate } from 'react-router-dom';
import Input from '@mui/material/Input';
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { 
    BarChart,
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as TooltipCart, 
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    ComposedChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import {  
    TrendingUp, 
    DollarSign, 
    Activity,
    Search,
    BarChartIcon,
    Paintbrush,
    FilterIcon,
    SquareX,
    Calendar,
    BarChart4,
    Captions,
} from 'lucide-react'

/** Importacion de liberias para mostrar Drawer de filtros */
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

const DashKpi = () => {

    /**Variable que se ocupa para evitar que las api y/o servicios
     * se mande a llamar dos veces o cuando ya esta la data montada 
     * en sus componentes necesario o ya se cumplio con las validaciones 
     * correspondiente para los diferentes flujos de trabajo
     */
    const executedRef = useRef(false);
    

    /** Variable que realizar el redireccionamiento entre pantallas */
    let navigate = useNavigate();
    /** Estado de loader */
    const [isLoader, setIsLoader] = useState(true);
    /** Estado que guarda y muestra error APi */
    const [error400, setError400] = useState(false);
    /** Estado que valida si el api de GetAllOperacion el arreglo 
    viene vacio [] indicando que no hay Deal crados el dia en curso */
    const [isEmptyArrayDeals, setIsEmptyArrayDeals] = useState(false);

    /** Estado que almacena las operaciones y suma de encabezado */
    /** NOTA: este estado ya no se ocupa ya que se rediseño el flujo para esta pantalla
     * esta estado se va a utilizarpara gurdar los filtros y este estado se pueda enviar a los filtros
     * el tema es cuando esto sea menos a 30 dias ya que se hizo esa valdiacion para los 
     * datos de las graficas sean mas entendibles para el usuario
     * 
     */
    /******************** REVISAR ESTE ESTADO************************* */

    //const [dataOperations, setDataOperations] = useState();
    /** Estado que almacena la informacion que se muestra en el 
    * encabezado de la pantalla estos son los indicadores 
    */
    const [dataSumTransactions, setDataSumTransactions] = useState({});
    /** Estados para realizar busqueda */
    const [dateRange, setDateRange] = useState('0');
    const [platform, setPlatform] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    /** Estado que guarda el catalogo de Plataformas */
    const [dataPlatform, setDataPlatform] = useState([]);

    /** Estado que almacena la data de la grafica de Degradado */
    const [dataChartGradient, setDataChartGradient] = useState([]);

    /**Estado de Fecha inicio de un Deal y/u Operacion 
    * este estado se ocupan para el Drawer de filtros
    */
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    /** Estado de Fecha fin o cierre de un Deal y/u Operacion 
    * este estado se ocupa para el drawer de filtros
    */
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    /** Estado que almacena la data en la nueva grafica en donde se muestran la suma
    * de montoUSD, montoMXN y utilidad cons sus nuevos valores para que se visualicen en la grafica
    */
    const [dataExample, setDataExample] = useState([]);


    /** Estado que almacena la data del total de los registros
    * de las operaciones hechas 
    */
    const [dataRegister ,setDataRegister] = useState([]); 

    /** Estado que almacena la data del total de plataformas de las 
    * operaciones fecha de toda la data registrada y carga la data segun 
    * el filtro seleccionado 
    */
    const [dataPlatformChart, setDataPlatformChart] = useState([])

    /** Estado que cambia el estado de los componentes fecha inicio y fecha fin
    * para realizar la busqueda en toda el api segun los rango de fecha seleccionados
    */
    const [
        isVisbleFilterDateRanger, 
        setIsVisbleFilterDateRanger
    ] =  useState(true);

    /**Estado que controla el estado para mostrar
     * el modal de filtros del tablero de Operaciones y/o Deal
     */
    const [openDrawerFilter, setOpenDrawer] = useState(false);

    /** Funcion que realiza el llamado al Api GetAllOperaciones 
    * para realizar las operaciones correspondiente y mostrar 
    * esa informacion al usuario en la pantalla 
    */
    const onGetAllOperations = async () => {
        try {
            const response = await apiGetAllOperation();
            return response;
        } catch (error) {
            console.error('error al cosumir api Pantalla KPI => ',error);
            throw error;
        }
    };

    /** Api que carga el catalogo de Plataformas que viene desde su servicio */
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
            return response
        } catch (error) {
            console.error('error en pantalla Platform => ',error);
            throw error;
        }
    };

    /** Variable que actualiza es estado del boton de BUSCAR POR FECHAS
    * y desactiva el select rango de fecha para evitar errores en la busqueda
    */
    const onToggleVisibility = () => {
        setIsVisbleFilterDateRanger((prevState) => !prevState);
    };

    /** Este useEffect es el que manda a llamar las apis necesarias
    * para cargar la data de las graficas y de los indicadores 
    * segun el tipo de filtro que se haya seleccionad
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

        onFilterDeal(
            'dateRanger',
            dateRange,
        );

        /** Funcion que carga toda la data de la plataformas 
        * para que se regrese la llamada de esta api para los procesos
        * correspondientes y se visualice la data en si grafica de paster
        */
        onGetlAllPlatform();

        /** Se manda a llamar esta funciones por primera vez para que se cargue 
        * toda la data de los registros exietente en la base desde el inicio de operaciones
        */
        onProcessDataAllRegisterAll([]);

        /** Esta funcion buscar por toda la data y por los filtros 
        * seleccionados de esta funcionalidad no se tiene que hacer una independiente
        * por mes como las demas graficas de:
        * All registe grafica de barras
        * All montoUSD, montoMXN y Utilidad
        * All monto_TCE_TC
        * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
        */
        onProcessDataPlatformAll([]);

        /** Funcion que carga la data de montoUSD, montoMXN y Utilidad y lo muestra por semana
        * del todo el registro que existe en la base de datos desde el inicio de operaciones
        * esta funcion entra por primera vez cuando se carga la data en esta pantalla por primera vez
        */
        onCountDataByWeekAmountsAll([]);

        /** Funcion que Carga la data de monto_TCE_TC de y lo muestra por semana
        * del todo el registro que existe en la base de datos desde el inicio de operaciones
        * esta funcion entra por primera vez cuando se carga la data en esta pantalla por primera vez
        */
        onGetDataByWeekAllCTE([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);



    /** Funcion que separa la cantidad del montoUSD con comas 000,000.00 respetando 
    * los decimales a la derecha del punto esto es para el CARD de encabezado
    */
    const formatMontoUSD = (num) => {
        const number = Number(num);
        if (isNaN(number)) {
            return "0.00";
        }
        return number.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    /** Funcion que separa el valor ingresado en 000,000,000.00
    * para que sea mas facil la lectura de estos valores para el usuario
    * esta formato se aplica a los valores de MontoMXN Utilidad que estan en las card
    * donde se suma y describe esta informacio ademas de grafica de MONTO MXN CTE TC
    */
    const formatCurrencyAll = (value) => {
        const number = Number(value)
        if(isNaN(number)) {
            return "0.00"
        }

        return (number / 100).toLocaleString(
            'en-US', {minimumFractionDigits: 2, 
                maximumFractionDigits: 2
        })
    };

    // aca van las api cuando entra por primera ves el compoenente 

    /** Funion que muestra los datos de montoMXN, utilidad y monto_TCE_TC separados por digitos mostrando solo 
    * dos punto decimales a la derecha y separados por cada 3 numero a la derecha
    */
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const formatCurrency = (value) =>
            new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            }).format(value / 100);

        
        return (
            <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <p><strong>{label}</strong></p>
                {payload.map((item, index) => {
                    // solo formatea si el nombre de la serie es montoMXN o utilidad
                    const shouldFormat = item.dataKey === 'montoMXN' || item.dataKey === 'utilidad' || item.dataKey === 'monto'; 
                    const displayValue = shouldFormat ? formatCurrency(item.value) : item.value;

                    return (
                        <p key={index} style={{ color: item.color }}>
                            {item.name}: {displayValue}
                        </p>
                    );
                })}
            </div>
        );
    };

    /**************** Funciones que se cargan cuando se carga el componente por ***Primera Vez*** */
    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por mes 
    */
    const onProcessDataAllRegisterAll = async (dataArg = []) => {
        try {
            let dataFilter = [];
            let data = dataArg
            if (data.length === 0) {
                console.log('mandamos a llamar GetAll Register')
                const response = await apiGetAllOperation()
                dataFilter = response.data

            } else {
                console.log('se utiliza data filtrada allRegister')
                dataFilter = dataArg;
            }

            const operacionesPorMes = {};
            dataFilter.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                const mes = fecha.getMonth(); // 0 (Enero) a 11 (Diciembre)
                const año = fecha.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
                
                const nombresMesesCortos = [
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                ];
                
                const claveMes = `${nombresMesesCortos[mes]}-${año}`;
                
                if (!operacionesPorMes[claveMes]) {
                    operacionesPorMes[claveMes] = 0;
                }
                operacionesPorMes[claveMes]++;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorMes)
                .map(clave => ({
                    date: clave,
                    total: operacionesPorMes[clave].toString()
                }))
                .sort((a, b) => {
                    // Convertir las claves a fechas para comparar
                    const partesA = a.date.split('-');
                    const partesB = b.date.split('-');
                    
                    const mesesCortos = [
                        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                    ];
                    const mesA = mesesCortos.indexOf(partesA[0]);
                    const añoA = parseInt(partesA[1]);
                    
                    const mesB = mesesCortos.indexOf(partesB[0]);
                    const añoB = parseInt(partesB[1]);
                    
                    // Comparar años primero, luego meses
                    return añoA - añoB || mesA - mesB;
                });

            console.log('grafica data All Register --> ',resultado);
            setDataRegister(resultado);

            setTimeout(() => {
                setIsLoader(false);   
            },2000)
            

        } catch(error) {
            console.error('error all register operation --> ',error)
            throw error;
        }
    };

    /** Variable constante que carga los colores para las plataformas para la grafica de 
    * pastel en donde se cargan las plataformas
    */
    const COLORSPLATFORM = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#4FD1C5', '#F687B3', '#63B3ED'];

    /** Funcion que mapea los datos para generar los valores de los porcentajes para la grafica de 
     * pastel en donde se carga las plataformas
     */
    const RADIAN = Math.PI / 180;
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    /** Funcion que recibe, mapea y valida la data que le llega por parametro
    * valida la misma y ejecuta los pasos necesarios para mostrar las el total de las
    * plataformas que se han utilizado al momento de regidtrar un Deal y/u Operacion
    */
    const onProcessDataPlatformAll = async (dataArg = []) => {
        try {   
            setIsLoader(true);        
            let dataFilter = [];
            let data = dataArg
            const platformCounts = {};
            //console.log('valor de dataFilter Plataformas --> ',dataArg)
            const responsePlatform = await onGetlAllPlatform();
            const validaEmpty = responsePlatform.data.slice(1);
            
            if (data.length === 0) {
                console.log('mandamos a llamar GetAll Platafromas ')
                const response = await apiGetAllOperation()
                dataFilter = response.data
            } else {
                console.log('se utiliza data filtrada Platafromas ')
                dataFilter = dataArg;
            }          
            
            // Inicializar todos los conteos en 0
            validaEmpty.forEach(platform => {
                platformCounts[platform.platformName] = 0;
            });

            // Contar las operaciones por plataforma
            dataFilter.forEach(operacion => {
                const platformName = operacion.platformName;
                if (platformCounts.hasOwnProperty(platformName)) {
                    platformCounts[platformName]++;
                }
            });

            // Convertir a array y filtrar plataformas con conteo > 0
            const resultado = Object.keys(platformCounts)
                .filter(platform => platformCounts[platform] > 0)
                .map(platform => ({
                    name: platform,
                    value: platformCounts[platform]
                }));

            console.log('grafica data Platform --> ',resultado);
            setDataPlatformChart(resultado);

            setTimeout(() => {
                setIsLoader(false);   
            },2000)

        } catch (error) {
            console.error('error all platform operation --> ',error)
            setError400(true);
            setIsLoader(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/login')
            },2000)
            throw error;
        }
    };

    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por semana 
    * esta funcion se ocupa para la grafica de montoUSD, montoMXN y Utilidad
    */
    const onCountDataByWeekAmountsAll = async (dataArg = []) => {
        try {
            setIsLoader(true);
            let dataFilter = [];
            let data = dataArg
            if (data.length === 0) {
                console.log('mandamos a llamar GetAll Amounts')
                const response = await apiGetAllOperation()
                dataFilter = response.data

            } else {
                console.log('se utiliza data filtrada Amounts')
                dataFilter = dataArg;
            }

            const operacionesPorSemana = {};

            dataFilter.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                
                // Obtener el primer día de la semana (lunes)
                const primerDiaSemana = new Date(fecha);
                const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
                const diasHastaLunes = (diaSemana === 0 ? 6 : diaSemana - 1); // Ajustar para que lunes sea 0
                primerDiaSemana.setDate(fecha.getDate() - diasHastaLunes);
                
                // Formatear la fecha del primer día de la semana
                const año = primerDiaSemana.getFullYear().toString().slice(-2);
                const mes = String(primerDiaSemana.getMonth() + 1).padStart(2, '0');
                const dia = String(primerDiaSemana.getDate()).padStart(2, '0');
                
                const claveSemana = `${dia}/${mes}/${año}`;
                
                if (!operacionesPorSemana[claveSemana]) {
                    operacionesPorSemana[claveSemana] = {
                        montoUSD: 0,
                        montoMXN: 0,
                        utilidad: 0
                    };
                }
                
                operacionesPorSemana[claveSemana].montoUSD += operacion.montoUSD;
                operacionesPorSemana[claveSemana].montoMXN += operacion.montoMXN;
                operacionesPorSemana[claveSemana].utilidad += operacion.utilidad;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorSemana)
                .map(clave => ({
                    date: clave,
                    montoUSD: operacionesPorSemana[clave].montoUSD,
                    montoMXN: operacionesPorSemana[clave].montoMXN,
                    utilidad: operacionesPorSemana[clave].utilidad
                }))
                .sort((a, b) => {
                    // Convertir las fechas para comparar
                    const fechaA = new Date(a.date.split('/').reverse().join('-'));
                    const fechaB = new Date(b.date.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });

            console.log('grafica data Amounts --> ',resultado);
            setDataExample(resultado);

            setTimeout(() => {
                setIsLoader(false);   
            },2000)

        } catch (error) {
            console.error('error all amounts operation --> ',error)
            setError400(true);
            setIsLoader(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/login')
            },2000)
            throw error;
        }
    };

    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por semana 
    * esta funcion se ocupa para la grafica de monto_TCE_TC
    */
    const onGetDataByWeekAllCTE = async (dataArg = []) => {
        try {
            setIsLoader(true);
            let dataFilter = [];
            let data = dataArg
            if (data.length === 0) {
                console.log('mandamos a llamar GetAll CTE')
                const response = await apiGetAllOperation()
                dataFilter = response.data

            } else {
                console.log('se utiliza data filtrada CTE')
                dataFilter = dataArg;
            }

            const operacionesPorSemana = {};

            dataFilter.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                
                // Obtener el primer día de la semana (lunes)
                const primerDiaSemana = new Date(fecha);
                const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
                const diasHastaLunes = (diaSemana === 0 ? 6 : diaSemana - 1); // Ajustar para que lunes sea 0
                primerDiaSemana.setDate(fecha.getDate() - diasHastaLunes);
                
                // Formatear la fecha del primer día de la semana
                const año = primerDiaSemana.getFullYear().toString().slice(-2);
                const mes = String(primerDiaSemana.getMonth() + 1).padStart(2, '0');
                const dia = String(primerDiaSemana.getDate()).padStart(2, '0');
                
                const claveSemana = `${dia}/${mes}/${año}`;
                
                if (!operacionesPorSemana[claveSemana]) {
                    operacionesPorSemana[claveSemana] = {
                        monto: 0
                    };
                }
                
                operacionesPorSemana[claveSemana].monto += operacion.monto_TCE_TC;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorSemana)
                .map(clave => ({
                    date: clave,
                    monto: operacionesPorSemana[clave].monto
                }))
                .sort((a, b) => {
                    // Convertir las fechas para comparar
                    const fechaA = new Date(a.date.split('/').reverse().join('-'));
                    const fechaB = new Date(b.date.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });

            console.log('grafica data CTE --> ',resultado);
            setDataChartGradient(resultado);

            setTimeout(() => {
                setIsLoader(false);   
            },2000)

        } catch (error) {
            console.error('error all CTE operation --> ',error)
            setError400(true);
            setIsLoader(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/login')
            },2000)
            throw error;
        }
    };

    /**************** Funciones que se cargan cuando se carga el componente por ***Primera Vez*** */

    /** Funcion que limpia los estados y boton de Buscar por fecha 
    * para empezar un flujo nuevo con los filtros Limpios y los estados se Setean a
    * su valor iunicial 
    */
    const onClearFilterDeal = () => {
        const today = new Date().toISOString().split('T')[0]
        setIsLoader(true);
        setDateRange('0');
        setPlatform('0');
        setSearchTerm('');
        setIsVisbleFilterDateRanger(true);
        setIsEmptyArrayDeals(false);
        setStartDate(today);
        setEndDate(today);

        setDataSumTransactions({});


        onProcessDataAllRegisterAll([]);

        /** Esta funcion buscar por toda la data y por los filtros 
        * seleccionados de esta funcionalidad no se tiene que hacer una independiente
        * por mes como las demas graficas de:
        * All registe grafica de barras
        * All montoUSD, montoMXN y Utilidad
        * All monto_TCE_TC
        * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
        */
        onProcessDataPlatformAll([]);


        /** Funcion que carga la data de montoUSD, montoMXN y Utilidad y lo muestra por semana
        * del todo el registro que existe en la base de datos desde el inicio de operaciones
        * esta funcion entra por primera vez cuando se carga la data en esta pantalla por primera vez
        */
        onCountDataByWeekAmountsAll([]);


        /** Funcion que Carga la data de monto_TCE_TC de y lo muestra por semana
        * del todo el registro que existe en la base de datos desde el inicio de operaciones
        * esta funcion entra por primera vez cuando se carga la data en esta pantalla por primera vez
        */
        onGetDataByWeekAllCTE([]);


        onFilterDeal(
            'dateRanger',
            '0',
        );
        setTimeout(() => {
            setIsLoader(false);
        },1000)
    };

   
    /************** Funciones para los filtros que viene del DRAWER** ************* */

    /** Funcion que muestra mensaje informativo indicando que aun no se tiene 
    *operaciones registradas el día de hoy y cambien los filtros 
    */
    const onMessagesInformativeDataEmpty = () => {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center border rounded-lg border-blue-700 h-64">
                    <div className="rounded-full bg-blue-100 p-4">
                        <Search className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                        No se encontraron resultados
                    </h3>
                    <p className="mb-6 w-full text-gray-600 text-base text-center">
                        Con los filtros seleccionados no se obtuvieron resultados. 
                        Por favor, intente con otros criterios de búsqueda.
                    </p>
                    <div className="flex gap-3">
                        <Button className="flex items-center gap-2 !bg-blue-600 hover:bg-blue-700 !text-white !text-xs">
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
        );
    };

    /**  Funcion que suma los valores que vienen de la funcion **onFilterDeal**
    * esta data que se recibe se summa para poder mostrar la en la 
    * seccion de los indicadores 
    */
    const onTotalResultOperations = async (dataArg) => {
        try {
            console.log('data para Cards --> ',dataArg)
            const result = dataArg.length > 0 
            ? dataArg.reduce((acc, item) => {
                return {
                    montoMXN: acc.montoMXN + item.montoMXN,
                    utilidad: acc.utilidad + item.utilidad,
                    montoUSD: acc.montoUSD + item.montoUSD
                };
            }, { montoMXN: 0, utilidad: 0, montoUSD: 0 })
            : {montoMXN: 0, utilidad: 0, montoUSD: 0};
            console.log('data para cards --> ',result)
            setDataSumTransactions(result);

            setIsEmptyArrayDeals(false);


        } catch (error){
            console.error('error al calcular operaciones => ',error);
            throw error;
        }
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

    /** Funcion que parcea la fecha que recibe dependiendo del tipo de 
    * filtrado para realizar las operaciones correspondientes esta funcionalidad solo 
    * es para el select de rango de Fecha el cual tiene los valores de
    * Hoy
    * Semana
    * Quincena
    * Mes
    */
    const onFormatFecha = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); /**  Mes en dos dígitos */
        const day = String(date.getDate()).padStart(2, '0'); /** Día en dos dígitos */
        return `${year}-${month}-${day}`;
    };

    /** Función mejorada para manejar la búsqueda */
    const handleSearch = (searchValue) => {
        if (!isVisbleFilterDateRanger) {
            setSearchTerm(searchValue);
            onFilterDeal('searchTerm', searchValue);
        } else {
            setSearchTerm(searchValue);
            onFilterDeal('searchTerm', searchValue);
            setDateRange('1');
            setSearchTerm('');
        }
    };

    /** Función para manejar el evento onKeyDown en el input de búsqueda */
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e.target.value);
        }
    };

    /** Función para manejar el evento onBlur en el input de búsqueda */
    const handleSearchBlur = (e) => {
        if (!isVisbleFilterDateRanger) {
            setSearchTerm(e.target.value);
            onFilterDeal('searchTerm', e.target.value);
            if (e.target.value === '') {
                onFilterRangeDetail(startDate, endDate);
            }
        } else {
            setSearchTerm(e.target.value);
            onFilterDeal('searchTerm', e.target.value);
            if (e.target.value === '') {
                setIsLoader(true);
                setDateRange('1');
                setPlatform('0');
                onFilterDeal('dateRanger', '1');
            }
        }
    };

    /** Función mejorada para manejar los inputs de fecha con navegación por teclado */
    const handleDateKeyDown = (e, dateType) => {
        const currentDate = dateType === 'start' ? startDate : endDate;
        const date = new Date(currentDate);
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                date.setDate(date.getDate() + 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                date.setDate(date.getDate() - 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                date.setDate(date.getDate() - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                date.setDate(date.getDate() + 1);
                break;
            case 'Enter':
                e.preventDefault();
                // Ejecutar la búsqueda cuando se presiona Enter
                if (dateType === 'start') {
                    onFilterRangeDetail(date.toISOString().split('T')[0], endDate);
                } else {
                    onFilterRangeDetail(startDate, date.toISOString().split('T')[0]);
                }
                return;
            default:
                return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const newDateString = date.toISOString().split('T')[0];
        
        if (newDateString <= today) {
            if (dateType === 'start') {
                setStartDate(newDateString);
                onFilterRangeDetail(newDateString, endDate);
            } else {
                setEndDate(newDateString);
                onFilterRangeDetail(startDate, newDateString);
            }
        }
    };

    /** Funcion que filtra la data que viene de la funcion **onGetAllOperations**
    * para mostrar esa data en los indicadores dependiendo del filtro seleccionado por el usuario 
    */
    const onFilterDeal = async (
        typeFilterArg,
        valueFilterArg = null,
    ) => {
        try {
            setIsLoader(true);
            let dataFilter = [];
            if (
                typeFilterArg === 'dateRanger' && 
                valueFilterArg === '1'
            ) {
                let dataDeals = await apiGetAllOperation()
                let startDate = await onFormatFecha(new Date());
                const filtered = dataDeals.data.filter(
                    op => op.fechaInicio.split('T')[0] === startDate
                );
                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else if (
                typeFilterArg === 'dateRanger' && 
                valueFilterArg === '2'
            ) {
                let dataDeals = await apiGetAllOperation()
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes de esta semana
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() - today.getDay() + 7); // Domingo de esta semana

                const startDateStr = onFormatFecha(startOfWeek);
                const endDateStr = onFormatFecha(endOfWeek);

                const filtered = dataDeals.data.filter(op => {
                    const opDate = op.fechaInicio.split('T')[0];
                    return opDate >= startDateStr && opDate <= endDateStr;
                });

                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else if (
                typeFilterArg === 'dateRanger' && 
                valueFilterArg === '3'
            ) {
                let dataDeals = await apiGetAllOperation()
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const startOfSecondHalf = new Date(today.getFullYear(), today.getMonth(), 16);

                let startDate, endDate;
                if (today.getDate() <= 15) {
                    // Primera quincena
                    startDate = startOfMonth;
                    endDate = new Date(today.getFullYear(), today.getMonth(), 15);
                } else {
                    // Segunda quincena
                    startDate = startOfSecondHalf;
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último día del mes
                }

                const startDateStr = onFormatFecha(startDate);
                const endDateStr = onFormatFecha(endDate);

                const filtered = dataDeals.data.filter(op => {
                    const opDate = op.fechaInicio.split('T')[0];
                    return opDate >= startDateStr && opDate <= endDateStr;
                });

                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else if (
                typeFilterArg === 'dateRanger' && 
                valueFilterArg === '4'
            ) {
                let dataDeals = await apiGetAllOperation()
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                const startDateStr = onFormatFecha(startOfMonth);
                const endDateStr = onFormatFecha(endOfMonth);

                const filtered = dataDeals.data.filter(op => {
                    const opDate = op.fechaInicio.split('T')[0];
                    return opDate >= startDateStr && opDate <= endDateStr;
                });

                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else if (
                typeFilterArg === 'platform' && 
                valueFilterArg !== '0'
            ) {
                let dataDeals = await apiGetAllOperation()
                const filtered = dataDeals.data.filter(
                    op => op.id_BankingPlatform === valueFilterArg
                );
                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else if (
                typeFilterArg === 'searchTerm' && 
                valueFilterArg !== ''
            ) {
                let dataDeals = await apiGetAllOperation()
                const searchLower = valueFilterArg.toLowerCase();
                const filtered = dataDeals.data.filter(op => 
                    op.nombreCliente.toLowerCase().includes(searchLower) ||
                    op.platformName.toLowerCase().includes(searchLower) ||
                    op.fechaInicio.toLowerCase().includes(searchLower)
                );
                if (filtered.length === 0) {
                    setIsEmptyArrayDeals(true);
                    setIsLoader(false);
                } else {
                    onTotalResultOperations(filtered);

                    onCountRegisterOperationDays(filtered);

                    /** Esta funcion buscar por toda la data y por los filtros 
                    * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                    * por mes como las demas graficas de:
                    * All registe grafica de barras
                    * All montoUSD, montoMXN y Utilidad
                    * All monto_TCE_TC
                    * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                    */
                    onProcessDataPlatformAll(filtered);

                    processDataForChart(filtered) // grafica nueva por dia 

                    onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                    setIsLoader(false);
                }
            } else {
                let dataDeals = await apiGetAllOperation()
                dataFilter = dataDeals.data;
                onTotalResultOperations(dataFilter);

                onCountRegisterOperationDays(dataFilter);

                /** Esta funcion buscar por toda la data y por los filtros 
                * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                * por mes como las demas graficas de:
                * All registe grafica de barras
                * All montoUSD, montoMXN y Utilidad
                * All monto_TCE_TC
                * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                */
                onProcessDataPlatformAll(dataFilter);

                processDataForChart(dataFilter) // grafica nueva por dia 

                onGetDataByDaysCTE(dataFilter) // ultima grafica monto_TCE_TC

                setIsLoader(false);
            }
        } catch (error) {
            console.error('error al filtrar deals => ',error);
            setError400(true);
            setIsLoader(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/login')
            },2000)
            throw error;
        }
    };

    /** Funcion que filtra la data que viene de la funcion **onGetAllOperations**
    * para mostrar esa data en los indicadores dependiendo del rango de fecha seleccionado por el usuario 
    * esta funcion se ocupa cuando el usuario selecciona el boton de BUSCAR POR FECHAS
    */
    const onFilterRangeDetail = async (
        startDateArg,
        endDateArg
    ) => {
        try {
            setIsLoader(true);
            let dataDeals = await apiGetAllOperation()
            const filtered = dataDeals.data.filter(op => {
                const opDate = op.fechaInicio.split('T')[0];
                return opDate >= startDateArg && opDate <= endDateArg;
            });

            if (filtered.length === 0) {
                setIsEmptyArrayDeals(true);
                setIsLoader(false);
            } else {
                onTotalResultOperations(filtered);

                onCountRegisterOperationDays(filtered);

                /** Esta funcion buscar por toda la data y por los filtros 
                * seleccionados de esta funcionalidad no se tiene que hacer una independiente
                * por mes como las demas graficas de:
                * All registe grafica de barras
                * All montoUSD, montoMXN y Utilidad
                * All monto_TCE_TC
                * NOTA: este proceso se replica en dotos los filtros seleccionados del Drawer
                */
                onProcessDataPlatformAll(filtered);

                processDataForChart(filtered) // grafica nueva por dia 

                onGetDataByDaysCTE(filtered) // ultima grafica monto_TCE_TC

                setIsLoader(false);
            }
        } catch (error) {
            console.error('error al filtrar por rango de fechas => ',error);
            setError400(true);
            setIsLoader(true);
            setTimeout(() => {
                setError400(false);
                setIsLoader(false);
                navigate('/login')
            },2000)
            throw error;
        }
    };

    /************** Funciones para los filtros que viene del DRAWER** ************* */

    /************** Funciones para las graficas que se cargan por filtros** ************* */

    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por dia 
    * esta funcion se ocupa cuando se filtra por:
    * Hoy
    * Semana
    * Quincena
    * Mes
    * Plataforma
    * Busqueda
    * Rango de fecha
    */
    const onCountRegisterOperationDays = async (dataArg) => {
        try {
            const operacionesPorDia = {};
            dataArg.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                const año = fecha.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
                const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes en dos dígitos
                const dia = String(fecha.getDate()).padStart(2, '0'); // Día en dos dígitos
                
                const claveDia = `${dia}/${mes}/${año}`;
                
                if (!operacionesPorDia[claveDia]) {
                    operacionesPorDia[claveDia] = 0;
                }
                operacionesPorDia[claveDia]++;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorDia)
                .map(clave => ({
                    date: clave,
                    total: operacionesPorDia[clave].toString()
                }))
                .sort((a, b) => {
                    // Convertir las fechas para comparar
                    const fechaA = new Date(a.date.split('/').reverse().join('-'));
                    const fechaB = new Date(b.date.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });

            console.log('grafica data Register Days --> ',resultado);
            setDataRegister(resultado);

        } catch(error) {
            console.error('error register operation days --> ',error)
            throw error;
        }
    };

    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por dia 
    * esta funcion se ocupa para la grafica de montoUSD, montoMXN y Utilidad
    * cuando se filtra por:
    * Hoy
    * Semana
    * Quincena
    * Mes
    * Plataforma
    * Busqueda
    * Rango de fecha
    */
    const processDataForChart = async (dataArg) => {
        try {
            const operacionesPorDia = {};

            dataArg.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                const año = fecha.getFullYear().toString().slice(-2);
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const dia = String(fecha.getDate()).padStart(2, '0');
                
                const claveDia = `${dia}/${mes}/${año}`;
                
                if (!operacionesPorDia[claveDia]) {
                    operacionesPorDia[claveDia] = {
                        montoUSD: 0,
                        montoMXN: 0,
                        utilidad: 0
                    };
                }
                
                operacionesPorDia[claveDia].montoUSD += operacion.montoUSD;
                operacionesPorDia[claveDia].montoMXN += operacion.montoMXN;
                operacionesPorDia[claveDia].utilidad += operacion.utilidad;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorDia)
                .map(clave => ({
                    date: clave,
                    montoUSD: operacionesPorDia[clave].montoUSD,
                    montoMXN: operacionesPorDia[clave].montoMXN,
                    utilidad: operacionesPorDia[clave].utilidad
                }))
                .sort((a, b) => {
                    // Convertir las fechas para comparar
                    const fechaA = new Date(a.date.split('/').reverse().join('-'));
                    const fechaB = new Date(b.date.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });

            console.log('grafica data Amounts Days --> ',resultado);
            setDataExample(resultado);

        } catch (error) {
            console.error('error amounts operation days --> ',error)
            throw error;
        }
    };

    /** Funcion que recorre los datos del llamado de la api apiGetAllOperation
    * para crear y contar los registros de los Deals hecho por dia 
    * esta funcion se ocupa para la grafica de monto_TCE_TC
    * cuando se filtra por:
    * Hoy
    * Semana
    * Quincena
    * Mes
    * Plataforma
    * Busqueda
    * Rango de fecha
    */
    const onGetDataByDaysCTE = async (dataArg) => {
        try {
            const operacionesPorDia = {};

            dataArg.forEach(operacion => {
                const fecha = new Date(operacion.fechaInicio);
                const año = fecha.getFullYear().toString().slice(-2);
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const dia = String(fecha.getDate()).padStart(2, '0');
                
                const claveDia = `${dia}/${mes}/${año}`;
                
                if (!operacionesPorDia[claveDia]) {
                    operacionesPorDia[claveDia] = {
                        monto: 0
                    };
                }
                
                operacionesPorDia[claveDia].monto += operacion.monto_TCE_TC;
            });

            // Convertir a array y ordenar cronológicamente
            const resultado = Object.keys(operacionesPorDia)
                .map(clave => ({
                    date: clave,
                    monto: operacionesPorDia[clave].monto
                }))
                .sort((a, b) => {
                    // Convertir las fechas para comparar
                    const fechaA = new Date(a.date.split('/').reverse().join('-'));
                    const fechaB = new Date(b.date.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });

            console.log('grafica data CTE Days --> ',resultado);
            setDataChartGradient(resultado);

        } catch (error) {
            console.error('error CTE operation days --> ',error)
            throw error;
        }
    };

    /************** Funciones para las graficas que se cargan por filtros** ************* */

    /** Funcion que renderiza el Drawer de filtros */
    const renderDrawerContent = () => {
        return (
            dataPlatform.map((anchor) => (
                <Drawer
                    key={anchor}
                    anchor={'right'}
                    open={openDrawerFilter['right'] || false}
                    onClose={toggleDrawer('right', false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: 350,
                            padding: 2,
                        },
                    }}
                >
                    <Box
                        sx={{ width: 350 }}
                        role="presentation"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between relative">
                                <InputLabel className="text-lg font-semibold text-gray-800">
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
                                            if (!isVisbleFilterDateRanger) {
                                                setSearchTerm(e.target.value);
                                                onFilterDeal('searchTerm', e.target.value);
                                            } else {
                                                setSearchTerm(e.target.value);
                                                onFilterDeal('searchTerm', e.target.value);
                                                setDateRange('1');
                                                setSearchTerm('');
                                            }
                                        }}
                                        onBlur={handleSearchBlur}
                                        onKeyDown={handleSearchKeyDown}
                                        className="w-full h-11 pl-9 pr-4 py-2 border border-b-4 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 "
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <InputLabel>
                                    Rango de fecha
                                </InputLabel>
                                <select 
                                    className="w-full h-11 px-3 py-2 border border-b-4 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                                    value={dateRange}
                                    disabled={!isVisbleFilterDateRanger}
                                    onChange={(e) => {
                                        setDateRange(e.target.value);
                                        onFilterDeal(
                                            'dateRanger',
                                            e.target.value
                                        );
                                        setOpenDrawer({ right: false });
                                    }}
                                >
                                    <option value="0">Todo</option>
                                    <option value="1">Hoy</option>
                                    <option value="2">Semana</option>
                                    <option value="3">Quincena</option>
                                    <option value="4">Mes</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <InputLabel>
                                    Plataforma
                                </InputLabel>
                                <select 
                                    className="w-full h-11 px-3 py-2 border border-b-4 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                                    value={platform}
                                    disabled={isEmptyArrayDeals}
                                    onChange={(e) => {
                                        setPlatform(e.target.value);
                                        onFilterDeal(
                                            'platform',
                                            e.target.value
                                        );
                                        setOpenDrawer({ right: false });
                                    }}
                                >
                                    {dataPlatform.map((platform, index) => (
                                        <option key={index} value={platform.id_BankingPlatform}>
                                            {platform.platformName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full border-t border-blue-600"></div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <InputLabel>
                                        Buscar por fechas
                                    </InputLabel>
                                    <Button
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                            !isVisbleFilterDateRanger 
                                                ? '!bg-green-600 !text-white hover:!bg-green-700' 
                                                : '!bg-gray-300 !text-gray-600 hover:!bg-gray-400'
                                        }`}
                                        onClick={onToggleVisibility}
                                    >
                                        {!isVisbleFilterDateRanger ? 'Activado' : 'Desactivado'}
                                    </Button>
                                </div>
                            </div>

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
                                        onKeyDown={(e) => handleDateKeyDown(e, 'start')}
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
                                        className="w-full h-11 pl-10 border rounded-lg border-gray-400 border-b-4 hover:border-blue-400"
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
                                        onKeyDown={(e) => handleDateKeyDown(e, 'end')}
                                    />
                                    <div className="absolute left-3 -mt-10 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full border-t border-blue-600"></div>


                        </div>
                    </Box>
                </Drawer>
            ))
        )
    };

    return (
        <>
            {error400 ? <Error400 /> :
                isLoader ? <Loader /> : 
                <>
                    <div className="flex h-screen bg-white">
                        <NavBar/>
                        <div className='flex-1 overflow-y-auto'>
                            <Head />
                            <div className="p-6 overflow-auto">
                                <Card className="h-full mx-auto shadow-xl p-2">
                                    <div className="max-w-full mx-auto space-y-8">
                                        <div className="h-[70px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                Información De La Operación
                                            </h2>
                                            {/* Seccion donde se muestra los botones para limpiar los filtros y abrir el Drawer de filtros  */}
                                            <div className="flex flex-wrap gap-4">
                                                {/* Botton para limpiar filtros */}
                                                <Tooltip title='Limpiar Filtros'>
                                                    <Button
                                                        className='w-12 h-9 bg-gradient-to-r !border-2 !border-solid !border-blue-500 !text-blue-500'
                                                        onClick={() => {
                                                            onClearFilterDeal();
                                                        }}
                                                    >
                                                        <Paintbrush className="w-4 h-4" />
                                                    </Button>
                                                </Tooltip>
                                                {/* Botton para abrir Drawer de filtros */}
                                                <Tooltip title='Filtros'>
                                                    <Button
                                                        className='w-12 h-9 bg-gradient-to-r !border-2 !border-solid !border-blue-500 !text-blue-500'
                                                        onClick={toggleDrawer('right', true)}
                                                    >
                                                        <FilterIcon className="w-4 h-4" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Seccion donde se muestran los indicadores */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-blue-100 text-sm font-medium">
                                                                Monto USD
                                                            </p>
                                                            <p className="text-2xl font-bold">
                                                                ${formatMontoUSD(dataSumTransactions.montoUSD || 0)}
                                                            </p>
                                                        </div>
                                                        <div className="h-12 w-12 bg-blue-400/30 rounded-lg flex items-center justify-center">
                                                            <DollarSign className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-green-100 text-sm font-medium">
                                                                Monto MXN
                                                            </p>
                                                            <p className="text-2xl font-bold">
                                                                ${formatCurrencyAll(dataSumTransactions.montoMXN || 0)}
                                                            </p>
                                                        </div>
                                                        <div className="h-12 w-12 bg-green-400/30 rounded-lg flex items-center justify-center">
                                                            <TrendingUp className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-purple-100 text-sm font-medium">
                                                                Utilidad
                                                            </p>
                                                            <p className="text-2xl font-bold">
                                                                ${formatCurrencyAll(dataSumTransactions.utilidad || 0)}
                                                            </p>
                                                        </div>
                                                        <div className="h-12 w-12 bg-purple-400/30 rounded-lg flex items-center justify-center">
                                                            <Activity className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Seccion donde se muestran las graficas */}
                                        {isEmptyArrayDeals ? (
                                            onMessagesInformativeDataEmpty()
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Grafica de barras - Registros por periodo */}
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <BarChartIcon className="h-5 w-5 text-blue-600" />
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                Registros por Periodo
                                                            </h3>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <BarChart data={dataRegister}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <TooltipCart />
                                                                <Bar dataKey="total" fill="#3B82F6" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </CardContent>
                                                </Card>

                                                {/* Grafica de pastel - Plataformas */}
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <BarChart4 className="h-5 w-5 text-green-600" />
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                Distribución por Plataforma
                                                            </h3>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={dataPlatformChart}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={false}
                                                                    label={renderCustomizedLabel}
                                                                    outerRadius={80}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                >
                                                                    {dataPlatformChart.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORSPLATFORM[index % COLORSPLATFORM.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <TooltipCart />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </CardContent>
                                                </Card>

                                                {/* Grafica combinada - Montos y Utilidad */}
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <TrendingUp className="h-5 w-5 text-purple-600" />
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                Montos y Utilidad por Periodo
                                                            </h3>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <ComposedChart data={dataExample}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <TooltipCart content={<CustomTooltip />} />
                                                                <Legend />
                                                                <Bar dataKey="montoUSD" fill="#3B82F6" name="Monto USD" />
                                                                <Bar dataKey="montoMXN" fill="#10B981" name="Monto MXN" />
                                                                <Line type="monotone" dataKey="utilidad" stroke="#8B5CF6" name="Utilidad" />
                                                            </ComposedChart>
                                                        </ResponsiveContainer>
                                                    </CardContent>
                                                </Card>

                                                {/* Grafica de área - Monto TCE TC */}
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Captions className="h-5 w-5 text-orange-600" />
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                Monto TCE TC por Periodo
                                                            </h3>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <AreaChart data={dataChartGradient}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <TooltipCart content={<CustomTooltip />} />
                                                                <Area 
                                                                    type="monotone" 
                                                                    dataKey="monto" 
                                                                    stroke="#F59E0B" 
                                                                    fill="url(#colorGradient)" 
                                                                    name="Monto TCE TC"
                                                                />
                                                                <defs>
                                                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                                                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                                                                    </linearGradient>
                                                                </defs>
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            <Footer />
                        </div>
                    </div>
                    {renderDrawerContent()}
                </>
            }
        </>
    );
};

export default DashKpi;