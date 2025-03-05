"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCwIcon as ReloadIcon, Pencil, Trash, Key, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPermissions } from "./user-permissions"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

interface User {
  user_id: string
  email: string
  username: string
  legajo: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ email: "", password: "", username: "", sendEmail: true })
  const { toast } = useToast()
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error fetching users")
      }
      const result = await response.json()
      setUsers(result.users)
      console.log("Usuarios recibidos en el cliente:", result.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los usuarios")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, []) // Added dependency array to fix the warning

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Crear el usuario
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          username: newUser.email.split("@")[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear el usuario")
      }

      const result = await response.json()

      // Si se seleccionó enviar email y la creación fue exitosa
      if (newUser.sendEmail) {
        setIsSendingEmail(true)
        try {
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: newUser.email,
              username: newUser.email.split("@")[0],
              password: newUser.password,
              type: "credentials", // Especificar que es un correo de credenciales
            }),
          })

          if (!emailResponse.ok) {
            throw new Error("Error al enviar el correo")
          }

          toast({
            title: "Correo enviado",
            description: "Las credenciales han sido enviadas al usuario.",
            variant: "default",
          })
        } catch (emailErr) {
          console.error("Error al enviar el correo:", emailErr)
          toast({
            title: "Error",
            description: "Usuario creado pero no se pudo enviar el correo.",
            variant: "destructive",
          })
        } finally {
          setIsSendingEmail(false)
        }
      }

      await fetchUsers() // Recargar la lista de usuarios
      setNewUser({ email: "", password: "", username: "", sendEmail: true }) // Limpiar el formulario

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error al crear el usuario:", err)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleDelete = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/users?userId=${userId}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          throw new Error("Error al eliminar el usuario")
        }
        await fetchUsers() // Recargar la lista de usuarios
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente.",
          variant: "default",
        })
      } catch (err) {
        console.error("Error al eliminar el usuario:", err)
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario.",
          variant: "destructive",
        })
      }
    }
  }

  const handlePermissions = (userId: string) => {
    setSelectedUserId(userId)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      })
      if (!response.ok) {
        throw new Error("Error al actualizar el usuario")
      }
      setEditingUser(null)
      await fetchUsers() // Recargar la lista de usuarios
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error al actualizar el usuario:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleResendCredentials = async (user: User) => {
    try {
      setIsSendingEmail(true)
      // Primero necesitamos obtener o generar una nueva contraseña
      const newPassword = prompt("Ingrese la nueva contraseña para el usuario:", "")

      if (!newPassword) {
        setIsSendingEmail(false)
        return // El usuario canceló
      }

      // Actualizar la contraseña del usuario
      const updateResponse = await fetch("/api/users/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.user_id,
          newPassword,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Error al actualizar la contraseña")
      }

      // Enviar el correo con las nuevas credenciales usando la plantilla de reset-password
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          username: user.username || user.email.split("@")[0],
          password: newPassword,
          type: "reset-password", // Especificar que es un correo de restablecimiento de contraseña
        }),
      })

      if (!emailResponse.ok) {
        throw new Error("Error al enviar el correo")
      }

      toast({
        title: "Contraseña restablecida",
        description: "La nueva contraseña ha sido enviada al usuario.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error al reenviar credenciales:", err)
      toast({
        title: "Error",
        description: "No se pudieron reenviar las credenciales.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>

        {/* Sección para Crear Nuevo Usuario */}
        <form
          onSubmit={handleCreateUser}
          className="space-y-4 mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm"
        >
          <h3 className="text-lg font-semibold">Crear Nuevo Usuario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="username">Nombre de usuario (opcional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nombre de usuario"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="send-email"
              checked={newUser.sendEmail}
              onCheckedChange={(checked) => setNewUser({ ...newUser, sendEmail: checked })}
            />
            <Label htmlFor="send-email">Enviar credenciales por correo</Label>
          </div>

          <Button type="submit" className="mt-4" disabled={isSendingEmail}>
            {isSendingEmail ? "Enviando..." : "Crear Usuario"}
          </Button>
        </form>

        {/* Sección de Usuarios Actuales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Usuarios Actuales</h3>
          <Button onClick={fetchUsers} className="mb-4" variant="outline">
            <ReloadIcon className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Recargar usuarios
          </Button>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Cargando...
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                    <TableHead className="font-medium">User ID</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Username</TableHead>
                    <TableHead className="font-medium">Legajo</TableHead>
                    <TableHead className="font-medium">Activo</TableHead>
                    <TableHead className="font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.legajo}</TableCell>
                      <TableCell>{user.is_active ? "Sí" : "No"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Usuario</DialogTitle>
                              </DialogHeader>
                              {editingUser && (
                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                  <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                      id="username"
                                      value={editingUser.username}
                                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="legajo">Legajo</Label>
                                    <Input
                                      id="legajo"
                                      value={editingUser.legajo}
                                      onChange={(e) => setEditingUser({ ...editingUser, legajo: e.target.value })}
                                    />
                                  </div>
                                  <Button type="submit">Actualizar</Button>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.user_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handlePermissions(user.user_id)}>
                                <Key className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Permisos de Usuario: {user.username}</DialogTitle>
                              </DialogHeader>
                              <UserPermissions userId={user.user_id} />
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendCredentials(user)}
                            disabled={isSendingEmail}
                            className="text-blue-500 hover:text-blue-700"
                            title="Restablecer contraseña"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay usuarios disponibles</div>
          )}
        </div>
      </div>
    </div>
  )
}

