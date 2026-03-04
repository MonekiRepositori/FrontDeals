import axios from 'axios'
import {
    saveToLocalStorage,
    readToLocalStorage,
} from './localStorage';

// importacion de URL's para ejecutar servicios
import { 
    urlCurrencies,
    loginUser,
    allListUsers,
    // url's tablero Operaciones
    allOperations,
    addOperations,
    getOperationById,
    updateOperation,
    // url que agrega Archvios PDF y PDF FED en el detalle de un Deal
    addAndUpdateFilePDFDealDetail,
    // url' tablero Usuarios
    allUsers,
    addUser,
    getUserById,
    updateUser,
    deleteUser,
    // url' tablero Plataformas
    allPlatform,
    addPlatform,
    updatePlatform,
    deletePlatform,
    // url's tablero Roles
    allRol,
    addRol,
    updateRol,
    deleteRol,  
    // url's tablero Currencys
    allCurrency,
    allStatusOperation,

    // url's tablero Status Ticket
    allStatusTicket,

    // url's tablero Ticket
    addTicket,
    getTicketById,
    updateTicket,

    // url's para tablero Comentarios
    addComment,

    // url para el tablero Deals Cancelados
    allOperationsCanceled,
} from './url'

// servico que ejecuta **lista de usuarios** el api de usuarios para validar login 
export const apiGetUsers = async () => {
    try {
        const urlUsers = allListUsers
        const response = await axios.get(urlUsers)
        //console.log('data de Usuarios Services => ',response)
        return response;
    } catch (error) {
        console.log('error al consumir servicio Usuarios => ',error)
        return {error: true, message: "No se pudieron obtener los usuarios. Inténtelo más tarde."}
    }
};

// servicio que ejecuta el login
export const apiLoginUser = async (data) => {
    try {
        const urlLogin = loginUser;
        const response = await axios.post(urlLogin, data)
        //console.log('data de login in Services => ',response);
        saveToLocalStorage('user',response.data)
        return response;
    } catch (error) {
        console.log('error al consumir servicio Login user => ',error)
        return {error: true, message: "No se pudieron obtener los usuarios. Inténtelo más tarde."}
    }
};

// servicoo que carga la data en el tablero de Operaciones
export const apiGetAllOperation = async () => {  
    try {
        const urlGetOperation = allOperations;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(
            `${urlGetOperation}?Authorization=${authorization}`, { 
            headers,
        })
        //console.log('data de Operations in Services => ',response)
        return response

    } catch (error) {
        console.log('error al consumir servicio All Operations => ',error)
        throw error;
    }
}

// servicio para agrega un deal y se muestre en el tablero de Operaciones
export const apiAddOperations = async (data) => {
    try {
        const urlAddDeal = addOperations;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken

        const response = await axios.post(`
            ${urlAddDeal}?Authorization=${authorization}`, 
            data, 
            {headers}
        );
        //console.log('se agrego un Deal => ',response)
        return response;
    } catch (error) {
        console.log('error al agregar un Deal => ',error);
        throw error;
    }
};

// servico que trae el detalle de un Deal 
export const apiGetOperationById = async (id) => {
    try {
        const urlGetOperationById = getOperationById;
        const localStorageArg = readToLocalStorage('user')
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(`
            ${urlGetOperationById}${id}?Authorization=${authorization}`, {
            headers,
        })
        //console.log('data getbyIdOperation services => ',response)
        return response;
    } catch (error) {
        //console.log('error sevicio getOperationById ',error)
        throw error;
    }
};

// servico que Actualiza un Deal del tablero de Operaciones 
export const apiUpdateDealOperation = async (id, data) => {
    try {
        const urlUpdateDealOperation = updateOperation;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken

        const response = await axios.put(`
            ${urlUpdateDealOperation}${id}?Authorization=${authorization}`, 
            data, 
            {headers}
        );
        // console.log('actuliza deal Operation => ',response)
        return response
    } catch (error) {
        console.log('error al actulizar Deal Operaciones => ',error)
        throw error;
    }
};

// servico que Agrega y/o actualiza archivos PDF y PDF FED en el detalle de un Deal
export const apiAddAndUpdateFilePdfDeal = async (id, data) => {
    try {
        const urlAddAndUpdateFilePdfDealDetail = addAndUpdateFilePDFDealDetail;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken

        const response = await axios.put(`
            ${urlAddAndUpdateFilePdfDealDetail}${id}?Authorization=${authorization}`, 
            data, 
            {headers}
        );
        // console.log('se agrego y actulizo pdf y pdf fed => ',response)
        return response;
    } catch (error) {
        console.log('error al Agregar o actulizar PDF en Deal Detail')
        throw error;
    }
};

