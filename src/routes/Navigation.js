import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'

const Navigation = () => {
    //console.log('data de rutas => ',routes)
    
    return (
        <BrowserRouter>
            <>
                <Routes>
                    {
                        routes.map((item) => {
                        // console.log('data de rutas => ',item)
                        return(
                            <Route 
                                key={item.path}
                                path={item.path}
                                element={<item.Component />}
                            />
                        )
                        })  
                    }
                    <Route path='/*' element={ <Navigate to={routes[0].path} replace /> } />
                </Routes>
            </>
        </BrowserRouter>
    )
    
}

export default Navigation;