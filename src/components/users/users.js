import React, { useEffect, useState } from 'react'
import NavBar from '../navBar/navBar';
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

import { 
    useLocation, 
    useNavigate 
} from 'react-router-dom';

import {
    User,
    Mail,
    Lock,
    MapPin,
    Calendar,
    Building,
    Hash,
    UserCircle,
    Save,
    ChevronLeft,
    UsersRound,
    UserRoundCheck,
    EyeOff,
    Eye,
  } from 'lucide-react'
import Head from '../head/head';
import Footer from '../footer/footer';
import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';

import {
  apiGetRol,
  apiAddUser,
  apiGetUserById,
  apiUpdateUser,
} from '../../apis/services'

import { toast, Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {

    let navigate = useNavigate();
    const location = useLocation();

    /** estado de loader */
    const [isLoader, setIsLoader] = useState(true);
    const [error400, setError400] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [typeArg, setTypeArg] = useState('');
    /** Estado que crea el objeto Agregar y/o Editar un usuario
    * para agregr lo a la cuenta 
    * NOTA: se borra **setDataUserArg** para evitar error de 
    * variable sin utilizar
    */
    const [dataUserArg] = useState({})

    // estado que settea datos del usuario para su editar informacion del usuario
    const [idUserGetById, setUserGetById] = useState('')

    // Estados para agregar un usuario 
    const [typeUser, setTypeUser] = useState('');
    const [userName, setUserName] = useState('');
    const [genderUser, setGenderUser] = useState('');
    const [firstName, setFirstName] = useState('');
    const [emailUser, setEmailUser] = useState('');
    const [password, setPassword] = useState('');
    const [namePaternal, setNamePaternal] = useState('');
    const [nameMaternal, setNameMaternal] =  useState('');
    const [birthDateUser, setBirthDateUser] = useState(new Date().toISOString().split('T')[0])
    const [streetUser, setStretUser] = useState('');
    const [exteriorNumber, setExteriorNumber] = useState('');
    const [interiorNumberUser,setInteriorNumberUser] = useState('');
    const [stateUser, setStateUser] = useState('');
    const [municipalityUser, setMunicipalityUser] = useState('');
    const [zipCodeUser, setZipCodeUser] = useState('');
    // End Estados para agregar un usuario

    // Estado que settea la data para editar informacion del Usuario
    const [formData, setFormData] = useState({
        username: typeArg === 'add' ? userName : dataUserArg.username,
        tipodeUsuario: typeArg === 'add' ? typeUser : dataUserArg.tipodeUsuario,
        gender: typeArg === 'add' ? genderUser : dataUserArg.gender,
        firstName: typeArg === 'add' ? firstName : dataUserArg.firstName,
        email: typeArg === 'add' ? emailUser : dataUserArg.email,
        password: typeArg === 'add' ? password : dataUserArg.password,
        lastNamePaternal: typeArg === 'add' ? namePaternal : dataUserArg.lastNamePaternal,
        lastNameMaternal: typeArg === 'add' ? nameMaternal : dataUserArg.lastNameMaternal,
        birthDate: typeArg === 'add' ? birthDateUser : dataUserArg.birthDate,
        street: typeArg === 'add' ? streetUser : dataUserArg.street,
        exteriorNumber: typeArg === 'add' ? exteriorNumber : dataUserArg.exteriorNumber,
        interiorNumber: typeArg === 'add' ? interiorNumberUser : dataUserArg.interiorNumber,
        state: typeArg === 'add' ? stateUser : dataUserArg.state,
        municipality: typeArg === 'add' ? municipalityUser : dataUserArg.municipality,
        postalCode: typeArg === 'add' ? zipCodeUser : dataUserArg.postalCode,      
    });
    // End Estado que settea la data para editar informacion del Usuario

    //estado que almacena la data del catalogo de Tipo Rol
    const [dataAllRol, setDataAllRol] = useState([]);

    /** Funcion que valida que tipo de operacion se va a realizar y 
    * proceder con el flujo correpondinte a dicha Operacion Agrega Usuario o Editar data de Usuario
    */
    useEffect(() => {
        onGetAllRol();
        const typeOperation = location?.state?.typeOperation || null; 
        const idUserArg = location?.state?.idUser || null

        if (typeOperation) {
            setTypeArg(typeOperation)
        } else {
            setTypeArg(null)
        }

        if (typeOperation === 'edit') {
            setIsLoader(true);
            onGetUserById(idUserArg);
            setUserGetById(idUserArg);
        }

        setTimeout(() => {
            setIsLoader(false);
        },1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps   
    },[]);

    /** Servicio que carga los datos de un usuario para su posteriro Edicion */
    const onGetUserById = async (idArg) => {
        try {
            const response = await apiGetUserById(idArg)
            setFormData(response.data)
            setIsLoader(false);
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                navigate('/table-users')
            },2000)
            throw error;
        }
    };

    /** Servicio que actualiza la data de un Usuario */
    const onUpdateUser = async (idArg, dataArg) => {
        try {
            const response = await apiUpdateUser(idArg, dataArg)
            if (response.status === '200') {
                toast.info("Datos del Usuarios ACtulizados \n De manera exitosa", {
                position: 'top-right',
                });
            }
            setTimeout(() => {
                navigate('/table-users')
            },2000)
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                navigate('/table-users')
            },2000)
            throw error
        } 
    }

    /** Servicio que se ejecuta para agregar un nuevo Usuario */
    const onAddUser = async (dataArg) => {
        try {
            const response = await apiAddUser(dataArg);
            console.log('usuario agregado de manera correcto pantalla => ',response)
            navigate('/table-users')
        } catch (error) {
            setError400(true);
            setTimeout(() => {
                navigate('/table-users')
            },2000)
            throw error;
        }
    };

    /** Servicio que carga el catalogo de Tipo Rol */
    const onGetAllRol = async () => {
        try {
            const response = await apiGetRol();
            const newValue = {
                id_Rol: "",
                tipoDeRol: 'Selecciona un Tipo de Rol'
            }
            response.data.unshift(newValue);
            if (response) {
                setDataAllRol(response.data);
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <>
            {error400 ? <Error400 /> :
                isLoader ? <Loader /> :
                    <div className="flex h-screen bg-white">
                        <NavBar />
                        <div className='flex-1 overflow-y-auto'>
                            <Head />
                            <div className="min-h-screen bg-gradient-to-br from-white-100 to-white-200 p-6 w-full">
                                <Toaster />                                <Card className="w-full mx-auto shadow-xl bg-white">
                                {/* max-w-6xl */}
                                    <div className="relative border-b bg-gradient-to-r from-blue-700 to-blue-900 h-16">
                                        <div className="text-2xl font-bold text-white flex justify-start pt-4">
                                            <span 
                                                className="flex w-12 justify-center items-center cursor-pointer"
                                                onClick={() => navigate('/table-users')}
                                            >
                                                <ChevronLeft />
                                            </span>
                                            <span>
                                                {typeArg === 'add' 
                                                    ? 'Ingresar Información del Usuario'
                                                    : 'Editar Información del Usuario'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                    <form className="space-y-8">
                                        {/* Información básica */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-blue-800">
                                                Información Básica
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="email" className="text-blue-600">
                                                        Nombre de Usuario
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <UserRoundCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-4 w-4" />
                                                        <Input
                                                        id="username"
                                                        name="username"
                                                        type="username"
                                                        value={typeArg === 'add' 
                                                            ? userName
                                                            : formData.username
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setUserName(e.target.value)
                                                                setFormData(prev => ({ ...prev, username: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, username: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="tipoUsuario" className="text-blue-600">
                                                        Tipo Rol
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
                                                        <select 
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                            placeholder='Usuario'
                                                            value={
                                                                typeArg === 'add'
                                                                ? typeUser
                                                                : formData.tipodeUsuario
                                                            }
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (typeArg === 'add') {
                                                                    setTypeUser(value);
                                                                    setFormData(prev => ({ ...prev, tipodeUsuario: value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, tipodeUsuario: value }));
                                                                }
                                                            }}
                                                        >
                                                            {Array.isArray(dataAllRol) &&
                                                                dataAllRol.map((item) => {
                                                                    return (
                                                                        <option
                                                                            key={item.id_Rol}
                                                                            value={item.id_Rol}
                                                                        >
                                                                            {item.tipoDeRol}
                                                                        </option>
                                                                    )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                               
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="contrasena" className="text-blue-600">
                                                        Genero
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <UsersRound className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 h-4 w-4" />
                                                        <select 
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                            placeholder='Usuario'
                                                            value={typeArg === 'add' 
                                                                ? genderUser
                                                                : formData.gender || null
                                                            }
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (typeArg === 'add') {
                                                                    setGenderUser(value);
                                                                    setFormData(prev => ({ ...prev, gender: value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, gender: value }));
                                                                }
                                                            }}
                                                        >
                                                            <option value="" disabled>Selecciona un género</option>
                                                            <option value="masculino">Masculino</option>
                                                            <option value="femenino">Femenino</option>
                                                        </select>

                                                        
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <br/>
                                        <div className="w-full border-t border-blue-600 my-4"></div>
                                        {/* <Separator className="bg-blue-200" /> */}

                                        {/* Información personal */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-blue-800">
                                                Información Personal
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="nombre" className="text-blue-600">
                                                        Nombre
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
                                                        <Input
                                                        id="nombre"
                                                        name="nombre"
                                                        value={typeArg === 'add'
                                                            ? firstName
                                                            : formData.firstName
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setFirstName(e.target.value);
                                                                setFormData(prev => ({ ...prev, firstName: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, firstName: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="email" className="text-blue-600">
                                                        Email
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300 h-4 w-4" />
                                                        <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={typeArg === 'add' 
                                                            ? emailUser
                                                            : formData.email
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setEmailUser(e.target.value)
                                                                setFormData(prev => ({ ...prev, email: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, email: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="contrasena" className="text-blue-600">
                                                        Contraseña
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 h-4 w-4" />
                                                        <Input
                                                            id="contrasena"
                                                            name="contrasena"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={typeArg === 'add' 
                                                                ? password
                                                                : formData.password
                                                            }
                                                            onChange={(e) => {
                                                                if (typeArg === 'add') {
                                                                    setPassword(e.target.value);
                                                                    setFormData(prev => ({ ...prev, password: e.target.value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, password: e.target.value }));
                                                                }
                                                            }}
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute -top-9 transform hover:bg-transparent text-gray-400 hover:text-gray-600 !ml-[-69px] !mb-[-65px]"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                            <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>

                                                    </div>
                                                </div>                       
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="apellidoPaterno" className="text-blue-600">
                                                        Apellido Paterno
                                                    </InputLabel>
                                                    <Input
                                                        id="apellidoPaterno"
                                                        name="apellidoPaterno"
                                                        value={typeArg === 'add' 
                                                            ? namePaternal 
                                                            : formData.lastNamePaternal
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setNamePaternal(e.target.value);
                                                                setFormData(prev => ({ ...prev, lastNamePaternal: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, lastNamePaternal: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="apellidoMaterno" className="text-blue-600">
                                                        Apellido Materno
                                                    </InputLabel>
                                                    <Input
                                                        id="apellidoMaterno"
                                                        name="apellidoMaterno"
                                                        value={typeArg === 'add' 
                                                            ? nameMaternal
                                                            : formData.lastNameMaternal
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setNameMaternal(e.target.value);
                                                                setFormData(prev => ({ ...prev, lastNameMaternal: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, lastNameMaternal: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="fechaNacimiento" className="text-blue-600">
                                                        Fecha de Nacimiento
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-4 w-4" />
                                                        <Input
                                                            id="fechaNacimiento"
                                                            name="fechaNacimiento"
                                                            type="date"
                                                            value={typeArg === 'add'
                                                                ? birthDateUser
                                                                : formData.birthDate.split('T')[0]
                                                            }
                                                            onChange={(e) => {
                                                                if (typeArg === 'add') {
                                                                    setBirthDateUser(e.target.value);
                                                                    setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                                                                }
                                                            }}
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <br/>
                                        <div className="w-full border-t border-blue-600 my-4"></div>
                                        {/* <Separator className="bg-blue-200" /> */}

                                        {/* Dirección */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-blue-800">
                                                Dirección
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="calle" className="text-blue-600">
                                                        Calle
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-red-700 h-4 w-4" />
                                                        <Input
                                                            id="calle"
                                                            name="calle"
                                                            value={typeArg === 'add'
                                                                ? streetUser
                                                                : formData.street
                                                            }
                                                            onChange={(e) => {
                                                                if (typeArg === 'add') {
                                                                    setStretUser(e.target.value);
                                                                    setFormData(prev => ({ ...prev, street: e.target.value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, street: e.target.value }));
                                                                }
                                                            }}
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="numeroExterior" className="text-blue-600">
                                                        Número Exterior
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
                                                        <Input
                                                            id="numeroExterior"
                                                            name="numeroExterior"
                                                            value={typeArg === 'add'
                                                                ? exteriorNumber 
                                                                : formData.exteriorNumber
                                                            }
                                                            onChange={(e) => {
                                                                if (typeArg === 'add') {
                                                                    setExteriorNumber(e.target.value);
                                                                    setFormData(prev => ({ ...prev, exteriorNumber: e.target.value }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, exteriorNumber: e.target.value }));
                                                                }
                                                            }}
                                                            className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="numeroInterior" className="text-blue-600">
                                                        Número Interior
                                                    </InputLabel>
                                                    <Input
                                                        id="numeroInterior"
                                                        name="numeroInterior"
                                                        value={typeArg === 'add'
                                                            ? interiorNumberUser 
                                                            : formData.interiorNumber
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setInteriorNumberUser(e.target.value);
                                                                setFormData(prev => ({ ...prev, interiorNumber: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, interiorNumber: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="estado" className="text-blue-600">
                                                        Estado
                                                    </InputLabel>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                        id="estado"
                                                        name="estado"
                                                        value={typeArg === 'add'
                                                            ? stateUser
                                                            : formData.state
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setStateUser(e.target.value);
                                                                setFormData(prev => ({ ...prev, state: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, state: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 pl-10 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="municipio" className="text-blue-600">
                                                        Municipio
                                                    </InputLabel>
                                                    <Input
                                                        id="municipio"
                                                        name="municipio"
                                                        value={typeArg === 'add' 
                                                            ? municipalityUser
                                                            : formData.municipality
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setMunicipalityUser(e.target.value);
                                                                setFormData(prev => ({ ...prev, municipality: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, municipality: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel htmlFor="codigoPostal" className="text-blue-600">
                                                        Código Postal
                                                    </InputLabel>
                                                    <Input
                                                        id="codigoPostal"
                                                        name="codigoPostal"
                                                        value={typeArg === 'add'
                                                            ? zipCodeUser
                                                            : formData.postalCode
                                                        }
                                                        onChange={(e) => {
                                                            if (typeArg === 'add') {
                                                                setZipCodeUser(e.target.value);
                                                                setFormData(prev => ({ ...prev, postalCode: e.target.value }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, postalCode: e.target.value }));
                                                            }
                                                        }}
                                                        className="w-full h-12 border rounded-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500 border-b-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* // button action  */}
                                        <div className="flex justify-end space-x-4 ">
                                            <Button 
                                                type="submit" 
                                                className="bg-gradient-to-r h-10 from-blue-600 to-blue-800 !text-white hover:from-blue-700 hover:to-blue-900"
                                                onClick={() => {
                                                    if (typeArg === 'add') {
                                                        //alert('mandar a llamar funcion para agregar data usuario')
                                                        setIsLoader(true);
                                                        onAddUser(formData);
                                                    } else {
                                                        //alert('mandar a llamar funcion para editar data de usuario')
                                                        setIsLoader(true);
                                                        onUpdateUser(idUserGetById, formData)
                                                    }
                                                }}
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {typeArg === 'add'
                                                    ? 'Agregar Usuario'
                                                    : 'Guardar Cambios'
                                                } 
                                            </Button>
                                        </div>
                                    </form>
                                    </CardContent>
                                </Card>
                            </div>
                            <Footer />
                        </div>

                    </div>
            }
        </>
    )
}

export default Users;
