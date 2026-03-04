import React, { useEffect, useState } from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Loader from '../loader/loader';
import Footer from '../footer/footer';
import Error400  from '../errorServices/error400';
import { motion } from "framer-motion"

import { 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    UserRoundCog,
    Trash2,
    Edit,
} from "lucide-react"

import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Card from "@mui/material/Card";

import {
    X,
} from "lucide-react"

import { 
    apiGetRol, 
    apiAddRol,
    apiUpdateRol,
    apiDeleteRol,
} from '../../apis/services';

const TableRol = () => {

    let navigate = useNavigate();

    // estado de loader
    const [isLoader, setIsLoader] = useState(true);

    const [error400, setError400] = useState(false);

    // estado para realizar busqueda 
    const [searchTerm, setSearchTerm] = useState("");
    // estado que donde se guarda el nuevo Rol a agregar
    const [rolName, setRolName] = useState("")

    const [dataRol, setDataRol] = useState([]);

    // estado que indica que tipo de operacion se va a realiza si agregar o editar data de Plataforma
    const [typeOperation, setTypeOperation] = useState('');

    // estado donde se guarda el Rol selecionado
    const [isSelectRol, setIsSelectRol] = useState([])

    // constante donde se crean el nomnbre de las columas del tablero 
    const headerTable = [
        "Rol",
        "Acciones",
    ];

    // Función para filtrar los datos basado en el término de búsqueda
    const getFilteredData = () => {
        if (!searchTerm.trim()) {
            return dataRol;
        }
        
        return dataRol.filter(item => 
            item.tipoDeRol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // estado que almacena la data del tablero filtrada
    const dataTable = getFilteredData();

    /** Estado para pagina del tablero 
    * NOTA se elimino **setRowsPerPage** para evirar error de 
    * variable sin utilizar si despues se necesita cambiar este valor
    * en un select se necesita acupar esta varible en un futuro
    */
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10);
    
    // constante para crear paginacion con result de data 
    const totalRecords = dataTable.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage)
    
    // funcion para cambiar de pagina del tablero 
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
        }
    };
    
    // funcion que actuliza la data que se muestra en el tablero 
    const displayData = dataTable.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Función para manejar la búsqueda
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Resetear a la primera página cuando se busca
    };

    // Función para manejar el evento onKeyDown en el input de búsqueda
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleSearch(e.target.value);
        }
    };

    // estados settean los estados que abren y cierran modal EDITAR UN ROL
    const [open, setOpen] = useState(false);
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);

    // estados settean los estados que abren y cierran modal ELIMINAR UN Rol
    const [openDelete, setOpenDelete] = useState(false);
    const onOpenDelete = () => setOpenDelete(true);
    const onCloseDelete = () => setOpenDelete(false);

    const onApiGetAllRol = async () => {
        try {
            const response = await apiGetRol();
            console.log('data rol in componente => ',response)
            setDataRol(response.data)
            setIsLoader(false);
        } catch (error) {
            console.log('error en pantalla Platform => ',error);
            setError400(true);
            setTimeout(() => {
                navigate('/login')
            },2000)
        }
    };

    const onAddRol = async (valueArg) => {
        try {
            const body = {
                tipoDeRol : valueArg 
            }
            const response = await apiAddRol(body);
            console.log('se agrego rol correctamente => ',response)
            onApiGetAllRol();
        } catch (error) {
            console.log('error al agregar un nuevo rol pantalla => ',error)
        }
    };

        // funcion que settea y controla que modal se tiene que abrir para 
    // Actualizar o Elimnar una Plataforma
    const onEditRol = (dataArg, typeOperArg) => {
        console.log('data el funcion Edit => ',dataArg, ' === ',typeOperArg)
        setIsSelectRol(dataArg)
        if (typeOperArg === 'delete') {
            onOpenDelete()
        } else {
            onOpen();
        }
    };

    const onUpdateRol = async (dataArg) => {
        setIsLoader(true)
        try {
            const response = await apiUpdateRol(
                dataArg.id_Rol,
                dataArg, 
                )
            console.log('data updateRol => ',response);
            onApiGetAllRol();
        } catch (error) {
            console.log('error al consumiri servicio update rol pantalla', error)
        }
    };

    const onDeleteRol = async (idArg) => {
        setIsLoader(true);
        console.log('id Rol => ',idArg)
        try {
            const response = await apiDeleteRol(idArg)
            console.log('data response delete Rol ',response)
            onApiGetAllRol();

        } catch (error) {
            console.log('eeror al eliminar un Rol => ',error)
        }
    }


    // componete modal para agregar y editar informacion de un Rol
    const onModalAddRol = () => {
        return (
            <Dialog 
                open={open} 
                onOpenChange={onClose}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {typeOperation === 'add'
                                ? 'Agregar Rol'
                                : 'Editar Rol'
                            }
                        </DialogTitle>
                        <X onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label 
                                htmlFor="platform" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Rol
                            </label>
                            <Input
                                id="platform"
                                placeholder="Administrador"
                                className="w-full h-12 px-3 border rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                value={typeOperation === 'add' 
                                    ? rolName
                                    : isSelectRol.tipoDeRol
                                }
                                onChange={(e) => {
                                    if (typeOperation === 'add') {
                                        setRolName(e.target.value)
                                    } else {
                                       setIsSelectRol({ ...isSelectRol, tipoDeRol: e.target.value})
                                    }
                                    
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                className={`w-full !bg-blue-600 !text-white hover:!bg-blue-700 transition-all duration-200 rounded-lg h-12 ${
                                    typeOperation === 'add' ? 'sm:w-40' : 'sm:w-20'
                                }`}
                                onClick={() => {
                                    if(typeOperation === 'add') {
                                        //alert('ejecutar api para agrega rol')
                                        onAddRol(rolName);
                                        onClose();
                                        setIsLoader(true);
                                    } else {
                                        //alert('ejecutar api para editar data plataforma')
                                        onUpdateRol(isSelectRol)
                                        onClose();
                                    }
                                }}
                            >
                                {typeOperation === 'add'
                                    ? 'Agregar Rol'
                                    : 'Editar'
                                }
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRolName('')
                                    onClose();
                                }}
                                className="!bg-blue-50 hover:!bg-blue-100 !text-blue-700 font-bold py-2 px-4"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    };

    /** Componete modal para eliminar una Plataforma */
    const onModalDeleteRol = () => {
        return (
            <Dialog 
                open={openDelete} 
                onOpenChange={onCloseDelete}
            >
                <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Borrar Rol
                        </DialogTitle>
                        <X onClick={onCloseDelete} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                    </div>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <span className='block text-lg text-center font-medium text-gray-700'>
                                Estas seguro que deseas eliminar este Rol<br/>
                                {`${isSelectRol.tipoDeRol}`}
                            </span>
                            <br/>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                className='w-full sm:w-52 !bg-red-500 !text-white hover:!bg-red-600 transition-all duration-200 rounded-lg h-12'
                                onClick={() => {
                                    onDeleteRol(isSelectRol.id_Rol);
                                    onCloseDelete();
                                }}
                            >
                                Eliminar Rol
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onCloseDelete();
                                }}
                                className="!bg-blue-50 hover:!bg-blue-100 !text-blue-700 font-bold py-2 px-4"
                            >
                                Cerrar
                            </Button>
                        </div>

                    </div>

                </DialogContent>
            </Dialog>
        )
    };


    useEffect(() => {
        onApiGetAllRol();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

  return (
    <>
        {error400 ? <Error400 /> : 
            isLoader ? <Loader /> : 
                <>
                    <div className="flex h-screen bg-white">
                        <NavBar/>
                        <div className='flex-1 overflow-y-auto'>
                            <Head />
                            <div className="min-h-screen bg-white rounded-xl shadow-lg overflow-hidden p-4">
                                <Card className="h-full mx-auto shadow-xl p-2">
                                    <div className="border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                                            <h1 className="text-2xl font-bold text-gray-800">
                                                Tablero Roles
                                            </h1>
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar Rol..."
                                                        value={searchTerm}
                                                        onChange={(e) => handleSearch(e.target.value)}
                                                        onKeyDown={handleSearchKeyDown}
                                                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <button 
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        onClick={() => {
                                                            setRolName('');
                                                            setTypeOperation('add');
                                                            onOpen()
                                                        }}
                                                    >
                                                    <UserRoundCog className="w-4 h-4" />
                                                    Nuevo Rol
                                                </button>
                                            </div>

                                        </div>
                                    </div>


                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                {headerTable.map((header) => (
                                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        <div className="flex items-center gap-1">
                                                            {header}
                                                        </div>
                                                    </th>
                                                ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {displayData.map((item, index) => (
                                                    <motion.tr
                                                        key={item.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="hover:bg-blue-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tipoDeRol}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <button className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        setTypeOperation('edit');
                                                                        onEditRol(item, 'edit');
                                                                    }}
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                </button>
                                                                <button className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        //alert('mostrar modal de confirmacion para eliminar plataforma ')
                                                                        onEditRol(item, 'delete');
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </button>                                               
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>

                                            
                                        </table>
                                    </div>

                                    <div className="px-6 py-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Mostrando {(currentPage - 1) * rowsPerPage + 1} -
                                                {Math.min(currentPage * rowsPerPage, totalRecords)} de {totalRecords} resultados
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    onClick={() => {
                                                        handlePageChange(currentPage - 1)
                                                    }}
                                                    disabled={currentPage === 1}
                                                >
                                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                                            currentPage === index + 1
                                                            ? "bg-blue-600 text-white"
                                                            : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => setCurrentPage(index + 1)}
                                                    >
                                                    {index + 1}
                                                    </button>
                                                ))}
                                                </div>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <ChevronRight 
                                                        className="w-5 h-5 text-gray-500" 
                                                        onClick={() => {
                                                        handlePageChange(currentPage + 1)
                                                        }}
                                                        disabled={currentPage === totalPages}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>  
                            <Footer />          
                        </div>
                    </div> 
                </>
        }
        {onModalAddRol()}
        {onModalDeleteRol()}
    </>
  )
}

export default TableRol
