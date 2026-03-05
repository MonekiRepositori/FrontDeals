const urlServices =
process.env.REACT_APP_ENV === 'DEV'
    ? process.env.REACT_APP_API_URL_DEV
    : process.env.REACT_APP_API_URL_PROD
    
// url's para el inicio sesion y guardar data de usuario logeado
export const loginUser = `${urlServices}Api/LoginUser/login`;
export const allListUsers = `${urlServices}api/User/ListUsers`;

// url's para realizar el CRUD de Operaciones
export const allOperations = `${urlServices}api/Operation/GetAll`;
export const addOperations = `${urlServices}api/Operation/Create`;
export const getOperationById = `${urlServices}api/Operation/GetByIdOperaciones/`;
export const updateOperation = `${urlServices}api/Operation/Update/`;

// url para actulizar los archivos PDF y PDF FED
export const addAndUpdateFilePDFDealDetail = `${urlServices}api/UploadFilesDealAndFed/Update/`;

// url's para realizar el CRUD de la pantalla de Usuarios
export const allUsers = `${urlServices}api/RegisterUser/GetAll`;
export const addUser = `${urlServices}api/RegisterUser/RegisterUser`;
export const getUserById = `${urlServices}api/RegisterUser/GetById/`;
export const updateUser = `${urlServices}api/RegisterUser/Update/`;
export const deleteUser = `${urlServices}api/RegisterUser/Delete/`;

// url's que para realizar el Crud de Plataformas
export const allPlatform = `${urlServices}api/Platform/GetALLPlataforma`;
export const addPlatform = `${urlServices}api/Platform/CreatePlatform`;
export const updatePlatform = `${urlServices}api/Platform/UpdatePlataforma/`;
export const deletePlatform = `${urlServices}api/Platform/DeletePlataforma/`;

// url's para realiazar el CRUD de la pantalla de Roles
export const allRol = `${urlServices}api/Role/RoleGetAll`;
export const addRol = `${urlServices}api/Role/Create`;
export const updateRol = `${urlServices}api/Role/`;
export const deleteRol = `${urlServices}api/Role/`;

// url's para realizar el CRUD de Tipo de Divisas
export const allCurrency = `${urlServices}api/ForeignCurrencys/GetAll`

// url's para reañizar el CRUD de Estatus de Operacion
export const allStatusOperation = `${urlServices}api/Statusoperation/StatusOperationGetAll`

// url para consumir api de divisas 
export const urlCurrencies = 'https://api.currencyapi.com/v3/latest'

// url  para realizar el CRUD de la pantalla StatusTicket
export const allStatusTicket = `${urlServices}api/StatusTicket/StatusTicketGetAll`;

// url para realizar el CRUD de la panatlla de Add Ticket
export const addTicket = `${urlServices}api/Tickets/Create`;
export const getTicketById = `${urlServices}api/Tickets/getbyid/`;
export const updateTicket = `${urlServices}api/Tickets/update/`;

// url para realizar el CRUD de la pantalla de Coemtarios
export const addComment = `${urlServices}api/Comments/Create`;


export const allOperationsCanceled = `${urlServices}api/Statusoperation/Canceled`;
