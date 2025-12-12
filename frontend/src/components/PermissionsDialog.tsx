"use client";

import React from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Typography, Switch 
} from "@material-tailwind/react";
import { UserCog } from "lucide-react";
import Button from "@/components/Button";

interface PermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  therapist: {
    nome: string;
    permCadastro: boolean;
    permAtendimento: boolean;
  } | null;
  // A função de update recebe a chave da permissão que mudou
  onUpdate: (key: "permCadastro" | "permAtendimento") => void;
}

export default function PermissionsDialog({ 
  open, 
  onClose, 
  therapist, 
  onUpdate 
}: PermissionsDialogProps) {
  
  // Proteção contra dados vazios
  if (!therapist) return null;

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="xs" 
      className="p-4" 
      placeholder={undefined}
    >
      <DialogHeader placeholder={undefined} className="justify-center gap-2">
        <UserCog className="text-brand-purple" />
        <Typography variant="h5" color="blue-gray">
          Gerenciar Permissões
        </Typography>
      </DialogHeader>
      
      <DialogBody placeholder={undefined} className="flex flex-col gap-4">
        <Typography className="text-center text-sm font-normal text-gray-600 mb-2">
          Controle o nível de acesso de <strong>{therapist.nome}</strong>.
        </Typography>

        <div className="flex flex-col gap-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          
          {/* Switch Cadastro */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <div>
              <Typography className="font-bold text-gray-800 text-sm">
                Cadastro
              </Typography>
              <Typography className="text-gray-500 text-xs">
                Registrar novos pacientes e terapeutas
              </Typography>
            </div>
            <Switch 
              crossOrigin={undefined}
              color="purple" 
              checked={therapist.permCadastro} 
              onChange={() => onUpdate("permCadastro")} 
            />
          </div>

          {/* Switch Atendimento */}
          <div className="flex justify-between items-center p-4 bg-white">
            <div>
              <Typography className="font-bold text-gray-800 text-sm">
                Atendimento
              </Typography>
              <Typography className="text-gray-500 text-xs">
                Realizar sessões (Terapeuta)
              </Typography>
            </div>
            <Switch 
              crossOrigin={undefined}
              color="purple" 
              checked={therapist.permAtendimento} 
              onChange={() => onUpdate("permAtendimento")} 
            />
          </div>

        </div>
      </DialogBody>
      
      <DialogFooter placeholder={undefined} className="justify-center">
        <Button onClick={onClose} fullWidth>
          Concluir
        </Button>
      </DialogFooter>
    </Dialog>
  );
}