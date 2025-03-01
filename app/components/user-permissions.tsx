'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Permission {
  permission_id: string;
  resource: string;
  action: string;
}

interface UserPermission {
  user_permission_id: string;
  user_id: string;
  permission_id: string;
  resource: string;
  action: string;
  status: 'unchanged' | 'added' | 'removed';
}

interface UserPermissionsProps {
  userId: string;
}

export function UserPermissions({ userId }: UserPermissionsProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (allPermissions.length > 0) {
      fetchUserPermissions();
    }
  }, [userId, allPermissions]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (!response.ok) {
        throw new Error('Error fetching permissions');
      }
      const data = await response.json();
      setAllPermissions(data.permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los permisos');
      console.error(err);
    }
  };

  const fetchUserPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user-permissions?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error fetching user permissions');
      }
      const data = await response.json();
      setUserPermissions(data.userPermissions.map((up: UserPermission) => ({ ...up, status: 'unchanged' as const })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los permisos del usuario');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupPermissionsByResource = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setUserPermissions(prevPermissions => {
      const existingPermission = prevPermissions.find(up => up.permission_id === permission.permission_id);
      if (existingPermission) {
        // If the permission exists, toggle its status
        return prevPermissions.map(up =>
          up.permission_id === permission.permission_id
            ? { ...up, status: up.status === 'unchanged' ? 'removed' : 'unchanged' }
            : up
        );
      } else if (checked) {
        // If the permission doesn't exist and it's being checked, add it
        return [...prevPermissions, {
          user_permission_id: `temp_${Date.now()}`,
          user_id: userId,
          permission_id: permission.permission_id,
          resource: permission.resource,
          action: permission.action,
          status: 'added'
        }];
      }
      return prevPermissions;
    });
  };

  const handleUpdatePermissions = async () => {
    try {
      const permissionsToAdd = userPermissions.filter(up => up.status === 'added');
      const permissionsToRemove = userPermissions.filter(up => up.status === 'removed');
      const response = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          permissionsToAdd, 
          permissionsToRemove 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update permissions');
      }

      const result = await response.json();

      // Refresh user permissions after changes
      setSuccessMessage('Permisos actualizados exitosamente');
      await fetchUserPermissions();
      setError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Error al actualizar los permisos: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancel = () => {
    fetchUserPermissions(); // Reset to original state
  };

  if (isLoading) {
    return <div>Cargando permisos...</div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  const groupedPermissions = groupPermissionsByResource(allPermissions);
  const resourceGroups = Object.entries(groupedPermissions);
  const midpoint = Math.ceil(resourceGroups.length / 2);

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-grow overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {[resourceGroups.slice(0, midpoint), resourceGroups.slice(midpoint)].map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {column.map(([resource, resourcePermissions]) => (
                <Card key={resource}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Acción</TableHead>
                          <TableHead className="w-[100px] text-right">Permitido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resourcePermissions.map((permission) => {
                          const userPermission = userPermissions.find(up => up.permission_id === permission.permission_id);
                          const isChecked = userPermission && userPermission.status !== 'removed';
                          return (
                            <TableRow key={permission.permission_id}>
                              <TableCell className="font-medium">{permission.action}</TableCell>
                              <TableCell className="text-right">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
      {successMessage && (
        <Alert variant="default" className="mb-4">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="mt-4 flex justify-end space-x-4 pt-4 border-t bg-background">
        {/* <Button variant="outline" onClick={handleCancel}>Cancelar</Button> */}
        <Button onClick={handleUpdatePermissions}>Actualizar Permisos</Button>
      </div>
    </div>
  );
}

