"use client";

import React from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Typography, Switch 
} from "@material-tailwind/react";
import { UserCog, ShieldAlert } from "lucide-react";
import Button from "@/components/Button";

interface PermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  therapist: {
    nome: string;
    permCadastro: boolean;
  } | null;
  onUpdate: (key: "permCadastro") => void;
}

export default function PermissionsDialog({ 
  open, 
  onClose, 
  therapist, 
  onUpdate 
}: PermissionsDialogProps) {
  
  if (!therapist) return null;

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="xs" 
      className="p-4 bg-brand-surface" 
    >
      <DialogHeader className="justify-center gap-2 border-b border-brand-purple/10 pb-4">
        <UserCog className="text-brand-purple" size={28} />
        <Typography variant="h5" className="text-brand-purple font-heading">
          Gerenciar Permissões
        </Typography>
      </DialogHeader>
      
      <DialogBody className="flex flex-col gap-6 pt-6">
        <Typography className="text-center text-sm font-normal text-gray-600">
          Controle o nível de acesso administrativo de <strong className="text-brand-dark">{therapist.nome}</strong>.
        </Typography>

        <div className="flex flex-col gap-0 bg-brand-bg rounded-xl border border-brand-purple/10 overflow-hidden">
          
          {/* Switch Cadastro */}
          <div className="flex justify-between items-center p-4 bg-white">
            <div className="flex gap-3">
              <div className="p-2 bg-brand-purple/10 rounded-lg h-fit text-brand-purple">
                 <ShieldAlert size={20} />
              </div>
              <div>
                <Typography className="font-bold text-brand-dark text-sm">
                  Permissão de Cadastro
                </Typography>
                <Typography className="text-gray-500 text-xs max-w-[200px] leading-tight mt-0.5">
                  Permite cadastrar, editar e remover novos Pacientes e outros Terapeutas.
                </Typography>
              </div>
            </div>
            <Switch 
              color="purple" 
              checked={therapist.permCadastro} 
              onChange={() => onUpdate("permCadastro")} 
              className="checked:bg-brand-purple"
              circleProps={{
                className: "before:hidden border-none",
              }}
            />
          </div>

        </div>
        
        <div className="bg-brand-peach/20 p-3 rounded-lg text-xs text-brand-dark/80 text-center border border-brand-peach/50">
           Todos os terapeutas possuem permissão de <strong>Atendimento</strong> por padrão.
        </div>

      </DialogBody>
      
      <DialogFooter className="justify-center pt-2">
        <Button onClick={onClose} fullWidth>
          CONCLUIR
        </Button>
      </DialogFooter>
    </Dialog>
  );
}