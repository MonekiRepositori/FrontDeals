import React, { useEffect, useState } from 'react'
import NavBar from '../navBar/navBar';
import Head from '../head/head';
import Footer from '../footer/footer';
import Loader from '../loader/loader';
import Error400  from '../errorServices/error400';

import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import Tabs from '@mui/material/Tabs'
//import TabsContent from '@mui/material/Tabs'
import TabsList from '@mui/material/Tabs'
import TabsTrigger from '@mui/material/Tabs'
//TabsContent, TabsList, TabsTrigger 

import { 
    Upload,
    
} from "lucide-react"

const ImagesOCR = () => {
    /** estado de loader */
    const [isLoader, setIsLoader] = useState(true);
    const [error400, setError400] = useState(false);

    const [activeTab, setActiveTab] = useState("datos")

    useEffect(() => {
        setTimeout(() => {
            setIsLoader(false);
            setError400(false);
        },1000)
    },[])

  return (
    <>
        {error400 ? <Error400 /> :
            isLoader ? <Loader /> :
            <div className="flex h-screen bg-white">
                <NavBar/>
                <div className='flex-1 overflow-y-auto'>
                    <Head />
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Procesador de Imágenes OCR
                            </h1>

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    className="bg-white" 
                                    onClick={() => {}}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir Imágenes
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="bg-white" 
                                    onClick={() => {}}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir Imágenes
                                </Button>

                            </div>
                        </div>
                        <Card className="mx-auto shadow-xl">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                            >
                                <div>
                                    Extracción de Datos OCR
                                </div>
                                <div
                                    className="text-blue-100"
                                >
                                    Sube imágenes para extraer información bancaria mediante OCR
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
                                        <TabsTrigger 
                                            value="imagenes" 
                                            className='!text-blue-700 '
                                        >
                                            Imágenes
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="datos"

                                        >
                                            Datos Extraídos
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

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

export default ImagesOCR;
