"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
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
import { columnDisplayNames } from "@/lib/column-display-names"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PeopleData {
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
  diasLibres: string
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
  comentario: string

  legajo: string
}

interface PeopleViewProps {
  hasActionPermission: (action: string) => boolean
}

const allFields: (keyof PeopleData)[] = [
  "requisition_id",
  "created_by",
  "created_at",
  "updated_at",
  "pais",
  "fechaIngreso",
  "cliente",
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
  "legajo",
]

export function PeopleView({ hasActionPermission }: PeopleViewProps) {
  const [expandedLotes, setExpandedLotes] = useState<string[]>([])
  const [peopleData, setPeopleData] = useState<PeopleData[]>([])
  const [filteredData, setFilteredData] = useState<PeopleData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterField, setFilterField] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [visibleFields, setVisibleFields] = useState<(keyof PeopleData)[]>([
    "requisition_id",
    "created_by",
    "pais",
    "fechaIngreso",
    "estado",
    "observaciones",
  ])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Alert Dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertAction, setAlertAction] = useState<{ type: "enbusqueda" | "confirmado"; id: string } | null>(null)

  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false) // Controlar la visibilidad del popup
  const [legajo, setLegajo] = useState("") // Almacenar el valor del legajo o documento
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null) // Almacenar el ID del registro seleccionado

  useEffect(() => {
    fetchPeopleData()
  }, [])

  useEffect(() => {
    filterAndSearchData()
  }, [peopleData, searchTerm, filterField, filterValue])

  const fetchPeopleData = async () => {
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
            ]
            record[fieldNames[index]] = field.v
          })
          return record as PeopleData
        })
        setPeopleData(formattedData)
        toast({
          title: "Datos actualizados",
          description: "Los datos de entrenamiento han sido actualizados exitosamente.",
        })
      } else {
        console.error("Unexpected data structure:", data)
        setPeopleData([])
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de entrenamiento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching Manager data:", error)
      setPeopleData([])
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos de entrenamiento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSearchData = () => {
    let result = peopleData.filter(
      (record) => (record.area === "People" && record.estado === "Pendiente") || record.estado === "EnBusqueda",
    )

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
        (record) => record[filterField as keyof PeopleData]?.toString().toLowerCase() === filterValue.toLowerCase(),
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
    {} as Record<string, PeopleData[]>,
  )

  const toggleLote = (loteId: string) => {
    setExpandedLotes((prev) => (prev.includes(loteId) ? prev.filter((id) => id !== loteId) : [...prev, loteId]))
  }

  const toggleField = (field: keyof PeopleData) => {
    setVisibleFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const updateRecordState = async (id_reg: string, newState: string, legajo?: string) => {
    try {
      let newestado = ""
      let newarea = ""

      if (newState === "EnBusqueda") {
        newestado = "EnBusqueda"
        newarea = "People"
      } else if (newState === "Finalizado") {
        newestado = "Finalizado"
        newarea = "Operaciones"
      }

      const response = await fetch("/api/agent-form", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_reg: id_reg,
          estado: newestado,
          area: newarea,
          legajo: legajo, // Incluir el legajo en la actualización
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      const result = await response.json()

      if (result.success) {
        setPeopleData((prevData) =>
          prevData.map((record) =>
            record.id_reg === id_reg ? { ...record, estado: newState, area: newarea } : record,
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

  const handleEnbusqueda = (id_reg: string) => {
    setAlertAction({ type: "enbusqueda", id: id_reg })
    setIsAlertOpen(true)
  }

  const handleConfirmado = (id_reg: string) => {
    setAlertAction({ type: "confirmado", id: id_reg })
    setIsAlertOpen(true)
  }

  const handleAlertConfirm = async () => {
    if (alertAction) {
      const { type, id } = alertAction
      if (type === "enbusqueda") {
        await updateRecordState(id, "EnBusqueda")
      } else if (type === "confirmado") {
        setSelectedRecordId(id) // Guardar el ID del registro
        setIsConfirmPopupOpen(true) // Abrir el popup para el legajo
      }
    }
    setIsAlertOpen(false)
    setAlertAction(null)
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
    const values = peopleData
      .map((record) => record[filterField as keyof PeopleData])
      .filter((value) => value !== null && value !== undefined && value !== "")
    return Array.from(new Set(values))
  }, [peopleData, filterField])

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

  return (
    <div className="space-y-4">
      <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Filtros y Búsqueda</span>
            <Button onClick={fetchPeopleData} disabled={isLoading} variant="outline" size="sm" className="ml-auto">
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
                  <TableHead className="font-medium">Cantidad de Entrenamientos</TableHead>
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
                                          new Date(Number(record[field])).toLocaleString()
                                        ) : (
                                          record[field]
                                        )}
                                      </TableCell>
                                    ))}
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleEnbusqueda(record.id_reg)}
                                          disabled={record.estado === "EnBusqueda"}
                                          className="bg-button-search-bg hover:bg-button-search-hover text-button-search-text dark:bg-button-dark-search-bg dark:hover:bg-button-dark-search-hover dark:text-button-dark-search-text"
                                        >
                                          En Busqueda
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            setSelectedRecordId(record.id_reg)
                                            setIsConfirmPopupOpen(true)
                                          }}
                                          disabled={record.estado === "Finalizado"}
                                          className="bg-button-approve-bg hover:bg-button-approve-hover text-button-approve-text dark:bg-button-dark-approve-bg dark:hover:bg-button-dark-approve-hover dark:text-button-dark-approve-text"
                                        >
                                          Confirmado
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

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="border-blue-200 dark:border-blue-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
            <AlertDialogDescription>
              {alertAction?.type === "enbusqueda"
                ? '¿Está seguro que desea marcar este registro como "En Busqueda"?'
                : '¿Está seguro que desea marcar este registro como "Confirmado"?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-200 dark:border-blue-800">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAlertConfirm} className="bg-blue-600 hover:bg-blue-700">
              {alertAction?.type === "enbusqueda" ? "En Busqueda" : "Confirmado"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmPopupOpen} onOpenChange={setIsConfirmPopupOpen}>
        <AlertDialogContent className="border-blue-200 dark:border-blue-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Asignación</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, ingrese el legajo o documento del agente que será asignado a este requerimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Legajo o Documento"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              className="border-blue-200 dark:border-blue-800"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-blue-200 dark:border-blue-800"
              onClick={() => {
                setIsConfirmPopupOpen(false)
                setLegajo("")
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={async () => {
                if (selectedRecordId) {
                  await updateRecordState(selectedRecordId, "Finalizado", legajo)
                }
                setIsConfirmPopupOpen(false)
                setLegajo("")
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

