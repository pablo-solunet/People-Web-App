"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  Edit,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatDateTime } from "@/lib/date-utils"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { columnDisplayNames } from "@/lib/column-display-names"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { gapFechaIngreso, paises, canales, emailCorpoOption } from "@/lib/appConfig"
import { updateAgentForm, deleteAgentForm } from "@/api/agent-form/service"
import { TimeSelector } from "@/components/operaciones/time-selector"
import { DaySchedule } from "@/components/operaciones/day-schedule"
import { useOperaciones, type OperacionesData } from "@/hooks/use-operaciones"
import { canEditRecord, getMinimumDate, updateCargaHoraria, getStatusBadgeClass } from "@/lib/operaciones-utils"

const dias_para_Editar = gapFechaIngreso

const allFields: (keyof OperacionesData)[] = [
  "requisition_id",
  "created_by",
  "created_at",
  "updated_at",
  "pais",
  "fechaIngreso",
  "legajo",
  "documento",
  "cliente",
  "atencion",
  "canal",
  "compania",
  "cargaHoraria",
  "horarioIn",
  "horarioOut",
  "job_title",
  "jobDescription",
  "puesto",
  "lunes_in",
  "lunes_out",
  "martes_in",
  "martes_out",
  "miercoles_in",
  "miercoles_out",
  "jueves_in",
  "jueves_out",
  "viernes_in",
  "viernes_out",
  "sabado_in",
  "sabado_out",
  "domingo_in",
  "domingo_out",
  "estado",
  "observaciones",
  "area",
  "requiereEmailCorpo",
]

// Definir los campos que pueden ser editados por Operaciones
const editableFields: (keyof OperacionesData)[] = [
  "pais",
  "fechaIngreso",
  "cliente",
  "canal",
  "observaciones",
  "horarioIn",
  "horarioOut",
  "lunes_in",
  "lunes_out",
  "martes_in",
  "martes_out",
  "miercoles_in",
  "miercoles_out",
  "jueves_in",
  "jueves_out",
  "viernes_in",
  "viernes_out",
  "sabado_in",
  "sabado_out",
  "domingo_in",
  "domingo_out",
  "cargaHoraria",
  "requiereEmailCorpo",
]

interface OperacionesViewProps {
  hasActionPermission: (action: string) => boolean
  currentUser?: {
    username: string
    userId: string
    permissions: string[]
    actions: string[]
  }
}

// Tipo para los registros con cambios pendientes
interface PendingChange {
  id_reg: string
  originalData: OperacionesData
  pendingData: OperacionesData
  timestamp: string
}

