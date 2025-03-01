import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings, RefreshCw, Edit, Delete, Trash } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { columnDisplayNames } from '@/lib/column-display-names';

interface OperacionesData {
  id_reg: string;
  lote_id: string;
  requisition_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  pais: string;
  fechaIngreso: string;
  cliente: string;
  canal: string;
  compania: string;
  cargaHoraria: string;
  horarioIn: string;
  horarioOut: string;
  job_title: string;
  jobDescription: string;
  puesto: string;

  lunes_in: string;
  lunes_out: string;
  martes_in: string;
  martes_out: string;
  miercoles_in: string;
  miercoles_out: string;
  jueves_in: string;
  jueves_out: string;
  viernes_in: string;
  viernes_out: string;
  sabado_in: string;
  sabado_out: string;
  domingo_in: string;
  domingo_out: string;

  estado: string;
  observaciones: string;
  area: string;
  comentario: string;

  legajo: string;
}

interface OperacionesViewProps {
  hasActionPermission: (action: string) => boolean;
}

const allFields: (keyof OperacionesData)[] = [
  'requisition_id', 'created_by', 'created_at', 'updated_at', 'pais', 'fechaIngreso', 'legajo',
  'cliente', 'canal', 'compania', 'cargaHoraria', 'horarioIn', 'horarioOut',
  'job_title', 'jobDescription', 'puesto', 'lunes_in', 'lunes_out', 'martes_in', 'martes_out',
  'miercoles_in', 'miercoles_out', 'jueves_in', 'jueves_out', 'viernes_in', 'viernes_out',
  'sabado_in', 'sabado_out', 'domingo_in', 'domingo_out', 'estado', 'observaciones', 'area'
];

