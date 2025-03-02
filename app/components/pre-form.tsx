import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users } from "lucide-react"

type UserType = "Agente" | "Staff"

interface PreFormProps {
  onSelectUserType: (type: UserType) => void
}

export function PreForm({ onSelectUserType }: PreFormProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null)

  return (
    <Card className="border-blue-100 dark:border-blue-800 shadow-blue-sm dark:shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-800 dark:text-blue-300">Selección de Tipo de Usuario</CardTitle>
        <CardDescription>Seleccione el tipo de usuario para continuar con el proceso de requerimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={(value) => setSelectedType(value as UserType)} className="space-y-4">
          <div
            className={`flex items-start space-x-3 border rounded-lg p-4 transition-all duration-200 ${selectedType === "Agente" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}
          >
            <RadioGroupItem value="Agente" id="agente" className="mt-1" />
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="agente" className="text-base font-medium cursor-pointer">
                  Agente
                </Label>
                <User className="ml-2 h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Seleccione esta opción para crear un requerimiento de agente.
              </p>
            </div>
          </div>

          <div
            className={`flex items-start space-x-3 border rounded-lg p-4 transition-all duration-200 ${selectedType === "Staff" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}
          >
            <RadioGroupItem value="Staff" id="staff" className="mt-1" />
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="staff" className="text-base font-medium cursor-pointer">
                  Staff
                </Label>
                <Users className="ml-2 h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Seleccione esta opción para crear un requerimiento de personal de staff.
              </p>
            </div>
          </div>
        </RadioGroup>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => selectedType && onSelectUserType(selectedType)}
            disabled={!selectedType}
            className="bg-gradient-blue hover:opacity-90 transition-opacity"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