export function OperacionesView(props: OperacionesViewProps) {
  const { hasActionPermission, currentUser } = props
  const {
    operacionesData,
    setOperacionesData,
    filteredData,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    fetchData: fetchOperacionesData,
  } = useOperaciones()

  const [expandedLotes, setExpandedLotes] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [visibleFields, setVisibleFields] = useState<(keyof OperacionesData)[]>([
    "requisition_id",
    "created_by",
    "area",
    "pais",
    "atencion",
    "fechaIngreso",
    "legajo",
    "estado",
    "observaciones",
    "requiereEmailCorpo",
  ])
  const { toast } = useToast()

  const [editingRecord, setEditingRecord] = useState<OperacionesData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estado para los cambios pendientes
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isConfirmChangesOpen, setIsConfirmChangesOpen] = useState(false)
  const [selectedPendingChange, setSelectedPendingChange] = useState<PendingChange | null>(null)
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)

  const groupedRecords = filteredData.reduce(
    (acc, record) => {
      if (!acc[record.lote_id]) {
        acc[record.lote_id] = []
      }
      acc[record.lote_id].push(record)
      return acc
    },
    {} as Record<string, OperacionesData[]>,
  )

  const toggleLote = (loteId: string) => {
    setExpandedLotes((prev) => (prev.includes(loteId) ? prev.filter((id) => id !== loteId) : [...prev, loteId]))
  }

  const toggleField = (field: keyof OperacionesData) => {
    setVisibleFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleEdit = (record: OperacionesData) => {
    console.log("Registro a editar:", record)
    console.log("Campo requiereEmailCorpo:", record.requiereEmailCorpo)
    setEditingRecord({ ...record })
    setIsEditDialogOpen(true)
  }

  // Función para guardar cambios como pendientes
  const handleSaveAsPending = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRecord) return

    // Validar fecha mínima antes de enviar
    if (
      editingRecord.fechaIngreso &&
      new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate(Number(dias_para_Editar)))
    ) {
      toast({
        title: "Error",
        description: `La fecha debe ser al menos ${dias_para_Editar} días después de hoy`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Buscar el registro original en operacionesData
      const originalRecord = operacionesData.find((record) => record.id_reg === editingRecord.id_reg)

      if (!originalRecord) {
        throw new Error("No se encontró el registro original")
      }

      // Crear un nuevo cambio pendiente
      const newPendingChange: PendingChange = {
        id_reg: editingRecord.id_reg,
        originalData: { ...originalRecord },
        pendingData: { ...editingRecord },
        timestamp: new Date().toISOString(),
      }

      // Actualizar el estado de cambios pendientes
      setPendingChanges((prev) => {
        // Si ya existe un cambio pendiente para este registro, reemplazarlo
        const existingIndex = prev.findIndex((change) => change.id_reg === editingRecord.id_reg)
        if (existingIndex >= 0) {
          const newChanges = [...prev]
          newChanges[existingIndex] = newPendingChange
          return newChanges
        }
        // Si no existe, añadir uno nuevo
        return [...prev, newPendingChange]
      })

      // Actualizar la UI para mostrar que hay cambios pendientes
      setOperacionesData((prevData) =>
        prevData.map((record) => {
          if (record.id_reg === editingRecord.id_reg) {
            return {
              ...record,
              ...editingRecord,
              estado: "Pendiente de confirmación", // Estado visual para indicar cambios pendientes
            }
          }
          return record
        }),
      )

      toast({
        title: "Cambios guardados como pendientes",
        description: "Los cambios han sido guardados y están pendientes de confirmación.",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error saving pending changes:", error)
      toast({
        title: "Error",
        description: `No se pudieron guardar los cambios pendientes: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función para confirmar y aplicar cambios pendientes
  const handleConfirmChanges = async (pendingChange: PendingChange) => {
    setIsApplyingChanges(true)
    try {
      // Crear un objeto con solo los campos editables
      const updatedFields: Partial<OperacionesData> = {}
      editableFields.forEach((field) => {
        updatedFields[field] = pendingChange.pendingData[field]
      })

      // Siempre establecer estado como "Pendiente" y área como "Training"
      updatedFields.estado = "Pendiente"
      updatedFields.area = "Training"

      // Añadir información al log_track
      const username = currentUser?.username || "Operaciones"
      const currentTimestamp = new Date().toLocaleString()
      updatedFields.log_track = `Cambios confirmados por ${username} at ${currentTimestamp}`
      // updatedFields.append_log = true

      const result = await updateAgentForm(pendingChange.id_reg, updatedFields)

      if (result.success) {
        // Actualizar el estado local
        setOperacionesData((prevData) =>
          prevData.map((record) => {
            if (record.id_reg === pendingChange.id_reg) {
              return {
                ...record,
                ...updatedFields,
                estado: "Pendiente", // Establecer el estado como Pendiente
                area: "Training", // Establecer el área como Training
              }
            }
            return record
          }),
        )

        // Eliminar de los cambios pendientes
        setPendingChanges((prev) => prev.filter((change) => change.id_reg !== pendingChange.id_reg))

        toast({
          title: "Cambios aplicados",
          description: `Los cambios han sido aplicados y el registro ha sido enviado a Training.`,
        })
        setIsConfirmChangesOpen(false)
        setSelectedPendingChange(null)
      } else {
        throw new Error(result.message || "Failed to apply changes")
      }
    } catch (error) {
      console.error("Error applying changes:", error)
      toast({
        title: "Error",
        description: `No se pudieron aplicar los cambios: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsApplyingChanges(false)
    }
  }

  // Función para descartar cambios pendientes
  const handleDiscardChanges = (pendingChange: PendingChange) => {
    // Restaurar el registro a su estado original en la UI
    setOperacionesData((prevData) =>
      prevData.map((record) => {
        if (record.id_reg === pendingChange.id_reg) {
          return { ...pendingChange.originalData }
        }
        return record
      }),
    )

    // Eliminar de los cambios pendientes
    setPendingChanges((prev) => prev.filter((change) => change.id_reg !== pendingChange.id_reg))

    toast({
      title: "Cambios descartados",
      description: `Los cambios pendientes al registro ${pendingChange.id_reg} han sido descartados.`,
    })
    setIsConfirmChangesOpen(false)
    setSelectedPendingChange(null)
  }

  const handleDelete = async (id_reg: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteAgentForm(id_reg)

      if (result.success) {
        // Actualizar el estado local eliminando el registro
        setOperacionesData((prevData) => prevData.filter((record) => record.id_reg !== id_reg))

        // Eliminar cualquier cambio pendiente para este registro
        setPendingChanges((prev) => prev.filter((change) => change.id_reg !== id_reg))

        toast({
          title: "Éxito",
          description: `Registro ${id_reg} eliminado correctamente.`,
        })
        // Close all dialogs
        setIsEditDialogOpen(false) // Cerrar el diálogo de edición
        setIsDeleteAlertOpen(false) // Cerrar la alerta de confirmación
      } else {
        throw new Error(result.message || "Failed to delete record")
      }
    } catch (error) {
      console.error("Error deleting record:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro: ${error}`,
        variant: "destructive",
      })
    } finally {
      setRecordToDelete(null) // Limpiar el registro a eliminar
      setIsDeleting(false)
      setEditingRecord(null) // Clear the editing record state
    }
  }

  const handleHorarioDiaChange = (dia: string, type: "in" | "out", value: string) => {
    if (editingRecord) {
      const newRecord = { ...editingRecord }

      // Actualizar el valor seleccionado
      newRecord[`${dia}_${type}` as keyof OperacionesData] = value

      // Si el "in" es "Franco", el "out" también debe ser "Franco"
      if (type === "in" && value === "Franco") {
        newRecord[`${dia}_out` as keyof OperacionesData] = "Franco"
      }

      // Actualizar la carga horaria automáticamente
      newRecord.cargaHoraria = updateCargaHoraria(newRecord)

      setEditingRecord(newRecord)
    }
  }

  const totalPages = Math.ceil(Object.keys(groupedRecords).length / itemsPerPage)
  const paginatedLotes = Object.entries(groupedRecords).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Dentro del componente, antes del return:
  const distinctFilterValues = React.useMemo(() => {
    if (!filterField) return []
    // Extrae los valores del campo seleccionado y filtra los nulos o vacíos.
    const values = operacionesData
      .map((record) => record[filterField as keyof OperacionesData])
      .filter((value) => value !== null && value !== undefined && value !== "")
    return Array.from(new Set(values))
  }, [operacionesData, filterField])

  // Verificar si un registro tiene cambios pendientes
  const hasPendingChanges = (id_reg: string) => {
    return pendingChanges.some((change) => change.id_reg === id_reg)
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Filtros y Búsqueda</span>
            <div className="flex items-center gap-2">
              {pendingChanges.length > 0 && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {pendingChanges.length} cambio(s) pendiente(s)
                </Badge>
              )}
              <Button
                onClick={fetchOperacionesData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Recargar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-blue-200 dark:border-blue-800"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select value={filterField} onValueChange={setFilterField}>
                <SelectTrigger className="w-full md:w-[180px] border-blue-200 dark:border-blue-800">
                  <SelectValue placeholder="Filtrar por..." />
                  {filterField && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilterField("")
                        setFilterValue("")
                      }}
                      className="p-1"
                    >
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
                  <SelectTrigger className="w-full md:w-[180px] border-blue-200 dark:border-blue-800">
                    <SelectValue placeholder="Selecciona un valor" />
                    {filterValue && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilterValue("")
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

              {(filterField || filterValue) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterField("")
                    setFilterValue("")
                  }}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Resetear filtro
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-800">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 border-blue-200 dark:border-blue-800">
                  <div className="grid gap-4">
                    <h4 className="font-medium leading-none text-blue-800 dark:text-blue-300">Campos visibles</h4>
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {allFields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={visibleFields.includes(field)}
                            onCheckedChange={() => toggleField(field)}
                          />
                          <Label htmlFor={field} className="cursor-pointer">
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
        </CardContent>
      </Card>

      {pendingChanges.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
              Cambios Pendientes de Confirmación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Tienes {pendingChanges.length} cambio(s) pendiente(s) de confirmación. Revisa y confirma los cambios
                antes de enviarlos.
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 italic">
                Nota: Los cambios pendientes se perderán si recargas la página o cierras el navegador. Confirma o
                descarta los cambios antes de salir.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {pendingChanges.map((change) => (
                  <Card key={change.id_reg} className="border-yellow-300 dark:border-yellow-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">ReqId : {change.pendingData.requisition_id}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Pendiente
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300"
                          onClick={() => {
                            setSelectedPendingChange(change)
                            setIsConfirmChangesOpen(true)
                          }}
                        >
                          Ver y confirmar cambios
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 mt-1"
                          onClick={() => handleDiscardChanges(change)}
                        >
                          Descartar cambios
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-lg">Cargando datos...</span>
        </div>
      ) : filteredData.length === 0 ? (
        <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">No se encontraron datos.</p>
              <p className="text-sm text-muted-foreground">Por favor, revise los filtros o la búsqueda.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                  <TableHead className="font-medium">Lote ID</TableHead>
                  <TableHead className="font-medium">Cantidad de Solicitudes </TableHead>
                  <TableHead className="font-medium">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLotes.map(([loteId, loteRecords]) => (
                  <React.Fragment key={loteId}>
                    <TableRow
                      className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => toggleLote(loteId)}
                    >
                      <TableCell className="font-medium">{loteId}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          {loteRecords.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLote(loteId)
                          }}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          {expandedLotes.includes(loteId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedLotes.includes(loteId) && (
                      <TableRow>
                        <TableCell colSpan={3} className="p-0">
                          <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-lg m-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white dark:bg-gray-900 border-b border-blue-100 dark:border-blue-800">
                                  {visibleFields.map((field) => (
                                    <TableHead
                                      key={field}
                                      className="font-medium text-xs uppercase text-muted-foreground"
                                    >
                                      {columnDisplayNames[field] || field}
                                    </TableHead>
                                  ))}
                                  <TableHead className="font-medium text-xs uppercase text-muted-foreground">
                                    Acciones
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {loteRecords.map((record) => (
                                  <TableRow
                                    key={record.id_reg}
                                    className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${
                                      hasPendingChanges(record.id_reg) ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""
                                    }`}
                                  >
                                    {visibleFields.map((field) => (
                                      <TableCell key={`${record.id_reg}-${field}`} className="py-2">
                                        {field === "estado" ? (
                                          <Badge
                                            className={`${
                                              hasPendingChanges(record.id_reg)
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                                : getStatusBadgeClass(record.estado)
                                            }`}
                                          >
                                            {hasPendingChanges(record.id_reg)
                                              ? "Pendiente de confirmación"
                                              : record.estado}
                                          </Badge>
                                        ) : field === "created_at" || field === "updated_at" ? (
                                          formatDateTime(record[field])
                                        ) : (
                                          record[field]
                                        )}
                                      </TableCell>
                                    ))}
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(record)}
                                          disabled={
                                            !hasActionPermission("operaciones-edit") ||
                                            !canEditRecord(record.fechaIngreso) ||
                                            hasPendingChanges(record.id_reg)
                                          }
                                          className="border-blue-200 dark:border-blue-800"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        {hasPendingChanges(record.id_reg) && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const pendingChange = pendingChanges.find(
                                                (change) => change.id_reg === record.id_reg,
                                              )
                                              if (pendingChange) {
                                                setSelectedPendingChange(pendingChange)
                                                setIsConfirmChangesOpen(true)
                                              }
                                            }}
                                            className="border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                          >
                                            Confirmar
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardContent className="p-4 border-t border-blue-100 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-blue-200 dark:border-blue-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{`Página ${currentPage} de ${totalPages || 1}`}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="border-blue-200 dark:border-blue-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[180px] border-blue-200 dark:border-blue-800">
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
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="border-blue-200 dark:border-blue-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-blue-200 dark:border-blue-800">
              {isDeleting ? <RefreshCw className="animate-spin h-4 w-4" /> : "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (recordToDelete) {
                  handleDelete(recordToDelete)
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <RefreshCw className="animate-spin h-4 w-4" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-blue-200 dark:border-blue-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Modifique los campos necesarios y guarde los cambios para revisión posterior.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <form onSubmit={handleSaveAsPending} className="space-y-6">
              {/* Datos Generales */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pais">País</Label>
                    <Select
                      value={editingRecord.pais || ""}
                      onValueChange={(value) => setEditingRecord({ ...editingRecord, pais: value })}
                    >
                      <SelectTrigger id="pais" className="border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Seleccione un país" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {paises.map((pais) => (
                          <SelectItem key={pais} value={pais}>
                            {pais}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                    <Input
                      id="fechaIngreso"
                      type="date"
                      value={editingRecord.fechaIngreso}
                      onChange={(e) => setEditingRecord({ ...editingRecord, fechaIngreso: e.target.value })}
                      min={getMinimumDate(Number(dias_para_Editar))}
                      className={`border-blue-200 dark:border-blue-800 ${
                        editingRecord.fechaIngreso &&
                        new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate(Number(dias_para_Editar)))
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {editingRecord.fechaIngreso &&
                      new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate(Number(dias_para_Editar))) && (
                        <p className="text-sm text-red-500">
                          La fecha debe ser al menos {dias_para_Editar} días después de hoy
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Input
                      id="cliente"
                      value={editingRecord.cliente}
                      onChange={(e) => setEditingRecord({ ...editingRecord, cliente: e.target.value })}
                      className="border-blue-200 dark:border-blue-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="canal">Canal</Label>
                    <Select
                      value={editingRecord.canal || ""}
                      onValueChange={(value) => setEditingRecord({ ...editingRecord, canal: value })}
                    >
                      <SelectTrigger id="canal" className="border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Seleccione un canal" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {canales.map((canal) => (
                          <SelectItem key={canal} value={canal}>
                            {canal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Horario General */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Horario General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cargaHoraria">Carga Horaria</Label>
                    <Input
                      id="cargaHoraria"
                      value={editingRecord.cargaHoraria}
                      readOnly
                      className="border-blue-200 dark:border-blue-800 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horarioIn">Horario Entrada</Label>
                    <TimeSelector
                      id="horarioIn"
                      value={editingRecord.horarioIn}
                      onChange={(value) => setEditingRecord({ ...editingRecord, horarioIn: value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horarioOut">Horario Salida</Label>
                    <TimeSelector
                      id="horarioOut"
                      value={editingRecord.horarioOut}
                      onChange={(value) => setEditingRecord({ ...editingRecord, horarioOut: value })}
                    />
                  </div>
                </div>
              </div>

              {/* Horarios por Día */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Horarios por Día</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DaySchedule
                    day="lunes"
                    dayLabel="Lunes"
                    inValue={editingRecord.lunes_in}
                    outValue={editingRecord.lunes_out}
                    onInChange={(value) => handleHorarioDiaChange("lunes", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("lunes", "out", value)}
                    disabled={editingRecord.lunes_in === "Franco"}
                  />

                  <DaySchedule
                    day="martes"
                    dayLabel="Martes"
                    inValue={editingRecord.martes_in}
                    outValue={editingRecord.martes_out}
                    onInChange={(value) => handleHorarioDiaChange("martes", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("martes", "out", value)}
                    disabled={editingRecord.martes_in === "Franco"}
                  />

                  <DaySchedule
                    day="miercoles"
                    dayLabel="Miércoles"
                    inValue={editingRecord.miercoles_in}
                    outValue={editingRecord.miercoles_out}
                    onInChange={(value) => handleHorarioDiaChange("miercoles", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("miercoles", "out", value)}
                    disabled={editingRecord.miercoles_in === "Franco"}
                  />

                  <DaySchedule
                    day="jueves"
                    dayLabel="Jueves"
                    inValue={editingRecord.jueves_in}
                    outValue={editingRecord.jueves_out}
                    onInChange={(value) => handleHorarioDiaChange("jueves", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("jueves", "out", value)}
                    disabled={editingRecord.jueves_in === "Franco"}
                  />

                  <DaySchedule
                    day="viernes"
                    dayLabel="Viernes"
                    inValue={editingRecord.viernes_in}
                    outValue={editingRecord.viernes_out}
                    onInChange={(value) => handleHorarioDiaChange("viernes", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("viernes", "out", value)}
                    disabled={editingRecord.viernes_in === "Franco"}
                  />

                  <DaySchedule
                    day="sabado"
                    dayLabel="Sábado"
                    inValue={editingRecord.sabado_in}
                    outValue={editingRecord.sabado_out}
                    onInChange={(value) => handleHorarioDiaChange("sabado", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("sabado", "out", value)}
                    disabled={editingRecord.sabado_in === "Franco"}
                  />

                  <DaySchedule
                    day="domingo"
                    dayLabel="Domingo"
                    inValue={editingRecord.domingo_in}
                    outValue={editingRecord.domingo_out}
                    onInChange={(value) => handleHorarioDiaChange("domingo", "in", value)}
                    onOutChange={(value) => handleHorarioDiaChange("domingo", "out", value)}
                    disabled={editingRecord.domingo_in === "Franco"}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Observaciones</h3>
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    value={editingRecord.observaciones}
                    onChange={(e) => setEditingRecord({ ...editingRecord, observaciones: e.target.value })}
                    className="border-blue-200 dark:border-blue-800"
                  />
                </div>

                <div>
                  <Label htmlFor="requiereEmailCorpo">Requiere Email Corporativo</Label>
                  <Select
                    value={editingRecord.requiereEmailCorpo || ""}
                    onValueChange={(value) => setEditingRecord({ ...editingRecord, requiereEmailCorpo: value })}
                  >
                    <SelectTrigger id="requiereEmailCorpo" className="border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {emailCorpoOption.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (editingRecord) {
                        setRecordToDelete(editingRecord.id_reg)
                        setIsDeleteAlertOpen(true)
                      }
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? <RefreshCw className="animate-spin h-4 w-4" /> : "Eliminar Registro"}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSaving || isDeleting}
                    className="border-blue-200 dark:border-blue-800"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    {isSaving ? <RefreshCw className="animate-spin h-4 w-4" /> : "Guardar para revisión"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmChangesOpen} onOpenChange={setIsConfirmChangesOpen}>
        <DialogContent className="border-yellow-200 dark:border-yellow-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-800 dark:text-yellow-300 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Confirmar Cambios Pendientes
            </DialogTitle>
            <DialogDescription>
              Revisa los cambios realizados antes de confirmarlos. Una vez confirmados, los cambios serán aplicados.
            </DialogDescription>
          </DialogHeader>
          {selectedPendingChange && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Detalles del Registro</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">ReqId :</span> {selectedPendingChange.pendingData.requisition_id}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de cambio:</span>{" "}
                    {new Date(selectedPendingChange.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Cambios Realizados</h3>
                <div className="border border-yellow-200 dark:border-yellow-800 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-yellow-50 dark:bg-yellow-900/30">
                        <TableHead className="font-medium">Campo</TableHead>
                        <TableHead className="font-medium">Valor Original</TableHead>
                        <TableHead className="font-medium">Nuevo Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableFields
                        .map((field) => {
                          const originalValue = selectedPendingChange.originalData[field]
                          const newValue = selectedPendingChange.pendingData[field]
                          const hasChanged = originalValue !== newValue

                          return hasChanged ? (
                            <TableRow key={field} className="border-b border-yellow-100 dark:border-yellow-800">
                              <TableCell className="font-medium">{columnDisplayNames[field] || field}</TableCell>
                              <TableCell>{originalValue}</TableCell>
                              <TableCell className="text-yellow-800 dark:text-yellow-300 font-medium">
                                {newValue}
                              </TableCell>
                            </TableRow>
                          ) : null
                        })
                        .filter(Boolean)}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Después de confirmar</h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Al confirmar estos cambios, se reiniciara el proceso, el registro será enviado automáticamente a Training con estado
                  "Pendiente".
                </p>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDiscardChanges(selectedPendingChange)}
                  className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Descartar cambios
                </Button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsConfirmChangesOpen(false)}
                    className="border-yellow-200 dark:border-yellow-800"
                  >
                    Revisar más tarde
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleConfirmChanges(selectedPendingChange)}
                    disabled={isApplyingChanges}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isApplyingChanges ? (
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Confirmar y enviar a Training
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
