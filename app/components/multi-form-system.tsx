"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreForm } from "./pre-form"
import { AgentForm } from "./form-agent"
import { StaffForm } from "./form-staff"
import { TempRecordsView } from "./temp-records-view"
import { UserManagement } from "./user-management"
import { StatusView } from "./status-view"
import { generateIds } from "@/lib/id-generator"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, User, LogOut, Menu, X } from "lucide-react"
import { Login } from "./login"
import { TrainingView } from "./training-view"
import { ManagerView } from "./manager-view"
import { OperacionesView } from "./operaciones-view"
import { PeopleView } from "./people-view"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type UserType = "Agente" | "Staff"

interface TempRecord {
  id_reg: string
  lote_id: string
  requisition_id: string
  created_by: string
  created_at: string
  updated_at: string
  pais: string
  fechaIngreso: string
  cliente: string
  canal: string
  compania: string
  cargaHoraria: string
  horarioIn: string
  horarioOut: string
  job_title: string
  jobDescription: string
  puesto: string

  lunes_in: string
  lunes_out: string
  martes_in: string
  martes_out: string
  miercoles_in: string
  miercoles_out: string
  jueves_in: string
  jueves_out: string
  viernes_in: string
  viernes_out: string
  sabado_in: string
  sabado_out: string
  domingo_in: string
  domingo_out: string

  estado: string
  observaciones: string
  area: string
  [key: string]: string | undefined
}

interface User {
  username: string
  userId: string
  permissions: string[]
  actions: string[]
}

