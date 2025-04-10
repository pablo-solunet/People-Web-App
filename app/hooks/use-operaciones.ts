"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { fetchAgentFormData } from "@/api/agent-form/service"

export interface OperacionesData {
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
  log_track: string
}

export function useOperaciones() {
  const [operacionesData, setOperacionesData] = useState<OperacionesData[]>([])
  const [filteredData, setFilteredData] = useState<OperacionesData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterField, setFilterField] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAgentFormData()

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

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSearchData()
  }, [operacionesData, searchTerm, filterField, filterValue])

  return {
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
    fetchData,
  }
}
