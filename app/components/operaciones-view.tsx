"use client"

import { DialogFooter } from "@/components/ui/dialog"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings, Edit } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { columnDisplayNames } from "@/lib/column-display-names"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { gapFechaIngreso, gapOperacionesEdit, paises, canales, emailCorpoOption } from "@/lib/appConfig"
import { TIME_SLOTS } from "@/lib/time-slots"

const puedeEditar = gapOperacionesEdit
const dias_para_Editar = gapFechaIngreso

interface OperacionesData {
  id_reg: string
  lote_id: string
  requisition_id: string
  created_by: string
  created_at: string
  updated_at: string
  pais: string
  fechaIngreso: string
  cliente: string
  atencion: string
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

  requiereEmailCorpo: string

  comentario: string

  legajo: string
  documento: string
}

interface OperacionesViewProps {
  hasActionPermission: (action: string) => boolean
  currentUser?: {
    username: string
    userId: string
    permissions: string[]
    actions: string[]
  }
}

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

// export function OperacionesView({ hasActionPermission }: OperacionesViewProps) {
export function OperacionesView(props: OperacionesViewProps) {
  const { hasActionPermission, currentUser } = props
  const [expandedLotes, setExpandedLotes] = useState<string[]>([])
  const [operacionesData, setOperacionesData] = useState<OperacionesData[]>([])
  const [filteredData, setFilteredData] = useState<OperacionesData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterField, setFilterField] = useState("")
  const [filterValue, setFilterValue] = useState("")
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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [editingRecord, setEditingRecord] = useState<OperacionesData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchOperacionesData()
  }, [])

  useEffect(() => {
    filterAndSearchData()
  }, [operacionesData, searchTerm, filterField, filterValue])

  const fetchOperacionesData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/agent-form")
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const formattedData = data.data.map((item: any) => {
          const record: any = {}
          item.f.forEach((field: any, index: number) => {
            const fieldNames = [
              "id_reg",
              "lote_id",
              "requisition_id",
              "created_by",
              "created_at",
              "updated_at",
              "pais",
              "pais_contrato",
              "fechaIngreso",
              "cliente",
              "atencion",
              "canal",
              "compania",
              "horarioIn",
              "horarioOut",
              "job_title",
              "jobDescription",
              "puesto",
              "observaciones",
              "estado",
              "cargaHoraria",
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
              "area",
              "legajo",
              "documento",
              "approvedFromIP",
              "log_track",
              "requiereEmailCorpo",
            ]
            record[fieldNames[index]] = field.v
          })
          return record as OperacionesData
        })

        // Agregar este log para verificar si el campo está presente en los datos
        // console.log(
        //   "Datos formateados:",
        //   formattedData.map((item) => ({
        //     id: item.id_reg,
        //     requiereEmailCorpo: item.requiereEmailCorpo,
        //   })),
        // )

        setOperacionesData(formattedData)
      } else {
        console.error("Unexpected data structure:", data)
        setOperacionesData([])
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de operaciones.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching operaciones data:", error)
      setOperacionesData([])
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos de operaciones.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSearchData = () => {
    // let result = operacionesData.filter((record) => record.area == "Operaciones" && record.estado !== "")
    let result = operacionesData.filter((record) => record.estado !== "")

    if (searchTerm) {
      result = result.filter((record) =>
        Object.values(record).some(
          (value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    }

    if (filterField && filterValue) {
      result = result.filter(
        (record) =>
          record[filterField as keyof OperacionesData]?.toString().toLowerCase() === filterValue.toLowerCase(),
      )
    }

    setFilteredData(result)
  }

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

  const updateRecordState = async (id_reg: string, newState: string, isLote: boolean, lote_id?: string) => {
    try {
      let newestado = "null"
      let newarea = "null"

      if (newState == "Aprobado") {
        newestado = "Pendiente"
        newarea = "Manager"
      } else {
        newestado = "Rechazado"
        newarea = "Operaciones"
      }

      const currentTimestamp = new Date().toLocaleString()
      const userDisplayName = currentUser?.username || "Operaciones"

      const response = await fetch("/api/agent-form", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isLote: isLote,
          lote_id: lote_id,
          id_reg: id_reg,
          estado: newestado,
          area: newarea,
          observaciones: newState === "Rechazado" ? "rejectComment" : "",
          log_track: `${newState} From ${userDisplayName} at ${currentTimestamp}`,
          append_log: true, // Indicador para el backend de que debe añadir al log existente
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      const result = await response.json()
      if (result.success) {
        setOperacionesData((prevData) =>
          prevData.map((record) =>
            record.id_reg === id_reg ? { ...record, estado: newState, comentario: "rejectComment" } : record,
          ),
        )
        toast({
          title: "Éxito",
          description: `Registro ${id_reg} actualizado a estado: ${newState}`,
        })
      } else {
        throw new Error(result.message || "Failed to update record")
      }
    } catch (error) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro: ${error}`,
        variant: "destructive",
      })
    }
  }

  // Modificar la función handleEditSubmit para incluir solo los campos permitidos
  const handleEdit = (record: OperacionesData) => {
    console.log("Registro a editar:", record)
    console.log("Campo requiereEmailCorpo:", record.requiereEmailCorpo)
    setEditingRecord(record)
    setIsEditDialogOpen(true)
  }

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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRecord) return

    // Validar fecha mínima antes de enviar
    if (editingRecord.fechaIngreso && new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate())) {
      toast({
        title: "Error",
        description: `La fecha debe ser al menos ${dias_para_Editar} días después de hoy`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Crear un objeto con solo los campos editables
    const updatedFields: Partial<OperacionesData> = {}
    editableFields.forEach((field) => {
      updatedFields[field] = editingRecord[field]
    })

    try {
      const response = await fetch("/api/agent-form", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_reg: editingRecord.id_reg, ...updatedFields }), // Enviar solo los campos actualizados
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      const result = await response.json()

      if (result.success) {
        setOperacionesData((prevData) =>
          prevData.map((record) => (record.id_reg === editingRecord.id_reg ? { ...record, ...updatedFields } : record)),
        )
        toast({
          title: "Éxito",
          description: `Registro ${editingRecord.id_reg} actualizado correctamente`,
        })
        setIsEditDialogOpen(false)
      } else {
        throw new Error(result.message || "Failed to update record")
      }
    } catch (error) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id_reg: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/agent-form?id=${id_reg}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to delete record")
      }

      const result = await response.json()

      if (result.success) {
        // Actualizar el estado local eliminando el registro
        setOperacionesData((prevData) => prevData.filter((record) => record.id_reg !== id_reg))

        // Update the main data state
        setOperacionesData((prevData) => prevData.filter((record) => record.id_reg !== id_reg))

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

  const totalPages = Math.ceil(Object.keys(groupedRecords).length / itemsPerPage)
  const paginatedLotes = Object.entries(groupedRecords).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Funcion para Calcular dias antes del Ingreso
  const canEditRecord = (fechaIngreso: string): boolean => {
    const today = new Date()
    const fecha = new Date(fechaIngreso)
    const diffDays = (fecha.getTime() - today.getTime()) / (1000 * 3600 * 24)
    return diffDays >= Number(puedeEditar)
  }

  // Funcion para obtener la fecha mínima permitida (similar a form-agent.tsx)
  const getMinimumDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + Number(dias_para_Editar))
    return minDate.toISOString().split("T")[0]
  }

  // Dentro del componente, antes del return:
  const distinctFilterValues = React.useMemo(() => {
    if (!filterField) return []
    // Extrae los valores del campo seleccionado y filtra los nulos o vacíos.
    const values = operacionesData
      .map((record) => record[filterField as keyof OperacionesData])
      .filter((value) => value !== null && value !== undefined && value !== "")
    return Array.from(new Set(values))
  }, [operacionesData, filterField])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-status-pendiente dark:bg-status-pendienteDark text-gray-800 dark:text-gray-100"
      case "EnBusqueda":
        return "bg-status-enBusqueda dark:bg-status-enBusquedaDark text-gray-800 dark:text-gray-100"
      case "Finalizado":
        return "bg-status-finalizado dark:bg-status-finalizadoDark text-gray-800 dark:text-gray-100"
      case "Rechazado":
        return "bg-status-rechazado dark:bg-status-rechazadoDark text-gray-800 dark:text-gray-100"
      default:
        return "bg-gray-200 dark:bg-gray-700"
    }
  }

  const calculateWorkHours = (startTime: string, endTime: string): number => {
    if (startTime === "Franco" || endTime === "Franco") return 0

    // Convertir los horarios a minutos para facilitar el cálculo
    const getMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }

    const startMinutes = getMinutes(startTime)
    const endMinutes = getMinutes(endTime)

    // Si la hora de fin es menor que la de inicio, asumimos que cruza la medianoche
    let diffMinutes = endMinutes - startMinutes
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60 // Añadir un día completo en minutos
    }

    // Convertir minutos a horas con un decimal
    return Math.round(diffMinutes / 6) / 10 // Redondear a 1 decimal
  }

  const updateCargaHoraria = (record: OperacionesData): string => {
    const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
    let totalHours = 0

    days.forEach((day) => {
      const startTime = record[`${day}_in` as keyof OperacionesData] as string
      const endTime = record[`${day}_out` as keyof OperacionesData] as string

      if (startTime && endTime && startTime !== "Franco") {
        totalHours += calculateWorkHours(startTime, endTime)
      }
    })

    return totalHours.toFixed(1)
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

  // Componente personalizado para el selector de horarios
  const TimeSelector = ({
    value,
    onChange,
    id,
    disabled = false,
    includesFranco = false,
  }: {
    value: string
    onChange: (value: string) => void
    id: string
    disabled?: boolean
    includesFranco?: boolean
  }) => {
    return (
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-blue-200 dark:border-blue-800"
        >
          {includesFranco && <option value="Franco">Franco</option>}
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>
    )
  }

return (
    <div className="space-y-4">
      <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Filtros y Búsqueda</span>
            <Button onClick={fetchOperacionesData} disabled={isLoading} variant="outline" size="sm" className="ml-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Recargar
            </Button>
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
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    {visibleFields.map((field) => (
                                      <TableCell key={`${record.id_reg}-${field}`} className="py-2">
                                        {field === "estado" ? (
                                          <Badge className={`${getStatusBadgeClass(record.estado)}`}>
                                            {record.estado}
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
                                            !canEditRecord(record.fechaIngreso)
                                          }
                                          className="border-blue-200 dark:border-blue-800"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
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
            <DialogDescription>Modifique los campos necesarios y guarde los cambios.</DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
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
                      min={getMinimumDate()}
                      className={`border-blue-200 dark:border-blue-800 ${
                        editingRecord.fechaIngreso && new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate())
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {editingRecord.fechaIngreso &&
                      new Date(editingRecord.fechaIngreso) < new Date(getMinimumDate()) && (
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
                  {/* Lunes */}
                  <div className="space-y-2">
                    <Label>Lunes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="lunes_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="lunes_in"
                          value={editingRecord.lunes_in}
                          onChange={(value) => handleHorarioDiaChange("lunes", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lunes_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="lunes_out"
                          value={editingRecord.lunes_out}
                          onChange={(value) => handleHorarioDiaChange("lunes", "out", value)}
                          disabled={editingRecord.lunes_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Martes */}
                  <div className="space-y-2">
                    <Label>Martes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="martes_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="martes_in"
                          value={editingRecord.martes_in}
                          onChange={(value) => handleHorarioDiaChange("martes", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="martes_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="martes_out"
                          value={editingRecord.martes_out}
                          onChange={(value) => handleHorarioDiaChange("martes", "out", value)}
                          disabled={editingRecord.martes_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Miércoles */}
                  <div className="space-y-2">
                    <Label>Miércoles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="miercoles_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="miercoles_in"
                          value={editingRecord.miercoles_in}
                          onChange={(value) => handleHorarioDiaChange("miercoles", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="miercoles_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="miercoles_out"
                          value={editingRecord.miercoles_out}
                          onChange={(value) => handleHorarioDiaChange("miercoles", "out", value)}
                          disabled={editingRecord.miercoles_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Jueves */}
                  <div className="space-y-2">
                    <Label>Jueves</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="jueves_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="jueves_in"
                          value={editingRecord.jueves_in}
                          onChange={(value) => handleHorarioDiaChange("jueves", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="jueves_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="jueves_out"
                          value={editingRecord.jueves_out}
                          onChange={(value) => handleHorarioDiaChange("jueves", "out", value)}
                          disabled={editingRecord.jueves_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Viernes */}
                  <div className="space-y-2">
                    <Label>Viernes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="viernes_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="viernes_in"
                          value={editingRecord.viernes_in}
                          onChange={(value) => handleHorarioDiaChange("viernes", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="viernes_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="viernes_out"
                          value={editingRecord.viernes_out}
                          onChange={(value) => handleHorarioDiaChange("viernes", "out", value)}
                          disabled={editingRecord.viernes_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sábado */}
                  <div className="space-y-2">
                    <Label>Sábado</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="sabado_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="sabado_in"
                          value={editingRecord.sabado_in}
                          onChange={(value) => handleHorarioDiaChange("sabado", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sabado_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="sabado_out"
                          value={editingRecord.sabado_out}
                          onChange={(value) => handleHorarioDiaChange("sabado", "out", value)}
                          disabled={editingRecord.sabado_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Domingo */}
                  <div className="space-y-2">
                    <Label>Domingo</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="domingo_in" className="text-xs">
                          Entrada
                        </Label>
                        <TimeSelector
                          id="domingo_in"
                          value={editingRecord.domingo_in}
                          onChange={(value) => handleHorarioDiaChange("domingo", "in", value)}
                          includesFranco={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="domingo_out" className="text-xs">
                          Salida
                        </Label>
                        <TimeSelector
                          id="domingo_out"
                          value={editingRecord.domingo_out}
                          onChange={(value) => handleHorarioDiaChange("domingo", "out", value)}
                          disabled={editingRecord.domingo_in === "Franco"}
                          includesFranco={true}
                        />
                      </div>
                    </div>
                  </div>
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

              <DialogFooter className="flex justify-between">
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
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSaving || isDeleting}
                    className="border-blue-200 dark:border-blue-800"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? <RefreshCw className="animate-spin h-4 w-4" /> : "Guardar cambios"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}