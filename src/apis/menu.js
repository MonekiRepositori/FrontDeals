const menuItems = [
    { 
        id: '/add-deal', 
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', 
        label: 'Agregar Deal', 
        path: '/add-deal'
    },
    { 
        id: '/operations', 
        icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', 
        label: 'Operaciones',
        path: '/operations'
    },
    { 
        id: '/dash-kpi', 
        icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 
        label: 'Dash KPI', 
        path: '/dash-kpi' 
    },
    { 
        id: '/table-users', 
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
        label: 'Tablero Usuarios', 
        path: '/table-users' 
    },
    { 
        id: '/table-platform', 
        icon: 'M3 7h18M4 21h16a1 1 0 001-1V10H3v10a1 1 0 001 1zm8-14v4', 
        label: 'Tablero Plataformas',
        path: '/table-platform'
    },
    { 
        id: '/table-rol', 
        icon: 'M12 4a4 4 0 110 8 4 4 0 010-8zm0 12a8 8 0 005.292-2.708M12 20a8 8 0 01-5.292-2.708m10.584 0A7.96 7.96 0 0112 20zM16 14h2a1 1 0 011 1v2a1 1 0 01-1 1h-2m-8-4H6a1 1 0 00-1 1v2a1 1 0 001 1h2',
        label: 'Tablero Roles',
        path: '/table-rol'
    },
   
    { 
        id: '/operations-canceled', 
        icon: 'M9 12l2 2 4-4M5 13l4 4L19 7M12 2a10 10 0 100 20 10 10 0 000-20z',
        label: 'Deals Cancelados',
        path: '/operations-canceled'
    },
]

export const NavBarMenu = (typeUser) => {
    switch (typeUser) {
        case '1':
            return menuItems;

        case '2':
            return menuItems.filter(item => 
                item.id === '/add-deal' ||
                item.id === '/operations' || 
                item.id === '/dash-kpi' ||
                item.id === '/table-users' ||
                item.id === '/table-platform' ||
                 item.id === '/operations-canceled'
            );

        case '3':
            return menuItems.filter(item => 
                item.id === '/operations' || 
                item.id === '/dash-kpi' ||
                item.id === '/table-platform' || 
                item.id === '/table-users'
            );
       
        case '4':
            return menuItems.filter(item => 
                item.id === '/add-deal' ||
                item.id === '/operations' || 
                item.id === '/table-platform'
            );
         
        case '5':
            return menuItems.filter(item => 
                item.id === '/add-deal' ||
                item.id === '/operations'
            );

        default:
            return [];
    }
}