// servicio que carga de tipo de divisas en componente Head
export const apiGetCurrencies = async () => {
    const base = 'USD'
    const simbolsArg = ['CAD,EUR,MXN'] //JPY,ARS,BRL
    const keyCurrencies = process.env.REACT_APP_KEY_CURRENCIES
    const url = `${urlCurrencies}?apikey=${keyCurrencies}&base=${base}&symbols=${simbolsArg}`
    try {
        const response = await axios.get(url)
        //console.log('dat api divisas Services => ',response)
        return response;
    } catch (error) {
        console.log('error al consumir Api divisas => ',error)
        throw error;
    }
};

// servicio que carga la data de tablero Plataformas 
export const apiGetPlatform = async () => {
    try {
        const urlAllPlatform = allPlatform;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(
            `${urlAllPlatform}?Authorization=${authorization}`, {
            headers
        });
        //console.log('data de api Platform => ', response);
        return response;

    } catch (error) {
        console.log('error al consumir servicio Plataforma => ',error)
        throw error;
    }
};

// servicio que agrega una Nueva plataforma y se muestra en el tablero de Plataformas
export const apiAddPlatform = async (data) => {
    
    try {
        const urlAddPlatform = addPlatform;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.post(`
            ${urlAddPlatform}?Authorization=${authorization}`, data, {
            headers,
        });
        // console.log('data de api Platform => ', response);
        return response;

    } catch (error) {
        console.log('error al consumir servicio Plataforma => ',error)
        throw error;
    }
};

//servicio que Actualiza Data de una plataforma y se muestra en el tablero de Plataformas 
export const apiUpdatePlatform = async (id, data) => {
    
    try {
        const urlUpdatePlatform = updatePlatform;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 

        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.put(`
            ${urlUpdatePlatform}${id}?Authorization=${authorization}`, data ,{
            headers
        });

        // console.log('data de api UpdatePlatform => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir  UpdatePlataforma => ',error)
        throw error;
    }
};

// servicio que Elimina una Plataforma de la lista que se carga en el tablero de Plataformas 
export const apiDeletePlatform = async (id) => { 
    try {
        const urlDeletePlatform = deletePlatform;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 

        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.delete(`
            ${urlDeletePlatform}${id}?Authorization=${authorization}` , {
                headers
            })
        // console.log('data de api Delete Platform => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir Delete Plataforma => ',error)
        throw error;
    }
};

// servicio que carga de data de tablero de Roles
export const apiGetRol = async () => {
    try {
        const urlAllRol = allRol;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken

        const response = await axios.get(`
            ${urlAllRol}?Authorization=${authorization}`, {
                headers
            })
        //console.log('data de api Roles => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir servicio Roles => ',error)
        throw error;
    }
};

// servicio que agrega uno Rol y se muestra en el tablero de Roles
export const apiAddRol = async (data) => {
    const urlAddRol = addRol;
    try {
        const response = await axios.post(urlAddRol, data)
        // console.log('data de api Platform => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir servicio Rol => ',error)
        throw error;
    }
};

//servicio que Actualiza Data de un Rol y se muestra en el tablero de Roles
export const apiUpdateRol = async (id, data) => {
    const urlUpdateRol = updateRol;
    try {
        const response = await axios.put(`${urlUpdateRol}${id}`,{
            id_Rol: data.id_Rol,
            tipoDeRol: data.tipoDeRol
        });
        // console.log('data de api UpdatePlatform => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir  UpdatePlataforma => ',error);
        throw error;
    }
};

// servicio que Elimina un Rol de la lista que se carga en el tablero de Roles 
export const apiDeleteRol = async (id) => {
    const urlDeleteRol = deleteRol;
    // console.log('id para eliminar => ',id)
    try {
        const response = await axios.delete(`${urlDeleteRol}${id}`)
        // console.log('data de api Delete Rol => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir Delete Rol => ',error);
        throw error;
    }
};

// servicio que carga de data de tablero Usuarios
export const apiGetAllUsers = async () => { 
    try {
        const urlAllUsers = allUsers;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(`
            ${urlAllUsers}?Authorization=${authorization}`, {
               headers 
            })
        //console.log('data de api Usuarios => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir servicio Usuarios => ',error)
        throw error;
    }
};

// servicio que agrega uno Usuario y se muestra en el tablero de Usuarios
export const apiAddUser = async (data) => {
    try {
        const urlAddUser = addUser;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.post(`
            ${urlAddUser}?Authorization=${authorization}`, data, {
                headers
            })
        // console.log('data de api Add Users => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir Add Users => ',error)
        throw error;
    }
};

// servicio que trae el detalle de un usuario 
export const apiGetUserById = async (id) => {
    try {
        const urlGetById = getUserById;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(`
            ${urlGetById}${id}?Authorization=${authorization}`,{
                headers
            })
        // console.log('data getById User => ',response);
        return response;
    } catch (error) {
        console.log('error al ejecutar getById User => ',error)
        throw error;
    }
}

