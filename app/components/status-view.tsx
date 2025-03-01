import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { columnDisplayNames } from '@/lib/column-display-names';

interface AgentFormData {
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
}

const allFields: (keyof AgentFormData)[] = [
  'requisition_id', 'created_by', 'created_at', 'updated_at', 'pais', 'fechaIngreso',
  'cliente', 'canal', 'compania', 'cargaHoraria', 'horarioIn', 'horarioOut',
  'job_title', 'jobDescription', 'puesto', 'lunes_in', 'lunes_out', 'martes_in', 'martes_out',
  'miercoles_in', 'miercoles_out', 'jueves_in', 'jueves_out', 'viernes_in', 'viernes_out',
  'sabado_in', 'sabado_out', 'domingo_in', 'domingo_out', 'estado', 'observaciones', 'area'
];

export function StatusView() {
  const [expandedLotes, setExpandedLotes] = useState<string[]>([]);
  const [agentFormData, setAgentFormData] = useState<AgentFormData[]>([]);
  const [filteredData, setFilteredData] = useState<AgentFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleFields, setVisibleFields] = useState<(keyof AgentFormData)[]>([
    'requisition_id', 'created_by', 'pais', 'fechaIngreso', 'area', 'estado', 'observaciones'
  ]);

  useEffect(() => {
    fetchAgentFormData();
  }, []);

  useEffect(() => {
    filterAndSearchData();
  }, [agentFormData, searchTerm, filterField, filterValue]);

  const fetchAgentFormData = async () => {
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
              'viernes_in','viernes_out','sabado_in','sabado_out','domingo_in','domingo_out','area'
            ];
  
            record[fieldNames[index]] = field.v;
          });
          return record as AgentFormData;
        });
        setAgentFormData(formattedData);
      } else {
        console.error('Unexpected data structure:', data);
        setAgentFormData([]);
      }
    } catch (error) {
      console.error('Error fetching agent form data:', error);
      setAgentFormData([]);
    }
  };

  const filterAndSearchData = () => {
    let result = agentFormData;

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
        record[filterField as keyof AgentFormData]?.toString().toLowerCase() === filterValue.toLowerCase()
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
  }, {} as Record<string, AgentFormData[]>);

  const toggleLote = (loteId: string) => {
    setExpandedLotes(prev => 
      prev.includes(loteId) 
        ? prev.filter(id => id !== loteId)
        : [...prev, loteId]
    );
  };

  const toggleField = (field: keyof AgentFormData) => {
    setVisibleFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const totalPages = Math.ceil(Object.keys(groupedRecords).length / itemsPerPage);
  const paginatedLotes = Object.entries(groupedRecords).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dentro del componente, antes del return:
    const distinctFilterValues = React.useMemo(() => {
      if (!filterField) return [];
      // Extrae los valores del campo seleccionado y filtra los nulos o vacíos.
      const values = agentFormData
        .map(record => record[filterField as keyof AgentFormData])
        .filter(value => value !== null && value !== undefined && value !== '');
      return Array.from(new Set(values));
    }, [agentFormData, filterField]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
        <p>No se encontraron datos. Por favor, revise los filtros o la búsqueda.</p>
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
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLote(loteId);
                      }}
                    >
                      {expandedLotes.includes(loteId) ? <ChevronUp /> : <ChevronDown />}
                    </Button>
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loteRecords.map(record => (
                            <TableRow
                                key={record.id_reg}
                                className={`${
                                  record.estado === 'Pendiente'
                                    ? 'bg-status-pendiente dark:bg-status-pendienteDark'
                                    : record.estado === 'EnBusqueda'
                                    ? 'bg-status-enBusqueda dark:bg-status-enBusquedaDark'
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
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
    </div>
  );
}

