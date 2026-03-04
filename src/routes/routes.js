import Login from "../components/login/login";
import Operaciones from "../components/operaciones/operaciones";
import DashKpi from "../components/dashKpi/dashKpi";
import TableUsers from "../components/tableUsers/tableUsers";
import DetailDeail from "../components/detailDeal/detailDeail";
import AddDeal from "../components/addDeal/addDeal";
import Users from "../components/users/users";
import TablePlatform from "../components/tablePlatform/tablePlatform";
import TableRol from "../components/tableRol/tableRol";
import ImagesOCR from "../components/imagesOCR/imagesOCR";
import OperacionesCanceled from "../components/operacionesCanceled/operacionesCanceled";
import DetailDealCanceled from "../components/detailDealCanceled/detailDealCanceled";

const routes = [
    {
        path: "/login",
        Component: Login,
        title: "Inicio sesion"
    },
    {
        path: "/operations",
        Component: Operaciones,
        title: "Operaciones"
    },
    {
        path: '/dash-kpi',
        Component: DashKpi,
        title: 'Dask KPI'
    },
    {
        path: "/table-users",
        Component: TableUsers,
        title: "Tablero Usuarios"
    },
    {
        path: "/detail-deal",
        Component: DetailDeail,
        title: "Detalle Deal"
    },
    {
        path: "/add-deal",
        Component: AddDeal,
        title: "Agregar Deal"
    },
    {
        path: "/user",
        Component: Users,
        title: "Usuario"
    },
    {
        path: "/table-platform",
        Component: TablePlatform,
        title: "Tablero Plataformas"
    },
    {
        path: "/table-rol",
        Component: TableRol,
        title: "Tablero Roles"
    },
    {
        path: "/image-ocr",
        Component: ImagesOCR,
        title: "Imagenes OCR"
    },
    {
        path: "/operations-canceled",
        Component: OperacionesCanceled,
        title: "Operaciones Canceladas"
    },
    {
        path: "/detail-deal-canceled",
        Component: DetailDealCanceled,
        title: "Detalle Deal Cancelado"
    },

]

export default routes;