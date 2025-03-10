import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { generateIdsFromServer } from "@/lib/id-generator"

interface TempRecord {
  id_reg: string;
  lote_id?: string;
  requisition_id: string;
  created_by: string;
  [key: string]: string | undefined;
}

interface TempRecordsViewProps {
  records: TempRecord[]
  onDelete: (id_reg: string) => void
  onConfirmAll: () => void
  onCancelAll: () => void
  onGenerateIds?: (ids: any[]) => void
}

export function TempRecordsView({ records, onDelete, onConfirmAll, onCancelAll, onGenerateIds }: TempRecordsViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingIds, setIsGeneratingIds] = useState(false)
  const { toast } = useToast()

  if (records.length === 0) {
    return null
  }

  const handleGenerateIds = async (count: number) => {
    setIsGeneratingIds(true)
    try {
      const ids = await generateIdsFromServer(count)
      if (onGenerateIds) {
        onGenerateIds(ids)
        return ids
      } 
      } catch (error) {
        console.error("Error generando IDs:", error)
        toast({
          title: "Error",
          description: "No se pudieron generar los IDs secuenciales.",
          variant: "destructive",
        })
      } 
  }

  const handleConfirmAll = async () => {
    setIsSubmitting(true)
    try {
      // Primero, generar IDs secuenciales para todos los registros
      const ids = await handleGenerateIds(records.length)

      // Generar un único lote_id para todos los registros
      const batchId = `LOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Asignar el mismo lote_id a todos los registros
      const recordsWithBatchId = records.map((record, index) => ({
        ...record,
        lote_id: batchId, // Sobrescribir cualquier lote_id existente
        requisition_id: ids && ids[index] ? ids[index].requisition_id : record.requisition_id, // Usar el nuevo ID si está disponible
      }))

      const response = await fetch("/api/agent-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordsWithBatchId),
      })

      if (!response.ok) {
        throw new Error("Error al Cargar Registros")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: `${records.length} registros cargados satisfactoriamente con lote ID: ${batchId}`,
      })
      onConfirmAll() // Clear the temporary records after successful submission
    } catch (error) {
      console.error("Error submitting records:", error)
      toast({
        title: "Error",
        description: "No se pudieron enviar los registros. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Índice</TableHead>
            {Object.keys(records[0])
              .filter((key) => key !== "id_reg" && key !== "lote_id" && key !== "requisition_id") // No mostrar lote_id en la tabla
              .map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id_reg}>
              <TableCell>{index + 1}</TableCell>
              {Object.entries(record)
                .filter(([key]) => key !== "id_reg" && key !== "lote_id" && key !== "requisition_id")
                .map(([key, value]) => (
                  <TableCell key={key}>{value}</TableCell>
                ))}
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onDelete(record.id_reg)}>
                  Borrar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end space-x-4">
        {/* ESTE ES EL BOTON PARA GENERAR -- POR AHORA lo hacemos al confirmar y listo */}
        {/* {onGenerateIds && (
            <Button
              variant="outline"
              onClick={() => handleGenerateIds(records.length)}
              disabled={isGeneratingIds || isSubmitting}
            >
              {isGeneratingIds ? "Generando..." : "Generar IDs Secuenciales"}
            </Button>
          )} */}
        <Button onClick={handleConfirmAll} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Confirmar Todo"}
        </Button>
        <Button variant="outline" onClick={onCancelAll} disabled={isSubmitting}>
          Cancelar Todo
        </Button>
      </div>
    </div>
  )
}

