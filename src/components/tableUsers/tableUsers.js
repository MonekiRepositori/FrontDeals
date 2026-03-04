import React, { useEffect, useState } from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Footer from '../footer/footer';
import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';

import {
  apiGetAllUsers,
  apiDeleteUser,
} from '../../apis/services';

import { motion } from "framer-motion"

import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus,
  Trash2,
  Edit,
} from "lucide-react"

import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Card from "@mui/material/Card";

import {
  X,
} from "lucide-react"


const TableUsers = () => {

  /** Varible para realizar la navegacion entre pantallas */
  let navigate = useNavigate();

  /**  estado para realizar busqueda */
  const [searchTerm, setSearchTerm] = useState("")

  /** estado de loader */
  const [isLoader, setIsLoader] = useState(true);
  const [error400, setError400] = useState(false);

  /**  constante donde se crean el nomnbre de las columas del tablero */
  const headerTable = [
    "Nombre de Usuario",
    "Tipo Usuario", 
    "Nombre", 
    "Apellido paterno", 
    "Apellido materno", 
    "Fecha de nacimiento", 
    "Género", 
    "Dirección",  
    "Código postal", 
    "Mun o Del",
    "Estado", 
    "Acciones"
  ];

  const [dataUsers, setDataUsers] = useState([]);

  // Función para filtrar los datos basado en el término de búsqueda
  const getFilteredData = () => {
    if (!searchTerm.trim()) {
      return dataUsers;
    }
    return dataUsers.filter(item => 
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastNamePaternal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastNameMaternal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.postalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  /** Variable donde se guardar la data del tablero filtrada */
  const users = getFilteredData();

  /**  estado que almacena la data del usuario seleccionado
  * para realizar las operaciones correspondientes
  */
  const [selectedRow, setSelectedRow] = useState({});

  /** Estados settean los estados que abren y cierran modal ELIMINAR UN Usuario */
  const [openDelete, setOpenDelete] = useState(false);
  const onOpenDelete = () => setOpenDelete(true);
  const onCloseDelete = () => setOpenDelete(false);

  /** estado para pagina del tablero 
  * NOTA se elimino **setRowsPerPage** para evirar error de 
  * variable sin utilizar si despues se necesita cambiar este valor
  * en un select se necesita acupar esta varible en un futuro
  */
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10);

  /** Constante para crear paginacion con result de data */
  const totalRecords = users.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage)

  /** Funcion para cambiar de pagina del tablero */
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /** Funcion que actuliza la data que se muestra en el tablero */
  const displayUsers = users.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  /** variable que asigna color segun el tipo de usuario
  * que se regresa en la data del tablero
  */
  const userTypeColors = {
    "1": "bg-gradient-to-r from-purple-500 to-blue-500",
    "2": "bg-gradient-to-r from-blue-500 to-cyan-500",
    "3": "bg-gradient-to-r from-pink-500 to-rose-500",
    "4": "bg-gradient-to-r from-orange-500 to-amber-500",
    "5": "bg-gradient-to-r from-green-500 to-emerald-500",
  };

  /** Variable que asigna el nombre segun el tipo de usuario
  * que se regresa en la data del tablero
  */
  const userTypeName = {
    "1": "Super Administrador",
    "2": "Administrador Genearl",
    "3": "Administrador Consultor",
    "4": "Coordinador",
    "5": "Ejecutivo"
  };

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

  /** Funcion que consumer el servicio para cargar la data 
   * de los usuario en su tablero
   */
  const onApiGetUsers = async () => {
    try {
      const response = await apiGetAllUsers();
      setDataUsers(response.data)
      setIsLoader(false);
    } catch (error) {
      console.log('erro de servicio pantalla Usuarios');
      setError400(true);
      setTimeout(() => {
          navigate('/login')
      },2000)
      throw error;
    }
  };

  /**  funicon que manda a llamar al servicio para borrar un **Usaurio** 
  del tablero de usuarios
  */
  const onDeleteUser = async (idArg) => {
    try {
      const response = await apiDeleteUser(idArg)
      console.log('se borro usuario ',response);
      onApiGetUsers();
    } catch (error) {
      setError400(true);
      setTimeout(() => {
          setError400(false);
          setIsLoader(false);
      },2000)
      throw error;
    }
  };

  /** Componete modal para eliminar un Usuario */
  const onModalDeleteUser = () => {
    return (
        <Dialog 
            open={openDelete} 
            onOpenChange={onCloseDelete}
        >
            <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">
                        Borrar Información de Usuario
                    </DialogTitle>
                    <X onClick={onCloseDelete} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
                </div>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <span className='block text-lg text-center font-medium text-gray-700'>
                            Estas seguro que deseas eliminar este Usuario<br/>
                            {`${selectedRow.username}`}
                        </span>
                        <br/>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            className='w-full sm:w-52 !bg-red-500 !text-white hover:!bg-red-600 transition-all duration-200 rounded-lg h-12'
                            onClick={() => {
                                setIsLoader(true);
                                onDeleteUser(selectedRow.userRecordId);
                                onCloseDelete();
                            }}
                        >
                            Eliminar Usuario
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
    onApiGetUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /** Funcion que redirecciona a la pantalla de usuario y manda el tipo 
   * de operacion a Realizar si se va agreagr o actulizar la data del usuario
   */
  const onRedirect = (typeArg, idUserArg) => {
    if (typeArg === 'add' ) {
      navigate('/user', { state: {
        typeOperation: typeArg,
        idUser: idUserArg
      }})
    } else if (typeArg === 'edit') {
      navigate('/user', { state :{
        typeOperation: typeArg,
        idUser: idUserArg
      }})
    } else {
      onOpenDelete();
    }
  };

  return (
    <>
      {error400 ? <Error400 /> :
        isLoader ? <Loader /> :
          <div className="flex h-screen bg-white">
            <NavBar/>
            <div className='flex-1 overflow-y-auto'>
              <Head />
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
                  <Card className="mx-auto shadow-xl p-2">
                    <div className="border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Tablero Usuarios
                        </h1>
                        <div className="flex gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Buscar usuario..."
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              onKeyDown={handleSearchKeyDown}
                              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              onClick={() => {
                                onRedirect('add', {})
                              }}
                          >
                            <UserPlus className="w-4 h-4" />
                            Nuevo Usuario
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
                                  {/* <ChevronDown className="w-4 h-4" /> */}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayUsers.map((user, index) => (
                            <motion.tr
                              key={user.userRecordId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userRecordId}</td> */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r ${userTypeColors[user.tipodeUsuario] || "from-gray-200 to-gray-300 text-gray-800"}`}>
                                  {userTypeName[user.tipodeUsuario]}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.firstName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastNamePaternal}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastNameMaternal}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.birthDate.split('T')[0]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.gender}</td>
                              <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900 text-center">
                                {user.street}, {user.exteriorNumber} {user.interiorNumber}
                              </td>
                              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.extNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.intNumber}</td> */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.postalCode}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.municipality}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.state}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <button className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                    onClick={() => {
                                      onRedirect('edit', user.userRecordId);
                                      setSelectedRow(user)
                                      // navigate('/user');
                                    }}
                                  >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                    onClick={() => {
                                      //alert('mostrar modal de confirmacion para eliminar usuario ')
                                      onRedirect('delete', user.userRecordId)
                                      setSelectedRow(user);
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
      }
      {onModalDeleteUser()}
    </>
  )
}

export default TableUsers;