export function MultiFormSystem() {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [tempRecords, setTempRecords] = useState<TempRecord[]>([])
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remoteRecords, setRemoteRecords] = useState([])
  const [activeTab, setActiveTab] = useState("requerimiento")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // const [authToken, setAuthToken] = useState<string | null>(null)

  const handleFormSubmit = (data: Record<string, string>) => {
    const quantity = Number.parseInt(data.quantity) || 1
    const newIds = generateIds(quantity)

    const newRecords = newIds.map(({ id_reg, lote_id, requisition_id }) => ({
      id_reg,
      lote_id,
      requisition_id,
      created_by: user?.username || "Usuario Desconocido",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pais: data.pais || "",
      fechaIngreso: data.fechaIngreso || "",
      cliente: data.cliente || "",
      canal: data.canal || "",
      compania: data.compania || "",
      cargaHoraria: data.cargaHoraria || "",
      horarioIn: data.horarioIn || "",
      horarioOut: data.horarioOut || "",
      job_title: data.job_title || "",
      jobDescription: data.jobDescription || "",
      puesto: data.puesto || "",

      lunes_in: data.lunes_in || "",
      lunes_out: data.lunes_out || "",
      martes_in: data.martes_in || "",
      martes_out: data.martes_out || "",
      miercoles_in: data.miercoles_in || "",
      miercoles_out: data.miercoles_out || "",
      jueves_in: data.jueves_in || "",
      jueves_out: data.jueves_out || "",
      viernes_in: data.viernes_in || "",
      viernes_out: data.viernes_out || "",
      sabado_in: data.sabado_in || "",
      sabado_out: data.sabado_out || "",
      domingo_in: data.domingo_in || "",
      domingo_out: data.domingo_out || "",

      estado: data.estado || "",
      observaciones: data.observaciones || "",
      area: data.area || "",
      ...data,
    }))

    setTempRecords((prev) => [...prev, ...newRecords])
  }

  const handleDelete = (id_reg: string) => {
    setTempRecords((prev) => prev.filter((record) => record.id_reg !== id_reg))
  }

  const handleConfirmAll = () => {
    if (tempRecords.length === 0) return

    const newIds = generateIds(tempRecords.length)

    const updatedRecords = tempRecords.map((record, index) => ({
      ...record,
      lote_id: newIds[0].lote_id, // All records get the same lote_id
    }))

    // console.log("Confirming all records:", updatedRecords)

    // Aquí deberías enviar los registros confirmados a tu backend o realizar la acción necesaria

    // Resetear tempRecords después de confirmar
    setTempRecords([])
  }

  const handleCancelAll = () => {
    setTempRecords([])
  }

  const handleReturnToPreForm = () => {
    setSelectedUserType(null)
    setTempRecords([])
  }

  const toggleTheme = () => {
    // setTheme(theme === "dark" ? "light" : "dark")
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleLogin = (username: string, userId: string, permissions: string[], actions: string[]) => {
    setUser({
      username,
      userId,
      permissions,
      actions
    });
    console.log('User logged in:', { username, userId, permissions, actions });
    if (permissions.length > 0) {
          setActiveTab(permissions[0])
    }
  }
  // const handleLogin = (username: string, userId: string, permissions: string[], actions: string[], token: string) => {
  // const handleLogin = (username: string, userId: string, permissions: string[], actions: string[]) => {
  //   setUser({
  //     username,
  //     userId,
  //     permissions,
  //     actions,
  //   })
  //   // setAuthToken(token)

  //   // Store the token in localStorage
  //   // localStorage.setItem("authToken", token)

  //   // Establecer la primera pestaña disponible como activa
  //   if (permissions.length > 0) {
  //     setActiveTab(permissions[0])
  //   }
  // }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  }

  // const handleLogout = () => {
  //   setUser(null)
  //   // setAuthToken(null)
  //   // localStorage.removeItem("authToken")
  // }
  const handleReloadStatus = () => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      fetch('/api/agent-form')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setRemoteRecords(data.data.map((item: any) => {
            const newObj: any = {};
            item.f.forEach((field: any) => {
              newObj[field.name] = field.v;
            });
            return newObj;
          }));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500); // Simulate a 500ms delay
  }

  // const handleReloadStatus = () => {
  //   // Simulate fetching data
  //   setIsLoading(true)
  //   setTimeout(() => {
  //     fetch("/api/agent-form", {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error("Network response was not ok")
  //         }
  //         return response.json()
  //       })
  //       .then((data) => {
  //         setRemoteRecords(
  //           data.data.map((item: any) => {
  //             const newObj: any = {}
  //             item.f.forEach((field: any) => {
  //               newObj[field.name] = field.v
  //             })
  //             return newObj
  //           }),
  //         )
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching data:", error)
  //       })
  //       .finally(() => {
  //         setIsLoading(false)
  //       })
  //   }, 500)
  // }

  const hasActionPermission = (action: string) => {
    return user?.actions.includes(action) || false
  }

  // useEffect(() => {
  //   const storedToken = localStorage.getItem("authToken")
  //   if (storedToken) {
  //     // Validate the token with the server
  //     validateToken(storedToken)
  //   }
  // }, [])

  // const validateToken = async (token: string) => {
  //   try {
  //     const response = await fetch("/api/auth/validate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ token }),
  //     })

  //     if (response.ok) {
  //       const userData = await response.json()
  //       handleLogin(userData.username, userData.userId, userData.permissions, userData.actions, token)
  //     } else {
  //       // If token is invalid, remove it from localStorage
  //       localStorage.removeItem("authToken")
  //     }
  //   } catch (error) {
  //     console.error("Error validating token:", error)
  //     localStorage.removeItem("authToken")
  //   }
  // }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-4">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Header para pantallas medianas y grandes */}
      <header className="hidden md:flex justify-between items-center p-4 md:p-6 border-b border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300">People App</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full">
            {/* <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-blue-600" /> */}
            {/* <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-300" /> */}
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-blue-200 dark:border-blue-800">
                <User size={16} />
                <span className="hidden md:inline">{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Header para móviles */}
      <header className="md:hidden flex justify-between items-center p-4 border-b border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 shadow-sm">
        <h1 className="text-xl font-bold text-blue-800 dark:text-blue-300">People App</h1>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
            {/* <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-blue-600" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-300" /> */}
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Menú</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col space-y-1">
                  {user.permissions.map((permission) => (
                    <Button
                      key={permission}
                      variant={activeTab === permission ? "default" : "ghost"}
                      className={`justify-start ${activeTab === permission ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => {
                        setActiveTab(permission)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      {permission === "requerimiento" && "Requerimiento Posiciones"}
                      {permission === "operaciones" && "Operations"}
                      {permission === "training" && "Training"}
                      {permission === "manager" && "Manager"}
                      {permission === "people" && "People"}
                      {permission === "status" && "Status"}
                      {permission === "usuarios" && "Usuarios"}
                    </Button>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-800">
                  <div className="flex items-center mb-4 px-2">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 animate-fade-in">
        {/* Tabs para pantallas medianas y grandes */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-1 rounded-lg">
              {user.permissions.includes("requerimiento") && (
                <TabsTrigger
                  value="requerimiento"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Requerimiento Posiciones
                </TabsTrigger>
              )}
              {user.permissions.includes("operaciones") && (
                <TabsTrigger
                  value="operaciones"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Operations
                </TabsTrigger>
              )}
              {user.permissions.includes("training") && (
                <TabsTrigger
                  value="training"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Training
                </TabsTrigger>
              )}
              {user.permissions.includes("manager") && (
                <TabsTrigger value="manager" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Manager
                </TabsTrigger>
              )}
              {user.permissions.includes("people") && (
                <TabsTrigger value="people" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  People
                </TabsTrigger>
              )}
              {user.permissions.includes("status") && (
                <TabsTrigger value="status" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Status
                </TabsTrigger>
              )}
              {user.permissions.includes("usuarios") && (
                <TabsTrigger
                  value="usuarios"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Usuarios
                </TabsTrigger>
              )}
            </TabsList>

            {user.permissions.includes("requerimiento") && (
              <TabsContent value="requerimiento" className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  {!selectedUserType ? (
                    <PreForm onSelectUserType={setSelectedUserType} />
                  ) : (
                    <>
                      {selectedUserType === "Agente" ? (
                        <AgentForm onSubmit={handleFormSubmit} onReturn={handleReturnToPreForm} />
                      ) : (
                        <StaffForm onSubmit={handleFormSubmit} onReturn={handleReturnToPreForm} />
                      )}
                      <TempRecordsView
                        records={tempRecords}
                        onDelete={handleDelete}
                        onConfirmAll={handleConfirmAll}
                        onCancelAll={handleCancelAll}
                      />
                    </>
                  )}
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("people") && (
              <TabsContent value="people">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">People</h2>
                  <PeopleView hasActionPermission={hasActionPermission} />
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("training") && (
              <TabsContent value="training">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Training</h2>
                  <TrainingView hasActionPermission={hasActionPermission} />
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("manager") && (
              <TabsContent value="manager">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Manager</h2>
                  <ManagerView hasActionPermission={hasActionPermission} />
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("operaciones") && (
              <TabsContent value="operaciones">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Operaciones</h2>
                  <OperacionesView hasActionPermission={hasActionPermission} />
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("status") && (
              <TabsContent value="status">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Status de Pedidos</h2>
                  <StatusView records={tempRecords.filter((record) => record.lote_id)} onReload={handleReloadStatus} />
                </div>
              </TabsContent>
            )}

            {user.permissions.includes("usuarios") && (
              <TabsContent value="usuarios">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
                  <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">
                    Administración de Usuarios
                  </h2>
                  <UserManagement />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Contenido para móviles (sin tabs, solo muestra el contenido activo) */}
        <div className="md:hidden">
          {activeTab === "requerimiento" && user.permissions.includes("requerimiento") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Requerimiento Posiciones</h2>
              {!selectedUserType ? (
                <PreForm onSelectUserType={setSelectedUserType} />
              ) : (
                <>
                  {selectedUserType === "Agente" ? (
                    <AgentForm onSubmit={handleFormSubmit} onReturn={handleReturnToPreForm} />
                  ) : (
                    <StaffForm onSubmit={handleFormSubmit} onReturn={handleReturnToPreForm} />
                  )}
                  <TempRecordsView
                    records={tempRecords}
                    onDelete={handleDelete}
                    onConfirmAll={handleConfirmAll}
                    onCancelAll={handleCancelAll}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "people" && user.permissions.includes("people") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">People</h2>
              <PeopleView hasActionPermission={hasActionPermission} />
            </div>
          )}

          {activeTab === "training" && user.permissions.includes("training") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Training</h2>
              <TrainingView hasActionPermission={hasActionPermission} />
            </div>
          )}

          {activeTab === "manager" && user.permissions.includes("manager") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Manager</h2>
              <ManagerView hasActionPermission={hasActionPermission} />
            </div>
          )}

          {activeTab === "operaciones" && user.permissions.includes("operaciones") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Operaciones</h2>
              <OperacionesView hasActionPermission={hasActionPermission} />
            </div>
          )}

          {activeTab === "status" && user.permissions.includes("status") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Status de Pedidos</h2>
              <StatusView records={tempRecords.filter((record) => record.lote_id)} onReload={handleReloadStatus} />
            </div>
          )}

          {activeTab === "usuarios" && user.permissions.includes("usuarios") && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-blue-sm dark:shadow-none border border-blue-100 dark:border-blue-800">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">Administración de Usuarios</h2>
              <UserManagement />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 py-4 border-t border-blue-100 dark:border-blue-800 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} People App. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

