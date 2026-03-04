import React, {useState, useEffect, useRef} from 'react'
import Logo from '../../assets/logos/logo.png'
import { motion } from 'framer-motion'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom';

import { 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  ArrowRight, 
} from 'lucide-react'

import { toast, Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';

import { 
  apiLoginUser,
  apiGetUsers,
} from '../../apis/services'

import Error400  from '../errorServices/error400';
import Loader from '../loader/loader';

const DynamicBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: { x: number; y: number; radius: number; vx: number; vy: number }[] = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      
      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()

        particles.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`
              ctx.lineWidth = 0.5
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.stroke()
            }
          }
        })
      })

      animationFrameId = requestAnimationFrame(drawParticles)
    }

    drawParticles()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const Login = () => {
  /** Estado que controla la navegacion entre componentes y/o pantallas */
  let navigate = useNavigate();
  /** Estado que controla el comportamiento del boton login
  * para que no se le de Click varias veces y este mande error 
  * cuando se este consuminedo el servicio de login 
  */
  const [
    isDisableButtonLogin, 
    setIsDisableButtonLogin
  ] = useState(false);
  /** Estado que controla el estado de validacion de los campos 
  * para inciar sesion
  */
  const [showPassword, setShowPassword] = useState(false);
  /** Estado que guardad los datos ingresandos en los intups nombre de usuario y contraña */
  const [formData, setFormData] = useState({ username: '', password: '' });
  /** Estado que controla el mensaje de error que se muestra en cada input 
  * indicando le al usuario cual es error en dicho campos
  */
  const [errors, setErrors] = useState({ username: '', password: '' });
  /** Estado que controla el loader de carga de la pagina de login */
  const [isLoader, setIsLoader] = useState(false);
  /** Estado que controla el mensaje de error cuando falla algun servicio */
  const [error400, setError400] = useState(false);

  /** Funcion que valida que los campos Nombre de Usuario y contraseña tengan datos
  * ademas de validar que los datos ingresaods esten registrados en el catalogo de 
  * Registro_Usiario y asi poder hacer ejecutar el api de Login
  * Esta funcion esta de manera asincrona con la de login esta mandar su respuesta para 
  * que se ejecute el servicio de login 
  */
  const onGetListUsers = async (e) => {
    e.preventDefault()
    setErrors({ username: '', password: '' })
    /** Variables que eliminan espacios en blanco cunado el usuario
    * ingresa su nombre de usuario y contraseña 
    * Esto se lleva acabo para evitar error al momento de inicia sesion
    */
    let userNameTrim = formData.username.trim();
    let passUserTrim = formData.password.trim();

    /** Validacion que las variables username y password no venga vacios
    * y de ser asi lanza los mensaje informativos en dichos campos
    */
    if (!userNameTrim) {
      setErrors(prev => ({ ...prev, username: 'El nombre de usuario es requerido' }))
      setIsDisableButtonLogin(false);
    }
    if (!passUserTrim) {
      setErrors(prev => ({ ...prev, password: 'La contraseña es requerida' }))
      setIsDisableButtonLogin(false);
    }
    try {
      /** Se realiza el consumo de api de lista de usuarios
      * registrados en la base de datos
      */
      const response = await apiGetUsers();
      /** Realiza busqueda de los datos ingresados para dar acceso
      * al usuario que esta accediendo al sistema summa
      */
      const foundUser = response.data.find((use) => 
        use.nombreUsuario === userNameTrim && 
        use.contrasena === passUserTrim
      )

      /** Busca y valida que los datos ingresados esten registardos en la 
      * base de datos y estos coincidan para dar acceso
      */
      if (!foundUser) {
        if (!response.data.some(user => 
          user.nombreUsuario === userNameTrim
        )) {
          console.log('error en nombre user ')
          setErrors(prev => ({...prev, username: 'El nombre de usuario no existe'}))
          setIsDisableButtonLogin(false);
        }
        if (!response.data.some(user => 
          user.contrasena === passUserTrim
        )) {
          setErrors(prev => ({...prev, password: 'La contraseña es incorrecta'}))
          setIsDisableButtonLogin(false);
        }
        setIsLoader(false)
        return
      }
      return formData
    } catch (error) {
      setTimeout(() => {
        setFormData(prev => ({ ...prev, username: '' }));
        setFormData(prev => ({ ...prev, password: '' }));
        setIsLoader(false);
        setError400(false);
        setIsDisableButtonLogin(false);
      },2000)
      return {error: true, message: "No se pudieron obtener los usuarios. Inténtelo más tarde."}
      //throw error;
    }
  };

  /** Funicon que espera la respuesta de la funcion **onGetListUsers** que los datos 
  * que esta funcion esta validando sean los correctos para poder ejecutar el servicio de
  * **Login** y poder dar acceso al usuario si estos datos son correctos 
  */
  const onGetLogin = async (e) => {
    try {
      /** Consume la funcion onGetListUsers y valida que los datos sean correctos
      * para dar acceso al sistema 
      */
      const responseDataUser = await onGetListUsers(e);
      /** Despliega mensaje informativo inidcando cual es el error
      * al tratar de iniciar session
      */
      if (!responseDataUser) {
        toast.error("El Usuario y/o Contraseña no coinciden. \n Revisa los datos ingresados", {
          position: 'top-right',
        });
        setIsDisableButtonLogin(false);
      } else {
        setIsDisableButtonLogin(true);
        setIsLoader(true);

        /** Crea la estructura para enviar los datos validos al api
        * y dar aceeso al usuario ya los datos ya estab validados
        * previamente por la fucnin onGetListUsers
        */
        const body = {
          nombreUsuario: responseDataUser.username,
          contrasena: responseDataUser.password
        }
        /** Cosume de servicio apiLoginUser para acceso al apicativo */
        const response = await apiLoginUser(body);
        /** Envia mensaje informativo que el acceso fue correcto */
        if(response.status === '200') {
          toast.info("Ingreso exitoso \n Bienvendo", {
            position: 'top-right',
          });  
        }
        /** Si las credeciales son correctas redirigue a la 
        * pagina principal para que el usaurio haga uso del 
        * aplicativo SUMMA
        */
        navigate('/operations');
      }
    } catch (error) {
      setIsLoader(true);
      setTimeout(() => {
        setIsLoader(false);
      },1000)
      return {error: true, message: "No se pudieron obtener los usuarios. Inténtelo más tarde."}
    }
  };

  return (
    <>
      { isLoader ? <Loader /> :
        error400 ? <Error400 /> : 
        <div className="min-h-screen grid lg:grid-cols-2">
          <Toaster />
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative hidden lg:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden"
          >
            <DynamicBackground />
            <p 
              className="text-7xl font-bold mb-8 z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Bienvenido
            </p>
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-56 h-56 relative z-10"
            >
              <img
                alt="Summa Logo"
                src={Logo}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <h3 className="loader flex gap-2">
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none hover:text-pink-600">S</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[100ms] hover:text-pink-600">U</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[200ms] hover:text-pink-600">M</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[300ms] hover:text-pink-600">M</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[400ms] hover:text-pink-600">A</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[100ms] hover:text-pink-600">&nbsp;</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[100ms] hover:text-pink-600">B</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[200ms] hover:text-pink-600">U</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[300ms] hover:text-pink-600">S</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[400ms] hover:text-pink-600">S</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[500ms] hover:text-pink-600">I</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[600ms] hover:text-pink-600">N</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[700ms] hover:text-pink-600">E</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[800ms] hover:text-pink-600">S</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[100ms] hover:text-pink-600">&nbsp;</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[100ms] hover:text-pink-600">S</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[200ms] hover:text-pink-600">O</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[300ms] hover:text-pink-600">L</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[400ms] hover:text-pink-600">U</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[500ms] hover:text-pink-600">T</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[600ms] hover:text-pink-600">I</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[700ms] hover:text-pink-600">O</span>
              <span className="animate-loading text-2xl text-[antiquewhite] shadow-none delay-[800ms] hover:text-pink-600">N</span>
            </h3>
            <motion.div
              className="mt-8 text-center z-10"
            >
              <p className="text-xl mt-2">Innovación en cada solución</p>
            </motion.div>
          </motion.div>

          <div className="flex items-center justify-center p-8 bg-gray-100 relative overflow-hidden">
            <div className="w-full max-w-md space-y-8 relative z-10 p-8 bg-white rounded-2xl shadow-2xl">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Ingresa a tu cuenta
                </h2>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <InputLabel htmlFor="username" className="text-gray-700">
                    Nombre del usuario
                  </InputLabel>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      onBlur={() => {
                        if (errors.username) {
                          setErrors((prev) => ({ ...prev, username: '' }));
                        } 
                      }}
                      className={clsx(
                        "pl-10 border rounded-lg w-full border-blue-300 text-gray-900 placeholder-gray-400 border-b-4",
                        errors.username && "border-red-500 focus-visible:ring-red-500"
                      )}
                      placeholder="Ingrese su nombre de usuario"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <InputLabel htmlFor="password" className="text-gray-700">
                    Contraseña
                  </InputLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      onBlur={() => {
                        if (errors.password) {
                          setErrors((prev) => ({ ...prev, password: '' }));
                        } 
                      }}
                      className={clsx(
                        "pl-10 border rounded-lg w-full border-blue-300 text-gray-900 placeholder-gray-400 border-b-4",
                        errors.password && "border-red-500 focus-visible:ring-red-500"
                      )}
                      placeholder="Ingrese su contraseña"
                    />
                    <Lock className="absolute left-3 top-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-9 transform hover:bg-transparent text-gray-400 hover:text-gray-600 !ml-[-69px] !mb-[-65px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 !text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                    disabled={isDisableButtonLogin}
                    onClick={(e) => {
                      setIsDisableButtonLogin(true);
                      onGetLogin(e)
                    }}
                  >
                    <>
                      Iniciar sesión
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  </Button>
                </div>
              </form>
            </div>
            <div className="h-full">
              <div className="fixed bottom-4 !bg-blue-500 right-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border text-white text-sm shadow-lg">
                v1.0.0
              </div>
            </div>  
          </div>
        </div>
      }
    </>
  );
}

export default Login;