export function OperacionesView({ hasActionPermission }: OperacionesViewProps) {
  const [expandedLotes, setExpandedLotes] = useState<string[]>([]);
  const [operacionesData, setOperacionesData] = useState<OperacionesData[]>([]);
  const [filteredData, setFilteredData] = useState<OperacionesData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleFields, setVisibleFields] = useState<(keyof OperacionesData)[]>([
    'requisition_id', 'created_by', 'area', 'pais', 'fechaIngreso', 'legajo', 'estado', 'observaciones'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [editingRecord, setEditingRecord] = useState<OperacionesData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert Dialog state
  // const [isAlertOpen, setIsAlertOpen] = useState(false);
  // const [alertAction, setAlertAction] = useState<{ type: 'approve' | 'reject', id: string, isLote: boolean } | null>(null);

  useEffect(() => {
    fetchOperacionesData();
  }, []);

  useEffect(() => {
    filterAndSearchData();
  }, [operacionesData, searchTerm, filterField, filterValue]);

  const fetchOperacionesData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent-form');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const formattedData = data.data.map((item: any) => {
          const record: any = {};
          item.f.forEach((field: any, index: number) => {
            const fieldNames = [
              'id_reg','lote_id','requisition_id','created_by','created_at','updated_at','pais',
              'pais_contrato','fechaIngreso','cliente','canal','compania','horarioIn','horarioOut',
              'job_title','jobDescription','puesto','observaciones','estado','cargaHoraria','lunes_in',
              'lunes_out','martes_in','martes_out','miercoles_in','miercoles_out','jueves_in','jueves_out',
              'viernes_in','viernes_out','sabado_in','sabado_out','domingo_in','domingo_out','area', 'legajo'
            ];
            record[fieldNames[index]] = field.v;
          });
          return record as OperacionesData;
        });
        setOperacionesData(formattedData);
        toast({
          title: "Datos actualizados",
          description: "Los datos de operaciones han sido actualizados exitosamente.",
        });
      } else {
        console.error('Unexpected data structure:', data);
        setOperacionesData([]);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de operaciones.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching operaciones data:', error);
      setOperacionesData([]);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos de operaciones.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchData = () => {
    let result = operacionesData.filter(record => record.area == 'Operaciones' && record.estado !== '');

    if (searchTerm) {
      result = result.filter(record => 
        Object.values(record).some(value => 
          value !== null &&
          value !== undefined &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterField && filterValue) {
      result = result.filter(record => 
        record[filterField as keyof OperacionesData]?.toString().toLowerCase() === filterValue.toLowerCase()
      );
    }

    setFilteredData(result);
  };

  const groupedRecords = filteredData.reduce((acc, record) => {
    if (!acc[record.lote_id]) {
      acc[record.lote_id] = [];
    }
    acc[record.lote_id].push(record);
    return acc;
  }, {} as Record<string, OperacionesData[]>);

  const toggleLote = (loteId: string) => {
    setExpandedLotes(prev => 
      prev.includes(loteId) 
        ? prev.filter(id => id !== loteId)
        : [...prev, loteId]
    );
  };

  const toggleField = (field: keyof OperacionesData) => {
    setVisibleFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const updateRecordState = async (id_reg: string, newState: string, isLote: boolean, lote_id?: string) => {
    try {
      let newestado = 'null'
      let newarea = 'null'

      if(newState == 'Aprobado') {
        newestado = 'Pendiente';
        newarea = 'Manager';
      } else {
        newestado = 'Rechazado';
        newarea = 'Operaciones';
      }

      const response = await fetch('/api/agent-form', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isLote: isLote,
          lote_id: lote_id,
          id_reg: id_reg,
          estado: newestado,
          area: newarea,
          observaciones: newState === 'Rechazado' ? 'rejectComment' : ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const result = await response.json();
      if (result.success) {
        setOperacionesData(prevData => 
          prevData.map(record => 
            record.id_reg === id_reg ? { ...record, estado: newState, comentario: 'rejectComment' } : record
          )
        );
        toast({
          title: "Éxito",
          description: `Registro ${id_reg} actualizado a estado: ${newState}`,
        });
      } else {
        throw new Error(result.message || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: OperacionesData) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/agent-form', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRecord),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const result = await response.json();

      if (result.success) {
        setOperacionesData(prevData =>
          prevData.map(record =>
            record.id_reg === editingRecord.id_reg ? editingRecord : record
          )
        );
        toast({
          title: "Éxito",
          description: `Registro ${editingRecord.id_reg} actualizado correctamente`,
        });
        setIsEditDialogOpen(false);
      } else {
        throw new Error(result.message || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id_reg: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agent-form?id=${id_reg}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
  
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
  
      const result = await response.json();
  
      if (result.success) {
        // Actualizar el estado local eliminando el registro
        setOperacionesData((prevData) =>
          prevData.filter((record) => record.id_reg !== id_reg)
        );
        toast({
          title: "Éxito",
          description: `Registro ${id_reg} eliminado correctamente.`,
        });
        setIsEditDialogOpen(false); // Cerrar el diálogo de edición
        setIsDeleteAlertOpen(false); // Cerrar la alerta de confirmación
      } else {
        throw new Error(result.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro: ${error}`,
        variant: "destructive",
      });
    } finally {
      setRecordToDelete(null); // Limpiar el registro a eliminar
      setIsDeleting(false);
    }
  };
  
  const totalPages = Math.ceil(Object.keys(groupedRecords).length / itemsPerPage);
  const paginatedLotes = Object.entries(groupedRecords).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Funcion para Calcular 20 dias antes del Ingreso
  const canEditRecord = (fechaIngreso: string): boolean => {
    const today = new Date();
    const fecha = new Date(fechaIngreso);
    const diffDays = (fecha.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 20;
  };

   // Dentro del componente, antes del return:
    const distinctFilterValues = React.useMemo(() => {
      if (!filterField) return [];
      // Extrae los valores del campo seleccionado y filtra los nulos o vacíos.
      const values = operacionesData
        .map(record => record[filterField as keyof OperacionesData])
        .filter(value => value !== null && value !== undefined && value !== '');
      return Array.from(new Set(values));
    }, [operacionesData, filterField]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button
            onClick={fetchOperacionesData}
            disabled={isLoading}
            aria-label="Recargar datos"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="ml-2">Recargar</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por..." />
              {
              filterField && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterField('');
                    setFilterValue('');
                  }}
                  className="p-1"
                >
                  {/* Icono de X para limpiar el filtro */}
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estado">Estado</SelectItem>
              <SelectItem value="pais">País</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
          {filterField && (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="max-w-sm flex items-center justify-between">
                <SelectValue placeholder="Selecciona un valor" />
                {filterValue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterValue('');
                    }}
                    className="p-1"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </SelectTrigger>
              <SelectContent>
                {distinctFilterValues.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botón adicional para resetear el filtro completo */}
            {(filterField || filterValue) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterField('');
                  setFilterValue('');
                }}
              >
                Resetear filtro
              </Button>
            )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <h4 className="font-medium leading-none">Campos visibles</h4>
                <div className="grid gap-2">
                  {allFields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={visibleFields.includes(field)}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <Label htmlFor={field}>
                        {columnDisplayNames[field] || field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
  
      {filteredData.length === 0 ? (
        <p>
          No se encontraron datos de operaciones. Por favor, revise los filtros o la búsqueda.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote ID</TableHead>
              <TableHead>Cantidad de Solicitudes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLotes.map(([loteId, loteRecords]) => (
              <React.Fragment key={loteId}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleLote(loteId)}
                >
                  <TableCell>{loteId}</TableCell>
                  <TableCell>{loteRecords.length}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLote(loteId);
                        }}
                      >
                        {expandedLotes.includes(loteId) ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedLotes.includes(loteId) && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {visibleFields.map((field) => (
                              <TableHead key={field}>
                                {columnDisplayNames[field] || field}
                              </TableHead>
                            ))}
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loteRecords.map((record) => (
                            <TableRow
                                key={record.id_reg}
                                className={`${
                                  record.estado === 'Rechazado'
                                    ? 'bg-status-rechazado dark:bg-status-rechazadoDark'
                                    : record.estado === 'Finalizado'
                                    ? 'bg-status-finalizado dark:bg-status-finalizadoDark'
                                    : ''
                                }`}
                              >
                              {visibleFields.map((field) => (
                                <TableCell key={`${record.id_reg}-${field}`}>
                                  {field === 'created_at' || field === 'updated_at'
                                    ? new Date(Number(record[field])).toLocaleString()
                                    : record[field]}
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(record)}
                                    disabled={
                                      !hasActionPermission('operaciones-edit') || !canEditRecord(record.fechaIngreso)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
  
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Registros por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {isDeleting ? (
                <RefreshCw className="animate-spin h-4 w-4" />
              ) : (
                "Cancelar"
              )}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recordToDelete) {
                  handleDelete(recordToDelete);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <RefreshCw className="animate-spin h-4 w-4" />
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  
      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Modifique los campos necesarios y guarde los cambios.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <form onSubmit={handleEditSubmit}>
              {visibleFields.map((field) => (
                <div key={field} className="mb-4">
                  <Label htmlFor={field}>
                    {columnDisplayNames[field] || field}
                  </Label>
                  <Input
                    id={field}
                    value={editingRecord[field]}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, [field]: e.target.value })
                    }
                  />
                </div>
              ))}
              <DialogFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    // En lugar de eliminar directamente, abrimos el AlertDialog para confirmar.
                    if (editingRecord) {
                      setRecordToDelete(editingRecord.id_reg);
                      setIsDeleteAlertOpen(true);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <RefreshCw className="animate-spin h-4 w-4" />
                  ) : (
                    "Eliminar Registro"
                  )}
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSaving || isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="animate-spin h-4 w-4" />
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
