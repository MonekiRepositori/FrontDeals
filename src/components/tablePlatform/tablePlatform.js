import React, {useState, useEffect } from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Loader from '../loader/loader';
import Footer from '../footer/footer';
import Error400 from '../errorServices/error400';
import { apiGetPlatform, apiAddPlatform, apiUpdatePlatform, apiDeletePlatform, } from '../../apis/services';
import { motion } from "framer-motion"
import { Search, ChevronLeft, ChevronRight, UserPlus, Trash2, Edit, } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Card from "@mui/material/Card";
import { X, } from "lucide-react"

const TablePlatform = () => {
  let navigate = useNavigate();
  
  // estado para realizar busqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [plataformaName, setPlatformName] = useState("")
  
  // estado donde se setea la data del tabalero
  const [dataPlatform, setDataPlatform] = useState([]);
  const [isSelectPlatform, setIsSeletedPlatform] = useState([])
  
  // estado que indica que tipo de operacion se va a realiza si agregar o editar data de Plataforma
  const [typeOperation, setTypeOperation] = useState('');
  
  // constante donde se crean el nomnbre de las columas del tablero
  const headerTable = [
    "Nombre",
    "Acciones",
  ];
  
  // estado de loader
  const [isLoader, setIsLoader] = useState(true);
  const [error400, setError400] = useState(false);
  
  // Función para filtrar los datos basado en el término de búsqueda
  const getFilteredData = () => {
    if (!searchTerm.trim()) {
      return dataPlatform;
    }
    return dataPlatform.filter(item => 
      item.platformName.toLowerCase().includes(searchTerm.toLowerCase())
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
  const displayPlatform = dataTable.slice(
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
  
  // estados settean los estados que abren y cierran modal EDITAR PLATAFORMA
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);
  
  // estados settean los estados que abren y cierran modal ELIMINAR PLATAFORMA
  const [openDelete, setOpenDelete] = useState(false);
  const onOpenDelete = () => setOpenDelete(true);
  const onCloseDelete = () => setOpenDelete(false);
  
  /** Funcion que manda a llamar el api para agregar plataforma */
  const onAddPlatform = async (valueArg) => {
    console.log('value new platform => ',valueArg);
    try {
      const body = {
        platformName : valueArg
      }
      // se ejecuta api ADD PLATFORM y agrega nuevo registro a tablero
      const response = await apiAddPlatform(body)
      console.log('se agrego el nuevo valor ',response)
      setPlatformName('');// limpiar estado del componente input del modal agregar y/o boton de cerrar
      setIsLoader(true);// se carga loader en lo que se realiza la ejecucion de api ADD PLATFORM
      onApiGetPlatform();// se manda a llamar api que carga data de tablero PLATFORM
    } catch (error) {
      throw error
    }
  };
  
  /** Funcion que settea y controla que modal se tiene que abrir para
   *Actualizar o Elimnar una Plataforma
   */
  const onEditPlatform = (dataArg, typeOperArg) => {
    setIsSeletedPlatform(dataArg)
    if (typeOperArg === 'delete') {
      onOpenDelete()
    } else {
      onOpen();
    }
  };
  
  /** Funcion que manda a llamar api para Actualiza data de una Plataforma */
  const onUpdatePlatform = async (dataArg) => {
    try {
      setIsLoader(true);
      const idArg = dataArg.id_BankingPlatform
      const body = {
        id_BankingPlatform: dataArg.id_BankingPlatform,
        platformName: dataArg.platformName
      }
      const response = await apiUpdatePlatform(idArg, body)
      console.log('data updatePlatform => ',response);
      onApiGetPlatform();
    } catch (error) {
      setIsLoader(false);
      throw error
    }
  };
  
  /** Funcion que manda a llamar api para Elinimar una Plataforma */
  const onDeletePlatform = async (idArg) => {
    console.log('id plataforma => ',idArg)
    try {
      setIsLoader(true);
      const response = await apiDeletePlatform(idArg)
      console.log('se elimino platfmorm => ',response)
      onApiGetPlatform();
    } catch (error) {
      setIsLoader(false);
      throw error
    }
  };
  
  /** Componete modal para agregar y editar informacion de Plataforma */
  const onModalAddPlatform = () => {
    return (
      <Dialog open={open} onOpenChange={onClose} >
        <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {typeOperation === 'add' ? 'Agregar Plataforma' : 'Editar Plataforma' }
            </DialogTitle>
            <X onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
          </div>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700" >
                Plataforma
              </label>
              <Input
                id="platform"
                placeholder="CIBANCO"
                className="w-full h-12 px-3 border rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={typeOperation === 'add' ? plataformaName : isSelectPlatform.platformName }
                onChange={(e) => {
                  if (typeOperation === 'add') {
                    setPlatformName(e.target.value)
                  } else {
                    setIsSeletedPlatform({ ...isSelectPlatform, platformName: e.target.value})
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button className={`w-full !bg-blue-600 !text-white hover:!bg-blue-700 transition-all duration-200 rounded-lg h-12 ${
                typeOperation === 'add' ? 'sm:w-52' : 'sm:w-20'
              }`}
                onClick={() => {
                  if(typeOperation === 'add') {
                    //alert('ejecutar api para agrega plataforma')
                    onAddPlatform(plataformaName);
                    onClose();
                  } else {
                    //alert('ejecutar api para editar data plataforma')
                    onUpdatePlatform(isSelectPlatform)
                    onClose();
                  }
                }}
              >
                {typeOperation === 'add' ? 'Agregar Plataforma' : 'Editar' }
              </Button>
              <Button
                variant="outline"
                // size="lg"
                onClick={() => {
                  setPlatformName('')
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
  const onModalDeletePlatform = () => {
    return (
      <Dialog open={openDelete} onOpenChange={onCloseDelete} >
        <DialogContent className="w-[550px] p-6 rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Borrar Plataforma
            </DialogTitle>
            <X onClick={onCloseDelete} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-[-5px] mt-[-50px]" />
          </div>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <span className='block text-lg text-center font-medium text-gray-700'>
                Estas seguro que deseas eliminar esta plataforma<br/>
                {`${isSelectPlatform.platformName}`}
              </span>
              <br/>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button className='w-full sm:w-52 !bg-red-500 !text-white hover:!bg-red-600 transition-all duration-200 rounded-lg h-12'
                onClick={() => {
                  onDeletePlatform(isSelectPlatform.id_BankingPlatform);
                  onCloseDelete();
                }}
              >
                Eliminar Plataforma
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
  }
  
  /** Funcion que hace el llamado a API para carga data en tablero */
  const onApiGetPlatform = async () => {
    try {
      const response = await apiGetPlatform();
      setDataPlatform(response.data)
      setIsLoader(false);
    } catch (error) {
      setError400(true);
      setTimeout(() => {
        navigate('/login')
      },2000)
      throw error;
    }
  };
  
  useEffect(() => {
    onApiGetPlatform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  
  return (
    <>
      {error400 ? <Error400 /> :
        isLoader ? <Loader /> :
          <div className="flex h-screen bg-white">
            <NavBar/>
            <div className='flex-1 overflow-y-auto'>
              <Head />
              <div className="min-h-screen bg-white rounded-xl shadow-lg overflow-hidden p-4">
                <Card className="h-full mx-auto shadow-xl p-2">
                  <div className="border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                      <h1 className="text-2xl font-bold text-gray-800"> Tablero Plataformas </h1>
                      <div className="flex gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Buscar plataforma..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          onClick={() => {
                            setTypeOperation('add');
                            onOpen()
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Nueva Plataforma
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
                        {displayPlatform.map((platform, index) => (
                          <motion.tr
                            key={platform.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{platform.platformName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                  onClick={() => {
                                    setTypeOperation('edit');
                                    onEditPlatform(platform, 'edit');
                                  }}
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                  onClick={() => {
                                    //alert('mostrar modal de confirmacion para eliminar plataforma ')
                                    onEditPlatform(platform, 'delete');
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
                        Mostrando {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalRecords)} de {totalRecords} resultados
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
                                currentPage === index + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
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
      {onModalAddPlatform()}
      {onModalDeletePlatform()}
    </>
  )
}

export default TablePlatform