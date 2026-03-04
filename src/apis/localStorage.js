export const saveToLocalStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        //console.log('data que se guardar en localStorage => ',serializedValue)
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.log('error al guarda data en local storage => ',error);
        throw error;
    }
};

export const readToLocalStorage = (key) => {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return undefined
        }
        //console.log('data que se lee de localStorage => ',JSON.parse(serializedValue))
        return JSON.parse(serializedValue);
    } catch (error) {
        console.log('error al leer data de LocalStorage => ',error)
        throw error;
    }
};

export const removeToLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        //console.log('se borro data de localStorage');
    } catch (error) {
        console.log('error al borrrar data de localStorage => ',error)
        throw error;
    }
};

export const saveIdDealToLocalStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        //console.log('data que se guardar en localStorage => ',serializedValue)
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.log('error al guarda data en local storage => ',error);
        throw error;
    }
};

export const readIdDealToLocalStorage = (key) => {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return undefined
        }
        //console.log('data que se lee de localStorage => ',JSON.parse(serializedValue))
        return JSON.parse(serializedValue);
    } catch (error) {
        console.log('error al leer data de LocalStorage => ',error)
        throw error;
    }
};

export const removeIdDealToLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        //console.log('se borro idDetailDeal de localStorage');
    } catch (error) {
        console.log('error al borrrar data de localStorage => ',error)
        throw error;
    }
};