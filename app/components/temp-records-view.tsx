import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

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
}

export function TempRecordsView({ records, onDelete, onConfirmAll, onCancelAll }: TempRecordsViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (records.length === 0) {
    return null
  }

  const handleConfirmAll = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/agent-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(records),
      })

      if (!response.ok) {
        throw new Error('Error al Cargar Registros')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: `${records.length} registros cargados Satisfactoriamente.`,
      })
      onConfirmAll() // Clear the temporary records after successful submission
    } catch (error) {
      console.error('Error submitting records:', error)
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
            {Object.keys(records[0]).filter(key => key !== 'id_reg').map((key) => (
              <TableHead key={key}>{key}</TableHead>
            ))}
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id_reg}>
              <TableCell>{index + 1}</TableCell>
              {Object.entries(record).filter(([key]) => key !== 'id_reg').map(([key, value]) => (
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
        <Button onClick={handleConfirmAll} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Confirmar Todo'}
        </Button>
        <Button variant="outline" onClick={onCancelAll} disabled={isSubmitting}>
          Cancelar Todo
        </Button>
      </div>
    </div>
  )
}

