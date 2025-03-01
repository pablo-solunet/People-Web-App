import { useState, FormEvent, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TIME_SLOTS } from '@/lib/time-slots'

interface StaffFormProps {
  onSubmit: (data: Record<string, string>) => void
  onReturn: () => void
}

export function StaffForm({ onSubmit, onReturn }: StaffFormProps) {
  const [formData, setFormData] = useState({
    pais: '',
    fechaIngreso: '',
    cliente: '',
    canal: '',
    compania: '',
    cargaHoraria: '5 x 9',
    horarioIn: '09:00',
    horarioOut: '',
    diasLibres: '',
    job_title: '',
    jobDescription: '',
    puesto: '',
    observaciones: '',
    estado: 'Pendiente',
    area: 'People',
    quantity: '1'
  })

  const [customArea, setCustomArea] = useState('')
  const [isCustomPuesto, setIsCustomPuesto] = useState(false)

  const companias = ['Kurner', 'Mempost', 'Solvenet', 'Solucionet']
  const paises = ['Argentina', 'Chile', 'Paraguay', 'Uruguay', 'Colombia']
  const estados = ['Pendiente', 'Rechazado', 'Completado']
  const areas = ['Salesforce', 'Operations', 'Marketing', 'Quality & Training', 'Otro']
  const cargasHorarias = ['5 x 9', '5 x 4']
  const puestos = ["Analista", "Manager", "Developer", "Coordinador", "Trainee", "Pasante", "Agregar..."]

  useEffect(() => {
    if (formData.cargaHoraria && formData.horarioIn) {
      const [dias, horas] = formData.cargaHoraria.split('x').map(Number);
      const [inHours, inMinutes] = formData.horarioIn.split(':').map(Number);
      const totalMinutes = inHours * 60 + inMinutes + horas * 60;
      const outHours = Math.floor(totalMinutes / 60) % 24;
      const outMinutes = totalMinutes % 60;
      
      setFormData(prev => ({
        ...prev,
        horarioOut: `${outHours.toString().padStart(2, '0')}:${outMinutes.toString().padStart(2, '0')}`
      }));
    }
  }, [formData.cargaHoraria, formData.horarioIn]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const dataToSubmit = { ...formData }
    if (formData.area === 'Otro') {
      dataToSubmit.area = customArea
    }
    onSubmit(dataToSubmit)
    handleClear()
  }

  const handleClear = () => {
    setFormData({
      cliente: '',
      canal: '',
      diasLibres: '',
      job_title: '',
      compania: '',
      pais: '',
      fechaIngreso: '',
      area: '',
      estado: 'Pendiente',
      cargaHoraria: '5 x 9', // Asegúrate de mantener el mismo formato
      horarioIn: '09:00',
      horarioOut: '',
      jobDescription: '',
      observaciones: '',
      puesto: 'Analista',
      quantity: '1'
    });
    setCustomArea('');
    setIsCustomPuesto(false);
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePuestoChange = (value: string) => {
    if (value === 'Agregar...') {
      setIsCustomPuesto(true)
      setFormData(prev => ({ ...prev, puesto: '' }))
    } else {
      setIsCustomPuesto(false)
      setFormData(prev => ({ ...prev, puesto: value }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-6">Estamos trabajando en esta funcionalidad. ¡Vuelve pronto!</h2>
      <Button type="button" variant="outline" onClick={onReturn} className="mb-6">
        Volver al formulario inicial
      </Button>
      </form>
    
  );

  /*
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-6">Formulario para Staff</h2>
      <Button type="button" variant="outline" onClick={onReturn} className="mb-6">
        Volver al formulario inicial
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="compania">Compañía</Label>
          <Select onValueChange={(value) => handleInputChange('compania', value)} value={formData.compania}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una compañía" />
            </SelectTrigger>
            <SelectContent>
              {companias.map((compania) => (
                <SelectItem key={compania} value={compania}>{compania}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pais">País de Contratacion</Label>
          <Select onValueChange={(value) => handleInputChange('pais', value)} value={formData.pais}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un país" />
            </SelectTrigger>
            <SelectContent>
              {paises.map((pais) => (
                <SelectItem key={pais} value={pais}>{pais}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
          <Input 
            id="fechaIngreso" 
            type="date"
            value={formData.fechaIngreso} 
            onChange={(e) => handleInputChange('fechaIngreso', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Área</Label>
          <Select onValueChange={(value) => handleInputChange('area', value)} value={formData.area}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.area === 'Otro' && (
            <Input 
              placeholder="Especifique el área"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select onValueChange={(value) => handleInputChange('estado', value)} value={formData.estado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargaHoraria">Carga Horaria</Label>
          <Select onValueChange={(value) => handleInputChange('cargaHoraria', value)} value={formData.cargaHoraria}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione la carga horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5x9">Full Time (5 x 9)</SelectItem>
              <SelectItem value="5x4">Part Time (5 x 4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="horarioIn">Horario de Entrada</Label>
          <Select onValueChange={(value) => handleInputChange('horarioIn', value)} value={formData.horarioIn}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el horario de entrada" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="horarioOut">Horario de Salida</Label>
          <Input 
            id="horarioOut" 
            value={formData.horarioOut} 
            readOnly 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="puesto">Puesto</Label>
          {isCustomPuesto ? (
            <Input 
              id="puesto"
              value={formData.puesto}
              onChange={(e) => handleInputChange('puesto', e.target.value)}
              placeholder="Ingrese el nuevo puesto"
            />
          ) : (
            <Select onValueChange={handlePuestoChange} value={formData.puesto}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un puesto" />
              </SelectTrigger>
              <SelectContent>
                {puestos.map((puesto) => (
                  <SelectItem key={puesto} value={puesto}>{puesto}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="jobDescription" 
              placeholder="Ingrese un enlace o arrastre un archivo"
              value={formData.jobDescription} 
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            />
            <Button type="button" onClick={() => alert('Funcionalidad de arrastrar y soltar archivos no implementada en este ejemplo')}>
              Subir Archivo
            </Button>
          </div>
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea 
            id="observaciones" 
            value={formData.observaciones} 
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <div className="w-24">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input 
            id="quantity" 
            name="quantity"
            type="number" 
            min="1" 
            value={formData.quantity} 
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            className="h-10"
          />
        </div>
        <Button type="submit" className="h-10">+ Agregar</Button>
        <Button type="button" variant="outline" onClick={handleClear} className="h-10">Limpiar</Button>
      </div>
    </form>
  )
    */
}

