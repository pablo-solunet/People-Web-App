'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreForm } from './pre-form'
import { AgentForm } from './form-agent'
import { StaffForm } from './form-staff'
import { TempRecordsView } from './temp-records-view'
import { UserManagement } from './user-management'
import { StatusView } from './status-view'
import { TestView } from '@/components/test-view'  // Importamos el nuevo componente
import { generateIds } from '@/lib/id-generator'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'
import { Login } from './login'
import { TrainingView } from './training-view'
import { ManagerView } from './manager-view'
import { OperacionesView } from './operaciones-view'
import { PeopleView } from './people-view'

type UserType = 'Agente' | 'Staff'

interface TempRecord {
  id_reg: string;
  lote_id?: string;
  requisition_id: string;
  created_by: string;
  [key: string]: string | undefined;
}

interface User {
  username: string;
  userId: string;
  permissions: string[];
  actions: string[]; // Update: Added actions field
}

export function MultiFormSystem() {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [tempRecords, setTempRecords] = useState<TempRecord[]>([])
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false); // Added state for loading
  const [remoteRecords, setRemoteRecords] = useState([]); // Added state for remote records

  const handleFormSubmit = (data: Record<string, string>) => {
    const quantity = parseInt(data.quantity) || 1;
    const newIds = generateIds(quantity);
    
    const newRecords = newIds.map(({ id_reg, lote_id,requisition_id }) => ({ 
      id_reg,
      lote_id,
      requisition_id,
      created_by: user?.username || "Usuario Desconocido",
      ...data 
    }));
    
    setTempRecords(prev => [...prev, ...newRecords]);
  };

  const handleDelete = (id_reg: string) => {
    setTempRecords(prev => prev.filter(record => record.id_reg !== id_reg))
  }

  const handleConfirmAll = () => {
    if (tempRecords.length === 0) return;

    const newIds = generateIds(tempRecords.length);
    
    const updatedRecords = tempRecords.map((record, index) => ({
      ...record,
      lote_id: newIds[0].lote_id // All records get the same lote_id
    }));

    console.log('Confirming all records:', updatedRecords);
    
    // Aquí deberías enviar los registros confirmados a tu backend o realizar la acción necesaria
    
    // Resetear tempRecords después de confirmar
    setTempRecords([]);
  }

  const handleCancelAll = () => {
    setTempRecords([])
  }

  const handleReturnToPreForm = () => {
    setSelectedUserType(null)
    setTempRecords([])
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogin = (username: string, userId: string, permissions: string[], actions: string[]) => {
    setUser({
      username,
      userId,
      permissions,
      actions
    });
    console.log('User logged in:', { username, userId, permissions, actions });
  }
  
  const handleLogout = () => {
    setUser(null);
  }

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

  const hasActionPermission = (action: string) => { 
    return user?.actions.includes(action) || false;
  }

  if (!user) {
    return (
      <div className="flex bg-blue-500 justify-center items-center min-h-screen bg-background">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bienvenido, {user.username}</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
          <Button onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </div>
      <Tabs defaultValue="requerimiento">
        <TabsList>
          {user.permissions.includes('requerimiento') && <TabsTrigger value="requerimiento">Requerimiento Posiciones</TabsTrigger>}
          {user.permissions.includes('operaciones') && <TabsTrigger value="operaciones">Operations</TabsTrigger>}
          {user.permissions.includes('training') && <TabsTrigger value="training">Training</TabsTrigger>}
          {user.permissions.includes('manager') && <TabsTrigger value="manager">Manager</TabsTrigger>}
          {user.permissions.includes('people') && <TabsTrigger value="people">People</TabsTrigger>}
          {user.permissions.includes('status') && <TabsTrigger value="status">Status</TabsTrigger>}
          {user.permissions.includes('usuarios') && <TabsTrigger value="usuarios">Usuarios</TabsTrigger>}
          {/* {user.permissions.includes('test') && <TabsTrigger value="test">Test</TabsTrigger>} */}
        </TabsList>
        {user.permissions.includes('requerimiento') && (
          <TabsContent value="requerimiento" className="space-y-6">
            {!selectedUserType ? (
              <PreForm onSelectUserType={setSelectedUserType} />
            ) : (
              <>
                {selectedUserType === 'Agente' ? (
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
          </TabsContent>
        )}
        {user.permissions.includes('people') && (
          <TabsContent value="people">
            <h2 className="text-2xl font-bold mb-4">Contenido de People</h2>
            <PeopleView hasActionPermission={hasActionPermission} />
          </TabsContent>
        )}
        {user.permissions.includes('training') && (
          <TabsContent value="training">
            <h2 className="text-2xl font-bold mb-4">Contenido de Training</h2>
            <TrainingView hasActionPermission={hasActionPermission} />
          </TabsContent>
        )}

        {user.permissions.includes('manager') && (
          <TabsContent value="manager">
            <h2 className="text-2xl font-bold mb-4">Contenido de Manager</h2>
            <ManagerView hasActionPermission={hasActionPermission} />
          </TabsContent>
        )}

        {user.permissions.includes('operaciones') && (
          <TabsContent value="operaciones">
            <h2 className="text-2xl font-bold mb-4">Contenido de Operaciones</h2>
            <OperacionesView hasActionPermission={hasActionPermission} />
          </TabsContent>
        )}

        {/* {user.permissions.includes('status') && (
          <TabsContent value="status">
            <h2 className="text-2xl font-bold mb-4">Status de Pedidos</h2>
            <StatusView
              records={tempRecords.filter(record => record.lote_id)}
              onReload={handleReloadStatus}
            />
          </TabsContent>
        )} */}

        {user.permissions.includes('status') && (
          <TabsContent value="status">
            <h2 className="text-2xl font-bold mb-4">Status de Pedidos</h2>
            <StatusView />
          </TabsContent>
        )}


        {user.permissions.includes('usuarios') && (
          <TabsContent value="usuarios">
            <h2 className="text-2xl font-bold mb-4">Administración de Usuarios</h2>
            <UserManagement />
          </TabsContent>
        )}
        {/* {user.permissions.includes('test') && (
          <TabsContent value="test">
            <h2 className="text-2xl font-bold mb-4">Contenido de Test</h2>
            <TestView />
          </TabsContent>
        )} */}
      </Tabs>
    </div>
  )
}

