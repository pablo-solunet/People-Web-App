import { useState, FormEvent, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TIME_SLOTS } from '@/lib/time-slots'

interface AgentFormProps {
  onSubmit: (data: Record<string, string>) => void
  onReturn: () => void
  hasActionPermission: (action: string) => boolean
}

export function AgentForm({ onSubmit, onReturn, hasActionPermission }: AgentFormProps) {
  const [isCustomJobTitle, setIsCustomJobTitle] = useState(false)
  const paises = ['Argentina', 'Chile', 'Paraguay', 'Uruguay', 'Colombia', 'Venezuela', 'Brasil']
  const estados = ["Pendiente", "Rechazado", "Completado"]
  const canales = ['Digital', 'Telefónico', 'Presencial']
  const areas = ["People", "Training", "Operaciones", "Manager"]
  const jobTitles = ["Customer Service Agent"]
  
  const [formData, setFormData] = useState({
    pais: '',
    fechaIngreso: '',
    cliente: '',
    atencion:'',
    canal: '',
    compania: 'Solu',
    horarioIn: '08:00',
    horarioOut: '14:00',
    job_title: 'Customer Service Agent',
    jobDescription: 'Customer Service Agent',
    puesto: 'Agente',
    observaciones: '',
    estado: 'Pendiente',
    area: 'Training',
    quantity: '1',
    cargaHoraria: '0 horas'
  })

  const [horariosDias, setHorariosDias] = useState({
    lunes: { in: '09:00', out: '18:00' },
    martes: { in: '09:00', out: '18:00' },
    miercoles: { in: '09:00', out: '18:00' },
    jueves: { in: '09:00', out: '18:00' },
    viernes: { in: '09:00', out: '18:00' },
    sabado: { in: '09:00', out: '18:00' },
    domingo: { in: '09:00', out: '18:00' }
  })

  const calcularCargaHoraria = () => {
    let totalHoras = 0
    Object.values(horariosDias).forEach(({ in: horaIn, out: horaOut }) => {
      if (horaIn !== 'Franco' && horaOut !== 'Franco') {
        const [inHora, inMinuto] = horaIn.split(':').map(Number)
        const [outHora, outMinuto] = horaOut.split(':').map(Number)
        const horasTrabajadas = (outHora - inHora) + (outMinuto - inMinuto) / 60
        totalHoras += horasTrabajadas
      }
    })
    return `${totalHoras.toFixed(2)} horas`
  };

  const getMinimumDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 20)
    return minDate.toISOString().split("T")[0]
  }

  useEffect(() => {
    // Recalcula la carga horaria y actualiza el estado
    setFormData(prev => ({ ...prev, cargaHoraria: calcularCargaHoraria() }));
  }, [horariosDias]);

  // Efecto para sincronizar "Horario de Entrada" con los horarios de los días
  useEffect(() => {
    if (formData.horarioIn) {
      setHorariosDias(prev => ({
        lunes: { in: formData.horarioIn, out: prev.lunes.out },
        martes: { in: formData.horarioIn, out: prev.martes.out },
        miercoles: { in: formData.horarioIn, out: prev.miercoles.out },
        jueves: { in: formData.horarioIn, out: prev.jueves.out },
        viernes: { in: formData.horarioIn, out: prev.viernes.out },
        sabado: { in: formData.horarioIn, out: prev.sabado.out },
        domingo: { in: formData.horarioIn, out: prev.domingo.out }
      }));
    }
  }, [formData.horarioIn]);

  {/* Efecto para sincronizar "Horario de Salida" con los campos "Out" */}
  useEffect(() => {
    if (formData.horarioOut) {
      setHorariosDias(prev => ({
        lunes: { in: prev.lunes.in, out: formData.horarioOut },
        martes: { in: prev.martes.in, out: formData.horarioOut },
        miercoles: { in: prev.miercoles.in, out: formData.horarioOut },
        jueves: { in: prev.jueves.in, out: formData.horarioOut },
        viernes: { in: prev.viernes.in, out: formData.horarioOut },
        sabado: { in: prev.sabado.in, out: formData.horarioOut },
        domingo: { in: prev.domingo.in, out: formData.horarioOut }
      }));
    }
  }, [formData.horarioOut]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

   // Validar fecha mínima si no puede saltarse la restricción
   if (
    !canBypassDateRestriction &&
    formData.fechaIngreso &&
    new Date(formData.fechaIngreso) < new Date(getMinimumDate())
  ) {
    alert("La fecha debe ser al menos 20 días después de hoy")
    document.getElementById("fechaIngreso")?.focus()
    return // Prevenir envío del formulario
  }
  
    // Aplanar el objeto horariosDias
    const horariosAplanados = Object.entries(horariosDias).reduce(
      (acc, [dia, horario]) => {
        acc[`${dia}_in`] = horario.in;
        acc[`${dia}_out`] = horario.out;
        return acc;
      },
      {} as Record<string, string>
    );
  
    // Combinar formData y horariosAplanados
    const data = { ...formData, ...horariosAplanados };
  
    // Enviar los datos
    onSubmit(data);
  };

  const handleClear = () => {
    setFormData({
      pais: '',
      fechaIngreso: '',
      cliente: '',
      atencion:'',
      canal: '',
      compania: 'Solu',
      horarioIn: '09:00',
      horarioOut: '14:00',
      job_title: 'Customer Service Agent',
      jobDescription: 'Customer Service Agent',
      puesto: 'Agente',
      observaciones: '',
      estado: 'Pendiente',
      area: 'Training',
      quantity: '1',
      cargaHoraria: '0 horas'
    })
    document.getElementById("pais")?.focus()
    ;

    setHorariosDias({
      lunes: { in: '08:00', out: '14:00' },
      martes: { in: '08:00', out: '14:00' },
      miercoles: { in: '08:00', out: '14:00' },
      jueves: { in: '08:00', out: '14:00' },
      viernes: { in: '08:00', out: '14:00' },
      sabado: { in: '08:00', out: '14:00' },
      domingo: { in: '08:00', out: '14:00' }
    });

    setIsCustomJobTitle(false)
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if user has permission to bypass date restriction
  const canBypassDateRestriction = hasActionPermission("requerimiento-create")

  const handleHorarioDiaChange = (dia: string, type: 'in' | 'out', value: string) => {
    setHorariosDias(prev => {
      const newHorarios = { ...prev, [dia]: { ...prev[dia], [type]: value } };
      if (type === 'in' && value === 'Franco') {
        newHorarios[dia].out = 'Franco'; // Si el "in" es "Franco", el "out" también debe ser "Franco"
      }
      return newHorarios;
    });
  };

  const handleJobTitleChange = (value: string) => {
    if (value === 'Agregar...') {
      setIsCustomJobTitle(true);
      setFormData(prev => ({ ...prev, job_title: '' }));
    } else {
      setIsCustomJobTitle(false);
      setFormData(prev => ({ ...prev, job_title: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-6">Formulario para Agentes</h2>
      <Button type="button" variant="outline" onClick={onReturn} className="mb-6 bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
        Volver al formulario inicial
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
          <Label htmlFor="pais">
            País de Contratacion <span className="text-red-500">*</span>
          </Label>
          <select
            id="pais"
            value={formData.pais}
            onChange={(e) => handleInputChange("pais", e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccione un país</option>
            {paises.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaIngreso">
            Fecha de Ingreso{!canBypassDateRestriction}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="fechaIngreso" 
            type="date"
            value={formData.fechaIngreso} 
            onChange={(e) => handleInputChange('fechaIngreso', e.target.value)}
            min={canBypassDateRestriction ? undefined : getMinimumDate()}
            className={`${
              !canBypassDateRestriction && 
              formData.fechaIngreso && 
              new Date(formData.fechaIngreso) < new Date(getMinimumDate())
                ? "bg-gray-100 text-gray-400 border-red-300" 
                : ""
              }`}
              required
          />
           {/* {!formData.fechaIngreso} */}
           {!canBypassDateRestriction &&
            formData.fechaIngreso &&
            new Date(formData.fechaIngreso) < new Date(getMinimumDate()) && (
              <p className="text-sm text-red-500">La fecha debe ser al menos 20 días después de hoy</p>
            )}
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Input 
              id="cliente" 
              value={formData.cliente} 
              onChange={(e) => handleInputChange('cliente', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="atencion">Atencion</Label>
            <Input 
              id="atencion" 
              value={formData.atencion} 
              onChange={(e) => handleInputChange('atencion', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canal">Canal</Label>
            <Select onValueChange={(value) => handleInputChange('canal', value)} value={formData.canal}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un canal" />
              </SelectTrigger>
              <SelectContent>
                {canales.map((canal) => (
                  <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="horarioIn">Horario de Entrada</Label>
              <Select 
                onValueChange={(value) => handleInputChange('horarioIn', value)} 
                value={formData.horarioIn}
              >
                <SelectTrigger className="w-full"> {/* Reducir el ancho */}
                  <SelectValue placeholder="Entrada" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="horarioOut">Horario de Salida</Label>
              <Select 
                onValueChange={(value) => handleInputChange('horarioOut', value)} 
                value={formData.horarioOut}
              >
                <SelectTrigger className="w-full"> {/* Reducir el ancho */}
                  <SelectValue placeholder="Salida" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="cargaHoraria">Carga Horaria</Label>
              <Input 
                id="cargaHoraria" 
                value={formData.cargaHoraria} 
                readOnly 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Puesto</Label>
              {isCustomJobTitle ? (
                <Input 
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="Ingrese el nuevo puesto"
                />
              ) : (
                <Select onValueChange={handleJobTitleChange} value={formData.job_title}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un puesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((title) => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Días de la semana con recuadro */}
        <div className="col-span-2">
          <div className="border p-4 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="text-center">
                    {Object.keys(horariosDias).map((dia) => (
                      <th key={dia} className="px-2 py-1">
                        <Label className="font-medium">{dia.charAt(0).toUpperCase() + dia.slice(1)}</Label>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    {Object.entries(horariosDias).map(([dia, _]) => (
                      <td key={`${dia}-in-header`} className="px-2 py-1">
                        <Label className="text-sm text-gray-500">In</Label>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {Object.entries(horariosDias).map(([dia, horario]) => (
                      <td key={`${dia}-in`} className="px-1 py-1">
                        <Select onValueChange={(value) => handleHorarioDiaChange(dia, "in", value)} value={horario.in}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="In" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="Franco">Franco</SelectItem>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                  </tr>
                  <tr className="text-center">
                    {Object.entries(horariosDias).map(([dia, _]) => (
                      <td key={`${dia}-out-header`} className="px-2 py-1">
                        <Label className="text-sm text-gray-500">Out</Label>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {Object.entries(horariosDias).map(([dia, horario]) => (
                      <td key={`${dia}-out`} className="px-1 py-1">
                        <Select
                          onValueChange={(value) => handleHorarioDiaChange(dia, "out", value)}
                          value={horario.out}
                          disabled={horario.in === "Franco"}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Out" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="Franco">Franco</SelectItem>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div className="hidden space-y-2">
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

          <div className="hidden space-y-2">
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
}