// servicio que actualiza la data de un usuario tomando su ID 
export const apiUpdateUser = async (id, data) => {
    try {
        const urlUpdateUser = updateUser;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.put(`
            ${urlUpdateUser}${id}?Authorization=${authorization}`, data,{
                headers
            })
        // console.log('data Update data User => ',response);
        return response;
    } catch (error) {
        console.log('error al ejecutar update data User => ',error)
        throw error;
    }
}

// servicio que Elimina un Usuario de la lista que se carga en el tablero de Usuarios
export const apiDeleteUser = async (id) => {
    try {
        const urlDeleteUser = deleteUser;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.delete(`
            ${urlDeleteUser}${id}?Authorization=${authorization}`,{
                headers
            })
        // console.log('data de api Delete User => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir Delete User => ',error);
        throw error;
    }
};

// servicio que garda toda la data de Currency
export const apiGetCatalogCurrencies = async () => {
    try {
        const urlAllCurrency = allCurrency;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(
            `${urlAllCurrency}?Authorization=${authorization}`, {
            headers
        });
        // console.log('data de api Platform => ', response);
        return response;

    } catch (error) {
        console.log('error al consumir servicio Plataforma => ',error)
        throw error;
    }
};

// servicio que carga toda el select el Estatus de un deal y/o Operacion
export const apiGetAllStatusOperation = async () => {
    try {
        const urlAllStatusOperation = allStatusOperation;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(
            `${urlAllStatusOperation}?Authorization=${authorization}`, {
            headers
        });
        //console.log('data de api StatusOperation => ', response);
        return response;

    } catch (error) {
        console.log('error al consumir servicio Estatus Operacion => ',error)
        throw error;
    }
};

// servicio que carga toda la data del select de Estatus Stickt para en detalle de operacion
export const apiGetAllStatusTicket = async () => {
    try {
        const urlAllStatusTicket = allStatusTicket
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken;
        const response = await axios.get(
            `${urlAllStatusTicket}?Authorization=${authorization}`, {
                headers
        })
        //console.log('data api StatusTicket ==> ',response);
        return response

    } catch (error) {
        console.log('error al consumir servicio StatusTicket => ',error)
        throw error;
    }
};


// servicio que agrega uno Rol y se muestra en el tablero de Roles
export const apiAddTicket = async (data) => {
    try {
        const urlAddTicket= addTicket;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken;

        const response = await axios.post(`
            ${urlAddTicket}?Authorization=${authorization}`, 
            data, 
            {headers}
        );
        //console.log('data services de api Add Ticket  => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir servicio AddTicket => ',error)
        throw error;
    }
};

// servicio que trae el detalle de un Ticket asociado a un operacion 
export const apiGetTicketById = async (id) => {
    try {
        const urlGetById = getTicketById;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(`
            ${urlGetById}${id}?Authorization=${authorization}`,{
                headers
            })
        //console.log('data getById Ticket => ',response);
        return response;
    } catch (error) {
        console.log('error al ejecutar getById Ticket => ',error)
        throw error;
    }
};

//servicio que Actualiza Data de un Rol y se muestra en el tablero de Roles
export const apiUpdateTicket = async (id, data) => {
    try {
        const urlUpdateTicket= updateTicket;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.put(`
            ${urlUpdateTicket}${id}?Authorization=${authorization}`, data ,{
                headers
            });
        //console.log('data de api UpdatePlatform => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir  UpdatePlataforma => ',error)
        throw error;
    }
};

// servicio que agrega uno Comentario y se muestra en la lista de detalle de un Deal
export const apiAddComment = async (data) => {
    try {
        const urlAddComment= addComment;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage');
        } 
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken;

        const response = await axios.post(`
            ${urlAddComment}?Authorization=${authorization}`, 
            data, 
            {headers}
        );
        //console.log('data services de api AddComment  => ', response);
        return response;
    } catch (error) {
        console.log('error al consumir servicio AddComment => ',error)
        throw error;
    }
};

// servicoo que carga la data en el tablero de Operaciones Canceladas
export const apiGetAllOperationCanceled = async () => {  
    try {
        const urlGetOperationCanceled = allOperationsCanceled;
        const localStorageArg = readToLocalStorage('user');
        if (!localStorageArg || !localStorageArg.token) {
            throw new Error('No se encontro data en LocalStorage')
        }
        const headers = {
            Authorization: `Bearer ${localStorageArg.token}`,
        }
        const authorization = localStorageArg.refreshToken
        const response = await axios.get(
            `${urlGetOperationCanceled}?Authorization=${authorization}`, { 
            headers,
        })
        // console.log('data de Operations Canceled in Services => ',response)
        return response

    } catch (error) {
        console.log('error al consumir servicio All OperationsCanceled => ',error)
        throw error;
    }
};





