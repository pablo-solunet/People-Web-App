'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCwIcon as ReloadIcon, Pencil, Trash, Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPermissions } from './user-permissions';

interface User {
  user_id: string;
  email: string;
  username: string;
  legajo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error fetching users');
      }
      const result = await response.json();
      setUsers(result.users);
      console.log('Usuarios recibidos en el cliente:', result.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }
      await fetchUsers(); // Recargar la lista de usuarios
      setNewUser({ email: '', password: '' }); // Limpiar el formulario
    } catch (err) {
      console.error('Error al crear el usuario:', err);
      alert('Error al crear el usuario');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users?userId=${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar el usuario');
        }
        await fetchUsers(); // Recargar la lista de usuarios
      } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handlePermissions = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }
      setEditingUser(null);
      await fetchUsers(); // Recargar la lista de usuarios
    } catch (err) {
      console.error('Error al actualizar el usuario:', err);
      alert('Error al actualizar el usuario');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
        
        {/* Sección para Crear Nuevo Usuario */}
        <form onSubmit={handleCreateUser} className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Crear Nuevo Usuario</h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Crear Usuario</Button>
          </div>
        </form>

        {/* Sección de Usuarios Actuales */}
        <h3 className="text-lg font-semibold mb-4">Usuarios Actuales</h3>
        <Button onClick={fetchUsers} className="mb-4">
          <ReloadIcon className="mr-2 h-4 w-4" />
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
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Legajo</TableHead>
                  <TableHead>Activo</TableHead>
                  {/* <TableHead>Creado</TableHead> */}
                  {/* <TableHead>Actualizado</TableHead> */}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.legajo}</TableCell>
                    <TableCell>{user.is_active ? 'Sí' : 'No'}</TableCell>
                    {/* <TableCell>{user.created_at.toLocaleString()}</TableCell>
                    <TableCell>{new Date(user.updated_at).toLocaleString()}</TableCell> */}
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
                                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                  />
                                </div>
                                {/* <div>
                                  <Label htmlFor="email">Email</Label>
                                  <Input
                                    id="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                  />
                                </div> */}
                                <div>
                                  <Label htmlFor="legajo">Legajo</Label>
                                  <Input
                                    id="legajo"
                                    value={editingUser.legajo}
                                    onChange={(e) => setEditingUser({...editingUser, legajo: e.target.value})}
                                  />
                                </div>
                                <Button type="submit">Actualizar</Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(user.user_id)}>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div>No hay usuarios disponibles</div>
        )}
      </div>
    </div>
  );
}

