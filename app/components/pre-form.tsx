import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type UserType = 'Agente' | 'Staff'

interface PreFormProps {
  onSelectUserType: (type: UserType) => void
}

export function PreForm({ onSelectUserType }: PreFormProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Seleccione el tipo de usuario:</h2>
      <RadioGroup onValueChange={(value) => setSelectedType(value as UserType)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Agente" id="agente" />
          <Label htmlFor="agente">Agente</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Staff" id="staff" />
          <Label htmlFor="staff">Staff</Label>
        </div>
      </RadioGroup>
      <Button onClick={() => selectedType && onSelectUserType(selectedType)} disabled={!selectedType}>
        Continuar
      </Button>
    </div>
  )
}

